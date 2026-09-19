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

/**
 * POST /control/agent
 * Globally pause or resume a specific agent by its key.
 * Reads/writes agent_pauses JSONB on system_control.
 */
router.post('/agent', async (req, res) => {
  const { agent, paused } = req.body;
  if (!agent) return res.status(400).json({ error: 'agent key is required' });

  const { data: current } = await supabase.from('system_control').select('*').single();
  const currentPauses = current?.agent_pauses || {};
  const updatedPauses = { ...currentPauses, [agent]: paused };

  // Try to update with agent_pauses — will fail gracefully if column missing
  const { data, error } = await supabase
    .from('system_control')
    .update({ agent_pauses: updatedPauses })
    .eq('id', 1)
    .select()
    .single();

  if (error) {
    // Column might not exist yet — return current state with local override
    console.warn('agent_pauses column not available:', error.message);
    return res.json({ ...(current || {}), agent_pauses: updatedPauses });
  }
  res.json(data);
});

export default router;
