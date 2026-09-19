import fs from 'fs';

const url = 'https://srddxidzjcjvrzguftll.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZGR4aWR6amNqdnJ6Z3VmdGxsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTgxNTg3NCwiZXhwIjoyMTA1MzkxODc0fQ.0rbk-ZE4asEssQAn8KCVwqj7rniycIUwfltn4ow1KN4';

async function run() {
  const res = await fetch(url);
  const data = await res.json();
  
  const tables = data.definitions;
  let sql = '-- Current Schema Dump (from OpenAPI spec)\n\n';
  
  const tablesToReport = ['campaigns', 'prospects', 'campaign_prospects', 'prompt_versions', 'agent_runs', 'activities', 'messages', 'escalations', 'conflicts', 'suppression_list', 'reps', 'campaign_reps', 'system_control', 'knowledge_chunks'];

  for (const t of tablesToReport) {
    console.log(`\nTable: ${t}`);
    if (!tables[t]) {
      console.log(`  Does NOT exist.`);
      continue;
    }
    sql += `CREATE TABLE ${t} (\n`;
    const props = tables[t].properties;
    const cols = [];
    for (const [col, def] of Object.entries(props)) {
      console.log(`  - ${col}: ${def.type} (${def.format || 'no format'})`);
      let typeStr = def.format || def.type;
      if (typeStr === 'character varying') typeStr = 'text';
      if (typeStr === 'timestamp with time zone') typeStr = 'timestamptz';
      if (typeStr === 'timestamp without time zone') typeStr = 'timestamp';
      cols.push(`  ${col} ${typeStr}`);
    }
    sql += cols.join(',\n') + '\n);\n\n';
  }
  
  fs.writeFileSync('server/db/000-current-schema.sql', sql);
  console.log('\nWrote server/db/000-current-schema.sql');
}

run();
