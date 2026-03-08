import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { submissions } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/client';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, website } = await req.json();

    // Honeypot check
    if (website) {
      return NextResponse.json({ message: 'ok' });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 });
    }

    const data = { name: name || 'Anonymous', email, message };

    if (isDbConfigured) {
      const id = crypto.randomUUID();
      await db.insert(submissions).values({
        id,
        type: 'feedback',
        dataJson: JSON.stringify(data),
        status: 'pending',
      });
    }

    await sendEmail({
      to: 'admin@duane-syndrome.com',
      subject: `New feedback from ${data.name}`,
      html: `
        <h2>New feedback received</h2>
        <p><strong>From:</strong> ${data.name} (${email})</p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
        <hr />
        <p style="color: #888; font-size: 12px;">Reply directly to this email or to ${email}</p>
      `,
    });

    return NextResponse.json({ message: 'Feedback sent successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
