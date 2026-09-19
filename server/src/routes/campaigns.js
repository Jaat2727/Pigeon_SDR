import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/metrics', async (req, res) => {
  // Stub for now
  res.json({
    '11111111-1111-1111-1111-111111111111': { prospects: 840, sent: 312, replies: 47, meetings: 8 },
    '22222222-2222-2222-2222-222222222222': { prospects: 520, sent: 198, replies: 22, meetings: 4 },
    '33333333-3333-3333-3333-333333333333': { prospects: 390, sent: 145, replies: 31, meetings: 6 }
  });
});

export default router;
