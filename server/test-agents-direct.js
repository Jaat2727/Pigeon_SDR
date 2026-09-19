import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { callAgent } from './src/agents/client.js';

const payload = {
  prospect: {
    enriched_profile: {
      person: { full_name: 'Rahul Patel', title: 'VP Engineering' },
      company: { name: 'Acme Corp', employee_count: 150, industry: 'SaaS' }
    }
  },
  campaign: {
    icp_criteria: 'Target VP Eng or CTO at SaaS companies with 50-500 employees.',
    exclusion_criteria: 'Exclude hardware companies.',
    sample_profiles: []
  }
};

async function run() {
  console.log('DRONAHQ_API_KEY is:', process.env.DRONAHQ_API_KEY ? 'present' : 'missing');
  try {
    const res = await callAgent('icp_fitment', payload, { prospect_id: null });
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
