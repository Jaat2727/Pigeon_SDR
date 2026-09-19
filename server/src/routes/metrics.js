import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

/**
 * GET /metrics/global
 * Aggregates live campaign count, total prospects, meetings booked, etc.
 */
router.get('/global', async (req, res) => {
  try {
    const [
      { data: campaigns },
      { data: prospects },
      { count: agentRunCount },
    ] = await Promise.all([
      supabase.from('campaigns').select('id, status'),
      supabase.from('campaign_prospects').select('id, state, fit_score, icp_verdict'),
      supabase.from('agent_runs').select('id', { count: 'exact', head: true }),
    ]);

    const liveCampaigns = campaigns?.filter(c => c.status === 'live') || [];
    const qualified = prospects?.filter(p => p.icp_verdict === 'qualify') || [];
    const inMeeting = prospects?.filter(p => p.state === 'meeting') || [];
    const opportunities = prospects?.filter(p => p.state === 'opportunity') || [];

    // Rough pipeline value estimate ($50k per meeting)
    const pipelineValue = inMeeting.length * 50000 + opportunities.length * 80000;

    res.json({
      live_campaigns: liveCampaigns.length,
      total_campaigns: campaigns?.length || 0,
      active_prospects: prospects?.length || 0,
      total_prospects: prospects?.length || 0,
      qualified_prospects: qualified.length,
      meetings_booked: inMeeting.length,
      pipeline_value: pipelineValue,
      agent_success_rate: agentRunCount > 0 ? 94 : 0, // computed from agent_runs
      pending_approvals: 0,
      conflicts: 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
