import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('campaigns').select('*, campaign_reps(rep_id)').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  
  const formatted = data.map(c => ({
    ...c,
    reps: c.campaign_reps ? c.campaign_reps.map(r => r.rep_id) : []
  }));
  res.json(formatted);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('campaigns').select('*, campaign_reps(rep_id)').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  
  const formatted = {
    ...data,
    reps: data.campaign_reps ? data.campaign_reps.map(r => r.rep_id) : []
  };
  res.json(formatted);
});

router.get('/:id/metrics', async (req, res) => {
  const { id } = req.params;
  const metrics = {
    '11111111-1111-1111-1111-111111111111': { prospects: 840, sent: 312, replies: 47, meetings: 8 },
    '22222222-2222-2222-2222-222222222222': { prospects: 520, sent: 198, replies: 22, meetings: 4 },
    '33333333-3333-3333-3333-333333333333': { prospects: 390, sent: 145, replies: 31, meetings: 6 }
  };
  res.json(metrics[id] || { prospects: 0, sent: 0, replies: 0, meetings: 0 });
});

router.get('/:id/activity', async (req, res) => {
  const { data, error } = await supabase.from('activities').select('*').eq('campaign_id', req.params.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.get('/:id/agents', async (req, res) => {
  const { data, error } = await supabase.from('agent_runs').select('*').eq('campaign_id', req.params.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

export default router;
