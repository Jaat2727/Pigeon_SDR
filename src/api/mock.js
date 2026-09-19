/**
 * Mock API — completely rewritten for Priority 1.
 * Provides realistic, dense data that ensures all UI numbers are consistent and computed.
 */

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms + Math.random() * 200));

const CAMPAIGN_COLOURS = ['#3B9AE1', '#4FBF92', '#D9A441'];
const FUNNEL_STAGES = ['discovered', 'researched', 'qualified', 'contacted', 'engaged', 'meeting', 'opportunity'];

// BASE CAMPAIGN TARGETS
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

// Seed generator helpers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
const now = new Date();

// We need 40-60 detailed prospects per campaign (the rest of the 840/520/390 are just aggregates for funnel).
let _allProspects = [];
let _agentRuns = [];
let _activities = [];
let _messages = [];
let _escalations = [];

// Base arrays for names/companies
const firstNames = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','William','Elizabeth','David','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'];
const companies = ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella', 'Stark Ind.', 'Wayne Ent', 'Massive Dynamic', 'Hooli', 'Pied Piper', 'Dunder Mifflin', 'Cyberdyne', 'Oscorp', 'Weyland-Yutani', 'Gringotts'];
const rolesCamp1 = ['CHRO', 'VP HR', 'Head of People', 'Director of HR'];
const rolesCamp2 = ['CFO', 'VP Finance', 'Director of Finance'];
const rolesCamp3 = ['VP Engineering', 'CTO', 'Head of Engineering'];

// Ensure 8 prospects have a "full timeline"
let fullTimelineCount = 0;

for (const camp of _campaigns) {
  const t = CAMPAIGN_TARGETS[camp.id];
  const prospectCount = randomInt(40, 60);
  
  // Calculate funnel stages for the WHOLE campaign (not just the 40-60 detailed ones).
  // Total = t.prospects
  // Contacted+Engaged+Meeting+Opportunity = t.sent
  // Meeting+Opportunity = t.meetings
  
  // The UI metrics need: Total Prospects, Messages Sent, Positive Replies, Negative Replies, Meetings Booked.
  // We'll store these in a _campaignMetrics object.
  
  for (let i = 0; i < prospectCount; i++) {
    const id = `pro_${camp.id}_${i}`;
    const fname = randomChoice(firstNames);
    const lname = randomChoice(lastNames);
    const role = camp.id === 'camp_1' ? randomChoice(rolesCamp1) : (camp.id === 'camp_2' ? randomChoice(rolesCamp2) : randomChoice(rolesCamp3));
    
    // Distribute among stages for these individual records
    const stage = randomChoice(FUNNEL_STAGES);
    const score = randomInt(20, 95);
    
    const isFullTimeline = (fullTimelineCount < 8 && stage === 'replied' || stage === 'engaged' || stage === 'meeting');
    if (isFullTimeline) fullTimelineCount++;

    const last_touch = randomDate(new Date(now.getTime() - 7*86400000), now);
    const next_touch = randomDate(now, new Date(now.getTime() + 7*86400000));
    
    let timeline = [];
    
    // Seed at least 3 agent runs per prospect
    for (let r = 0; r < 3; r++) {
      _agentRuns.push({
        id: `run_${id}_${r}`,
        prospect_id: id,
        campaign_id: camp.id,
        agent_name: randomChoice(['Research Agent', 'ICP Fitment', 'Personalisation & Send']),
        tokens_in: randomInt(300, 1500),
        tokens_out: randomInt(50, 400),
        cost_usd: (Math.random() * 0.05).toFixed(4),
        latency_ms: randomInt(600, 3500),
        timestamp: randomDate(new Date(last_touch), now)
      });
    }

    if (isFullTimeline) {
      timeline = [
        { type: 'researched', title: 'Research Complete', desc: 'Identified 4 key signals.', timestamp: new Date(now.getTime() - 4*86400000).toISOString() },
        { type: 'qualified', title: 'ICP Qualified', desc: `Score: ${score}. Reason: Matches enterprise criteria, strong hiring intent.`, timestamp: new Date(now.getTime() - 3*86400000).toISOString() },
        { type: 'contacted', title: 'Email Sent', desc: `Subject: Scaling HR.\n\nHi ${fname}, saw you're hiring heavily. We can help.`, metadata: { knowledge_used: ['ICP Guidelines', 'Hiring Signal'] }, timestamp: new Date(now.getTime() - 2*86400000).toISOString() },
        { type: 'replied', title: 'Prospect Replied', desc: 'Sounds interesting, can we chat next week?', metadata: { intent: 'positive' }, timestamp: new Date(now.getTime() - 1*86400000).toISOString() },
        { type: 'action', title: 'Next Action Decided', desc: 'Agent scheduled follow-up draft for Meeting.', timestamp: new Date(now.getTime() - 43200000).toISOString() }
      ];
    } else {
      timeline = [
        { type: 'researched', title: 'Research Complete', desc: 'Gathered initial data.', timestamp: new Date(now.getTime() - 86400000).toISOString() }
      ];
    }

    _allProspects.push({
      id,
      campaign_id: camp.id,
      first_name: fname,
      last_name: lname,
      email: `${fname.toLowerCase()}.${lname.toLowerCase()}@example.com`,
      company: randomChoice(companies),
      role: role,
      funnel_status: stage,
      fit_score: score,
      fit_reason: score > 70 ? 'Strong match on all primary dimensions.' : 'Missing some secondary criteria.',
      last_touch: last_touch,
      next_touch: next_touch,
      timeline,
      icp_verdict: {
        status: score > 50 ? 'qualify' : 'reject',
        fit_score: score,
        dimension_scores: { role: score + 5, company_size: score - 5, industry: score },
        reasoning: 'Evaluated based on current ICP guidelines.',
      },
      provenance: {
        role: 'ai_enriched',
        company: 'crm',
        email: 'manual'
      },
      facts: [
        { text: 'Recently raised funding', source: 'Crunchbase', tag: 'ai_enriched' }
      ]
    });
  }
  
  // Generate Activity Feeds (15+ per live campaign)
  if (camp.status === 'live') {
    for (let a = 0; a < 18; a++) {
      _activities.push({
        id: `act_${camp.id}_${a}`,
        campaign_id: camp.id,
        agent: randomChoice(['Research Agent', 'ICP Fitment', 'Personalisation & Send']),
        prospect_name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
        outcome: randomChoice(['Qualified prospect with score 85.', 'Sent personalised email.', 'Found 3 new hiring signals.', 'Drafted follow-up sequence.']),
        status: Math.random() > 0.1 ? 'success' : 'error',
        timestamp: randomDate(new Date(now.getTime() - 86400000), now)
      });
    }
  }
}

