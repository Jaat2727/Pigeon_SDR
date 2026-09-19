import { supabase } from '../db/client.js';
import { advance } from '../orchestrator/index.js';

const POLL_INTERVAL_MS = 30000; // 30 seconds
const STALE_TIMEOUT_MINS = 5;

async function runSweeper() {
  try {
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - STALE_TIMEOUT_MINS * 60000).toISOString();

    // 1. STALE RUN SWEEPER
    const { data: staleProspects, error: staleErr } = await supabase
      .from('campaign_prospects')
      .select('*')
      .not('pending_agent_call', 'is', null)
      .lt('agent_fired_at', staleThreshold);

    if (staleErr) {
      console.error('Worker: Error fetching stale prospects', staleErr);
    } else if (staleProspects && staleProspects.length > 0) {
      for (const cp of staleProspects) {
        console.log(`Worker: Prospect ${cp.prospect_id} has a stale pending run for ${cp.pending_agent_call}. Failing it out.`);
        
        // Write degraded agent_runs record
        await supabase.from('agent_runs').insert({
          campaign_id: cp.campaign_id,
          prospect_id: cp.prospect_id,
          agent_name: cp.pending_agent_call,
          input_data: cp.pending_payload || {},
          output_data: { _degraded: true, error: 'Run timed out waiting for callback' },
          status: 'error'
        });

        // Clear pending flags
        await supabase.from('campaign_prospects')
          .update({
            pending_agent_call: null,
            pending_run_id: null,
            pending_thread_id: null,
            agent_fired_at: null
          })
          .eq('campaign_id', cp.campaign_id)
          .eq('prospect_id', cp.prospect_id);

        // We can either advance() again (which would retry the same agent) 
        // or let it be escalated depending on how orchestrator handles degraded output.
        // For now, advance will just pick up the same state again and retry, 
        // unless we updated the state to 'needs_review'.
        advance(cp.campaign_id, cp.prospect_id);
      }
    }

    // 2. ACTION SWEEPER
    const { data: readyProspects, error: readyErr } = await supabase
      .from('campaign_prospects')
      .select('*')
      .is('pending_agent_call', null)
      .lte('next_action_at', now.toISOString());

    if (readyErr) {
      console.error('Worker: Error fetching ready prospects', readyErr);
    } else if (readyProspects && readyProspects.length > 0) {
      for (const cp of readyProspects) {
        console.log(`Worker: Prospect ${cp.prospect_id} is ready for advance.`);
        advance(cp.campaign_id, cp.prospect_id);
      }
    }

  } catch (err) {
    console.error('Worker loop error:', err);
  }
}

let intervalId = null;

export function startWorker() {
  if (intervalId) return;
  console.log('Starting orchestrator worker loop...');
  runSweeper(); // run immediately
  intervalId = setInterval(runSweeper, POLL_INTERVAL_MS);
}

export function stopWorker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Stopped orchestrator worker loop.');
  }
}
