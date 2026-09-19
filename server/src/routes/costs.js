import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

// GET /costs — aggregate daily spend from agent_runs
router.get('/', async (req, res) => {
  try {
    const { data: runs } = await supabase.from('agent_runs').select('cost_usd, latency_ms, campaign_id');
    const rs = runs || [];
    
    const totalSpend = rs.reduce((s, r) => s + parseFloat(r.cost_usd || 0), 0);
    const avgLatency = rs.length > 0 
      ? Math.round(rs.reduce((s, r) => s + (r.latency_ms || 0), 0) / rs.length) 
      : 0;
    
    // Group by campaign
    const { data: campaigns } = await supabase.from('campaigns').select('id, name');
    const campMap = {};
    (campaigns || []).forEach(c => { campMap[c.id] = c.name; });
    
    const byCampaign = {};
    rs.forEach(r => {
      if (!byCampaign[r.campaign_id]) {
        byCampaign[r.campaign_id] = { campaign_id: r.campaign_id, campaign_name: campMap[r.campaign_id] || 'Unknown', spend: 0, runs: 0 };
      }
      byCampaign[r.campaign_id].spend += parseFloat(r.cost_usd || 0);
      byCampaign[r.campaign_id].runs++;
    });
    
    res.json({
      total_spend: parseFloat(totalSpend.toFixed(2)),
      avg_latency_ms: avgLatency,
      total_runs: rs.length,
      by_campaign: Object.values(byCampaign).map(c => ({ ...c, spend: parseFloat(c.spend.toFixed(2)) })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
