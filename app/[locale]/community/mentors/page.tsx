import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { db, isDbConfigured } from '@/lib/db/client';
import { mentorPosts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { seedMentorPosts } from '@/lib/seed-data';

interface MentorPost {
  id: string;
  role: string;
  bio: string;
  contactMethod: string | null;
  anonymous: boolean | null;
  locale: string | null;
  active: boolean | null;
  createdAt: string | null;
}

export default async function MentorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let posts: MentorPost[] = [];
  if (isDbConfigured) {
    try {
      posts = await db
        .select()
        .from(mentorPosts)
        .where(eq(mentorPosts.active, true))
        .orderBy(desc(mentorPosts.createdAt));
    } catch {
      // DB not ready
    }
  }

  if (posts.length === 0) {
    posts = seedMentorPosts;
  }

  return <MentorsContent posts={posts} />;
}

function MentorsContent({ posts }: { posts: MentorPost[] }) {
  const t = useTranslations('nav');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/community" className="hover:text-primary-600">{t('community')}</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">{t('mentors')}</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">Mentor / Mentee Board</h1>
      <p className="mt-4 text-warm-600">
        Connect with others in the Duane Syndrome community. Find a mentor who understands
        what you&apos;re going through, or become one for someone who needs guidance.
      </p>

      {posts.length === 0 ? (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
            <p className="text-lg text-warm-500">
              The mentor board is waiting for its first posts!
            </p>
            <p className="mt-2 text-warm-400">
              Sign in to offer your experience as a mentor or to find support as a mentee.
            </p>
          </div>

          {/* What is this section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-5">
              <h3 className="text-lg font-semibold text-primary-800">Become a Mentor</h3>
              <p className="mt-2 text-sm text-primary-600">
                Share your experience living with Duane Syndrome. Help a newly diagnosed person
                or parent navigate questions about school, work, surgery decisions, and daily life.
              </p>
            </div>
            <div className="rounded-xl border border-accent-200 bg-accent-50 p-5">
              <h3 className="text-lg font-semibold text-accent-800">Find a Mentor</h3>
              <p className="mt-2 text-sm text-accent-600">
                Looking for someone who understands? Connect with people who&apos;ve been through
                similar experiences and can offer guidance and support.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-warm-200 bg-card p-5"
            >
              <div className="flex items-center gap-2">
                <Badge variant={post.role === 'mentor' ? 'primary' : 'default'}>
                  {post.role === 'mentor' ? 'Mentor' : 'Looking for Mentor'}
                </Badge>
                {post.anonymous && (
                  <Badge variant="default">Anonymous</Badge>
                )}
              </div>
              <p className="mt-3 text-warm-600">{post.bio}</p>
              {post.contactMethod && (
                <p className="mt-2 text-sm text-warm-400">
                  Contact: {post.contactMethod}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
