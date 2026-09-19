import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('escalations').select('*, prospects(first_name, last_name, company_name), campaigns(name)').eq('status', 'pending');
  if (error) return res.status(500).json({ error: error.message });
  
  // Format for frontend
  const escalations = data.map(e => ({
    ...e,
    prospect_name: e.prospects ? `${e.prospects.first_name} ${e.prospects.last_name}` : 'Unknown',
    campaign_name: e.campaigns ? e.campaigns.name : 'Unknown'
  }));
  
  res.json(escalations);
});

export default router;
