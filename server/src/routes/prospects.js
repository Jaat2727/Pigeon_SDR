import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { campaignId, status } = req.query;
  let query = supabase.from('campaign_prospects').select('*, prospects(*)');
  if (campaignId) query = query.eq('campaign_id', campaignId);
  if (status) query = query.eq('state', status);
  
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  
  // Flatten for frontend
  const prospects = data.map(cp => ({
    ...cp.prospects,
    campaign_id: cp.campaign_id,
    funnel_status: cp.state,
    fit_score: cp.fit_score,
    icp_verdict: { status: cp.icp_verdict, confidence: cp.icp_confidence },
    last_touch: cp.last_touch_at,
    campaign_prospect_id: cp.id
  }));
  
  res.json(prospects);
});

export default router;
