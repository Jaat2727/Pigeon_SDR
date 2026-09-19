import express from 'express';
import { supabase } from '../db/client.js';

const router = express.Router();

// GET /prompts — list all (rarely used directly)
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('prompt_versions').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// POST /prompts/:id/activate — activate a specific prompt version
router.post('/:id/activate', async (req, res) => {
  const { id } = req.params;
  
  // Get the target prompt to find its campaign_id and agent_name
  const { data: target, error: fetchErr } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (!target) return res.status(404).json({ error: 'Prompt version not found' });
  
  // Deactivate all versions for the same agent in the same campaign
  await supabase
    .from('prompt_versions')
    .update({ is_active: false })
    .eq('campaign_id', target.campaign_id)
    .eq('agent_name', target.agent_name);
  
  // Activate the target version
  const { data, error } = await supabase
    .from('prompt_versions')
    .update({ is_active: true })
    .eq('id', id)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
