/**
 * Mock API — returns correctly shaped data for every endpoint.
 * Simulates network delay. All state is held in memory.
 * Swap out for real API by setting VITE_API_BASE_URL.
 */

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms + Math.random() * 200));

// ────────────────────────────────────────
// Seed Data
// ────────────────────────────────────────

const CAMPAIGN_COLOURS = [
  '#3B9AE1', '#4FBF92', '#D9A441', '#E05C5C',
  '#A78BFA', '#F472B6', '#38BDF8', '#FB923C',
];

let _campaigns = [
  {
    id: 'camp_1',
    name: 'Enterprise HR Tech Outreach',
    description: 'Target CHROs at large enterprises to introduce our HR automation platform.',
    colour: CAMPAIGN_COLOURS[0],
    status: 'live',
    owner: 'Nishu',
    target_audience: 'CHROs, US Enterprise 5k–10k employees',
    geography: ['United States'],
    target_roles: ['CHRO', 'VP People', 'Head of HR'],
    company_size: '5000-10000',
    industry: ['Technology', 'Financial Services'],
    channels: { email: true, linkedin: true, sms: false, voice: false },
    channel_limits: { email: 50, linkedin: 30, sms: 0, voice: 0 },
    agents: {
      research: true, icp_fitment: true, personalisation: true,
      conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false,
    },
    working_hours: { start: '09:00', end: '18:00', timezone: 'America/New_York' },
    reps: ['rep_1', 'rep_2'],
    approval_required: false,
    created_at: '2026-09-15T10:30:00Z',
    updated_at: '2026-09-18T14:20:00Z',
  },
  {
    id: 'camp_2',
    name: 'Mid-Market CFO Campaign',
    description: 'Reach CFOs at mid-market fintech and SaaS companies across Europe.',
    colour: CAMPAIGN_COLOURS[1],
    status: 'live',
    owner: 'Nishu',
    target_audience: 'CFOs, EU Fintech and SaaS companies',
    geography: ['United Kingdom', 'Germany', 'France'],
    target_roles: ['CFO', 'Finance Director', 'VP Finance'],
    company_size: '200-2000',
    industry: ['Fintech', 'SaaS'],
    channels: { email: true, linkedin: true, sms: true, voice: false },
    channel_limits: { email: 40, linkedin: 25, sms: 10, voice: 0 },
    agents: {
      research: true, icp_fitment: true, personalisation: true,
      conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false,
    },
    working_hours: { start: '08:00', end: '17:00', timezone: 'Europe/London' },
    reps: ['rep_1'],
    approval_required: true,
    created_at: '2026-09-16T08:00:00Z',
    updated_at: '2026-09-18T16:45:00Z',
  },
  {
    id: 'camp_3',
    name: 'SaaS Dev Tools – Tech Leaders',
    description: 'Engage VPs of Engineering at early-stage dev tools companies.',
    colour: CAMPAIGN_COLOURS[2],
    status: 'live',
    owner: 'Nishu',
    target_audience: 'VPs of Engineering, Dev Tools, Series A–B',
    geography: ['United States', 'Canada'],
    target_roles: ['VP Engineering', 'CTO', 'Head of Platform'],
    company_size: '50-500',
    industry: ['Developer Tools', 'Infrastructure'],
    channels: { email: true, linkedin: true, sms: false, voice: false },
    channel_limits: { email: 35, linkedin: 20, sms: 0, voice: 0 },
    agents: {
      research: true, icp_fitment: true, personalisation: true,
      conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false,
    },
    working_hours: { start: '09:00', end: '17:00', timezone: 'America/Los_Angeles' },
    reps: ['rep_2'],
    approval_required: false,
    created_at: '2026-09-17T12:00:00Z',
    updated_at: '2026-09-18T18:00:00Z',
  },
  {
    id: 'camp_4',
    name: 'Healthcare AI Discovery',
    description: 'Explore AI adoption among US healthcare providers.',
    colour: CAMPAIGN_COLOURS[3],
    status: 'paused',
    owner: 'Nishu',
    target_audience: 'Heads of AI, US Healthcare Providers',
    geography: ['United States'],
    target_roles: ['Head of AI', 'Chief Data Officer'],
    company_size: '1000-50000',
    industry: ['Healthcare', 'Life Sciences'],
    channels: { email: true, linkedin: false, sms: false, voice: false },
    channel_limits: { email: 20, linkedin: 0, sms: 0, voice: 0 },
    agents: {
      research: true, icp_fitment: true, personalisation: true,
      conversation: false, outreach_strategy: true, followup_timing: true, voice_sdr: false,
    },
    working_hours: { start: '08:00', end: '16:00', timezone: 'America/Chicago' },
    reps: ['rep_1'],
    approval_required: true,
    created_at: '2026-09-14T09:00:00Z',
    updated_at: '2026-09-18T10:00:00Z',
  },
  {
    id: 'camp_5',
    name: 'APAC Logistics Outreach',
    description: 'Target supply chain leaders in the APAC logistics sector.',
    colour: CAMPAIGN_COLOURS[4],
    status: 'draft',
    owner: 'Nishu',
    target_audience: 'Heads of Supply Chain, APAC',
    geography: ['Singapore', 'Australia', 'India'],
    target_roles: ['Head of Supply Chain', 'VP Operations'],
    company_size: '500-5000',
    industry: ['Logistics', 'Supply Chain'],
    channels: { email: true, linkedin: true, sms: false, voice: false },
    channel_limits: { email: 30, linkedin: 15, sms: 0, voice: 0 },
    agents: {
      research: true, icp_fitment: true, personalisation: true,
      conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false,
    },
    working_hours: { start: '09:00', end: '18:00', timezone: 'Asia/Singapore' },
    reps: [],
    approval_required: false,
    created_at: '2026-09-18T06:00:00Z',
    updated_at: '2026-09-18T06:00:00Z',
  },
];

