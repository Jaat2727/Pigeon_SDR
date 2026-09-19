import fs from 'fs';

const AGENTS = [
  {
    name: 'icp_fitment',
    payload: {
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
    }
  },
  {
    name: 'research',
    payload: {
      prospect: {
        stub: { full_name: 'Rahul Patel', company_name: 'Acme Corp', linkedin_url: 'https://linkedin.com/in/rahulpatel' }
      },
      campaign: {
        research_focus: 'Look for recent funding or product launches.'
      }
    }
  },
  {
    name: 'outreach_strategy',
    payload: {
      prospect: {
        enriched_profile: { person: { title: 'CTO' }, company: { name: 'Acme' } },
        icp_result: { verdict: 'qualify', fit_score: 85, confidence: 'high' },
        contact_history: []
      },
      campaign: {
        outreach_policy: '3 touches over 7 days. Email first.',
        enabled_channels: ['email', 'linkedin']
      }
    }
  },
  {
    name: 'personalisation',
    payload: {
      prospect: {
        enriched_profile: { person: { first_name: 'Rahul' }, company: { name: 'Acme' } },
        thread_history: []
      },
      outreach: {
        current_step: { channel: 'email', angle: 'Productivity' }
      },
      campaign: {
        messaging_policy: 'Keep it short, under 100 words.'
      },
      retrieved_knowledge: [],
      rep: { identity: 'Alex, SDR at Pigeon' }
    }
  },
  {
    name: 'conversation',
    payload: {
      inbound: { message: 'We just bought a competitor tool last week.', channel: 'email' },
      prospect: {
        thread_history: [{ from: 'us', body: 'Hi Rahul, interested in trying Pigeon?' }],
        enriched_profile: { person: { title: 'CTO' } }
      },
      campaign: { objective_and_policy: 'Book a demo.' }
    }
  }
];

async function run() {
  let report = '# Agent Test Results\n\n';
  
  for (const agent of AGENTS) {
    console.log(`Testing ${agent.name}...`);
    try {
      const res = await fetch(`http://localhost:3001/debug/agent/${agent.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent.payload)
      });
      const data = await res.json();
      
      report += `## ${agent.name}\n\n`;
      report += '```json\n' + JSON.stringify(data, null, 2) + '\n```\n\n';
    } catch (err) {
      report += `## ${agent.name}\n\nERROR: ${err.message}\n\n`;
    }
  }
  
  fs.writeFileSync('agent_test_results.md', report);
  console.log('Done. Results in agent_test_results.md');
}

run();
