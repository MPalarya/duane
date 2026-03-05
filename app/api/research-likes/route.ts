import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { researchLikes } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { paperId, visitorId } = await req.json();
    if (!paperId || !visitorId) {
      return NextResponse.json({ error: 'Missing paperId or visitorId' }, { status: 400 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ ok: true });
    }

    const existing = await db
      .select()
      .from(researchLikes)
      .where(and(eq(researchLikes.paperId, paperId), eq(researchLikes.visitorId, visitorId)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(researchLikes).values({
        id: crypto.randomUUID(),
        paperId,
        visitorId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { paperId, visitorId } = await req.json();
    if (!paperId || !visitorId) {
      return NextResponse.json({ error: 'Missing paperId or visitorId' }, { status: 400 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ ok: true });
    }

    await db
      .delete(researchLikes)
      .where(and(eq(researchLikes.paperId, paperId), eq(researchLikes.visitorId, visitorId)));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
