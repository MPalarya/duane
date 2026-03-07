import { NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { loginsByCountry } from '@/lib/db/schema';
import { seedVisitorMapData } from '@/lib/seed-data';
import { desc } from 'drizzle-orm';

const CACHE = 'public, s-maxage=60, stale-while-revalidate=300';

export async function GET() {
  if (!isDbConfigured) {
    return NextResponse.json(seedVisitorMapData, {
      headers: { 'Cache-Control': CACHE },
    });
  }

  try {
    const rows = await db
      .select({
        code: loginsByCountry.countryCode,
        count: loginsByCountry.count,
      })
      .from(loginsByCountry)
      .orderBy(desc(loginsByCountry.count));

    return NextResponse.json(rows, {
      headers: { 'Cache-Control': CACHE },
    });
  } catch {
    return NextResponse.json([], {
      headers: { 'Cache-Control': CACHE },
    });
  }
}
