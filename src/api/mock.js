/**
 * Mock API — Pigeon SDR Command Center
 * Updated for Buildathon 2026 demo.
 * 3 concurrent campaigns: US SaaS CTO | India BFSI CIO | Voice AI Founder
 */

const delay = (ms = 250) => new Promise(r => setTimeout(r, ms + Math.random() * 150));

const CAMPAIGN_COLOURS = ['#4F6EF7', '#10B981', '#F59E0B'];
const FUNNEL_STAGES = ['discovered', 'researched', 'qualified', 'contacted', 'engaged', 'meeting', 'opportunity'];

const CAMPAIGN_TARGETS = {
  'camp_1': { prospects: 840, sent: 312, replies: 47, meetings: 8, pipeline_value: 420000 },
  'camp_2': { prospects: 520, sent: 198, replies: 22, meetings: 4, pipeline_value: 280000 },
  'camp_3': { prospects: 390, sent: 145, replies: 31, meetings: 6, pipeline_value: 195000 },
};

let _campaigns = [
  {
    id: 'camp_1',
    name: 'US SaaS CTO Outreach',
    description: 'Target CTOs at high-growth US SaaS companies scaling their engineering teams.',
    colour: CAMPAIGN_COLOURS[0],
    status: 'live',
    owner: 'Kriti Jasuja',
    icp: 'US SaaS CTOs · $5M–$50M ARR',
    target_audience: 'CTOs, VP Engineering — US SaaS, Series B+',
    channels: { email: true, linkedin: true, sms: false, voice: false },
    agents: { research: true, icp_fitment: true, personalisation: true, conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false },
    reps: ['rep_1', 'rep_2'],
    created_at: '2026-09-10T10:30:00Z',
  },
  {
    id: 'camp_2',
    name: 'India BFSI CIO Outreach',
    description: 'Reach CIOs at leading Indian BFSI institutions modernising their tech stack.',
    colour: CAMPAIGN_COLOURS[1],
    status: 'paused',
    owner: 'Kriti Jasuja',
    icp: 'India BFSI CIOs · Large Enterprise',
    target_audience: 'CIOs, CDOs — Indian Banks, Insurance, NBFC',
    channels: { email: true, linkedin: true, sms: true, voice: false },
    agents: { research: true, icp_fitment: true, personalisation: true, conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false },
    reps: ['rep_1'],
    created_at: '2026-09-12T08:00:00Z',
  },
  {
    id: 'camp_3',
    name: 'Voice AI Founder Outreach',
    description: 'Connect with founders building voice AI and conversational AI startups.',
    colour: CAMPAIGN_COLOURS[2],
    status: 'live',
    owner: 'Kriti Jasuja',
    icp: 'Voice AI Founders · Seed–Series A',
    target_audience: 'Founders, Co-Founders — Voice AI, Conversational AI startups',
    channels: { email: true, linkedin: true, sms: false, voice: true },
    agents: { research: true, icp_fitment: true, personalisation: true, conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: true },
    reps: ['rep_2'],
    created_at: '2026-09-14T12:00:00Z',
  }
];

// ── Reps ──
let _reps = [
  { id: 'rep_1', full_name: 'Kriti Jasuja', email: 'kriti@pigeonsdr.com', title: 'Founder & SDR Lead', linkedin_url: 'https://linkedin.com/in/kriti', is_active: true, created_at: '2026-09-01T10:00:00Z' },
  { id: 'rep_2', full_name: 'Aarav Singh', email: 'aarav@pigeonsdr.com', title: 'Account Executive', linkedin_url: 'https://linkedin.com/in/aarav', is_active: true, created_at: '2026-09-05T10:00:00Z' },
];

// ── Suppression ──
let _suppression = [
  { id: 'sup_1', email: 'ceo@competitor.com', domain: null, reason: 'Competitor', added_by: 'Kriti', created_at: '2026-09-14T10:00:00Z' },
  { id: 'sup_2', email: null, domain: 'government.gov', reason: 'Government org — not a target', added_by: 'System', created_at: '2026-09-14T10:00:00Z' },
  { id: 'sup_3', email: 'optout@example.com', domain: null, reason: 'Opt-out request', added_by: 'System', created_at: '2026-09-15T10:00:00Z' },
];

// ── Seed helpers ──
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
const now = new Date();

const firstNames = ['James','Sarah','John','Patricia','Robert','Jennifer','Michael','Linda','William','Elizabeth','David','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Priya','Charles','Rahul','Ananya','Vikram','Maya','Arjun'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Patel','Sharma','Chen','Gupta','Kumar','Mehta','Shah','Nair','Reddy','Anderson','Taylor'];

const companiesCamp1 = ['Rippling', 'Carta', 'Brex', 'Descript', 'Loom', 'Retool', 'Linear', 'Notion', 'Figma Clone', 'Vercel', 'PlanetScale', 'Supabase', 'Render', 'Railway'];
const companiesCamp2 = ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'SBI Life', 'Bajaj Finance', 'IIFL Finance', 'Muthoot Finance', 'Shriram Finance', 'L&T Finance', 'PNB Housing'];
const companiesCamp3 = ['Kore.ai', 'Deepgram', 'ElevenLabs', 'Voiceflow', 'Vapi', 'Retell AI', 'Bland AI', 'Hamming AI', 'Air AI', 'Cognigy', 'Nuance', 'Synthesis AI'];

const rolesCamp1 = ['CTO', 'VP of Engineering', 'Head of Engineering', 'Director of Engineering', 'Principal Engineer'];
const rolesCamp2 = ['CIO', 'CDO', 'CTO', 'VP Technology', 'Head of Digital Transformation', 'Chief Digital Officer'];
const rolesCamp3 = ['CEO', 'CTO', 'Co-Founder', 'Founder', 'Head of Product'];

