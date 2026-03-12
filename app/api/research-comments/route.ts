import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { researchComments, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export async function GET(req: NextRequest) {
  try {
    const paperId = req.nextUrl.searchParams.get('paperId');
    if (!paperId) {
      return NextResponse.json({ error: 'Missing paperId' }, { status: 400 });
    }

    if (!isDbConfigured) {
      return NextResponse.json([]);
    }

    const rows = await db
      .select({
        id: researchComments.id,
        text: researchComments.text,
        createdAt: researchComments.createdAt,
        userName: users.name,
        userImage: users.image,
      })
      .from(researchComments)
      .leftJoin(users, eq(researchComments.userId, users.id))
      .where(eq(researchComments.paperId, paperId))
      .orderBy(desc(researchComments.createdAt));

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[research-comments GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isClerkConfigured) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 503 });
    }
    if (!isDbConfigured) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paperId, text } = await req.json();
    if (!paperId || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing paperId or text' }, { status: 400 });
    }

    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed.length > 1000) {
      return NextResponse.json({ error: 'Text must be 1-1000 characters' }, { status: 400 });
    }

    // Upsert Clerk user into users table
    const user = await currentUser();
    const userName = user?.fullName || user?.firstName || 'Anonymous';
    const userImage = user?.imageUrl || null;
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || null;

    const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existing.length === 0) {
      await db.insert(users).values({
        id: userId,
        name: userName,
        email: userEmail,
        image: userImage,
        provider: 'clerk',
      });
    }

    const comment = {
      id: crypto.randomUUID(),
      paperId,
      userId,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    await db.insert(researchComments).values(comment);

    return NextResponse.json({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      userName,
      userImage,
    });
  } catch (err) {
    console.error('[research-comments POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
