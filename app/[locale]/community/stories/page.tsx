import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { db, isDbConfigured } from '@/lib/db/client';
import { stories } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { seedStories } from '@/lib/seed-data';

interface Story {
  id: string;
  title: string;
  profession: string | null;
  content: string;
  createdAt: string | null;
}

export default async function StoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let allStories: Story[] = [];
  if (isDbConfigured) {
    try {
      allStories = await db
        .select()
        .from(stories)
        .where(eq(stories.approved, true))
        .orderBy(desc(stories.createdAt));
    } catch {
      // DB not ready
    }
  }

  if (allStories.length === 0) {
    allStories = seedStories;
  }

  return <StoriesContent stories={allStories} />;
}

function StoriesContent({ stories: data }: { stories: Story[] }) {
  const t = useTranslations('nav');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Success Stories</h1>
      <p className="mt-4 text-warm-600">
        Real stories from people with Duane Syndrome proving that it doesn&apos;t define
        or limit what you can achieve.
      </p>

      {data.length === 0 ? (
        <div className="mt-8 rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
          <p className="text-lg text-warm-500">
            Be the first to share your story!
          </p>
          <p className="mt-2 text-warm-400">
            Your experience can inspire others in the Duane Syndrome community.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-700"
          >
            Share Your Story
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {data.map((story) => (
            <article
              key={story.id}
              className="rounded-xl border border-warm-200 bg-card p-6"
            >
              <h2 className="text-xl font-semibold text-warm-900">{story.title}</h2>
              {story.profession && (
                <p className="mt-1 text-sm font-medium text-primary-600">{story.profession}</p>
              )}
              <p className="mt-3 whitespace-pre-line text-warm-600 leading-relaxed">
                {story.content}
              </p>
              {story.createdAt && (
                <p className="mt-3 text-sm text-warm-400">
                  {new Date(story.createdAt).toLocaleDateString()}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
