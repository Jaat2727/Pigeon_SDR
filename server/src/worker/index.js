import { supabase } from '../db/client.js';
import { advance } from '../orchestrator/index.js';

const POLL_INTERVAL_MS = 30000; // 30 seconds
const STALE_TIMEOUT_MINS = 5;

async function runSweeper() {
  try {
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - STALE_TIMEOUT_MINS * 60000).toISOString();


    // 2. ACTION SWEEPER
    const { data: readyProspects, error: readyErr } = await supabase
      .from('campaign_prospects')
      .select('*')
      .is('pending_agent_call', null)
      .lte('next_action_at', now.toISOString());

    if (readyErr) {
      console.error('Worker: Error fetching ready prospects', readyErr);
    } else if (readyProspects && readyProspects.length > 0) {
      for (const cp of readyProspects) {
        console.log(`Worker: Prospect ${cp.prospect_id} is ready for advance.`);
        advance(cp.campaign_id, cp.prospect_id);
      }
    }

  } catch (err) {
    console.error('Worker loop error:', err);
  }
}

let intervalId = null;

export function startWorker() {
  if (intervalId) return;
  console.log('Starting orchestrator worker loop...');
  runSweeper(); // run immediately
  intervalId = setInterval(runSweeper, POLL_INTERVAL_MS);
}

export function stopWorker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Stopped orchestrator worker loop.');
  }
}
