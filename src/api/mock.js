/**
 * Mock API — Phase 1 complete rebuild.
 * Fixes: 3-state ICP, all 7 agents, rich timelines, missing CRUD functions,
 * reps, suppression, computed health/cost, human-readable escalation names.
 */

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms + Math.random() * 200));

const CAMPAIGN_COLOURS = ['#3B9AE1', '#4FBF92', '#D9A441'];
const FUNNEL_STAGES = ['discovered', 'researched', 'qualified', 'contacted', 'engaged', 'meeting', 'opportunity'];

const CAMPAIGN_TARGETS = {
  'camp_1': { prospects: 840, sent: 312, replies: 47, meetings: 8 },
  'camp_2': { prospects: 520, sent: 198, replies: 22, meetings: 4 },
  'camp_3': { prospects: 390, sent: 145, replies: 31, meetings: 6 }
};

let _campaigns = [
  {
    id: 'camp_1', name: 'Enterprise HR Tech Outreach', description: 'Target CHROs at large enterprises.', colour: CAMPAIGN_COLOURS[0], status: 'live', owner: 'Nishu',
    target_audience: 'CHROs, US Enterprise 5k–10k employees', channels: { email: true, linkedin: true, sms: false, voice: false },
    agents: { research: true, icp_fitment: true, personalisation: true, conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false },
    reps: ['rep_1', 'rep_2'], created_at: '2026-09-15T10:30:00Z',
  },
  {
    id: 'camp_2', name: 'Mid-Market CFO Campaign', description: 'Reach CFOs at mid-market fintech and SaaS companies.', colour: CAMPAIGN_COLOURS[1], status: 'paused', owner: 'Nishu',
    target_audience: 'CFOs, EU Fintech and SaaS companies', channels: { email: true, linkedin: true, sms: true, voice: false },
    agents: { research: true, icp_fitment: true, personalisation: true, conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false },
    reps: ['rep_1'], created_at: '2026-09-16T08:00:00Z',
  },
  {
    id: 'camp_3', name: 'SaaS Dev Tools – Tech Leaders', description: 'Engage VPs of Engineering at early-stage dev tools companies.', colour: CAMPAIGN_COLOURS[2], status: 'live', owner: 'Nishu',
    target_audience: 'VPs of Engineering, Dev Tools, Series A–B', channels: { email: true, linkedin: false, sms: false, voice: false },
    agents: { research: true, icp_fitment: true, personalisation: true, conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false },
    reps: ['rep_2'], created_at: '2026-09-17T12:00:00Z',
  }
];

// ── Reps ──
let _reps = [
  { id: 'rep_1', full_name: 'Nishu Jain', email: 'nishu@iitm.ac.in', title: 'Founder & SDR Lead', linkedin_url: 'https://linkedin.com/in/nishu', is_active: true, created_at: '2026-09-10T10:00:00Z' },
  { id: 'rep_2', full_name: 'Aarav Singh', email: 'aarav@pigeonsdr.com', title: 'Account Executive', linkedin_url: 'https://linkedin.com/in/aarav', is_active: true, created_at: '2026-09-12T10:00:00Z' },
];

// ── Suppression ──
let _suppression = [
  { id: 'sup_1', email: 'ceo@competitor.com', domain: null, reason: 'Competitor', added_by: 'Nishu', created_at: '2026-09-14T10:00:00Z' },
  { id: 'sup_2', email: null, domain: 'government.gov', reason: 'Government org — not a target', added_by: 'System', created_at: '2026-09-14T10:00:00Z' },
  { id: 'sup_3', email: 'optout@example.com', domain: null, reason: 'Opt-out request', added_by: 'System', created_at: '2026-09-15T10:00:00Z' },
];

// ── Seed helpers ──
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
const now = new Date();

const firstNames = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','William','Elizabeth','David','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'];
const companies = ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella', 'Stark Ind.', 'Wayne Ent', 'Massive Dynamic', 'Hooli', 'Pied Piper', 'Dunder Mifflin', 'Cyberdyne', 'Oscorp', 'Weyland-Yutani', 'Gringotts'];
const rolesCamp1 = ['CHRO', 'VP HR', 'Head of People', 'Director of HR'];
const rolesCamp2 = ['CFO', 'VP Finance', 'Director of Finance'];
const rolesCamp3 = ['VP Engineering', 'CTO', 'Head of Engineering'];

const replyTexts = [
  'Sounds interesting, can we chat next week?',
  'We actually just started evaluating solutions in this space.',
  'Can you send more details? Particularly around pricing.',
  'Not the right time, but circle back in Q2.',
  'Who should I loop in from our side?',
  'We already have a vendor for this. Thanks though.',
];
const replyIntents = ['interested', 'meeting_request', 'question', 'not_now', 'referral', 'not_interested'];
const knowledgeChunks = ['Product Specs v4.2', 'Greenhouse API Integration Checklist', 'Objection Handling Script', 'Competitor Comparison Grid', 'Enterprise HR Playbook'];

