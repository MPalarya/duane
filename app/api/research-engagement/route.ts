import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { researchEngagement } from '@/lib/db/schema';

const VALID_TYPES = new Set(['copy', 'share']);

export async function POST(req: NextRequest) {
  try {
    const { paperId, visitorId, type } = await req.json();
    if (!paperId || !visitorId || !type || !VALID_TYPES.has(type)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ ok: true });
    }

    await db.insert(researchEngagement).values({
      id: crypto.randomUUID(),
      paperId,
      visitorId,
      type,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