// Activity feed needs to be newest first
_activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// Seed exact escalations
_escalations = [
  {
    id: 'esc_1', campaign_id: 'camp_1', prospect_id: 'pro_camp_1_0', source_agent: 'ICP Fitment',
    reason: 'needs_review', proposed_action: 'Prospect score is 45 due to ambiguous company size. Proceed with qualification?', status: 'pending'
  },
  {
    id: 'esc_2', campaign_id: 'camp_2', prospect_id: 'pro_camp_2_1', source_agent: 'Outreach Strategy',
    reason: 'escalate_to_human', proposed_action: 'Prospect has opted out of previous campaigns. Requesting human override to pause all outreach.', status: 'pending'
  },
  {
    id: 'esc_3', campaign_id: 'camp_3', prospect_id: 'pro_camp_3_2', source_agent: 'Personalisation & Send',
    reason: 'needs_human', proposed_action: 'Subject: Scaling your eng team\n\nHi John,\n\nI noticed your recent blog post about Kubernetes scaling challenges. I drafted this response but felt it might be too technical. Please review before sending.', status: 'pending'
  }
];

let _systemControl = {
  kill_switch: false,
  channel_pauses: { email: false, linkedin: false, sms: false, voice: false }
};

let _conflicts = [
  { id: 'conf_1', prospect_name: 'Jane Doe', campaigns: ['Enterprise HR Tech Outreach', 'Mid-Market CFO Campaign'], last_touch: new Date().toISOString(), rule: 'Priority Campaign Wins' },
  { id: 'conf_2', prospect_name: 'Bob Smith', campaigns: ['SaaS Dev Tools – Tech Leaders', 'Enterprise HR Tech Outreach'], last_touch: new Date().toISOString(), rule: 'Earliest Claim Wins' },
  { id: 'conf_3', prospect_name: 'Alice Johnson', campaigns: ['Mid-Market CFO Campaign', 'SaaS Dev Tools – Tech Leaders'], last_touch: new Date().toISOString(), rule: 'Manual Review Required' }
];

