import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { submissions } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Honeypot check
    if (data?.website) {
      return NextResponse.json({ message: 'ok' }); // Silent fail for bots
    }

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    if (!isDbConfigured) {
      // If DB not configured, still accept (log for dev)
      console.log('[Submission]', type, data);
      return NextResponse.json({ message: 'Submission received' });
    }

    const id = crypto.randomUUID();
    await db.insert(submissions).values({
      id,
      type,
      dataJson: JSON.stringify(data),
      status: 'pending',
    });

    // Notify admin
    await sendEmail({
      to: 'admin@duane-syndrome.com',
      subject: `New submission: ${type}`,
      html: `
        <h2>New ${type} submission</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <p>Review at: https://duane-syndrome.com/admin</p>
      `,
    });

    return NextResponse.json({ message: 'Submission received', id });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
