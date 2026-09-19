/**
 * Migration: Add agent_pauses column to system_control table.
 * Run once: node --env-file ../.env migrate-agent-pauses.js
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Supabase JS doesn't expose raw DDL, so we PATCH the row with a new field
// and rely on the column already existing. Since it doesn't, we use the
// Supabase Management API via fetch.

const projectRef = process.env.SUPABASE_URL.match(/https:\/\/(\w+)\.supabase\.co/)?.[1];
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectRef) {
  console.error('Could not extract project ref from SUPABASE_URL');
  process.exit(1);
}

const sql = `ALTER TABLE system_control ADD COLUMN IF NOT EXISTS agent_pauses jsonb NOT NULL DEFAULT '{}'::jsonb;`;

const resp = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  }
);

const result = await resp.json();
if (!resp.ok) {
  console.error('Failed:', result);
  process.exit(1);
}

console.log('Migration applied successfully:', result);
