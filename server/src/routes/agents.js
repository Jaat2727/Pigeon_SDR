import express from 'express';
import { supabase } from '../db/client.js';
import { AGENT_REGISTRY } from '../agents/registry.js';

const router = express.Router();

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

    const agents = AGENT_REGISTRY.map(a => {
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