const FUNNEL_STAGES = ['discovered', 'researched', 'qualified', 'contacted', 'engaged', 'meeting', 'opportunity'];

function makeProspects(campaignId, colour, count) {
  const companies = [
    { company: 'Stripe', domain: 'stripe.com' },
    { company: 'Snowflake', domain: 'snowflake.com' },
    { company: 'Datadog', domain: 'datadoghq.com' },
    { company: 'Notion', domain: 'notion.so' },
    { company: 'Figma', domain: 'figma.com' },
    { company: 'Vercel', domain: 'vercel.com' },
    { company: 'HashiCorp', domain: 'hashicorp.com' },
    { company: 'Confluent', domain: 'confluent.io' },
    { company: 'MongoDB', domain: 'mongodb.com' },
    { company: 'Cloudflare', domain: 'cloudflare.com' },
    { company: 'PagerDuty', domain: 'pagerduty.com' },
    { company: 'Elastic', domain: 'elastic.co' },
  ];
  const firstNames = ['Sarah', 'Michael', 'Priya', 'James', 'Elena', 'David', 'Aisha', 'Chen', 'Olivia', 'Raj', 'Emma', 'Lucas'];
  const lastNames = ['Chen', 'Patel', 'Johnson', 'Mueller', 'Garcia', 'Kim', 'Singh', 'Williams', 'Brown', 'Lee', 'Martinez', 'Anderson'];
  const roles = ['VP Engineering', 'CHRO', 'CFO', 'Head of AI', 'CTO', 'VP People', 'Director of Engineering', 'Head of Platform'];

  const prospects = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i + 3) % lastNames.length];
    const co = companies[i % companies.length];
    const stage = FUNNEL_STAGES[Math.min(Math.floor(Math.random() * 7), 6)];
    const fitScore = Math.floor(Math.random() * 40) + 60;
    const fitReasons = [
      'Strong ICP match: role seniority and company size align with target criteria',
      'Moderate fit: company in target industry but role is adjacent',
      'High fit: recent funding round, growth signals strong buying intent',
      'Excellent fit: prior engagement with competitor products indicates need',
    ];
    prospects.push({
      id: `pro_${campaignId}_${i}`,
      first_name: fn,
      last_name: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${co.domain}`,
      company: co.company,
      company_domain: co.domain,
      role: roles[i % roles.length],
      campaign_id: campaignId,
      campaign_colour: colour,
      funnel_status: stage,
      fit_score: fitScore,
      fit_reason: fitReasons[i % fitReasons.length],
      last_touch: stage !== 'discovered' ? '2026-09-18T14:30:00Z' : null,
      next_touch: ['contacted', 'engaged'].includes(stage) ? '2026-09-19T09:00:00Z' : null,
      channel: 'email',
      linkedin_url: `https://linkedin.com/in/${fn.toLowerCase()}${ln.toLowerCase()}`,
      company_size: co.company === 'Stripe' ? 8000 : Math.floor(Math.random() * 5000) + 100,
      company_industry: 'Technology',
      company_funding: '$200M Series D',
      company_description: `${co.company} is a leading technology company in the industry.`,
      facts: [
        { text: `${fn} has been ${roles[i % roles.length]} for 3 years`, source: 'LinkedIn' },
        { text: `${co.company} recently raised $50M in Series C`, source: 'Crunchbase' },
        { text: `Company has ${Math.floor(Math.random() * 5000) + 200} employees`, source: 'LinkedIn' },
        { text: `${fn} previously worked at Google for 5 years`, source: 'LinkedIn' },
        { text: `${co.company} is expanding into European markets`, source: 'News' },
      ],
    });
  }
  return prospects;
}

