import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { subscribers } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/client';
import { eq } from 'drizzle-orm';

const NEWSLETTER_SECRET = process.env.NEWSLETTER_SECRET;
const BATCH_LIMIT = 90; // Safe margin under Resend's 100/day free tier

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!NEWSLETTER_SECRET || authHeader !== `Bearer ${NEWSLETTER_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, html, offset = 0 } = await req.json();

    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and html are required' }, { status: 400 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const allConfirmed = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.confirmed, true));

    const total = allConfirmed.length;
    const batch = allConfirmed.slice(offset, offset + BATCH_LIMIT);
    const remaining = Math.max(0, total - offset - batch.length);

    let sent = 0;
    let failed = 0;

    for (const sub of batch) {
      try {
        const emailHtml = `
          ${html}
          <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e5e5;" />
          <p style="color: #888; font-size: 12px; text-align: center;">
            You're receiving this because you subscribed to the Duane Syndrome Portal newsletter.<br />
            <a href="https://duane-syndrome.com/subscribe" style="color: #888;">Unsubscribe</a>
          </p>
        `;

        await sendEmail({ to: sub.email, subject, html: emailHtml });
        sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      sent,
      failed,
      total,
      remaining,
      nextOffset: remaining > 0 ? offset + batch.length : null,
      message: remaining > 0
        ? `Sent to ${sent}/${total}. ${remaining} remaining — send the next batch tomorrow.`
        : `Newsletter sent to ${sent} subscriber${sent !== 1 ? 's' : ''}.`,
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
