import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

/**
 * GET /activity
 * Returns the most recent activity events across all campaigns.
 */
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const { data, error } = await supabase
    .from('activities')
    .select('*, campaigns(name, colour)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

export default router;
