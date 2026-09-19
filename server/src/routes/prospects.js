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

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('campaign_prospects').select('*, prospects(*)').eq('prospect_id', id).single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Not found in campaign_prospects, just fetch prospect
      const { data: pData, error: pError } = await supabase.from('prospects').select('*').eq('id', id).single();
      if (pError) return res.status(404).json({ error: 'Not found' });
      return res.json(pData);
    }
    return res.status(500).json({ error: error.message });
  }

  const prospect = {
    ...data.prospects,
    campaign_id: data.campaign_id,
    funnel_status: data.state,
    fit_score: data.fit_score,
    icp_verdict: { status: data.icp_verdict, confidence: data.icp_confidence },
    last_touch: data.last_touch_at,
    campaign_prospect_id: data.id
  };
  
  res.json(prospect);
});

export default router;
