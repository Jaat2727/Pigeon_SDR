import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

// GET /reps
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('reps').select('*').order('full_name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

export default router;
