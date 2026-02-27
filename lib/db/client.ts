import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

export const isDbConfigured = Boolean(tursoUrl);

const client = tursoUrl
  ? createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
  : createClient({ url: ':memory:' });

export const db = drizzle(client, { schema });