let _allProspects = [];
let _agentRuns = [];
let _activities = [];
let _messages = [];
let _escalations = [];

// ── Generate prospects ──
for (const camp of _campaigns) {
  const t = CAMPAIGN_TARGETS[camp.id];
  const prospectCount = randomInt(40, 60);
  const roles = camp.id === 'camp_1' ? rolesCamp1 : (camp.id === 'camp_2' ? rolesCamp2 : rolesCamp3);

  for (let i = 0; i < prospectCount; i++) {
    const id = `pro_${camp.id}_${i}`;
    const fname = randomChoice(firstNames);
    const lname = randomChoice(lastNames);
    const role = randomChoice(roles);
    const company = randomChoice(companies);
    const stage = randomChoice(FUNNEL_STAGES);
    const stageIdx = FUNNEL_STAGES.indexOf(stage);
    const score = randomInt(20, 95);

    // ── Three-state ICP verdict ──
    const icp_status = score > 65 ? 'qualify' : (score >= 40 ? 'needs_review' : 'reject');
    const icp_confidence = score > 65 ? 'high' : (score >= 40 ? 'low' : 'medium');
    const icp_reasoning = score > 65
      ? 'Strong match across all primary dimensions. Role, seniority, company size and industry all align.'
      : (score >= 40
        ? 'Critical data missing or ambiguous — company size unverified, seniority unclear. Manual review recommended.'
        : 'Does not meet minimum ICP criteria. Industry mismatch and insufficient seniority.');

    const last_touch = randomDate(new Date(now.getTime() - 7*86400000), now);
    const next_touch = randomDate(now, new Date(now.getTime() + 7*86400000));

    // ── Rich timeline events based on funnel stage ──
    let timeline = [];
    const baseTime = now.getTime() - (stageIdx + 3) * 86400000;

    // Stage 0+: discovered
    timeline.push({
      type: 'discovered', agent: null, agent_engine: null, prompt_version: null,
      tokens_used: 0, cost: 0,
      timestamp: new Date(baseTime).toISOString(),
      details: {}, knowledge_chunks: [],
    });

    // Stage 1+: researched
    if (stageIdx >= 1) {
      const tIn = randomInt(800, 1500);
      const tOut = randomInt(200, 500);
      const cost = parseFloat(((tIn + tOut) * 0.000015).toFixed(4));
      timeline.push({
        type: 'researched', agent: 'Research & Enrichment', agent_engine: 'dronahq', prompt_version: 'v2',
        tokens_used: tIn + tOut, cost,
        timestamp: new Date(baseTime + 86400000).toISOString(),
        details: { signals_found: randomInt(2, 6) }, knowledge_chunks: [],
      });
    }

    // Stage 2+: ICP scored
    if (stageIdx >= 2) {
      const tIn = randomInt(400, 800);
      const tOut = randomInt(100, 300);
      const cost = parseFloat(((tIn + tOut) * 0.000015).toFixed(4));
      timeline.push({
        type: icp_status === 'qualify' ? 'qualified' : (icp_status === 'needs_review' ? 'needs_review' : 'rejected'),
        agent: 'ICP Fitment', agent_engine: 'dronahq', prompt_version: 'v4',
        tokens_used: tIn + tOut, cost,
        timestamp: new Date(baseTime + 2*86400000).toISOString(),
        details: { verdict: icp_status, reason: `Score: ${score}. ${icp_reasoning}` },
        knowledge_chunks: ['ICP Guidelines v2'],
      });
    }

    // Stage 3+: strategy created + message sent
    if (stageIdx >= 3) {
      const tIn1 = randomInt(500, 900);
      const tOut1 = randomInt(150, 400);
      const cost1 = parseFloat(((tIn1 + tOut1) * 0.000015).toFixed(4));
      timeline.push({
        type: 'strategy_created', agent: 'Outreach Strategy', agent_engine: 'dronahq', prompt_version: 'v1',
        tokens_used: tIn1 + tOut1, cost: cost1,
        timestamp: new Date(baseTime + 2.5*86400000).toISOString(),
        details: {}, knowledge_chunks: [],
      });

      const tIn2 = randomInt(600, 1200);
      const tOut2 = randomInt(200, 500);
      const cost2 = parseFloat(((tIn2 + tOut2) * 0.000015).toFixed(4));
      timeline.push({
        type: 'contacted', agent: 'Personalisation & Send', agent_engine: 'dronahq', prompt_version: 'v4',
        tokens_used: tIn2 + tOut2, cost: cost2,
        timestamp: new Date(baseTime + 3*86400000).toISOString(),
        details: {
          subject: `Scaling ${company}'s ${camp.id === 'camp_1' ? 'HR' : (camp.id === 'camp_2' ? 'finance' : 'engineering')} operations`,
          message_text: `Hi ${fname},\n\nI noticed ${company} recently expanded and your team is growing fast. We help companies like yours streamline operations at scale.\n\nWould 15 minutes next week work to explore if there's a fit?\n\nBest,\nNishu`,
        },
        knowledge_chunks: [randomChoice(knowledgeChunks), randomChoice(knowledgeChunks)],
      });
    }

    // Stage 4+: reply received
    if (stageIdx >= 4) {
      const replyIdx = randomInt(0, replyTexts.length - 1);
      const tIn = randomInt(300, 600);
      const tOut = randomInt(80, 200);
      const cost = parseFloat(((tIn + tOut) * 0.000015).toFixed(4));
      timeline.push({
        type: 'replied', agent: 'Conversation', agent_engine: 'dronahq', prompt_version: 'v2',
        tokens_used: tIn + tOut, cost,
        timestamp: new Date(baseTime + 4*86400000).toISOString(),
        details: {
          reply_text: replyTexts[replyIdx],
          detected_intent: replyIntents[Math.min(replyIdx, replyIntents.length - 1)],
        },
        knowledge_chunks: [],
      });
    }

    // Stage 5+: meeting booked
    if (stageIdx >= 5) {
      timeline.push({
        type: 'meeting_booked', agent: 'Follow-up Timing', agent_engine: 'our_engine', prompt_version: null,
        tokens_used: 0, cost: 0,
        timestamp: new Date(baseTime + 5*86400000).toISOString(),
        details: {}, knowledge_chunks: [],
      });
    }

    // Stage 6: opportunity
    if (stageIdx >= 6) {
      timeline.push({
        type: 'opportunity', agent: null, agent_engine: null, prompt_version: null,
        tokens_used: 0, cost: 0,
        timestamp: new Date(baseTime + 6*86400000).toISOString(),
        details: {}, knowledge_chunks: [],
      });
    }

    // ── Agent runs (for cost/health computation) ──
    const agentNames = ['Research & Enrichment', 'ICP Fitment', 'Outreach Strategy', 'Personalisation & Send', 'Conversation'];
    const runsPerProspect = randomInt(2, 5);
    for (let r = 0; r < runsPerProspect; r++) {
      const aName = agentNames[r % agentNames.length];
      const tIn = randomInt(300, 1500);
      const tOut = randomInt(50, 400);
      const failed = Math.random() < 0.03; // 3% failure rate
      _agentRuns.push({
        id: `run_${id}_${r}`,
        prospect_id: id,
        campaign_id: camp.id,
        agent_name: aName,
        engine: aName === 'Follow-up Timing' ? 'our_engine' : 'dronahq',
        tokens_in: tIn,
        tokens_out: tOut,
        cost_usd: parseFloat(((tIn + tOut) * 0.000015).toFixed(4)),
        latency_ms: randomInt(600, 3500),
        status: failed ? 'failed' : 'success',
        prompt_version: 'v' + randomInt(1, 4),
        timestamp: randomDate(new Date(now.getTime() - 3*86400000), now),
      });
    }

    _allProspects.push({
      id,
      campaign_id: camp.id,
      campaign_name: camp.name,
      first_name: fname,
      last_name: lname,
      email: `${fname.toLowerCase()}.${lname.toLowerCase()}@example.com`,
      company: company,
      role: role,
      funnel_status: stage,
      fit_score: score,
      fit_reason: icp_reasoning,
      last_touch: last_touch,
      next_touch: next_touch,
      timeline,
      icp_verdict: {
        status: icp_status,
        fit_score: score,
        confidence: icp_confidence,
        dimension_scores: {
          role: { score: Math.min(score + randomInt(-5, 10), 100), evidence: 'Title matches target persona' },
          company_size: { score: Math.max(score + randomInt(-15, 5), 0), evidence: score >= 40 ? 'Company size within target range' : 'Company too small for ICP' },
          industry: { score: Math.min(score + randomInt(0, 8), 100), evidence: 'Industry alignment verified' },
        },
        reasoning: icp_reasoning,
        disqualifiers: icp_status === 'reject' ? ['Below minimum score threshold', 'Industry mismatch'] : [],
        missing_data: icp_status === 'needs_review' ? ['company_employee_count', 'funding_stage'] : [],
      },
      provenance: {
        role: randomChoice(['manual', 'crm', 'ai_enriched']),
        company: randomChoice(['manual', 'crm', 'ai_enriched']),
        email: randomChoice(['manual', 'crm']),
        title: 'ai_enriched',
        phone: 'crm',
      },
      facts: [
        { text: randomChoice(['Recently raised Series B funding', 'Expanding to 3 new markets', 'Hiring 20+ engineers this quarter', 'New CTO appointed last month']), source: randomChoice(['Crunchbase', 'LinkedIn', 'Company Blog', 'News API']), tag: 'ai_enriched' },
        score > 50 ? { text: 'Previously used competitor product', source: 'CRM Import', tag: 'crm' } : null,
      ].filter(Boolean),
    });
  }

  // ── Activity feeds ──
  if (camp.status === 'live') {
    const allAgents = ['Research & Enrichment', 'ICP Fitment', 'Outreach Strategy', 'Personalisation & Send', 'Conversation', 'Follow-up Timing'];
    const outcomes = [
      'Qualified prospect with score 85.', 'Sent personalised email via Email.', 'Found 3 new hiring signals.',
      'Drafted follow-up sequence.', 'Classified reply as interested.', 'Scheduled follow-up for Tuesday.',
      'Rejected prospect — industry mismatch.', 'Escalated: missing company data, needs review.',
    ];
    for (let a = 0; a < 18; a++) {
      _activities.push({
        id: `act_${camp.id}_${a}`,
        campaign_id: camp.id,
        agent: randomChoice(allAgents),
        prospect_name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
        outcome: randomChoice(outcomes),
        status: Math.random() > 0.08 ? 'success' : 'error',
        timestamp: randomDate(new Date(now.getTime() - 86400000), now),
      });
    }
  }
}

_activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// ── Escalations with human-readable names ──
_escalations = [
  {
    id: 'esc_1', campaign_id: 'camp_1', campaign_name: 'Enterprise HR Tech Outreach',
    prospect_id: 'pro_camp_1_0', prospect_name: `${_allProspects.find(p => p.id === 'pro_camp_1_0')?.first_name || 'James'} ${_allProspects.find(p => p.id === 'pro_camp_1_0')?.last_name || 'Smith'}`,
    source_agent: 'ICP Fitment', escalation_type: 'needs_review',
    reason: 'needs_review', proposed_action: 'Prospect score is 45 due to ambiguous company size. Company employee count not found in any source. Proceed with qualification or reject?',
    status: 'pending', created_at: new Date(now.getTime() - 3600000).toISOString(),
  },
  {
    id: 'esc_2', campaign_id: 'camp_2', campaign_name: 'Mid-Market CFO Campaign',
    prospect_id: 'pro_camp_2_1', prospect_name: `${_allProspects.find(p => p.id === 'pro_camp_2_1')?.first_name || 'Mary'} ${_allProspects.find(p => p.id === 'pro_camp_2_1')?.last_name || 'Johnson'}`,
    source_agent: 'Outreach Strategy', escalation_type: 'escalate_to_human',
    reason: 'escalate_to_human', proposed_action: 'Prospect has opted out of previous campaigns. Prior negative response detected in thread history. Requesting human override to pause all outreach to this prospect.',
    status: 'pending', created_at: new Date(now.getTime() - 7200000).toISOString(),
  },
  {
    id: 'esc_3', campaign_id: 'camp_3', campaign_name: 'SaaS Dev Tools – Tech Leaders',
    prospect_id: 'pro_camp_3_2', prospect_name: `${_allProspects.find(p => p.id === 'pro_camp_3_2')?.first_name || 'John'} ${_allProspects.find(p => p.id === 'pro_camp_3_2')?.last_name || 'Williams'}`,
    source_agent: 'Personalisation & Send', escalation_type: 'needs_human',
    reason: 'needs_human', proposed_action: 'Subject: Scaling your engineering team\n\nHi John,\n\nI noticed your recent blog post about Kubernetes scaling challenges at Initech. I drafted this response but felt it relies on a product claim I couldn\'t verify from the knowledge base. Please review before sending.\n\nBest,\nNishu',
    status: 'pending', created_at: new Date(now.getTime() - 1800000).toISOString(),
  },
];

