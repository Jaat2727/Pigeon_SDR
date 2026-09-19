import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

// Canonical agent registry — single source of truth across DB, backend, and UI
const CANONICAL_AGENTS = [
  { id: 'agent_research',      name: 'Lead Research Agent',      key: 'research',          engine: 'dronahq' },
  { id: 'agent_icp',           name: 'ICP Fitment Agent',        key: 'icp_fitment',       engine: 'dronahq' },
  { id: 'agent_outreach',      name: 'Outreach Strategy Agent',  key: 'outreach_strategy', engine: 'dronahq' },
  { id: 'agent_personal',      name: 'Personalisation Agent',    key: 'personalisation',   engine: 'dronahq' },
  { id: 'agent_conversation',  name: 'Conversation Agent',       key: 'conversation',      engine: 'dronahq' },
  { id: 'agent_followup',      name: 'Follow-up Timing Agent',   key: 'followup_timing',   engine: 'our_engine' },
  { id: 'agent_voice',         name: 'Voice SDR Agent',          key: 'voice_sdr',         engine: 'dronahq' },
];

/**
 * GET /agents
 * Returns global agent status, aggregated across all campaigns.
 * Merges canonical registry with live stats from agent_runs table.
 */
router.get('/', async (req, res) => {
  try {
    // Fetch today's agent run stats grouped by agent name
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: runs } = await supabase
      .from('agent_runs')
      .select('agent_name, status, created_at')
      .gte('created_at', today.toISOString());

    // Aggregate per agent
    const statsMap = {};
    (runs || []).forEach(r => {
      if (!statsMap[r.agent_name]) {
        statsMap[r.agent_name] = { runs_today: 0, failures_today: 0 };
      }
      statsMap[r.agent_name].runs_today++;
      if (r.status === 'failed') statsMap[r.agent_name].failures_today++;
    });

    // Fetch system control for paused states
    const { data: ctrl } = await supabase.from('system_control').select('agent_pauses').single();
    const agentPauses = ctrl?.agent_pauses || {};

    const agents = CANONICAL_AGENTS.map(a => {
      const stats = statsMap[a.name] || { runs_today: 0, failures_today: 0 };
      const paused = agentPauses[a.key] || false;
      const successRate = stats.runs_today > 0
        ? Math.round(((stats.runs_today - stats.failures_today) / stats.runs_today) * 100)
        : 100;
      return {
        ...a,
        paused,
        status: paused ? 'paused' : (stats.runs_today > 0 ? 'running' : 'idle'),
        runs_today: stats.runs_today,
        failures_today: stats.failures_today,
        success_rate: successRate,
      };
    });

    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import { processAgentCallback } from '../agents/client.js';
import { advance } from '../orchestrator/index.js';

/**
 * POST /agents/callback
 * DronaHQ agent webhook callback endpoint.
 * Requires Authorization: Bearer <AGENT_CALLBACK_SECRET>
 */
router.post('/callback', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.AGENT_CALLBACK_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { run_id, thread_id, agent_name, payload } = req.body;
  if (!agent_name || !payload || (!run_id && !thread_id)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Find the pending campaign_prospect
    let query = supabase.from('campaign_prospects')
      .select('*, prospects(*), campaigns(*)')
      .eq('pending_agent_call', agent_name)
      .not('agent_fired_at', 'is', null);
      
    if (run_id) {
      query = query.eq('pending_run_id', run_id);
    } else {
      query = query.eq('pending_thread_id', thread_id);
    }

    const { data: prospects, error } = await query;
    
    if (error) throw error;
    if (!prospects || prospects.length === 0) {
      return res.status(404).json({ error: 'No matching pending prospect found' });
    }
    
    const cp = prospects[0];

    // Meta object needed by processAgentCallback for logging to agent_runs
    const meta = {
      campaign_id: cp.campaign_id,
      prospect_id: cp.prospect_id,
      prompt_version_id: cp.campaigns?.active_prompt_version_id || null,
      payload: cp.pending_payload || {}, // Should we store the payload? We didn't add it to DB yet!
      is_retry: false 
    };

    const latencyMs = Date.now() - new Date(cp.agent_fired_at).getTime();

    // 2. Process the callback (validates, retries once async if needed, writes to agent_runs)
    const result = await processAgentCallback(agent_name, payload, meta, req.body.tokens || 200, req.body.cost || 0.002, latencyMs);

    if (result.is_retry_fired) {
      // Validation failed, and processAgentCallback fired a new run asynchronously.
      // We must update the pending flags to the new thread_id/run_id
      const { error: updErr } = await supabase.from('campaign_prospects')
        .update({
          pending_run_id: result.pending.run_id,
          pending_thread_id: result.pending.thread_id,
          agent_fired_at: new Date().toISOString()
        })
        .eq('campaign_id', cp.campaign_id)
        .eq('prospect_id', cp.prospect_id);
      
      if (updErr) console.error('Failed to update retry pending info:', updErr);
      return res.json({ message: 'Retry fired', new_pending: result.pending });
    }

    // 3. Clear pending state
    const { error: clearErr } = await supabase.from('campaign_prospects')
      .update({
        pending_agent_call: null,
        pending_run_id: null,
        pending_thread_id: null,
        agent_fired_at: null
      })
      .eq('campaign_id', cp.campaign_id)
      .eq('prospect_id', cp.prospect_id);

    if (clearErr) throw clearErr;

    // 4. Trigger the orchestrator to advance this prospect
    // advance() runs asynchronously and does not block the callback response
    advance(cp.campaign_id, cp.prospect_id, result.parsedOutput).catch(err => {
      console.error(`Error advancing prospect ${cp.prospect_id}:`, err);
    });

    res.json({ success: true, message: 'Callback processed and pipeline advanced' });

  } catch (err) {
    console.error('Callback processing error:', err);
    res.status(500).json({ error: err.message });
  }
});
