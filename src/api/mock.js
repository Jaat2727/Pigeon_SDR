/**
 * Mock API — returns correctly shaped data for every endpoint.
 * Simulates network delay. All state is held in memory.
 */

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms + Math.random() * 200));

const CAMPAIGN_COLOURS = ['#3B9AE1', '#4FBF92', '#D9A441'];

// Exactly three campaigns, different ICPs, one Paused
let _campaigns = [
  {
    id: 'camp_1',
    name: 'Enterprise HR Tech Outreach',
    description: 'Target CHROs at large enterprises.',
    colour: CAMPAIGN_COLOURS[0],
    status: 'live',
    owner: 'Nishu',
    target_audience: 'CHROs, US Enterprise 5k–10k employees',
    channels: { email: true, linkedin: true, sms: false, voice: false },
    agents: {
      research: true, icp_fitment: true, personalisation: true,
      conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false,
    },
    reps: ['rep_1', 'rep_2'],
    created_at: '2026-09-15T10:30:00Z',
  },
  {
    id: 'camp_2',
    name: 'Mid-Market CFO Campaign',
    description: 'Reach CFOs at mid-market fintech and SaaS companies.',
    colour: CAMPAIGN_COLOURS[1],
    status: 'paused',
    owner: 'Nishu',
    target_audience: 'CFOs, EU Fintech and SaaS companies',
    channels: { email: true, linkedin: true, sms: true, voice: false },
    agents: {
      research: true, icp_fitment: true, personalisation: true,
      conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false,
    },
    reps: ['rep_1'],
    created_at: '2026-09-16T08:00:00Z',
  },
  {
    id: 'camp_3',
    name: 'SaaS Dev Tools – Tech Leaders',
    description: 'Engage VPs of Engineering at early-stage dev tools companies.',
    colour: CAMPAIGN_COLOURS[2],
    status: 'live',
    owner: 'Nishu',
    target_audience: 'VPs of Engineering, Dev Tools, Series A–B',
    channels: { email: true, linkedin: false, sms: false, voice: false },
    agents: {
      research: true, icp_fitment: true, personalisation: true,
      conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false,
    },
    reps: ['rep_2'],
    created_at: '2026-09-17T12:00:00Z',
  },
];

const FUNNEL_STAGES = ['discovered', 'researched', 'qualified', 'contacted', 'engaged', 'meeting', 'opportunity'];

function generateProspects(campaignId, count) {
  const prospects = [];
  const roles = ['VP Engineering', 'CHRO', 'CFO', 'CTO'];
  for (let i = 0; i < count; i++) {
    const stage = FUNNEL_STAGES[Math.floor(Math.random() * FUNNEL_STAGES.length)];
    const verdict = Math.random() > 0.8 ? 'needs_review' : (Math.random() > 0.5 ? 'qualify' : 'reject');
    prospects.push({
      id: `pro_${campaignId}_${i}`,
      campaign_id: campaignId,
      first_name: `John${i}`,
      last_name: `Doe${i}`,
      email: `john${i}@example.com`,
      company: `Company ${i}`,
      role: roles[i % roles.length],
      funnel_status: stage,
      fit_score: Math.floor(Math.random() * 100),
      last_touch: new Date().toISOString(),
      next_touch: new Date(Date.now() + 86400000).toISOString(),
      icp_verdict: {
        status: verdict,
        fit_score: 85,
        dimension_scores: { role: 90, company_size: 80, industry: 100 },
        reasoning: 'Matches all primary criteria for enterprise.',
        disqualifiers: [],
        missing_data: [],
      },
      provenance: {
        role: 'ai_enriched',
        company: 'crm',
        email: 'manual'
      },
      facts: [
        { text: 'Recently raised Series C', source: 'Crunchbase', tag: 'ai_enriched' },
        { text: 'Using React/Node.js stack', source: 'BuiltWith', tag: 'ai_enriched' },
      ]
    });
  }
  return prospects;
}

