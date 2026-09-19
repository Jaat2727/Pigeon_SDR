import express from 'express';
import { callAgent } from '../agents/client.js';
import { supabase } from '../db/client.js';

const router = express.Router();

router.post('/agent/:name', async (req, res) => {
  const { name } = req.params;
  const payload = req.body;
  
  // Rate Limit
  const maxCalls = parseInt(process.env.MAX_AGENT_CALLS_PER_DAY || '20', 10);
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count: runsToday } = await supabase
    .from('agent_runs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay.toISOString());

  if (runsToday >= maxCalls) {
    return res.status(429).json({ error: `Daily limit reached (${runsToday}/${maxCalls})` });
  }

  try {
    const result = await callAgent(name, payload, { prospect_id: null });
    res.json(result);
  } catch (error) {
    console.error('Agent debug error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

export default router;
