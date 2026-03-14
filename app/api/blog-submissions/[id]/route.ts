import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { blogSubmissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { plateToPortableText } from '@/lib/plate-to-portable-text';
import { sanityMutate, sanityUploadImageFromUrl } from '@/lib/sanity/write-client';
import { revalidatePath } from 'next/cache';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 96);
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// PATCH — approve or reject a submission
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!ADMIN_EMAIL || email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, adminNote } = body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!isDbConfigured) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Fetch the submission
    const [submission] = await db
      .select()
      .from(blogSubmissions)
      .where(eq(blogSubmissions.id, id));

    if (!submission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (action === 'reject') {
      await db
        .update(blogSubmissions)
        .set({ status: 'rejected', adminNote: adminNote || null })
        .where(eq(blogSubmissions.id, id));

      return NextResponse.json({ message: 'Submission rejected' });
    }

    // === APPROVE: Publish to Sanity ===
    const slug = slugify(submission.title);

    // Parse the Plate JSON stored in bodyMarkdown column
    let portableTextBody;
    try {
      const plateValue = JSON.parse(submission.bodyMarkdown);
      portableTextBody = plateToPortableText(plateValue);
    } catch {
      // Fallback: if it's not valid JSON (legacy markdown), use HTML converter
      const { htmlToPortableText } = await import('@/lib/html-to-portable-text');
      portableTextBody = htmlToPortableText(submission.bodyHtml);
    }

    // Upload inline images to Sanity and replace _imageUrl placeholders with asset refs
    for (let i = 0; i < portableTextBody.length; i++) {
      const node = portableTextBody[i] as Record<string, unknown>;
      if (node._type === 'image' && node._imageUrl) {
        const assetId = await sanityUploadImageFromUrl(node._imageUrl as string);
        if (assetId) {
          portableTextBody[i] = {
            _type: 'image',
            _key: node._key as string,
            asset: { _type: 'reference', _ref: assetId },
            alt: (node.alt as string) || undefined,
            caption: (node.caption as string) || undefined,
          };
        }
      }
    }

    const readingTime = estimateReadingTime(submission.bodyHtml.replace(/<[^>]*>/g, ''));
    const tags = submission.tags ? JSON.parse(submission.tags) : [];

    // Upload featured image to Sanity if provided
    let featuredImageAssetId: string | null = null;
    if (submission.featuredImageUrl) {
      featuredImageAssetId = await sanityUploadImageFromUrl(
        submission.featuredImageUrl
      );
    }

    // Create or update the author in Sanity
    const authorId = `author-${submission.userId}`;
    const authorDoc = {
      _id: authorId,
      _type: 'author',
      name: submission.authorName,
      bio: submission.authorBio || undefined,
    };

    // Create the blog post document
    const postId = `blogPost-${id}`;
    const postDoc: Record<string, unknown> = {
      _id: postId,
      _type: 'blogPost',
      title: submission.title,
      slug: { _type: 'slug', current: slug },
      author: { _type: 'reference', _ref: authorId },
      excerpt: submission.excerpt || undefined,
      body: portableTextBody,
      tags: tags.length > 0 ? tags : undefined,
      locale: 'en',
      readingTime,
      publishedAt: new Date().toISOString(),
    };

    if (featuredImageAssetId) {
      postDoc.featuredImage = {
        _type: 'image',
        asset: { _type: 'reference', _ref: featuredImageAssetId },
      };
    }

    // Execute mutations
    await sanityMutate([
      { createOrReplace: authorDoc },
      { createOrReplace: postDoc },
    ]);

    // Update the submission record
    await db
      .update(blogSubmissions)
      .set({
        status: 'approved',
        adminNote: adminNote || null,
        sanityDocId: postId,
      })
      .where(eq(blogSubmissions.id, id));

    // Revalidate blog pages
    revalidatePath('/community');
    revalidatePath(`/community/blog/${slug}`);

    return NextResponse.json({
      message: 'Post approved and published!',
      slug,
      sanityDocId: postId,
    });
  } catch (err) {
    console.error('[Blog Approval Error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
