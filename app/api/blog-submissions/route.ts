import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { blogSubmissions } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/client';
import { desc } from 'drizzle-orm';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

// POST — Submit a new blog post
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const body = await req.json();
    const { title, excerpt, bodyHtml, bodyJson, tags, featuredImageUrl } = body;

    if (!title?.trim() || !bodyHtml) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const authorName =
      user.fullName || user.emailAddresses?.[0]?.emailAddress || 'Anonymous';

    if (!isDbConfigured) {
      console.log('[Blog Submission]', { title, authorName });
      return NextResponse.json({ message: 'Submission received' });
    }

    const id = crypto.randomUUID();
    await db.insert(blogSubmissions).values({
      id,
      userId: user.id,
      authorName,
      title: title.trim(),
      excerpt: excerpt?.trim() || null,
      // bodyMarkdown column stores the Plate JSON (editor state)
      bodyMarkdown: bodyJson || '[]',
      bodyHtml,
      tags: tags ? JSON.stringify(tags) : null,
      featuredImageUrl: featuredImageUrl || null,
      status: 'pending',
    });

    // Notify admin
    await sendEmail({
      to: ADMIN_EMAIL || 'admin@duane-syndrome.com',
      subject: `New blog post submission: "${title}"`,
      html: `
        <h2>New blog post submitted</h2>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Author:</strong> ${authorName}</p>
        <p><strong>Excerpt:</strong> ${excerpt || '(none)'}</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://duane-syndrome.com'}/blog-admin">Review it here</a></p>
      `,
    });

    return NextResponse.json({ message: 'Submission received', id });
  } catch (err) {
    console.error('[Blog Submission Error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET — List submissions (admin only)
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!ADMIN_EMAIL || email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ submissions: [] });
    }

    const rows = await db
      .select()
      .from(blogSubmissions)
      .orderBy(desc(blogSubmissions.createdAt));

    return NextResponse.json({
      submissions: rows.map((r) => ({
        ...r,
        tags: r.tags ? JSON.parse(r.tags) : [],
      })),
    });
  } catch (err) {
    console.error('[Blog Submissions GET Error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
