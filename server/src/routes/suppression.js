import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

// GET /suppression
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('suppression_list').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

export default router;