let _systemControl = {
  kill_switch: false,
  channel_pauses: { email: false, linkedin: false, sms: false, voice: false },
};

let _conflicts = [
  { id: 'conf_1', prospect_name: 'Jane Doe', prospect_id: 'pro_camp_1_5', campaigns: ['Enterprise HR Tech Outreach', 'Mid-Market CFO Campaign'], campaign_ids: ['camp_1', 'camp_2'], last_touch: new Date().toISOString(), rule: 'Priority Campaign Wins', status: 'pending' },
  { id: 'conf_2', prospect_name: 'Bob Smith', prospect_id: 'pro_camp_3_3', campaigns: ['SaaS Dev Tools – Tech Leaders', 'Enterprise HR Tech Outreach'], campaign_ids: ['camp_3', 'camp_1'], last_touch: new Date().toISOString(), rule: 'Earliest Claim Wins', status: 'pending' },
  { id: 'conf_3', prospect_name: 'Alice Johnson', prospect_id: 'pro_camp_2_7', campaigns: ['Mid-Market CFO Campaign', 'SaaS Dev Tools – Tech Leaders'], campaign_ids: ['camp_2', 'camp_3'], last_touch: new Date().toISOString(), rule: 'Manual Review Required', status: 'pending' },
];

// ── Prompt versions (per campaign, per agent tab) ──
let _promptVersions = {
  'camp_1': [
    // System Prompt
    {
      id: 'pv_c1_s4', agent_name: 'System Prompt', version: 4, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 2*86400000).toISOString(),
      content: 'Role: You are an SDR targeting Enterprise HR at Fortune 500s.\n\nVariables:\n- {{first_name}}: Prospect first name\n- {{company}}: Prospect company\n- {{recent_news}}: Recent company news/funding\n\nRules:\n1. Be concise, under 75 words.\n2. Do NOT use buzzwords like "synergy" or "alignment".\n3. Start with the recent news to show we did our research.\n\nOutput Schema:\n{\n  "subject": "string",\n  "body": "string",\n  "escalate": "boolean"\n}\n\nEscalation:\n- Return "needs_human" if company size is missing from context.',
    },
    {
      id: 'pv_c1_s3', agent_name: 'System Prompt', version: 3, is_active: false, author: 'Nishu',
      created_at: new Date(now.getTime() - 10*86400000).toISOString(),
      content: 'Role: You are an SDR targeting Enterprise HR.\n\nVariables:\n- {{first_name}}: Prospect first name\n- {{company}}: Prospect company\n- {{recent_news}}: Recent company news\n\nRules:\n1. Keep it under 100 words.\n2. Start with the recent news to show we did our research.\n\nOutput Schema:\n{\n  "subject": "string",\n  "body": "string"\n}\n\nEscalation:\n- Return "needs_human" if company size is missing.',
    },
    {
      id: 'pv_c1_s2', agent_name: 'System Prompt', version: 2, is_active: false, author: 'Admin SDR',
      created_at: new Date(now.getTime() - 20*86400000).toISOString(),
      content: 'Role: You are an SDR targeting Enterprise HR.\n\nVariables:\n- {{first_name}}\n- {{company}}\n\nRules:\n1. Keep it under 100 words.\n2. Be friendly and polite.\n\nOutput Schema:\n{\n  "subject": "string",\n  "body": "string"\n}\n\nEscalation: none.',
    },
    {
      id: 'pv_c1_s1', agent_name: 'System Prompt', version: 1, is_active: false, author: 'Admin SDR',
      created_at: new Date(now.getTime() - 30*86400000).toISOString(),
      content: 'Role: You are an SDR.\n\nVariables:\n- {{first_name}}\n\nRules:\nBe friendly.\n\nOutput Schema:\n{ "body": "string" }\n\nEscalation: none.',
    },
    // Research Agent
    {
      id: 'pv_c1_r2', agent_name: 'Research Agent', version: 2, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 5*86400000).toISOString(),
      content: 'Role: Research agent enriching prospect profiles.\n\nFocus areas:\n- Recent funding rounds\n- Hiring signals (engineering, HR)\n- Tech stack changes\n- Leadership changes\n\nSources: Klazify, Krust Data, LinkedIn.\n\nRules:\n1. Never guess — null is correct, invented is not.\n2. Record confidence per field.\n3. Cite sources for every fact.',
    },
    {
      id: 'pv_c1_r1', agent_name: 'Research Agent', version: 1, is_active: false, author: 'Admin SDR',
      created_at: new Date(now.getTime() - 15*86400000).toISOString(),
      content: 'Role: Research agent.\n\nFocus: funding, hiring, tech stack.\n\nRules: Never guess. Cite sources.',
    },
    // ICP Agent
    {
      id: 'pv_c1_i2', agent_name: 'ICP Agent', version: 2, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 4*86400000).toISOString(),
      content: 'Role: ICP scoring agent.\n\nDimensions:\n- Role match (CHRO, VP HR, Head of People)\n- Company size (5,000–10,000 employees)\n- Industry (Enterprise, Technology, SaaS)\n- Seniority (C-level, VP, Director)\n\nExclusions (immediate reject, score 0):\n- Government organisations\n- Companies under 100 employees\n- Existing customers\n\nVerdicts:\n- qualify: score >= 65, all critical dimensions met\n- needs_review: score 40-64 OR missing critical data\n- reject: score < 40 OR exclusion match\n\nTemperature: 0',
    },
    {
      id: 'pv_c1_i1', agent_name: 'ICP Agent', version: 1, is_active: false, author: 'Admin SDR',
      created_at: new Date(now.getTime() - 18*86400000).toISOString(),
      content: 'Role: ICP scorer.\nDimensions: role, company size, industry.\nVerdicts: qualify or reject.\nTemperature: 0.',
    },
    // Personalisation Agent
    {
      id: 'pv_c1_p2', agent_name: 'Personalisation Agent', version: 2, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 3*86400000).toISOString(),
      content: 'Role: Write one outbound message for one step.\n\nRules:\n1. Under 75 words.\n2. Every claim about the prospect must cite a real profile field.\n3. Every product claim must cite a knowledge chunk.\n4. Set needs_human when inputs are thin.\n5. Include personalisation_used[] with {claim, source_field}.\n6. Include knowledge_used[] with {claim, source}.',
    },
    {
      id: 'pv_c1_p1', agent_name: 'Personalisation Agent', version: 1, is_active: false, author: 'Admin SDR',
      created_at: new Date(now.getTime() - 22*86400000).toISOString(),
      content: 'Role: Write outbound message.\nRules: Be concise. Personalise.',
    },
    // Conversation Agent
    {
      id: 'pv_c1_cv1', agent_name: 'Conversation Agent', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 6*86400000).toISOString(),
      content: 'Role: Classify inbound replies.\n\nIntents: interested, meeting_request, question, objection, not_now, not_interested, opt_out, referral, wrong_person, auto_reply, bounce, unclear.\n\nRules:\n1. opt_out overrides every other reading.\n2. Extract facts from the reply.\n3. Identify questions and objections separately.\n4. Recommend action: respond, escalate, close, wait.',
    },
  ],
  'camp_2': [
    {
      id: 'pv_c2_s1', agent_name: 'System Prompt', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 5*86400000).toISOString(),
      content: 'Role: Finance SDR targeting CFOs at mid-market fintech.\n\nVariables: {{first_name}}, {{company}}, {{revenue}}\n\nRules:\n1. Focus on ROI and cost savings.\n2. Under 80 words.\n\nOutput Schema: { "subject": "string", "body": "string" }\n\nEscalation: needs_human if revenue data missing.',
    },
    {
      id: 'pv_c2_r1', agent_name: 'Research Agent', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 5*86400000).toISOString(),
      content: 'Role: Research agent for CFO outreach.\nFocus: revenue, funding, board changes, regulatory filings.\nRules: Never guess. Cite sources.',
    },
    {
      id: 'pv_c2_i1', agent_name: 'ICP Agent', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 5*86400000).toISOString(),
      content: 'Role: ICP scorer for mid-market CFO campaign.\nDimensions: role (CFO, VP Finance), company size (200-2000), industry (Fintech, SaaS).\nVerdicts: qualify, needs_review, reject.',
    },
    {
      id: 'pv_c2_p1', agent_name: 'Personalisation Agent', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 5*86400000).toISOString(),
      content: 'Role: Write one finance-focused outbound message.\nRules: Lead with ROI. Under 80 words.',
    },
    {
      id: 'pv_c2_cv1', agent_name: 'Conversation Agent', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 5*86400000).toISOString(),
      content: 'Role: Classify inbound CFO replies.\nIntents: interested, meeting_request, question, objection, not_now, not_interested, opt_out.\nRules: opt_out overrides all.',
    },
  ],
  'camp_3': [
    {
      id: 'pv_c3_s1', agent_name: 'System Prompt', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 3*86400000).toISOString(),
      content: 'Role: Dev tools SDR targeting VPs of Engineering.\n\nVariables: {{first_name}}, {{company}}, {{tech_stack}}\n\nRules:\n1. Reference their tech stack.\n2. Be technical but not salesy.\n3. Under 70 words.\n\nOutput Schema: { "subject": "string", "body": "string" }\n\nEscalation: needs_human if tech stack unknown.',
    },
    {
      id: 'pv_c3_r1', agent_name: 'Research Agent', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 3*86400000).toISOString(),
      content: 'Role: Research agent for dev tools outreach.\nFocus: tech stack, engineering blog posts, GitHub activity, open roles.\nRules: Never guess. Cite sources.',
    },
    {
      id: 'pv_c3_i1', agent_name: 'ICP Agent', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 3*86400000).toISOString(),
      content: 'Role: ICP scorer for dev tools campaign.\nDimensions: role (VP Eng, CTO), company stage (Series A-B), industry (Dev Tools, SaaS).\nVerdicts: qualify, needs_review, reject.',
    },
    {
      id: 'pv_c3_p1', agent_name: 'Personalisation Agent', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 3*86400000).toISOString(),
      content: 'Role: Write one dev-tools-focused outbound message.\nRules: Reference tech stack. Be technical. Under 70 words.',
    },
    {
      id: 'pv_c3_cv1', agent_name: 'Conversation Agent', version: 1, is_active: true, author: 'Nishu',
      created_at: new Date(now.getTime() - 3*86400000).toISOString(),
      content: 'Role: Classify inbound engineering leader replies.\nIntents: interested, meeting_request, question, objection, not_now, not_interested, opt_out.\nRules: opt_out overrides all.',
    },
  ],
};

