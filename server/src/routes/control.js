import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('system_control').select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/kill', async (req, res) => {
  const { enabled } = req.body;
  const { data, error } = await supabase
    .from('system_control')
    .update({ kill_switch: enabled })
    .eq('id', 1)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/channel', async (req, res) => {
  const { channel, paused } = req.body;
  
  const { data: current } = await supabase.from('system_control').select('channel_pauses').single();
  const updatedPauses = { ...current.channel_pauses, [channel]: paused };
  
  const { data, error } = await supabase
    .from('system_control')
    .update({ channel_pauses: updatedPauses })
    .eq('id', 1)
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