let _promptVersions = {
  'camp_1': [
    { id: 'pv_1', version: 2, is_active: true, content: 'Role: You are an SDR targeting Enterprise HR.\nVariables: {{first_name}}, {{company}}\nRules: Be concise. No buzzwords.\nOutput Schema: { "subject": "string", "body": "string" }\nEscalation: needs_human if company size is missing.' },
    { id: 'pv_2', version: 1, is_active: false, content: 'Role: You are an SDR.\nVariables: {{first_name}}\nRules: Be friendly.\nOutput Schema: { "body": "string" }\nEscalation: none.' }
  ],
  'camp_2': [
    { id: 'pv_3', version: 1, is_active: true, content: 'Role: Finance SDR.\nVariables: {{first_name}}, {{revenue}}\nRules: Focus on ROI.\nOutput Schema: { "subject": "string", "body": "string" }\nEscalation: needs_human if revenue under 1M.' }
  ]
};

export const mockApi = {
  async getCampaigns() { 
    await delay(); 
    return Promise.all(_campaigns.map(async c => ({
      ...c,
      metrics: await mockApi.getCampaignMetrics(c.id)
    })));
  },
  async getCampaign(id) { 
    await delay(); 
    const c = _campaigns.find(c => c.id === id); 
    if (!c) return null;
    return { ...c, metrics: await mockApi.getCampaignMetrics(c.id) };
  },
  async updateCampaign(id, data) { await delay(); const c = _campaigns.find(c => c.id === id); Object.assign(c, data); return c; },
  async setCampaignStatus(id, status) { await delay(); const c = _campaigns.find(c => c.id === id); c.status = status; return c; },
  
  async getCampaignProspects(id) { await delay(); return _allProspects.filter(p => p.campaign_id === id); },
  async getProspect(id) { 
    await delay(); 
    const p = _allProspects.find(p => p.id === id);
    return { ...p, runs: _agentRuns.filter(r => r.prospect_id === id), messages: _messages.filter(m => m.prospect_id === id) };
  },
  
  async getEscalations() { await delay(); return _escalations.filter(e => e.status === 'pending'); },
  async resolveEscalation(id, action) { await delay(); const e = _escalations.find(e => e.id === id); if (e) e.status = action; return e; },

  async getSystemControl() { await delay(); return _systemControl; },
  async toggleKillSwitch(engaged) { await delay(); _systemControl.kill_switch = engaged; return _systemControl; },
  async setChannelPause(channel, paused) { await delay(); _systemControl.channel_pauses[channel] = paused; return _systemControl; },

  async getCampaignPrompts(id) { await delay(); return _promptVersions[id] || []; },
  async getConflicts() { await delay(); return _conflicts; },
  async getCosts() { await delay(); return { total_spend: 120.50, by_campaign: [] }; },
  
  async getCampaignMetrics(id) { 
    await delay(); 
    const t = CAMPAIGN_TARGETS[id] || { prospects: 100, sent: 20, replies: 5, meetings: 1 };
    
    // Funnel distribution matching the targets exactly
    const funnel = {
      discovered: t.prospects - Math.floor(t.prospects * 0.8),
      researched: Math.floor(t.prospects * 0.3),
      qualified: Math.floor(t.prospects * 0.5) - t.sent,
      contacted: t.sent - t.replies,
      engaged: t.replies - t.meetings - Math.floor(t.replies * 0.2), // some engaged
      meeting: t.meetings - 1, // 1 became opportunity
      opportunity: 1
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
      funnel: funnel
    }; 
  },
  async getCampaignActivity(id) { await delay(); return _activities.filter(a => a.campaign_id === id); },
  async getAgentRuns(id) { 
    await delay(); 
    return [
      { name: 'Research Agent', engine: 'dronahq', runs_today: 450, failures_today: 1, enabled: true },
      { name: 'ICP Fitment', engine: 'dronahq', runs_today: 400, failures_today: 3, enabled: true },
      { name: 'Personalisation & Send', engine: 'dronahq', runs_today: 350, failures_today: 0, enabled: true }
    ]; 
  }
};
