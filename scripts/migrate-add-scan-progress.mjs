/**
 * Migration: add scan_progress table for historical article crawl.
 *
 * Usage:
 *   source <(grep -E '^TURSO_' .env.local | sed 's/^/export /')
 *   node scripts/migrate-add-scan-progress.mjs
 */

import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS scan_progress (
      source TEXT PRIMARY KEY,
      offset_value INTEGER DEFAULT 0,
      cursor_token TEXT,
      completed_at TEXT,
      updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);
  console.log('OK: scan_progress table created');

  // Verify
  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log(
    'Tables:',
    tables.rows.map((r) => r.name)
  );
}

main().catch((e) => console.error('FAIL:', e.message));
