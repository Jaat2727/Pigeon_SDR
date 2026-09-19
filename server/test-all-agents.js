import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { callAgent } from './src/agents/client.js';

const agents = [
  {
    name: 'research',
    payload: {
      prospect: { first_name: 'Guillermo', last_name: 'Rauch', company_name: 'Vercel', email: 'rauchg@vercel.com', title: 'CEO' }
    }
  },
  {
    name: 'icp_fitment',
    payload: {
      prospect: { enriched_profile: { full_name: 'Guillermo Rauch', title: 'CEO', company_name: 'Vercel', company_industry: 'Software', company_employee_count: 500 } },
      campaign: { icp_criteria: 'Target CEO at Software companies', exclusion_criteria: 'Exclude hardware', sample_profiles: [] }
    }
  },
  {
    name: 'outreach_strategy',
    payload: {
      prospect: { enriched_profile: { full_name: 'Guillermo Rauch', title: 'CEO' }, thread_history: [] },
      outreach: { current_step: {} },
      campaign: { messaging_policy: 'Keep it short.' },
      retrieved_knowledge: [],
      rep: { identity: 'System' }
    }
  },
  {
    name: 'personalisation',
    payload: {
      prospect: { enriched_profile: { full_name: 'Guillermo Rauch', title: 'CEO', recent_news: 'Vercel shipped Next.js 15.' }, thread_history: [] },
      outreach: { current_step: { channel: 'email', goal: 'Pitch platform.' } },
      campaign: { messaging_policy: 'Be professional.' },
      retrieved_knowledge: [],
      rep: { identity: 'System' }
    }
  },
  {
    name: 'conversation',
    payload: {
      inbound: { message: 'Not interested right now.', channel: 'email' },
      prospect: { enriched_profile: { full_name: 'Guillermo Rauch' }, thread_history: [] },
      campaign: { objective_and_policy: 'Book meeting.' }
    }
  }
];

async function run() {
  console.log('DRONAHQ_API_KEY is:', process.env.DRONAHQ_API_KEY ? 'present' : 'missing');
  const results = {};
  for (const agent of agents) {
    console.log(`\n\n=== RUNNING: ${agent.name} ===`);
    try {
      const res = await callAgent(agent.name, agent.payload, { prospect_id: null });
      // Remove parsedOutput for brevity of logging raw output
      delete res.parsedOutput; 
      console.log(JSON.stringify(res, null, 2));
    } catch (err) {
      console.error(`Failed ${agent.name}:`, err.message);
    }
  }
}
run();