// ── Helpers for computed metrics ──
function getRunsForCampaign(campId) {
  return _agentRuns.filter(r => r.campaign_id === campId);
}

// ═══════════════════════════════════════════════
// MOCK API
// ═══════════════════════════════════════════════
let _nextCampaignNum = 4;

export const mockApi = {
  // ── Campaigns ──
  async getCampaigns() {
    await delay();
    return Promise.all(_campaigns.map(async c => ({
      ...c,
      metrics: await mockApi.getCampaignMetrics(c.id),
    })));
  },

  async getCampaign(id) {
    await delay();
    const c = _campaigns.find(c => c.id === id);
    if (!c) return null;
    return { ...c, metrics: await mockApi.getCampaignMetrics(c.id) };
  },

  async updateCampaign(id, data) {
    await delay();
    const c = _campaigns.find(c => c.id === id);
    if (!c) throw new Error('Campaign not found');
    Object.assign(c, data);
    return c;
  },

  async setCampaignStatus(id, status) {
    await delay();
    const c = _campaigns.find(c => c.id === id);
    if (!c) throw new Error('Campaign not found');
    c.status = status;
    return c;
  },

  async createCampaign(data) {
    await delay();
    const newCamp = {
      id: `camp_${_nextCampaignNum++}`,
      colour: CAMPAIGN_COLOURS[_campaigns.length % CAMPAIGN_COLOURS.length],
      status: 'draft',
      created_at: new Date().toISOString(),
      ...data,
    };
    _campaigns.push(newCamp);
    return newCamp;
  },

  async duplicateCampaign(id) {
    await delay();
    const source = _campaigns.find(c => c.id === id);
    if (!source) throw new Error('Campaign not found');
    const dup = {
      ...source,
      id: `camp_${_nextCampaignNum++}`,
      name: `${source.name} (Copy)`,
      status: 'draft',
      created_at: new Date().toISOString(),
    };
    _campaigns.push(dup);
    return dup;
  },

  // ── Prospects ──
  async getCampaignProspects(id) {
    await delay();
    return _allProspects.filter(p => p.campaign_id === id);
  },

  async getAllProspects() {
    await delay();
    return _allProspects;
  },

  async getProspect(id) {
    await delay();
    const p = _allProspects.find(p => p.id === id);
    if (!p) return null;
    return {
      ...p,
      runs: _agentRuns.filter(r => r.prospect_id === id),
      messages: _messages.filter(m => m.prospect_id === id),
    };
  },

  // ── Escalations ──
  async getEscalations() {
    await delay();
    return _escalations.filter(e => e.status === 'pending');
  },

  async resolveEscalation(id, action) {
    await delay();
    const e = _escalations.find(e => e.id === id);
    if (e) { e.status = action; e.resolved_at = new Date().toISOString(); }
    return e;
  },

  // ── System Control ──
  async getSystemControl() {
    await delay();
    return _systemControl;
  },

  async toggleKillSwitch(engaged) {
    await delay();
    _systemControl.kill_switch = engaged;
    return _systemControl;
  },

  async setChannelPause(channel, paused) {
    await delay();
    _systemControl.channel_pauses[channel] = paused;
    return _systemControl;
  },

  // ── Prompts ──
  async getCampaignPrompts(id) {
    await delay();
    return _promptVersions[id] || [];
  },

  async createPromptVersion(campaignId, data) {
    await delay();
    const existing = _promptVersions[campaignId] || [];
    const agentVersions = existing.filter(v => v.agent_name === (data.agent_name || 'System Prompt'));
    const maxVersion = agentVersions.reduce((max, v) => Math.max(max, v.version), 0);
    const newVersion = {
      id: `pv_new_${Date.now()}`,
      agent_name: data.agent_name || 'System Prompt',
      version: maxVersion + 1,
      is_active: false,
      author: 'Nishu',
      created_at: new Date().toISOString(),
      content: data.content || '',
    };
    if (!_promptVersions[campaignId]) _promptVersions[campaignId] = [];
    _promptVersions[campaignId].unshift(newVersion);
    return newVersion;
  },

  async activatePrompt(id) {
    await delay();
    let found = false;
    for (const pvList of Object.values(_promptVersions)) {
      const target = pvList.find(p => p.id === id);
      if (target) {
        // Deactivate others in same campaign AND same agent
        pvList.filter(p => p.agent_name === target.agent_name).forEach(p => p.is_active = false);
        target.is_active = true;
        found = true;
        break;
      }
    }
    if (!found) throw new Error('Prompt version not found');
  },

  // ── Conflicts ──
  async getConflicts() {
    await delay();
    return _conflicts.filter(c => c.status === 'pending');
  },

  async resolveConflict(id, winningCampaignId) {
    await delay();
    const c = _conflicts.find(c => c.id === id);
    if (c) {
      c.status = 'resolved';
      c.resolved_campaign_id = winningCampaignId;
      c.resolved_at = new Date().toISOString();
    }
    return c;
  },

  // ── Costs ──
  async getCosts() {
    await delay();
    const totalSpend = _agentRuns.reduce((sum, r) => sum + parseFloat(r.cost_usd), 0);
    const avgLatency = _agentRuns.length > 0
      ? Math.round(_agentRuns.reduce((sum, r) => sum + r.latency_ms, 0) / _agentRuns.length)
      : 0;
    const byCampaign = _campaigns.map(c => {
      const runs = getRunsForCampaign(c.id);
      return {
        campaign_id: c.id,
        campaign_name: c.name,
        spend: parseFloat(runs.reduce((sum, r) => sum + parseFloat(r.cost_usd), 0).toFixed(2)),
        runs: runs.length,
      };
    });
    return {
      total_spend: parseFloat(totalSpend.toFixed(2)),
      avg_latency_ms: avgLatency,
      total_runs: _agentRuns.length,
      by_campaign: byCampaign,
    };
  },

  // ── Metrics ──
  async getCampaignMetrics(id) {
    await delay();
    const t = CAMPAIGN_TARGETS[id] || { prospects: 100, sent: 20, replies: 5, meetings: 1 };
    const runs = getRunsForCampaign(id);
    const failures = runs.filter(r => r.status === 'failed').length;
    const pendingEsc = _escalations.filter(e => e.campaign_id === id && e.status === 'pending').length;
    const spend = parseFloat(runs.reduce((sum, r) => sum + parseFloat(r.cost_usd), 0).toFixed(2));

    const funnel = {
      discovered: t.prospects - Math.floor(t.prospects * 0.8),
      researched: Math.floor(t.prospects * 0.3),
      qualified: Math.floor(t.prospects * 0.5) - t.sent,
      contacted: t.sent - t.replies,
      engaged: t.replies - t.meetings - Math.floor(t.replies * 0.2),
      meeting: t.meetings - 1,
      opportunity: 1,
    };

    return {
      total_prospects: t.prospects,
      messages_sent: t.sent,
      positive_replies: Math.floor(t.replies * 0.6),
      negative_replies: t.replies - Math.floor(t.replies * 0.6),
      replies: t.replies,
      meetings: t.meetings,
      meetings_booked: t.meetings,
      response_rate: ((t.replies / t.sent) * 100).toFixed(1),
      meeting_rate: ((t.meetings / t.replies) * 100).toFixed(1),
      funnel,
      // Health fields
      failures_today: failures,
      pending_approvals: pendingEsc,
      escalations: pendingEsc,
      agent_runs_today: runs.length,
      spend_today: spend,
    };
  },

  async getCampaignActivity(id) {
    await delay();
    return _activities.filter(a => a.campaign_id === id);
  },

  // ── Agents (all 7 with correct engine badges) ──
  async getAgentRuns(id) {
    await delay();
    const camp = _campaigns.find(c => c.id === id);
    const runs = getRunsForCampaign(id);
    const countFor = (name) => runs.filter(r => r.agent_name === name).length;
    const failFor = (name) => runs.filter(r => r.agent_name === name && r.status === 'failed').length;
    return [
      { name: 'Research & Enrichment', key: 'research', engine: 'dronahq', runs_today: countFor('Research & Enrichment') || 450, failures_today: failFor('Research & Enrichment') || 1, enabled: camp?.agents?.research ?? true },
      { name: 'ICP Fitment', key: 'icp_fitment', engine: 'dronahq', runs_today: countFor('ICP Fitment') || 400, failures_today: failFor('ICP Fitment') || 3, enabled: camp?.agents?.icp_fitment ?? true },
      { name: 'Outreach Strategy', key: 'outreach_strategy', engine: 'dronahq', runs_today: countFor('Outreach Strategy') || 380, failures_today: failFor('Outreach Strategy'), enabled: camp?.agents?.outreach_strategy ?? true },
      { name: 'Personalisation & Send', key: 'personalisation', engine: 'dronahq', runs_today: countFor('Personalisation & Send') || 350, failures_today: failFor('Personalisation & Send'), enabled: camp?.agents?.personalisation ?? true },
      { name: 'Conversation', key: 'conversation', engine: 'dronahq', runs_today: countFor('Conversation') || 120, failures_today: failFor('Conversation') || 2, enabled: camp?.agents?.conversation ?? true },
      { name: 'Follow-up Timing', key: 'followup_timing', engine: 'our_engine', runs_today: 200, failures_today: 0, enabled: camp?.agents?.followup_timing ?? true },
      { name: 'Voice SDR', key: 'voice_sdr', engine: 'dronahq', runs_today: 0, failures_today: 0, enabled: camp?.agents?.voice_sdr ?? false },
    ];
  },

  // ── Reps ──
  async getReps() {
    await delay();
    return _reps;
  },

  // ── Suppression ──
  async getSuppression() {
    await delay();
    return _suppression;
  },
};
