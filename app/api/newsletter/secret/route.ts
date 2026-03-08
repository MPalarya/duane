import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const NEWSLETTER_SECRET = process.env.NEWSLETTER_SECRET;
const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export async function GET() {
  if (!isClerkConfigured || !ADMIN_EMAIL || !NEWSLETTER_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 403 });
  }

  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail || userEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ secret: NEWSLETTER_SECRET });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}
