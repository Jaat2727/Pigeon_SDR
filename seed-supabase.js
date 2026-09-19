import { createClient } from '@supabase/supabase-js';
import { mockApi } from './src/api/mock.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedSupabase() {
  console.log('Fetching mock data...');
  const campaigns = await mockApi.getCampaigns();
  const prospects = await mockApi.getAllProspects();
  const conflicts = await mockApi.getConflicts();
  const escalations = await mockApi.getEscalations();
  const reps = await mockApi.getReps();
  const suppression = await mockApi.getSuppression();

  const cMap = {
    'camp_1': '11111111-1111-1111-1111-111111111111',
    'camp_2': '22222222-2222-2222-2222-222222222222',
    'camp_3': '33333333-3333-3333-3333-333333333333',
  };

  console.log('Seeding Reps...');
  for (const r of reps) {
    const id = `00000000-0000-0000-0000-${r.id.padEnd(12, '0')}`;
    await supabase.from('reps').upsert({
      id,
      full_name: r.full_name,
      email: r.email,
      title: r.title,
      linkedin_url: r.linkedin_url,
      is_active: r.is_active,
      created_at: r.created_at,
    });
  }

  console.log('Seeding Suppression List...');
  for (const s of suppression) {
    const id = `00000000-0000-0000-0000-${s.id.padEnd(12, '0')}`;
    await supabase.from('suppression_list').upsert({
      id,
      email: s.email,
      domain: s.domain,
      phone: s.phone,
      reason: s.reason,
      added_by: s.added_by,
      created_at: s.created_at,
    });
  }

  console.log('Seeding Campaigns...');
  for (const c of campaigns) {
    const id = cMap[c.id];
    await supabase.from('campaigns').upsert({
      id,
      name: c.name,
      description: c.description,
      colour: c.colour,
      status: c.status,
      owner: c.owner,
      target_audience: c.target_audience,
      channels: c.channels,
      agents: c.agents,
      created_at: c.created_at,
    });
    
    for (const repId of c.reps) {
      await supabase.from('campaign_reps').upsert({
        campaign_id: id,
        rep_id: `00000000-0000-0000-0000-${repId.padEnd(12, '0')}`
      });
    }
  }

  console.log('Seeding Prospects and Campaign_Prospects...');
  for (const p of prospects) {
    const rawId = p.id.replace('pro_camp_', '');
    const pId = `00000000-0000-0000-0000-${rawId.padEnd(12, '0')}`;
    await supabase.from('prospects').upsert({
      id: pId,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      title: p.role,
      company_name: p.company,
      provenance: p.provenance || {}
    });
    
    const cpId = `00000000-0000-0000-0001-${rawId.padEnd(12, '0')}`;
    await supabase.from('campaign_prospects').upsert({
      id: cpId,
      campaign_id: cMap[p.campaign_id],
      prospect_id: pId,
      state: p.funnel_status,
      fit_score: p.fit_score,
      icp_verdict: p.icp_verdict?.status || null,
      icp_confidence: p.icp_verdict?.confidence || null,
      last_touch_at: p.last_touch || null
    });
  }

  console.log('Seeding Conflicts...');
  for (const conf of conflicts) {
    const rawId = conf.id.replace('conflict_', '');
    const confId = `00000000-0000-0000-0002-${rawId.padEnd(12, '0')}`;
    const pId = `00000000-0000-0000-0000-${conf.prospect_id.replace('pro_camp_', '').padEnd(12, '0')}`;
    const campaign_ids = conf.campaign_ids.map(cid => cMap[cid]);
    await supabase.from('conflicts').upsert({
      id: confId,
      prospect_id: pId,
      campaign_ids: campaign_ids,
      rule: conf.rule,
      status: 'pending'
    });
  }

  console.log('Seeding Escalations...');
  for (const esc of escalations) {
    const rawId = esc.id.replace('esc_', '');
    const escId = `00000000-0000-0000-0003-${rawId.padEnd(12, '0')}`;
    const pId = `00000000-0000-0000-0000-${esc.prospect_id.replace('pro_camp_', '').padEnd(12, '0')}`;
    const cpId = `00000000-0000-0000-0001-${esc.prospect_id.replace('pro_camp_', '').padEnd(12, '0')}`;
    await supabase.from('escalations').upsert({
      id: escId,
      campaign_id: cMap[esc.campaign_id],
      prospect_id: pId,
      campaign_prospect_id: cpId,
      source_agent: esc.source_agent,
      escalation_type: esc.reason, // mock.js uses reason for the type (needs_review, etc)
      reason: esc.reason,
      proposed_action: esc.proposed_action,
      status: 'pending'
    });
  }

  console.log('Supabase seeded successfully!');
}

seedSupabase().catch(console.error);
