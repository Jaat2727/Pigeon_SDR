import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const now = new Date();

const prompts = [
  // Campaign 1 - US SaaS CTO
  {
    campaign_id: '11111111-1111-1111-1111-111111111111',
    agent_name: 'System Prompt', version: 1, is_active: false,
    author: 'Aarav Singh',
    content: 'Role: Enterprise SaaS SDR targeting US-based CTOs.\nVariables: {{first_name}}, {{company}}\nRules: Professional, concise. Under 80 words.\nOutput Schema: { "subject": "string", "body": "string" }',
    created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
  },
  {
    campaign_id: '11111111-1111-1111-1111-111111111111',
    agent_name: 'System Prompt', version: 2, is_active: true,
    author: 'Kriti Jasuja',
    content: 'Role: Enterprise SaaS SDR targeting US-based CTOs and VPs Engineering.\n\nVariables: {{first_name}}, {{company}}, {{recent_funding}}, {{tech_stack}}\n\nRules:\n1. Reference recent company news or technical decisions when available.\n2. Lead with a specific pain point relevant to their tech stack.\n3. Keep under 80 words.\n4. Never use generic openers.\n\nOutput Schema: { "subject": "string", "body": "string" }\n\nEscalation: If prospect is a C-suite exec at a company >500 employees, flag for human review.',
    created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
  },
  {
    campaign_id: '11111111-1111-1111-1111-111111111111',
    agent_name: 'Lead Research Agent', version: 1, is_active: true,
    author: 'Kriti Jasuja',
    content: 'Role: Research agent for US SaaS CTO outreach.\nFocus: Recent funding rounds, technical blog posts, conference talks, open-source contributions, hiring signals.\nRules: Never guess. Cite sources. Flag if data is >6 months old.',
    created_at: new Date(now.getTime() - 7 * 86400000).toISOString(),
  },
  {
    campaign_id: '11111111-1111-1111-1111-111111111111',
    agent_name: 'ICP Agent', version: 1, is_active: true,
    author: 'Kriti Jasuja',
    content: 'Role: ICP scorer for US SaaS CTO campaign.\nDimensions: role (CTO, VP Eng, Head of Eng), company size (50-2000), industry (SaaS, DevTools), funding (Series A+).\nVerdicts: qualify, needs_review, reject.\nConfidence: high, medium, low.',
    created_at: new Date(now.getTime() - 7 * 86400000).toISOString(),
  },

  // Campaign 2 - BFSI CIO India
  {
    campaign_id: '22222222-2222-2222-2222-222222222222',
    agent_name: 'System Prompt', version: 1, is_active: false,
    author: 'Aarav Singh',
    content: 'Role: BFSI SDR targeting Indian CIOs.\nVariables: {{first_name}}, {{company}}\nRules: Focus on ROI and compliance. Under 80 words.\nOutput Schema: { "subject": "string", "body": "string" }',
    created_at: new Date(now.getTime() - 12 * 86400000).toISOString(),
  },
  {
    campaign_id: '22222222-2222-2222-2222-222222222222',
    agent_name: 'System Prompt', version: 2, is_active: true,
    author: 'Kriti Jasuja',
    content: 'Role: BFSI SDR targeting CIOs at Indian banks and NBFCs.\n\nVariables: {{first_name}}, {{company}}, {{org_type}}, {{compliance_focus}}\n\nRules:\n1. Reference RBI compliance or digital transformation initiatives.\n2. Lead with regulatory or cost-saving angles.\n3. Under 80 words.\n\nOutput Schema: { "subject": "string", "body": "string" }',
    created_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
  },
  {
    campaign_id: '22222222-2222-2222-2222-222222222222',
    agent_name: 'Lead Research Agent', version: 1, is_active: true,
    author: 'Kriti Jasuja',
    content: 'Role: Research agent for BFSI CIO outreach.\nFocus: Digital transformation initiatives, RBI compliance updates, technology vendor relationships, board announcements.\nRules: Never guess. Cite sources.',
    created_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
  },

  // Campaign 3 - Voice AI Founders
  {
    campaign_id: '33333333-3333-3333-3333-333333333333',
    agent_name: 'System Prompt', version: 1, is_active: false,
    author: 'Aarav Singh',
    content: 'Role: Dev tools SDR targeting founders.\nVariables: {{first_name}}, {{company}}\nRules: Be technical. Under 70 words.\nOutput Schema: { "subject": "string", "body": "string" }',
    created_at: new Date(now.getTime() - 12 * 86400000).toISOString(),
  },
  {
    campaign_id: '33333333-3333-3333-3333-333333333333',
    agent_name: 'System Prompt', version: 2, is_active: true,
    author: 'Kriti Jasuja',
    content: 'Role: Voice AI SDR targeting founders of conversational AI startups.\n\nVariables: {{first_name}}, {{company}}, {{product_description}}, {{tech_challenge}}\n\nRules:\n1. Reference their specific voice AI product or technology challenge.\n2. Be technical and peer-to-peer in tone.\n3. Under 70 words.\n4. Mention a relevant technical insight.\n\nOutput Schema: { "subject": "string", "body": "string" }\n\nEscalation: needs_human if product description is missing or ambiguous.',
    created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
  },
  {
    campaign_id: '33333333-3333-3333-3333-333333333333',
    agent_name: 'Lead Research Agent', version: 1, is_active: true,
    author: 'Kriti Jasuja',
    content: 'Role: Research agent for Voice AI founder outreach.\nFocus: Product announcements, technical blog posts, GitHub activity, YC/investor affiliations, conference talks.\nRules: Never guess. Cite sources.',
    created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
  },
];

const { data, error } = await sb.from('prompt_versions').insert(prompts).select();
if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
console.log('Seeded', data.length, 'prompt versions');