let _allProspects = [
  ...generateProspects('camp_1', 12),
  ...generateProspects('camp_2', 8),
  ...generateProspects('camp_3', 10),
];

let _agentRuns = [
  {
    id: 'run_1',
    prospect_id: 'pro_camp_1_1',
    agent_name: 'ICP Fitment',
    prompt_version_id: 'pv_camp_1_1',
    retrieved_chunks: ['ICP Guidelines v2', 'Company Profile'],
    tokens_in: 450,
    tokens_out: 120,
    cost_usd: 0.005,
    latency_ms: 1200,
    timestamp: new Date().toISOString(),
  }
];

let _messages = [
  {
    id: 'msg_1',
    prospect_id: 'pro_camp_1_1',
    direction: 'outbound',
    channel: 'email',
    subject: 'Quick question about HR tech',
    body: 'Hi John, saw your Series C raise. We help teams scale HR.',
    personalisation_used: ['Series C raise'],
    knowledge_used: ['Value Prop 1'],
    conversation_result: 'pending',
    timestamp: new Date().toISOString(),
  }
];

let _escalations = [
  {
    id: 'esc_1',
    campaign_id: 'camp_1',
    prospect_id: 'pro_camp_1_1',
    source_agent: 'ICP Fitment',
    reason: 'needs_human',
    proposed_action: 'Proceed with qualification despite missing company size.',
    status: 'pending',
  },
  {
    id: 'esc_2',
    campaign_id: 'camp_3',
    prospect_id: 'pro_camp_3_2',
    source_agent: 'Personalisation & Send',
    reason: 'escalate_to_human',
    proposed_action: 'Drafted message is unusually long. Needs review before sending.',
    status: 'pending',
  }
];

let _systemControl = {
  kill_switch: false,
  channel_pauses: { email: false, linkedin: false, sms: false, voice: false }
};

let _conflicts = [];
let _promptVersions = {
  'camp_1': [{ id: 'pv_camp_1_1', version: 1, is_active: true, content: 'You are an SDR.' }]
};

export const mockApi = {
  async getCampaigns() { await delay(); return _campaigns; },
  async getCampaign(id) { await delay(); return _campaigns.find(c => c.id === id); },
  async updateCampaign(id, data) { await delay(); const c = _campaigns.find(c => c.id === id); Object.assign(c, data); return c; },
  async setCampaignStatus(id, status) { await delay(); const c = _campaigns.find(c => c.id === id); c.status = status; return c; },
  
  async getCampaignProspects(id) { await delay(); return _allProspects.filter(p => p.campaign_id === id); },
  async getProspect(id) { 
    await delay(); 
    const p = _allProspects.find(p => p.id === id);
    return { ...p, runs: _agentRuns.filter(r => r.prospect_id === id), messages: _messages.filter(m => m.prospect_id === id) };
  },
  
  async getEscalations() { await delay(); return _escalations.filter(e => e.status === 'pending'); },
  async resolveEscalation(id, action) {
    await delay();
    const e = _escalations.find(e => e.id === id);
    if (e) e.status = action;
    return e;
  },

  async getSystemControl() { await delay(); return _systemControl; },
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

  async getCampaignPrompts(id) { await delay(); return _promptVersions[id] || []; },
  async getConflicts() { await delay(); return _conflicts; },
  async getCosts() { await delay(); return { total_spend: 120.50, by_campaign: [] }; },
  
  // Stubs for missing endpoints
  async getCampaignMetrics(id) { 
    await delay(); 
    return { funnel: { discovered: 10, researched: 5, qualified: 2 } }; 
  },
  async getCampaignActivity(id) { await delay(); return []; },
  async getAgentRuns(id) { 
    await delay(); 
    return [
      { name: 'Research Agent', engine: 'dronahq', runs_today: 45, failures_today: 0, enabled: true },
      { name: 'ICP Fitment', engine: 'dronahq', runs_today: 40, failures_today: 2, enabled: true },
      { name: 'Personalisation & Send', engine: 'dronahq', runs_today: 35, failures_today: 0, enabled: true }
    ]; 
  }
};