const replyTexts = [
  'Sounds interesting, can we chat next week?',
  'We actually just started evaluating solutions in this space.',
  'Can you send more details? Particularly around pricing.',
  'Not the right time, but circle back in Q2.',
  'Who should I loop in from our side?',
  'We already have a vendor for this. Thanks though.',
];
const replyIntents = ['interested', 'meeting_request', 'question', 'not_now', 'referral', 'not_interested'];
const knowledgeChunks = ['Product Specs v4.2', 'Case Study: Rippling Implementation', 'Objection Handling Script', 'Competitor Comparison Grid', 'ICP Definition v3', 'BFSI Regulatory Playbook', 'Voice AI Founder Deck'];

let _allProspects = [];
let _agentRuns = [];
let _activities = [];
let _messages = [];
let _escalations = [];

// ── Generate prospects ──
for (const camp of _campaigns) {
  const t = CAMPAIGN_TARGETS[camp.id];
  const prospectCount = randomInt(45, 60);
  const roles = camp.id === 'camp_1' ? rolesCamp1 : (camp.id === 'camp_2' ? rolesCamp2 : rolesCamp3);
  const companies = camp.id === 'camp_1' ? companiesCamp1 : (camp.id === 'camp_2' ? companiesCamp2 : companiesCamp3);

  for (let i = 0; i < prospectCount; i++) {
    const id = `pro_${camp.id}_${i}`;
    const fname = randomChoice(firstNames);
    const lname = randomChoice(lastNames);
    const role = randomChoice(roles);
    const company = randomChoice(companies);
    const stage = randomChoice(FUNNEL_STAGES);
    const stageIdx = FUNNEL_STAGES.indexOf(stage);
    const score = randomInt(20, 95);

    // Three-state ICP verdict
    const icp_status = score > 65 ? 'qualify' : (score >= 40 ? 'needs_review' : 'reject');
    const icp_confidence = score > 65 ? 'high' : (score >= 40 ? 'low' : 'medium');
    const icp_reasoning = score > 65
      ? 'Strong match across all primary dimensions. Role, seniority, company size and industry all align.'
      : (score >= 40
        ? 'Critical data missing or ambiguous — company size unverified, seniority unclear. Manual review recommended.'
        : 'Does not meet minimum ICP criteria. Industry mismatch and insufficient seniority.');

    const last_touch = randomDate(new Date(now.getTime() - 7 * 86400000), now);
    const next_touch = randomDate(now, new Date(now.getTime() + 7 * 86400000));

    // Rich timeline events based on funnel stage
    let timeline = [];
    const baseTime = now.getTime() - (stageIdx + 3) * 86400000;

    timeline.push({
      type: 'discovered', agent: null, agent_engine: null, prompt_version: null,
      tokens_used: 0, cost: 0,
      timestamp: new Date(baseTime).toISOString(),
      details: {}, knowledge_chunks: [],
    });

    if (stageIdx >= 1) {
      const tIn = randomInt(800, 1500);
      const tOut = randomInt(200, 500);
      const cost = parseFloat(((tIn + tOut) * 0.000015).toFixed(4));
      timeline.push({
        type: 'researched', agent: 'Lead Research Agent', agent_engine: 'dronahq', prompt_version: 'v2',
        tokens_used: tIn + tOut, cost,
        timestamp: new Date(baseTime + 86400000).toISOString(),
        details: { signals_found: randomInt(2, 6) }, knowledge_chunks: [],
      });
    }

    if (stageIdx >= 2) {
      const tIn = randomInt(400, 800);
      const tOut = randomInt(100, 300);
      const cost = parseFloat(((tIn + tOut) * 0.000015).toFixed(4));
      timeline.push({
        type: icp_status === 'qualify' ? 'qualified' : (icp_status === 'needs_review' ? 'needs_review' : 'rejected'),
        agent: 'ICP Fitment Agent', agent_engine: 'dronahq', prompt_version: 'v4',
        tokens_used: tIn + tOut, cost,
        timestamp: new Date(baseTime + 2 * 86400000).toISOString(),
        details: { verdict: icp_status, reason: `Score: ${score}. ${icp_reasoning}` },
        knowledge_chunks: ['ICP Definition v3'],
      });
    }

    if (stageIdx >= 3) {
      const tIn1 = randomInt(500, 900);
      const tOut1 = randomInt(150, 400);
      timeline.push({
        type: 'strategy_created', agent: 'Outreach Strategy Agent', agent_engine: 'dronahq', prompt_version: 'v1',
        tokens_used: tIn1 + tOut1, cost: parseFloat(((tIn1 + tOut1) * 0.000015).toFixed(4)),
        timestamp: new Date(baseTime + 2.5 * 86400000).toISOString(),
        details: {}, knowledge_chunks: [],
      });

      const tIn2 = randomInt(600, 1200);
      const tOut2 = randomInt(200, 500);
      timeline.push({
        type: 'contacted', agent: 'Personalisation Agent', agent_engine: 'dronahq', prompt_version: 'v4',
        tokens_used: tIn2 + tOut2, cost: parseFloat(((tIn2 + tOut2) * 0.000015).toFixed(4)),
        timestamp: new Date(baseTime + 3 * 86400000).toISOString(),
        details: {
          subject: `Scaling ${company}'s ${camp.id === 'camp_1' ? 'engineering velocity' : (camp.id === 'camp_2' ? 'digital infrastructure' : 'voice AI platform')}`,
          message_text: `Hi ${fname},\n\nI noticed ${company} recently ${randomChoice(['expanded their engineering team', 'announced a new product line', 'published a technical blog on scaling challenges'])}. We help companies like yours streamline their ${camp.id === 'camp_1' ? 'engineering operations' : (camp.id === 'camp_2' ? 'technology modernisation' : 'AI deployment')} at scale.\n\nWould 15 minutes next week work to explore if there's a fit?\n\nBest,\nKriti`,
        },
        knowledge_chunks: [randomChoice(knowledgeChunks), randomChoice(knowledgeChunks)],
      });
    }

    if (stageIdx >= 4) {
      const replyIdx = randomInt(0, replyTexts.length - 1);
      const tIn = randomInt(300, 600);
      const tOut = randomInt(80, 200);
      timeline.push({
        type: 'replied', agent: 'Conversation Agent', agent_engine: 'dronahq', prompt_version: 'v2',
        tokens_used: tIn + tOut, cost: parseFloat(((tIn + tOut) * 0.000015).toFixed(4)),
        timestamp: new Date(baseTime + 4 * 86400000).toISOString(),
        details: {
          reply_text: replyTexts[replyIdx],
          detected_intent: replyIntents[Math.min(replyIdx, replyIntents.length - 1)],
        },
        knowledge_chunks: [],
      });
    }

    if (stageIdx >= 5) {
      timeline.push({
        type: 'meeting_booked', agent: 'Follow-up Agent', agent_engine: 'our_engine', prompt_version: null,
        tokens_used: 0, cost: 0,
        timestamp: new Date(baseTime + 5 * 86400000).toISOString(),
        details: { meeting_time: new Date(now.getTime() + randomInt(1, 5) * 86400000).toISOString() },
        knowledge_chunks: [],
      });
    }

    if (stageIdx >= 6) {
      timeline.push({
        type: 'opportunity', agent: null, agent_engine: null, prompt_version: null,
        tokens_used: 0, cost: 0,
        timestamp: new Date(baseTime + 6 * 86400000).toISOString(),
        details: { opportunity_value: randomInt(15000, 80000) },
        knowledge_chunks: [],
      });
    }

    // Agent runs
    const agentNames = ['Lead Research Agent', 'ICP Fitment Agent', 'Outreach Strategy Agent', 'Personalisation Agent', 'Conversation Agent'];
    const runsPerProspect = randomInt(2, 5);
    for (let r = 0; r < runsPerProspect; r++) {
      const aName = agentNames[r % agentNames.length];
      const tIn = randomInt(300, 1500);
      const tOut = randomInt(50, 400);
      const failed = Math.random() < 0.03;
      _agentRuns.push({
        id: `run_${id}_${r}`,
        prospect_id: id,
        campaign_id: camp.id,
        agent_name: aName,
        engine: 'dronahq',
        tokens_in: tIn,
        tokens_out: tOut,
        cost_usd: parseFloat(((tIn + tOut) * 0.000015).toFixed(4)),
        latency_ms: randomInt(600, 3500),
        status: failed ? 'failed' : 'success',
        prompt_version: 'v' + randomInt(1, 4),
        timestamp: randomDate(new Date(now.getTime() - 3 * 86400000), now),
      });
    }

    _allProspects.push({
      id,
      campaign_id: camp.id,
      campaign_name: camp.name,
      first_name: fname,
      last_name: lname,
      email: `${fname.toLowerCase()}.${lname.toLowerCase()}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      company,
      role,
      funnel_status: stage,
      fit_score: score,
      fit_reason: icp_reasoning,
      last_touch,
      next_touch,
      timeline,
      intent_score: randomInt(30, 95),
      authority_score: randomInt(40, 100),
      urgency_score: randomInt(20, 90),
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
        { text: randomChoice(['Recently raised Series B funding', 'Expanding to 3 new markets', 'Hiring 20+ engineers this quarter', 'New CTO appointed last month', 'Announced AI-first strategy', 'Published technical blog on scaling']), source: randomChoice(['Crunchbase', 'LinkedIn', 'Company Blog', 'News API']), tag: 'ai_enriched' },
        score > 50 ? { text: 'Previously evaluated competitor product', source: 'CRM Import', tag: 'crm' } : null,
      ].filter(Boolean),
      ai_summary: `${fname} ${lname} is a ${role} at ${company}. ${icp_reasoning} ${score > 65 ? `This prospect shows strong intent signals and is a high-priority target for ${camp.name}.` : score >= 40 ? `Recommend manual review before proceeding with outreach.` : `Does not meet ICP criteria — consider suppressing from this campaign.`}`,
      recommended_next_action: score > 65
        ? (stage === 'engaged' ? 'Schedule a discovery call — prospect showed interest in last interaction.' : stage === 'contacted' ? 'Send follow-up email with case study.' : 'Continue automated sequence.')
        : score >= 40
        ? 'Review ICP qualification manually before next outreach.'
        : 'Remove from campaign — below minimum ICP threshold.',
    });
  }

  // Activity feeds
  if (camp.status === 'live') {
    const activityTemplates = [
      { agent: 'Lead Research Agent', outcomes: ['Found 3 new hiring signals at {company}', 'Enriched profile with LinkedIn data', 'Discovered recent funding round — $12M Series A', 'Added 4 new intent signals from job postings'] },
      { agent: 'ICP Fitment Agent', outcomes: ['Qualified prospect with score 87 — strong ICP match', 'Marked as needs_review — company size unverified', 'Rejected prospect — industry mismatch', 'Qualified 5 prospects in batch run'] },
      { agent: 'Outreach Strategy Agent', outcomes: ['Designed 3-touch email sequence', 'Recommended LinkedIn first-touch based on prospect activity', 'Created personalised opening hook', 'Scheduled follow-up for Day 4'] },
      { agent: 'Personalisation Agent', outcomes: ['Generated email referencing recent blog post', 'Created personalised LinkedIn message', 'Escalated — insufficient data to personalise', 'Drafted email using 3 knowledge chunks'] },
      { agent: 'Conversation Agent', outcomes: ['Classified reply as meeting_request — routing to calendar', 'Detected objection: pricing — suggested response', 'Classified reply as not_now — scheduled Q2 follow-up', 'Escalated objection to human review'] },
      { agent: 'Follow-up Agent', outcomes: ['Scheduled Day 3 follow-up for {name}', 'Paused sequence — prospect in DNC list', 'Triggered re-engagement after 14-day silence', 'Booked meeting slot at prospect preference'] },
      { agent: 'Voice SDR Agent', outcomes: ['Completed 2-minute discovery call', 'Left voicemail with personalised hook', 'Prospect answered — escalated to human SDR', 'Scheduled callback for tomorrow 2pm'] },
    ];

    for (let a = 0; a < 20; a++) {
      const template = randomChoice(activityTemplates);
      const prospect = randomChoice(_allProspects.filter(p => p.campaign_id === camp.id));
      const outcome = template.outcomes[Math.floor(Math.random() * template.outcomes.length)]
        .replace('{company}', prospect?.company || 'Acme Corp')
        .replace('{name}', `${prospect?.first_name} ${prospect?.last_name}` || 'Prospect');

      _activities.push({
        id: `act_${camp.id}_${a}`,
        campaign_id: camp.id,
        agent: template.agent,
        prospect_id: prospect?.id,
        prospect_name: `${prospect?.first_name} ${prospect?.last_name}`,
        prospect_company: prospect?.company,
        outcome,
        status: Math.random() > 0.06 ? 'success' : 'error',
        timestamp: randomDate(new Date(now.getTime() - 86400000), now),
        details: {
          agent: template.agent,
          reason: `Triggered by ${randomChoice(['pipeline event', 'prospect reply', 'scheduled timer', 'ICP score threshold'])}`,
          data_used: randomChoice(['LinkedIn profile, Crunchbase data', 'CRM history, email open data', 'Job posting signals, funding data']),
          knowledge_sources: [randomChoice(knowledgeChunks)],
          prompt_version: 'v' + randomInt(1, 4),
          confidence: randomInt(72, 98),
          action_taken: outcome,
          next_action: randomChoice(['Send follow-up in 3 days', 'Await prospect reply', 'Escalate to human review', 'Schedule meeting']),
        },
      });
    }
  }
}

_activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// ── Escalations ──
_escalations = [
  {
    id: 'esc_1', campaign_id: 'camp_1', campaign_name: 'US SaaS CTO Outreach',
    prospect_id: 'pro_camp_1_0',
    prospect_name: `${_allProspects.find(p => p.id === 'pro_camp_1_0')?.first_name || 'Sarah'} ${_allProspects.find(p => p.id === 'pro_camp_1_0')?.last_name || 'Chen'}`,
    source_agent: 'ICP Fitment Agent', escalation_type: 'needs_review',
    reason: 'needs_review',
    proposed_action: 'Prospect score is 48 due to ambiguous company size. Company employee count not found in any data source. Recommend manual verification before proceeding with outreach.',
    status: 'pending', risk_level: 'medium',
    created_at: new Date(now.getTime() - 3600000).toISOString(),
  },
  {
    id: 'esc_2', campaign_id: 'camp_2', campaign_name: 'India BFSI CIO Outreach',
    prospect_id: 'pro_camp_2_1',
    prospect_name: `${_allProspects.find(p => p.id === 'pro_camp_2_1')?.first_name || 'Vikram'} ${_allProspects.find(p => p.id === 'pro_camp_2_1')?.last_name || 'Mehta'}`,
    source_agent: 'Outreach Strategy Agent', escalation_type: 'escalate_to_human',
    reason: 'escalate_to_human',
    proposed_action: 'Prospect has opted out of a previous campaign. Prior negative response detected in thread history. Requesting human override to pause all outreach to this prospect.',
    status: 'pending', risk_level: 'high',
    created_at: new Date(now.getTime() - 7200000).toISOString(),
  },
  {
    id: 'esc_3', campaign_id: 'camp_3', campaign_name: 'Voice AI Founder Outreach',
    prospect_id: 'pro_camp_3_2',
    prospect_name: `${_allProspects.find(p => p.id === 'pro_camp_3_2')?.first_name || 'Priya'} ${_allProspects.find(p => p.id === 'pro_camp_3_2')?.last_name || 'Sharma'}`,
    source_agent: 'Personalisation Agent', escalation_type: 'needs_human',
    reason: 'needs_human',
    proposed_action: 'Subject: Scaling your voice AI platform\n\nHi Priya,\n\nI noticed your recent blog post about latency challenges in real-time voice AI. I drafted a personalised response but felt it relies on a product claim I couldn\'t verify from the knowledge base. Please review before sending.\n\nBest,\nKriti',
    status: 'pending', risk_level: 'low',
    created_at: new Date(now.getTime() - 1800000).toISOString(),
  },
  {
    id: 'esc_4', campaign_id: 'camp_1', campaign_name: 'US SaaS CTO Outreach',
    prospect_id: 'pro_camp_1_5',
    prospect_name: 'David Rodriguez',
    source_agent: 'Conversation Agent', escalation_type: 'needs_human',
    reason: 'objection_detected',
    proposed_action: 'Prospect replied with a pricing objection. Conversation Agent suggests: "Our enterprise tier starts at $1,200/month with a 30-day pilot." Please approve before sending.',
    status: 'pending', risk_level: 'medium',
    created_at: new Date(now.getTime() - 900000).toISOString(),
  },
];

let _systemControl = {
  kill_switch: false,
  channel_pauses: { email: false, linkedin: false, sms: false, voice: false },
  agent_pauses: {
    'ICP Fitment Agent': false,
    'Lead Research Agent': false,
    'Outreach Strategy Agent': false,
    'Personalisation Agent': false,
    'Conversation Agent': false,
    'Voice SDR Agent': false,
    'Follow-up Agent': false,
  },
};

let _conflicts = [
  {
    id: 'conf_1', prospect_name: 'Sarah Chen', prospect_id: 'pro_camp_1_5',
    campaigns: ['US SaaS CTO Outreach', 'Voice AI Founder Outreach'],
    campaign_ids: ['camp_1', 'camp_3'],
    last_touch: new Date().toISOString(), rule: 'Priority Campaign Wins', status: 'pending',
    reason: 'Prospect appears in both campaigns. CTO role qualifies for US SaaS CTO Outreach. Also tagged as AI Founder.',
  },
  {
    id: 'conf_2', prospect_name: 'Rahul Patel', prospect_id: 'pro_camp_3_3',
    campaigns: ['Voice AI Founder Outreach', 'India BFSI CIO Outreach'],
    campaign_ids: ['camp_3', 'camp_2'],
    last_touch: new Date().toISOString(), rule: 'Earliest Claim Wins', status: 'pending',
    reason: 'Prospect is a founder in both Voice AI and BFSI space. Dual outreach risk.',
  },
  {
    id: 'conf_3', prospect_name: 'Ananya Gupta', prospect_id: 'pro_camp_2_7',
    campaigns: ['India BFSI CIO Outreach', 'US SaaS CTO Outreach'],
    campaign_ids: ['camp_2', 'camp_1'],
    last_touch: new Date().toISOString(), rule: 'Manual Review Required', status: 'pending',
    reason: 'Prospect has dual role — CIO at Indian BFSI but also runs a SaaS subsidiary.',
  },
];

// ── Prompt versions (per campaign) ──
let _promptVersions = {
  'camp_1': [
    {
      id: 'pv_c1_s4', agent_name: 'System Prompt', version: 4, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      content: 'Role: You are an SDR targeting CTOs at US SaaS companies (Series B+).\n\nVariables:\n- {{first_name}}: Prospect first name\n- {{company}}: Prospect company\n- {{recent_news}}: Recent company news/funding\n- {{tech_stack}}: Known tech stack\n\nRules:\n1. Be concise, under 75 words.\n2. Do NOT use buzzwords like "synergy" or "alignment".\n3. Reference specific engineering challenges.\n4. Start with a concrete, verifiable signal.\n\nOutput Schema:\n{\n  "subject": "string",\n  "body": "string",\n  "escalate": "boolean"\n}\n\nEscalation:\n- Return "needs_human" if company size or tech stack is missing from context.',
    },
    {
      id: 'pv_c1_s3', agent_name: 'System Prompt', version: 3, is_active: false, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
      content: 'Role: You are an SDR targeting CTOs at SaaS companies.\n\nVariables:\n- {{first_name}}\n- {{company}}\n- {{recent_news}}\n\nRules:\n1. Keep it under 100 words.\n2. Start with the recent news.\n\nOutput Schema:\n{\n  "subject": "string",\n  "body": "string"\n}\n\nEscalation: Return "needs_human" if company size is missing.',
    },
    {
      id: 'pv_c1_s2', agent_name: 'System Prompt', version: 2, is_active: false, author: 'Aarav Singh',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 20 * 86400000).toISOString(),
      content: 'Role: You are an SDR targeting engineering leaders.\n\nVariables:\n- {{first_name}}\n- {{company}}\n\nRules:\n1. Keep it under 100 words.\n2. Be friendly and polite.\n\nOutput Schema:\n{\n  "subject": "string",\n  "body": "string"\n}\n\nEscalation: none.',
    },
    {
      id: 'pv_c1_r2', agent_name: 'Lead Research Agent', version: 2, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
      content: 'Role: Research agent enriching CTO prospect profiles.\n\nFocus areas:\n- Recent funding rounds and growth signals\n- Engineering team size and hiring velocity\n- Tech stack changes (GitHub, job posts)\n- Leadership changes\n- Published content (blogs, talks, papers)\n\nSources: Apollo, Klazify, LinkedIn, GitHub, Crunchbase.\n\nRules:\n1. Never guess — null is correct, invented is not.\n2. Record confidence per field.\n3. Cite sources for every fact.',
    },
    {
      id: 'pv_c1_r1', agent_name: 'Lead Research Agent', version: 1, is_active: false, author: 'Aarav Singh',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 15 * 86400000).toISOString(),
      content: 'Role: Research agent.\nFocus: funding, hiring, tech stack.\nRules: Never guess. Cite sources.',
    },
    {
      id: 'pv_c1_i2', agent_name: 'ICP Fitment Agent', version: 2, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
      content: 'Role: ICP scoring agent for US SaaS CTO campaign.\n\nDimensions:\n- Role match (CTO, VP Engineering, Head of Engineering)\n- Company stage (Series B+, $5M+ ARR)\n- Industry (SaaS, Dev Tools, Cloud Infrastructure)\n- Engineering team size (20+ engineers)\n\nExclusions (immediate reject, score 0):\n- Government organisations\n- Companies under 20 employees\n- Existing customers\n- Non-tech companies\n\nVerdicts:\n- qualify: score >= 65, all critical dimensions met\n- needs_review: score 40-64 OR missing critical data\n- reject: score < 40 OR exclusion match\n\nTemperature: 0',
    },
    {
      id: 'pv_c1_p2', agent_name: 'Personalisation Agent', version: 2, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      content: 'Role: Write one outbound message for one step.\n\nRules:\n1. Under 75 words.\n2. Every claim about the prospect must cite a real profile field.\n3. Every product claim must cite a knowledge chunk.\n4. Set needs_human when inputs are thin.\n5. Include personalisation_used[] with {claim, source_field}.\n6. Include knowledge_used[] with {claim, source}.\n7. Never fabricate signals. Authentic > clever.',
    },
    {
      id: 'pv_c1_cv1', agent_name: 'Conversation Agent', version: 1, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 6 * 86400000).toISOString(),
      content: 'Role: Classify inbound replies.\n\nIntents: interested, meeting_request, question, objection, not_now, not_interested, opt_out, referral, wrong_person, auto_reply, bounce, unclear.\n\nRules:\n1. opt_out overrides every other reading.\n2. Extract facts from the reply.\n3. Identify questions and objections separately.\n4. Recommend action: respond, escalate, close, wait.',
    },
  ],
  'camp_2': [
    {
      id: 'pv_c2_s2', agent_name: 'System Prompt', version: 2, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      content: 'Role: Finance & Technology SDR targeting CIOs at Indian BFSI institutions.\n\nVariables: {{first_name}}, {{company}}, {{regulation_context}}, {{digital_initiative}}\n\nRules:\n1. Focus on digital transformation, regulatory compliance, and cost efficiency.\n2. Under 80 words.\n3. Reference specific Indian BFSI context (RBI guidelines, NPCI, UPI).\n\nOutput Schema: { "subject": "string", "body": "string" }\n\nEscalation: needs_human if regulatory context is ambiguous.',
    },
    {
      id: 'pv_c2_s1', agent_name: 'System Prompt', version: 1, is_active: false, author: 'Aarav Singh',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
      content: 'Role: BFSI SDR targeting CIOs.\nVariables: {{first_name}}, {{company}}\nRules: Focus on ROI and compliance. Under 80 words.\nOutput Schema: { "subject": "string", "body": "string" }',
    },
    {
      id: 'pv_c2_r1', agent_name: 'Lead Research Agent', version: 1, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
      content: 'Role: Research agent for BFSI CIO outreach.\nFocus: Digital transformation initiatives, RBI compliance updates, technology vendor relationships, board announcements.\nRules: Never guess. Cite sources.',
    },
    {
      id: 'pv_c2_i1', agent_name: 'ICP Fitment Agent', version: 1, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
      content: 'Role: ICP scorer for India BFSI CIO campaign.\nDimensions: role (CIO, CDO, CTO), org type (Bank, Insurance, NBFC, Payment), AUM or revenue (>₹500 Cr).\nVerdicts: qualify, needs_review, reject.',
    },
  ],
  'camp_3': [
    {
      id: 'pv_c3_s2', agent_name: 'System Prompt', version: 2, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      content: 'Role: Voice AI SDR targeting founders of conversational AI startups.\n\nVariables: {{first_name}}, {{company}}, {{product_description}}, {{tech_challenge}}\n\nRules:\n1. Reference their specific voice AI product or technology challenge.\n2. Be technical and peer-to-peer in tone.\n3. Under 70 words.\n4. Mention a relevant technical insight.\n\nOutput Schema: { "subject": "string", "body": "string" }\n\nEscalation: needs_human if product description is missing or ambiguous.',
    },
    {
      id: 'pv_c3_s1', agent_name: 'System Prompt', version: 1, is_active: false, author: 'Aarav Singh',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 12 * 86400000).toISOString(),
      content: 'Role: Dev tools SDR targeting founders.\nVariables: {{first_name}}, {{company}}\nRules: Be technical. Under 70 words.\nOutput Schema: { "subject": "string", "body": "string" }',
    },
    {
      id: 'pv_c3_r1', agent_name: 'Lead Research Agent', version: 1, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      content: 'Role: Research agent for Voice AI founder outreach.\nFocus: Product announcements, technical blog posts, GitHub activity, YC/investor affiliations, conference talks.\nRules: Never guess. Cite sources.',
    },
    {
      id: 'pv_c3_v1', agent_name: 'Voice SDR Agent', version: 1, is_active: true, author: 'Kriti Jasuja',
      approved_by: 'Kriti Jasuja',
      created_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
      content: 'Role: Voice SDR agent making outbound calls to Voice AI founders.\n\nScript:\n1. Identify yourself and Pigeon SDR.\n2. Reference specific technical context from research.\n3. State value prop in under 20 seconds.\n4. Ask for 15-minute discovery call.\n5. Handle objections using knowledge base.\n\nEscalation: Transfer to human if prospect is actively engaged and asking pricing questions.\n\nVoice: Friendly, technical, peer-to-peer. Not salesy.',
    },
  ],
};

// ── Global agents state ──
let _globalAgents = [
  {
    id: 'agent_icp', name: 'ICP Fitment Agent', key: 'icp_fitment', engine: 'dronahq',
    status: 'running', paused: false,
    current_task: 'Scoring 12 prospects from US SaaS CTO Outreach',
    success_rate: 94, runs_today: 847, failures_today: 4,
    last_action: 'Qualified Sarah Chen (score: 87) — US SaaS CTO Outreach',
    last_action_at: new Date(now.getTime() - 300000).toISOString(),
    description: 'Scores prospects against ICP dimensions. Returns qualify, needs_review, or reject verdicts with confidence scores.',
  },
  {
    id: 'agent_research', name: 'Lead Research Agent', key: 'research', engine: 'dronahq',
    status: 'running', paused: false,
    current_task: 'Enriching 8 new prospects from Voice AI Founder Outreach',
    success_rate: 97, runs_today: 623, failures_today: 1,
    last_action: 'Enriched profile: Priya Sharma — found 4 intent signals',
    last_action_at: new Date(now.getTime() - 120000).toISOString(),
    description: 'Enriches prospect profiles with LinkedIn data, funding signals, hiring signals, tech stack, and recent news.',
  },
  {
    id: 'agent_outreach', name: 'Outreach Strategy Agent', key: 'outreach_strategy', engine: 'dronahq',
    status: 'idle', paused: false,
    current_task: 'Waiting for ICP queue',
    success_rate: 91, runs_today: 412, failures_today: 8,
    last_action: 'Designed 3-touch sequence for 6 qualified prospects',
    last_action_at: new Date(now.getTime() - 600000).toISOString(),
    description: 'Determines optimal outreach sequence, timing, and channel mix per prospect based on research signals.',
  },
  {
    id: 'agent_personal', name: 'Personalisation Agent', key: 'personalisation', engine: 'dronahq',
    status: 'running', paused: false,
    current_task: 'Writing emails for 6 prospects — US SaaS CTO Outreach',
    success_rate: 89, runs_today: 389, failures_today: 12,
    last_action: 'Generated personalised email for David Rodriguez using 3 knowledge chunks',
    last_action_at: new Date(now.getTime() - 60000).toISOString(),
    description: 'Writes personalised outreach messages grounded in prospect research and knowledge base content.',
  },
  {
    id: 'agent_conversation', name: 'Conversation Agent', key: 'conversation', engine: 'dronahq',
    status: 'running', paused: false,
    current_task: 'Classifying 3 inbound replies',
    success_rate: 96, runs_today: 127, failures_today: 2,
    last_action: 'Detected meeting_request intent — routing to calendar booking',
    last_action_at: new Date(now.getTime() - 180000).toISOString(),
    description: 'Classifies inbound replies, detects intent, handles objections, and routes conversations appropriately.',
  },
  {
    id: 'agent_voice', name: 'Voice SDR Agent', key: 'voice_sdr', engine: 'dronahq',
    status: 'running', paused: false,
    current_task: 'Active call: Rahul Patel — Voice AI Founder Outreach',
    success_rate: 82, runs_today: 14, failures_today: 1,
    last_action: 'Completed call with Ananya Gupta — booked discovery meeting',
    last_action_at: new Date(now.getTime() - 900000).toISOString(),
    description: 'Makes outbound voice calls, handles real-time conversations, and escalates to human SDRs when needed.',
  },
  {
    id: 'agent_followup', name: 'Follow-up Agent', key: 'followup_timing', engine: 'our_engine',
    status: 'idle', paused: false,
    current_task: 'Scheduling 18 follow-ups across active campaigns',
    success_rate: 99, runs_today: 203, failures_today: 0,
    last_action: 'Scheduled Day 3 follow-up for 6 prospects — optimal send time 9am IST',
    last_action_at: new Date(now.getTime() - 240000).toISOString(),
    description: 'Manages follow-up timing and cadence. Determines optimal send times based on prospect engagement patterns.',
  },
];

// ── Needs Attention Items ──
const _needsAttentionItems = [
  {
    id: 'att_1', type: 'approval', priority: 'high',
    title: 'Prompt approval pending',
    description: 'Personalisation Agent v2.4 awaiting approval before deployment to US SaaS CTO Outreach.',
    campaign: 'US SaaS CTO Outreach',
    agent: 'Personalisation Agent',
    action_url: '/review-queue',
    created_at: new Date(now.getTime() - 900000).toISOString(),
  },
  {
    id: 'att_2', type: 'conflict', priority: 'medium',
    title: 'Prospect conflict detected',
    description: 'Sarah Chen is targeted by 2 campaigns simultaneously. Resolve to prevent duplicate outreach.',
    campaign: 'Multiple',
    agent: null,
    action_url: '/conflicts',
    created_at: new Date(now.getTime() - 1800000).toISOString(),
  },
  {
    id: 'att_3', type: 'escalation', priority: 'high',
    title: 'Agent escalation: objection detected',
    description: 'Conversation Agent flagged a pricing objection from David Rodriguez. Review suggested response.',
    campaign: 'US SaaS CTO Outreach',
    agent: 'Conversation Agent',
    action_url: '/review-queue',
    created_at: new Date(now.getTime() - 300000).toISOString(),
  },
  {
    id: 'att_4', type: 'opportunity', priority: 'medium',
    title: 'Follow-up opportunity',
    description: 'Rahul Patel opened email 3 times in last 24h. Recommend immediate personalised follow-up.',
    campaign: 'Voice AI Founder Outreach',
    agent: 'Follow-up Agent',
    action_url: '/prospects',
    created_at: new Date(now.getTime() - 600000).toISOString(),
  },
  {
    id: 'att_5', type: 'approval', priority: 'low',
    title: 'Campaign activation pending',
    description: 'India BFSI CIO Outreach is paused. Resume when ready to re-engage BFSI prospects.',
    campaign: 'India BFSI CIO Outreach',
    agent: null,
    action_url: '/campaigns/camp_2',
    created_at: new Date(now.getTime() - 3600000).toISOString(),
  },
];

// ── Helpers ──
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

  async setAgentPause(agentKey, paused) {
    await delay();
    const agentName = Object.keys(_systemControl.agent_pauses).find(k =>
      k.toLowerCase().replace(/ /g, '_') === agentKey ||
      k === agentKey
    );
    if (agentName) {
      _systemControl.agent_pauses[agentName] = paused;
    }
    const agent = _globalAgents.find(a => a.key === agentKey || a.name === agentKey);
    if (agent) {
      agent.paused = paused;
      agent.status = paused ? 'paused' : 'idle';
    }
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
      author: 'Kriti Jasuja',
      approved_by: null,
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
    const t = CAMPAIGN_TARGETS[id] || { prospects: 100, sent: 20, replies: 5, meetings: 1, pipeline_value: 50000 };
    const runs = getRunsForCampaign(id);
    const failures = runs.filter(r => r.status === 'failed').length;
    const pendingEsc = _escalations.filter(e => e.campaign_id === id && e.status === 'pending').length;
    const spend = parseFloat(runs.reduce((sum, r) => sum + parseFloat(r.cost_usd), 0).toFixed(2));
    const successRate = runs.length > 0 ? Math.round(((runs.length - failures) / runs.length) * 100) : 97;

    const funnel = {
      discovered: t.prospects,
      researched: Math.floor(t.prospects * 0.75),
      qualified: Math.floor(t.prospects * 0.5),
      contacted: t.sent,
      engaged: t.replies,
      meeting: t.meetings,
      opportunity: Math.max(Math.floor(t.meetings * 0.6), 1),
    };

    const progress = Math.round((t.sent / t.prospects) * 100);

    return {
      total_prospects: t.prospects,
      messages_sent: t.sent,
      positive_replies: Math.floor(t.replies * 0.6),
      negative_replies: t.replies - Math.floor(t.replies * 0.6),
      replies: t.replies,
      meetings: t.meetings,
      meetings_booked: t.meetings,
      pipeline_value: t.pipeline_value,
      response_rate: ((t.replies / t.sent) * 100).toFixed(1),
      meeting_rate: ((t.meetings / t.replies) * 100).toFixed(1),
      qualified_lead_rate: ((funnel.qualified / t.prospects) * 100).toFixed(1),
      funnel,
      progress,
      // Health
      failures_today: failures,
      pending_approvals: pendingEsc,
      escalations: pendingEsc,
      agent_runs_today: runs.length,
      spend_today: spend,
      agent_success_rate: successRate,
    };
  },

  async getGlobalMetrics() {
    await delay();
    const allRuns = _agentRuns;
    const failures = allRuns.filter(r => r.status === 'failed').length;
    const successRate = allRuns.length > 0
      ? Math.round(((allRuns.length - failures) / allRuns.length) * 100)
      : 97;

    const totalMeetings = Object.values(CAMPAIGN_TARGETS).reduce((sum, t) => sum + t.meetings, 0);
    const totalPipeline = Object.values(CAMPAIGN_TARGETS).reduce((sum, t) => sum + t.pipeline_value, 0);
    const totalProspects = _allProspects.length;
    const activeProspects = _allProspects.filter(p => ['contacted', 'engaged', 'meeting'].includes(p.funnel_status)).length;
    const liveCampaigns = _campaigns.filter(c => c.status === 'live').length;

    return {
      live_campaigns: liveCampaigns,
      total_campaigns: _campaigns.length,
      active_prospects: activeProspects,
      total_prospects: totalProspects,
      meetings_booked: totalMeetings,
      pipeline_value: totalPipeline,
      agent_success_rate: successRate,
      pending_approvals: _escalations.filter(e => e.status === 'pending').length,
      conflicts: _conflicts.filter(c => c.status === 'pending').length,
    };
  },

  async getCampaignActivity(id) {
    await delay();
    return _activities.filter(a => a.campaign_id === id);
  },

  async getAllActivity() {
    await delay();
    return _activities.slice(0, 30);
  },

  // ── Agents ──
  async getAgentRuns(id) {
    await delay();
    const camp = _campaigns.find(c => c.id === id);
    const runs = getRunsForCampaign(id);
    const countFor = (name) => runs.filter(r => r.agent_name === name).length;
    const failFor = (name) => runs.filter(r => r.agent_name === name && r.status === 'failed').length;
    return [
      { name: 'Lead Research Agent', key: 'research', engine: 'dronahq', runs_today: countFor('Lead Research Agent') || 623, failures_today: failFor('Lead Research Agent') || 1, enabled: camp?.agents?.research ?? true },
      { name: 'ICP Fitment Agent', key: 'icp_fitment', engine: 'dronahq', runs_today: countFor('ICP Fitment Agent') || 847, failures_today: failFor('ICP Fitment Agent') || 4, enabled: camp?.agents?.icp_fitment ?? true },
      { name: 'Outreach Strategy Agent', key: 'outreach_strategy', engine: 'dronahq', runs_today: countFor('Outreach Strategy Agent') || 412, failures_today: failFor('Outreach Strategy Agent') || 8, enabled: camp?.agents?.outreach_strategy ?? true },
      { name: 'Personalisation Agent', key: 'personalisation', engine: 'dronahq', runs_today: countFor('Personalisation Agent') || 389, failures_today: failFor('Personalisation Agent') || 12, enabled: camp?.agents?.personalisation ?? true },
      { name: 'Conversation Agent', key: 'conversation', engine: 'dronahq', runs_today: countFor('Conversation Agent') || 127, failures_today: failFor('Conversation Agent') || 2, enabled: camp?.agents?.conversation ?? true },
      { name: 'Follow-up Timing Agent', key: 'followup_timing', engine: 'our_engine', runs_today: 203, failures_today: 0, enabled: camp?.agents?.followup_timing ?? true },
      { name: 'Voice SDR Agent', key: 'voice_sdr', engine: 'dronahq', runs_today: 14, failures_today: 1, enabled: camp?.agents?.voice_sdr ?? false },
    ];
  },

  async getGlobalAgents() {
    await delay();
    return _globalAgents.map(a => ({
      ...a,
      paused: _systemControl.agent_pauses[a.name] || a.paused,
    }));
  },

  // ── Needs Attention ──
  async getNeedsAttention() {
    await delay();
    const items = [..._needsAttentionItems];
    // Dynamic: add conflicts
    const pendingConflicts = _conflicts.filter(c => c.status === 'pending').length;
    const pendingEsc = _escalations.filter(e => e.status === 'pending').length;
    return {
      items,
      summary: {
        total: items.length,
        high: items.filter(i => i.priority === 'high').length,
        pending_approvals: pendingEsc,
        pending_conflicts: pendingConflicts,
      }
    };
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
