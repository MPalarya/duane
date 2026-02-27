import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { subscribers } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/client';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { email, name, locale } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Check if already subscribed
    const existing = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Already subscribed' });
    }

    const id = crypto.randomUUID();
    await db.insert(subscribers).values({
      id,
      email,
      name: name || null,
      locale: locale || 'en',
      confirmed: false,
    });

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Confirm your subscription - Duane Syndrome Portal',
      html: `
        <h2>Welcome to the Duane Syndrome community!</h2>
        <p>Please confirm your subscription by clicking the link below:</p>
        <p><a href="https://duane-syndrome.com/api/subscribe?confirm=${id}">Confirm Subscription</a></p>
        <p>If you didn't sign up, you can safely ignore this email.</p>
      `,
    });

    return NextResponse.json({ message: 'Subscription pending confirmation' });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const confirmId = req.nextUrl.searchParams.get('confirm');

  if (!confirmId || !isDbConfigured) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    await db
      .update(subscribers)
      .set({ confirmed: true })
      .where(eq(subscribers.id, confirmId));

    // Redirect to success page
    return NextResponse.redirect(new URL('/en/subscribe?confirmed=true', req.url));
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