let _allProspects = [
  ...makeProspects('camp_1', CAMPAIGN_COLOURS[0], 15),
  ...makeProspects('camp_2', CAMPAIGN_COLOURS[1], 12),
  ...makeProspects('camp_3', CAMPAIGN_COLOURS[2], 10),
  ...makeProspects('camp_4', CAMPAIGN_COLOURS[3], 8),
  ...makeProspects('camp_5', CAMPAIGN_COLOURS[4], 5),
];

function makeActivities(campaignId) {
  const agents = ['Research', 'ICP Fitment', 'Personalisation', 'Conversation', 'Outreach Strategy', 'Follow-up Timing'];
  const agentEngines = ['dronahq', 'dronahq', 'dronahq', 'dronahq', 'our_engine', 'our_engine'];
  const outcomes = [
    'Enriched company data from Crunchbase and LinkedIn',
    'Qualified with 87% confidence — strong ICP match',
    'Rejected: company size below threshold (45 employees)',
    'Sent personalised email referencing recent Series B raise',
    'Reply detected: positive intent — requesting demo',
    'Reply detected: negative — not interested at this time',
    'Scheduled follow-up in 3 days via LinkedIn',
    'Meeting booked for Sept 22 at 2pm ET',
    'Decided to pause: prospect already in another campaign',
    'Research complete: found 5 key talking points',
  ];
  const prospects = _allProspects.filter(p => p.campaign_id === campaignId);
  const activities = [];
  const count = 20 + Math.floor(Math.random() * 15);
  for (let i = 0; i < count; i++) {
    const agentIdx = Math.floor(Math.random() * agents.length);
    const prospect = prospects[Math.floor(Math.random() * prospects.length)];
    activities.push({
      id: `act_${campaignId}_${i}`,
      campaign_id: campaignId,
      agent: agents[agentIdx],
      agent_engine: agentEngines[agentIdx],
      prospect_id: prospect?.id,
      prospect_name: prospect ? `${prospect.first_name} ${prospect.last_name}` : 'Unknown',
      outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
      tokens_used: Math.floor(Math.random() * 2000) + 200,
      cost: parseFloat((Math.random() * 0.08 + 0.01).toFixed(4)),
      latency_ms: Math.floor(Math.random() * 3000) + 500,
      status: Math.random() > 0.1 ? 'success' : 'failed',
    });
  }
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function computeMetrics(campaignId) {
  const prospects = _allProspects.filter(p => p.campaign_id === campaignId);
  const funnel = {};
  FUNNEL_STAGES.forEach(s => { funnel[s] = 0; });
  prospects.forEach(p => { funnel[p.funnel_status] = (funnel[p.funnel_status] || 0) + 1; });

  const contacted = funnel.contacted + funnel.engaged + funnel.meeting + funnel.opportunity;
  const replied = funnel.engaged + funnel.meeting + funnel.opportunity;
  const meetings = funnel.meeting + funnel.opportunity;

  return {
    campaign_id: campaignId,
    total_prospects: prospects.length,
    funnel,
    messages_sent: contacted + Math.floor(Math.random() * 20),
    replies: replied + Math.floor(Math.random() * 5),
    positive_replies: Math.floor(replied * 0.6),
    negative_replies: Math.floor(replied * 0.4),
    meetings,
    opportunities: funnel.opportunity,
    response_rate: contacted > 0 ? parseFloat(((replied / Math.max(contacted, 1)) * 100).toFixed(1)) : 0,
    meeting_rate: contacted > 0 ? parseFloat(((meetings / Math.max(contacted, 1)) * 100).toFixed(1)) : 0,
    agent_runs_today: Math.floor(Math.random() * 50) + 10,
    failures_today: Math.floor(Math.random() * 5),
    pending_approvals: Math.floor(Math.random() * 8),
    escalations: Math.floor(Math.random() * 3),
    spend_today: parseFloat((Math.random() * 15 + 2).toFixed(2)),
  };
}

// Prompt versions
let _promptVersions = {};
function getPromptVersions(campaignId) {
  if (!_promptVersions[campaignId]) {
    _promptVersions[campaignId] = [
      {
        id: `pv_${campaignId}_1`,
        campaign_id: campaignId,
        version: 1,
        author: 'Nishu',
        created_at: '2026-09-15T10:00:00Z',
        is_active: false,
        type: 'campaign',
        content: `You are an SDR agent for our company. Your goal is to book meetings with qualified prospects.\n\nWhen researching prospects:\n- Focus on their role, company size, and recent news\n- Look for buying signals like funding rounds or team growth\n\nWhen writing messages:\n- Keep it under 150 words\n- Reference one specific thing about them\n- Ask a clear question to drive a response`,
      },
      {
        id: `pv_${campaignId}_2`,
        campaign_id: campaignId,
        version: 2,
        author: 'Nishu',
        created_at: '2026-09-16T14:30:00Z',
        is_active: false,
        type: 'campaign',
        content: `You are an SDR agent for our company. Your goal is to book meetings with qualified prospects.\n\nResearch guidelines:\n- Focus on their role, company size, recent funding, and competitive landscape\n- Look for buying signals: funding rounds, team growth, job postings for related roles\n- Check for existing tech stack mentions\n\nMessage guidelines:\n- Keep it under 120 words\n- Lead with a specific insight about their company\n- Connect the insight to our value proposition\n- End with a low-friction CTA (15-min call, not a demo)\n- Never use "I hope this email finds you well" or similar filler`,
      },
      {
        id: `pv_${campaignId}_3`,
        campaign_id: campaignId,
        version: 3,
        author: 'Nishu',
        created_at: '2026-09-18T09:15:00Z',
        is_active: true,
        type: 'campaign',
        content: `You are a senior SDR agent. Book qualified meetings by being genuinely helpful.\n\nResearch (be thorough):\n- Role tenure, career trajectory, public talks or posts\n- Company: funding, growth rate, tech stack, recent news\n- Competitive landscape and potential pain points\n- Any mutual connections or shared experiences\n\nQualification:\n- Must match ICP: right seniority, company size ${'>'}200, target industry\n- Confidence score must be ${'>'}75% to proceed\n- Flag edge cases for human review\n\nMessage craft:\n- Max 100 words\n- Open with a genuine observation (not flattery)\n- Connect to a specific problem we solve\n- End with: "Would a 15-minute call this week make sense?"\n- Never: "I hope this finds you well", "I noticed you", "Congrats on"\n- Tone: peer-to-peer, not salesy`,
      },
    ];
  }
  return _promptVersions[campaignId];
}

// Agent run data per campaign
function getAgentRuns(campaignId) {
  const agents = [
    { name: 'Research & Enrichment', engine: 'dronahq', enabled: true },
    { name: 'ICP Fitment', engine: 'dronahq', enabled: true },
    { name: 'Personalisation & Send', engine: 'dronahq', enabled: true },
    { name: 'Conversation', engine: 'dronahq', enabled: true },
    { name: 'Outreach Strategy', engine: 'our_engine', enabled: true },
    { name: 'Follow-up Timing', engine: 'our_engine', enabled: true },
    { name: 'Voice SDR', engine: 'dronahq', enabled: false },
  ];
  const campaign = _campaigns.find(c => c.id === campaignId);
  const agentKeys = ['research', 'icp_fitment', 'personalisation', 'conversation', 'outreach_strategy', 'followup_timing', 'voice_sdr'];

  return agents.map((a, i) => ({
    ...a,
    enabled: campaign?.agents?.[agentKeys[i]] ?? a.enabled,
    runs_today: a.enabled ? Math.floor(Math.random() * 40) + 5 : 0,
    failures_today: a.enabled ? Math.floor(Math.random() * 4) : 0,
  }));
}

// Conflicts
let _conflicts = [
  {
    id: 'conf_1',
    prospect_id: 'pro_camp_1_3',
    prospect_name: 'James Mueller',
    company: 'Notion',
    campaigns: [
      { id: 'camp_1', name: 'Enterprise HR Tech Outreach', claimed_at: '2026-09-16T10:00:00Z', times_contacted: 2 },
      { id: 'camp_2', name: 'Mid-Market CFO Campaign', claimed_at: '2026-09-17T14:00:00Z', times_contacted: 1 },
    ],
    auto_rule: 'Assigned to earliest claim (Enterprise HR Tech Outreach)',
    resolved: false,
  },
  {
    id: 'conf_2',
    prospect_id: 'pro_camp_2_5',
    prospect_name: 'Elena Williams',
    company: 'Vercel',
    campaigns: [
      { id: 'camp_2', name: 'Mid-Market CFO Campaign', claimed_at: '2026-09-15T08:00:00Z', times_contacted: 3 },
      { id: 'camp_3', name: 'SaaS Dev Tools – Tech Leaders', claimed_at: '2026-09-17T11:00:00Z', times_contacted: 0 },
    ],
    auto_rule: 'Assigned to most-contacted campaign (Mid-Market CFO Campaign)',
    resolved: false,
  },
];

// Reps
let _reps = [
  {
    id: 'rep_1',
    name: 'Nishu',
    email: 'nishu@iitm.ac.in',
    working_hours: { start: '09:00', end: '18:00', timezone: 'Asia/Kolkata' },
    campaigns: ['camp_1', 'camp_2', 'camp_4'],
  },
  {
    id: 'rep_2',
    name: 'Alex Chen',
    email: 'alex@company.com',
    working_hours: { start: '08:00', end: '17:00', timezone: 'America/New_York' },
    campaigns: ['camp_1', 'camp_3'],
  },
];

// Suppression list
let _suppression = [
  { email: 'ceo@competitor.com', reason: 'Competitor', added_at: '2026-09-10T10:00:00Z' },
  { email: 'legal@bigcorp.com', reason: 'Legal request', added_at: '2026-09-12T15:00:00Z' },
  { email: '*@government.gov', reason: 'Government domain', added_at: '2026-09-01T08:00:00Z' },
];

// System control
let _systemControl = {
  kill_switch: false,
  channel_pauses: { email: false, linkedin: false, sms: false, voice: false },
  updated_at: new Date().toISOString(),
};

// Timeline for a prospect
function getProspectTimeline(prospectId) {
  const prospect = _allProspects.find(p => p.id === prospectId);
  if (!prospect) return [];

  const pv = getPromptVersions(prospect.campaign_id);
  const activeVersion = pv.find(v => v.is_active) || pv[pv.length - 1];

  const timeline = [];
  const stages = FUNNEL_STAGES;
  const stageIdx = stages.indexOf(prospect.funnel_status);

  if (stageIdx >= 0) {
    timeline.push({
      type: 'discovered',
      agent: 'Research & Enrichment',
      agent_engine: 'dronahq',
      timestamp: '2026-09-16T10:15:00Z',
      prompt_version: activeVersion.version,
      knowledge_chunks: ['Company profile from Crunchbase', 'LinkedIn profile data'],
      tokens_used: 450,
      cost: 0.0180,
      latency_ms: 1200,
      details: { facts_found: prospect.facts.length },
    });
  }
  if (stageIdx >= 1) {
    timeline.push({
      type: 'researched',
      agent: 'Research & Enrichment',
      agent_engine: 'dronahq',
      timestamp: '2026-09-16T10:16:30Z',
      prompt_version: activeVersion.version,
      knowledge_chunks: ['Industry analysis doc', 'Competitor landscape brief'],
      tokens_used: 820,
      cost: 0.0328,
      latency_ms: 2100,
      details: { enrichment_sources: ['LinkedIn', 'Crunchbase', 'News'] },
    });
  }
  if (stageIdx >= 2) {
    timeline.push({
      type: 'qualified',
      agent: 'ICP Fitment',
      agent_engine: 'dronahq',
      timestamp: '2026-09-16T10:18:00Z',
      prompt_version: activeVersion.version,
      knowledge_chunks: ['ICP criteria document', 'Scoring rubric v2'],
      tokens_used: 380,
      cost: 0.0152,
      latency_ms: 900,
      details: {
        verdict: 'qualified',
        score: prospect.fit_score,
        reason: prospect.fit_reason,
      },
    });
  }
  if (stageIdx >= 3) {
    timeline.push({
      type: 'contacted',
      agent: 'Personalisation & Send',
      agent_engine: 'dronahq',
      timestamp: '2026-09-17T09:30:00Z',
      prompt_version: activeVersion.version,
      knowledge_chunks: ['Product value props', 'Case study: similar company', 'Prospect research notes'],
      tokens_used: 1250,
      cost: 0.0500,
      latency_ms: 3200,
      details: {
        channel: 'email',
        message_text: `Hi ${prospect.first_name},\n\nI noticed ${prospect.company} recently expanded into new markets — congrats on the growth. Companies at your stage often find that their outbound process becomes a bottleneck right around now.\n\nWe help teams like yours automate prospect research and personalised outreach without sacrificing quality. Our AI agents handle the research, qualification, and initial messaging so your team can focus on closing.\n\nWould a 15-minute call this week make sense to see if there's a fit?\n\nBest,\nPigeon SDR`,
        subject: `${prospect.company}'s growth + a quick question`,
      },
    });
  }
  if (stageIdx >= 4) {
    timeline.push({
      type: 'engaged',
      agent: 'Conversation',
      agent_engine: 'dronahq',
      timestamp: '2026-09-17T16:45:00Z',
      prompt_version: activeVersion.version,
      knowledge_chunks: ['Reply handling playbook', 'Objection responses'],
      tokens_used: 680,
      cost: 0.0272,
      latency_ms: 1500,
      details: {
        reply_text: `Thanks for reaching out. We are actually looking at this right now. Can you send me some more info about how the AI agents work? I'd be open to a call next week.`,
        detected_intent: 'positive',
        next_action: 'Send case study + schedule call',
      },
    });
  }
  if (stageIdx >= 5) {
    timeline.push({
      type: 'meeting',
      agent: 'Outreach Strategy',
      agent_engine: 'our_engine',
      timestamp: '2026-09-18T10:00:00Z',
      prompt_version: activeVersion.version,
      knowledge_chunks: [],
      tokens_used: 150,
      cost: 0.0060,
      latency_ms: 400,
      details: {
        meeting_time: '2026-09-22T14:00:00Z',
        meeting_type: 'Discovery call',
      },
    });
  }

  return timeline;
}

// Costs
function getCosts() {
  return {
    total_spend: 47.82,
    today_spend: 12.34,
    cost_per_prospect: 0.038,
    cost_per_qualified_lead: 0.142,
    cost_per_conversation: 0.285,
    by_campaign: _campaigns.map(c => ({
      campaign_id: c.id,
      campaign_name: c.name,
      spend: parseFloat((Math.random() * 20 + 5).toFixed(2)),
    })),
    by_agent: [
      { agent: 'Research & Enrichment', spend: 12.40 },
      { agent: 'ICP Fitment', spend: 6.20 },
      { agent: 'Personalisation & Send', spend: 18.50 },
      { agent: 'Conversation', spend: 7.80 },
      { agent: 'Outreach Strategy', spend: 1.92 },
      { agent: 'Follow-up Timing', spend: 1.00 },
    ],
  };
}


// ────────────────────────────────────────
// Mock API Handlers
// ────────────────────────────────────────

export const mockApi = {
  // ── Campaigns ──
  async getCampaigns() {
    await delay();
    return _campaigns.map(c => ({
      ...c,
      metrics: computeMetrics(c.id),
    }));
  },

  async createCampaign(data) {
    await delay(400);
    const newCampaign = {
      id: `camp_${Date.now()}`,
      colour: CAMPAIGN_COLOURS[_campaigns.length % CAMPAIGN_COLOURS.length],
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };
    _campaigns.push(newCampaign);
    return newCampaign;
  },

  async getCampaign(id) {
    await delay();
    const c = _campaigns.find(c => c.id === id);
    if (!c) throw new Error('Campaign not found');
    return { ...c, metrics: computeMetrics(id) };
  },

  async updateCampaign(id, data) {
    await delay(300);
    const idx = _campaigns.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Campaign not found');
    _campaigns[idx] = { ..._campaigns[idx], ...data, updated_at: new Date().toISOString() };
    return _campaigns[idx];
  },

  async setCampaignStatus(id, status) {
    await delay(200);
    const idx = _campaigns.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Campaign not found');
    _campaigns[idx].status = status;
    _campaigns[idx].updated_at = new Date().toISOString();
    return _campaigns[idx];
  },

  async duplicateCampaign(id) {
    await delay(400);
    const original = _campaigns.find(c => c.id === id);
    if (!original) throw new Error('Campaign not found');
    const dupe = {
      ...original,
      id: `camp_${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      colour: CAMPAIGN_COLOURS[_campaigns.length % CAMPAIGN_COLOURS.length],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    _campaigns.push(dupe);
    return dupe;
  },

  async getCampaignMetrics(id) {
    await delay();
    return computeMetrics(id);
  },

  async getCampaignActivity(id) {
    await delay();
    return makeActivities(id);
  },

  async getCampaignProspects(id) {
    await delay();
    return _allProspects.filter(p => p.campaign_id === id);
  },

  // ── Prospects ──
  async getProspect(id) {
    await delay();
    const p = _allProspects.find(p => p.id === id);
    if (!p) throw new Error('Prospect not found');
    return {
      ...p,
      timeline: getProspectTimeline(id),
    };
  },

  async getAllProspects() {
    await delay();
    return _allProspects;
  },

  // ── Prompts ──
  async getCampaignPrompts(campaignId) {
    await delay();
    return getPromptVersions(campaignId);
  },

  async createPromptVersion(campaignId, data) {
    await delay(300);
    const versions = getPromptVersions(campaignId);
    const newVersion = {
      id: `pv_${campaignId}_${versions.length + 1}`,
      campaign_id: campaignId,
      version: versions.length + 1,
      author: 'Nishu',
      created_at: new Date().toISOString(),
      is_active: false,
      type: data.type || 'campaign',
      content: data.content,
    };
    versions.push(newVersion);
    return newVersion;
  },

  async activatePrompt(promptId) {
    await delay(200);
    // Find across all campaigns
    for (const campaignId of Object.keys(_promptVersions)) {
      const versions = _promptVersions[campaignId];
      const target = versions.find(v => v.id === promptId);
      if (target) {
        versions.forEach(v => { v.is_active = false; });
        target.is_active = true;
        return target;
      }
    }
    throw new Error('Prompt version not found');
  },

  // ── Conflicts ──
  async getConflicts() {
    await delay();
    return _conflicts.filter(c => !c.resolved);
  },

  async resolveConflict(id, assignToCampaignId) {
    await delay(200);
    const conflict = _conflicts.find(c => c.id === id);
    if (!conflict) throw new Error('Conflict not found');
    conflict.resolved = true;
    conflict.resolved_to = assignToCampaignId;
    return conflict;
  },

  // ── System Control ──
  async getSystemControl() {
    await delay(100);
    return _systemControl;
  },

  async toggleKillSwitch(engaged) {
    await delay(200);
    _systemControl.kill_switch = engaged;
    _systemControl.updated_at = new Date().toISOString();
    if (engaged) {
      _campaigns.forEach(c => {
        if (c.status === 'live') c.status = 'paused';
      });
    }
    return _systemControl;
  },

  async setChannelPause(channel, paused) {
    await delay(200);
    _systemControl.channel_pauses[channel] = paused;
    _systemControl.updated_at = new Date().toISOString();
    return _systemControl;
  },

  // ── Costs ──
  async getCosts() {
    await delay();
    return getCosts();
  },

  // ── Agent Runs ──
  async getAgentRuns(campaignId) {
    await delay();
    return getAgentRuns(campaignId);
  },

  // ── Reps ──
  async getReps() {
    await delay();
    return _reps;
  },

  async getSuppression() {
    await delay();
    return _suppression;
  },
};
