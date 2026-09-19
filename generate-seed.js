import fs from 'fs';
import { mockApi } from './src/api/mock.js';

async function generateSeed() {
  const campaigns = await mockApi.getCampaigns();
  const prospects = await mockApi.getAllProspects();
  const conflicts = await mockApi.getConflicts();
  const escalations = await mockApi.getEscalations();
  const reps = await mockApi.getReps();
  const suppression = await mockApi.getSuppression();

  let sql = `-- ==========================================\n`;
  sql += `-- Pigeon SDR — Exact Mock Seed Data\n`;
  sql += `-- ==========================================\n\n`;
  
  // Helper to escape strings
  const esc = (str) => {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'boolean') return str ? 'true' : 'false';
    if (typeof str === 'number') return str;
    if (typeof str === 'object') {
      if (Array.isArray(str)) return `'{"${str.join('","')}"}'::text[]`; // basic array handling
      return `'${JSON.stringify(str).replace(/'/g, "''")}'::jsonb`;
    }
    return `'${String(str).replace(/'/g, "''")}'`;
  };

  const toArr = (arr) => {
    if (!arr || arr.length === 0) return "'{}'::text[]";
    return `ARRAY[${arr.map(esc).join(',')}]::text[]`;
  };

  sql += `-- ── REPS ──\n`;
  for (const r of reps) {
    sql += `INSERT INTO reps (id, full_name, email, title, linkedin_url, is_active, created_at) VALUES ('00000000-0000-0000-0000-${r.id.padEnd(12, '0')}', ${esc(r.full_name)}, ${esc(r.email)}, ${esc(r.title)}, ${esc(r.linkedin_url)}, ${esc(r.is_active)}, ${esc(r.created_at)}) ON CONFLICT DO NOTHING;\n`;
  }
  sql += `\n`;

  sql += `-- ── SUPPRESSION LIST ──\n`;
  for (const s of suppression) {
    sql += `INSERT INTO suppression_list (id, email, domain, phone, reason, added_by, created_at) VALUES ('00000000-0000-0000-0000-${s.id.padEnd(12, '0')}', ${esc(s.email)}, ${esc(s.domain)}, ${esc(s.phone)}, ${esc(s.reason)}, ${esc(s.added_by)}, ${esc(s.created_at)}) ON CONFLICT DO NOTHING;\n`;
  }
  sql += `\n`;

  sql += `-- ── CAMPAIGNS ──\n`;
  // We need valid UUIDs. Let's map camp_1 -> uuid etc.
  const cMap = {
    'camp_1': '11111111-1111-1111-1111-111111111111',
    'camp_2': '22222222-2222-2222-2222-222222222222',
    'camp_3': '33333333-3333-3333-3333-333333333333',
  };

  for (const c of campaigns) {
    sql += `INSERT INTO campaigns (id, name, description, colour, status, owner, target_audience, channels, agents, created_at) VALUES (${esc(cMap[c.id])}, ${esc(c.name)}, ${esc(c.description)}, ${esc(c.colour)}, ${esc(c.status)}, ${esc(c.owner)}, ${esc(c.target_audience)}, ${esc(c.channels)}, ${esc(c.agents)}, ${esc(c.created_at)}) ON CONFLICT DO NOTHING;\n`;
    
    for (const repId of c.reps) {
      sql += `INSERT INTO campaign_reps (campaign_id, rep_id) VALUES (${esc(cMap[c.id])}, '00000000-0000-0000-0000-${repId.padEnd(12, '0')}') ON CONFLICT DO NOTHING;\n`;
    }
  }
  sql += `\n`;

  sql += `-- ── PROSPECTS & CAMPAIGN_PROSPECTS ──\n`;
  for (const p of prospects) {
    const pId = '00000000-0000-0000-0000-' + p.id.replace('pro_camp_', '').padEnd(12, '0');
    sql += `INSERT INTO prospects (id, first_name, last_name, email, title, company_name, provenance) VALUES (${esc(pId)}, ${esc(p.first_name)}, ${esc(p.last_name)}, ${esc(p.email)}, ${esc(p.role)}, ${esc(p.company)}, ${esc(p.provenance || {})}) ON CONFLICT DO NOTHING;\n`;
    
    // We only have one campaign_prospects row per prospect in the mock
    const cpId = '00000000-0000-0000-0001-' + p.id.replace('pro_camp_', '').padEnd(12, '0');
    sql += `INSERT INTO campaign_prospects (id, campaign_id, prospect_id, state, fit_score, icp_verdict, icp_confidence, last_touch_at) VALUES (${esc(cpId)}, ${esc(cMap[p.campaign_id])}, ${esc(pId)}, ${esc(p.funnel_status)}, ${esc(p.fit_score)}, ${esc(p.icp_verdict?.status)}, ${esc(p.icp_verdict?.confidence)}, ${esc(p.last_touch)}) ON CONFLICT DO NOTHING;\n`;
  }
  sql += `\n`;

  fs.writeFileSync('server/db/seed.sql', sql);
  console.log('Seed SQL generated to server/db/seed.sql');
}

generateSeed().catch(console.error);
