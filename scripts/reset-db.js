// reset-db.js — Wipe all Supabase records for testing
// Usage: npm run reset-db
// Requires SUPABASE_SERVICE_ROLE_KEY in .env (bypasses RLS)

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

// Delete in child-first order to respect foreign keys
// Each entry: [table, filter column] — use a non-null column that covers all rows
const tables = [
  ['listener_snapshots', 'league_id'],
  ['lineups',            'league_id'],
  ['league_members',     'league_id'],
  ['leagues',            'id'],
  ['users',              'id'],
];

for (const [table, col] of tables) {
  const { error } = await supabase.from(table).delete().not(col, 'is', null);
  if (error) {
    console.error(`Failed to clear ${table}:`, error.message);
    process.exit(1);
  }
  console.log(`Cleared: ${table}`);
}

console.log('Done. DB is empty.');
