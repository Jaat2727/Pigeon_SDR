import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('conflicts').select('*, prospects(first_name, last_name, company_name)').eq('status', 'pending');
  if (error) return res.status(500).json({ error: error.message });
  
  // Need to fetch campaigns for each conflict since it's an array of UUIDs
  // For demo, just return them raw and let frontend map names if needed
  const conflicts = data.map(c => ({
    ...c,
    prospect_name: c.prospects ? `${c.prospects.first_name} ${c.prospects.last_name}` : 'Unknown'
  }));
  
  res.json(conflicts);
});

export default router;
