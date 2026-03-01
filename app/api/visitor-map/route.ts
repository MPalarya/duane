import { NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { loginsByCountry } from '@/lib/db/schema';
import { seedVisitorMapData } from '@/lib/seed-data';
import { desc } from 'drizzle-orm';

export async function GET() {
  if (!isDbConfigured) {
    return NextResponse.json(seedVisitorMapData, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
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

    const data = rows.length > 0 ? rows : seedVisitorMapData;

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  } catch {
    return NextResponse.json(seedVisitorMapData, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  }
}
