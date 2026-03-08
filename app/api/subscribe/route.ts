import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { subscribers } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/client';
import { eq } from 'drizzle-orm';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, name, locale } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Check if logged-in user's email matches — skip confirmation if so
    let isVerifiedUser = false;
    if (isClerkConfigured) {
      try {
        const { userId } = await auth();
        if (userId) {
          const user = await currentUser();
          const userEmail = user?.emailAddresses?.[0]?.emailAddress;
          console.log('[Subscribe] Clerk user email:', userEmail, '| Submitted email:', email);
          if (userEmail && userEmail.toLowerCase() === email.toLowerCase()) {
            isVerifiedUser = true;
          }
        }
      } catch (err) {
        console.log('[Subscribe] Clerk auth check failed:', err);
      }
    }

    // Check if already exists
    const existing = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
    const isResubscribe = existing.length > 0;

    if (isResubscribe && existing[0].confirmed) {
      return NextResponse.json({ message: 'Already subscribed' });
    }

    // Verified user (logged in with matching email) — confirm immediately
    if (isVerifiedUser) {
      if (isResubscribe) {
        await db.update(subscribers).set({ confirmed: true }).where(eq(subscribers.email, email));
      } else {
        await db.insert(subscribers).values({
          id: crypto.randomUUID(), email, name: name || null, locale: locale || 'en', confirmed: true,
        });
      }
      return NextResponse.json({ message: 'Subscribed' });
    }

    // Not verified — create row if new, then send confirmation email
    const subscriberId = isResubscribe
      ? existing[0].id
      : crypto.randomUUID();

    if (!isResubscribe) {
      await db.insert(subscribers).values({
        id: subscriberId, email, name: name || null, locale: locale || 'en', confirmed: false,
      });
    }

    console.log('[Subscribe] Sending confirmation email to:', email);
    await sendEmail({
      to: email,
      subject: 'Welcome to the Duane Syndrome community! 💙',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .btn:hover { background-color: #fbd38d !important; }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Inter', sans-serif;">
          
          <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;" aria-hidden="true">
            Join our shared vision. Confirm your email to connect with patients, parents, and professionals.
          </div>
          
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
              
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: left;">
                      <img src="https://duane-syndrome.com/images/logo.png" alt="Duane Syndrome Portal" width="180" style="display: block; border: none;">
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 20px 40px 40px 40px;">
                      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 20px 0; letter-spacing: -0.025em;">One Shared Vision.</h1>
                      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Welcome to the home for research, lived experiences, and meaningful connection. Please confirm your email below to join our community and access the latest breakthroughs.
                      </p>
                  
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" bgcolor="#facc15" style="border-radius: 6px;">
                            <a href="https://duane-syndrome.com/api/subscribe?confirm=${subscriberId}" 
                               target="_blank" 
                               style="font-size: 16px; font-weight: 600; color: #0f172a; text-decoration: none; padding: 14px 30px; display: inline-block;">
                              Confirm Subscription
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #64748b; font-size: 14px; margin-top: 40px; border-top: 1px solid #334155; padding-top: 20px;">
                        If you didn't request this, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-top: 20px;">
                  <tr>
                    <td style="text-align: center; color: #475569; font-size: 12px;">
                      &copy; ${new Date().getFullYear()} Duane Syndrome Portal <br>
                      Bridging the gap between diagnosis and daily life.
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </body>
        </html>  
      `,
    });

    return NextResponse.json({ message: 'Subscription pending confirmation' });
  } catch (err) {
    console.error('[Subscribe] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Always return success to prevent email enumeration
    const existing = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);

    if (existing.length > 0 && existing[0].confirmed) {
      await db
        .update(subscribers)
        .set({ confirmed: false })
        .where(eq(subscribers.email, email));
    }

    return NextResponse.json({ message: 'If this email was subscribed, it has been unsubscribed.' });
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

    return NextResponse.redirect(new URL('/subscribe?confirmed=true', req.url));
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
