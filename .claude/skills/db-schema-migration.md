# Skill: Turso/Drizzle DB Schema Migration

## When to use
When adding or modifying tables in `lib/db/schema.ts` for this project.

## Key facts
- **DB**: Turso (remote LibSQL) via `@libsql/client`
- **ORM**: Drizzle ORM with `drizzle-kit` for migrations
- **Config**: `drizzle.config.ts` — uses `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
- **Schema**: `lib/db/schema.ts`
- **Client**: `lib/db/client.ts` — falls back to `:memory:` when env vars missing

## Critical: `drizzle-kit push` is broken with `dialect: 'turso'`
This is a known drizzle-kit bug (https://github.com/drizzle-team/drizzle-orm/issues/2095).
`push` and `introspect` silently fail — they report "Changes applied" or show 0 tables even though the DB has tables.
The config (`dialect: 'turso'`) is correct for v0.31.x — `dialect: 'sqlite'` + `driver: 'turso'` is NOT valid in this version.
`generate` works fine; only `push`/`introspect` are broken. Do NOT rely on them.

## Correct procedure

### 1. Edit the schema
Add/modify tables in `lib/db/schema.ts`.

### 2. Generate the migration SQL
```bash
npx drizzle-kit generate
```
This creates a `.sql` file in `drizzle/` (e.g., `drizzle/0003_xyz.sql`).

### 3. Apply the migration directly via libsql client
The env vars are in `.env.local` but are NOT available in the shell by default (Next.js loads them, the terminal does not). You must load and export them explicitly.

Create a temporary script **inside the project directory** (so node_modules resolve correctly):

```typescript
// scripts/migrate.ts
import { createClient } from '@libsql/client';

const c = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  // Paste the SQL from the generated migration file here:
  await c.execute(`CREATE TABLE IF NOT EXISTS ... `);
  console.log('OK: migration applied');

  // Verify:
  const tables = await c.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables:', tables.rows.map(r => r.name));
}

main().catch(e => console.error('FAIL:', e.message));
```

Run it with env vars exported:
```bash
source <(grep -E '^TURSO_' .env.local) && export TURSO_DATABASE_URL TURSO_AUTH_TOKEN && npx tsx scripts/migrate.ts
```

**Important constraints for the script:**
- Must be in the project directory (not `/tmp`) so `@libsql/client` resolves
- Must NOT use top-level `await` — wrap in `async function main()` (tsx runs as CJS)
- Clean up the script file after migration succeeds

### 4. Verify the table exists
The migration script should list all tables. Confirm the new table appears.

### 5. Type-check
```bash
npx tsc --noEmit
```

## Common pitfalls
| Pitfall | Why it fails |
|---------|-------------|
| `npx drizzle-kit push` | Silently does nothing with this Turso setup |
| Running script from `/tmp` | Can't resolve `@libsql/client` from `node_modules` |
| Top-level `await` in `.ts` | tsx/esbuild runs as CJS, doesn't support it |
| Env vars not exported | `source` sets vars but child processes need `export` |
| `turso db shell` | Requires separate `turso auth login`, not available in CI |
