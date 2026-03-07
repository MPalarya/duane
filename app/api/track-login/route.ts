import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { loginsByCountry } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json({ ok: true });
  }

  try {
    const country = req.headers.get('x-vercel-ip-country')
      || req.headers.get('cf-ipcountry')
      || 'XX';

    await db
      .insert(loginsByCountry)
      .values({ countryCode: country, count: 1 })
      .onConflictDoUpdate({
        target: loginsByCountry.countryCode,
        set: { count: sql`${loginsByCountry.count} + 1` },
      });
  } catch {
    // best-effort, never surface errors
  }

  return NextResponse.json({ ok: true });
}
