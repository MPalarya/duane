import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { safeFetch } from '@/lib/sanity/client';
import { communityLinksQuery } from '@/lib/sanity/queries';
import { seedCommunityLinks } from '@/lib/seed-data';

interface CommunityLink {
  _id: string;
  name: string;
  url: string;
  platform?: string;
  description?: string;
  memberCount?: number;
}

const platformIcons: Record<string, string> = {
  facebook: '📘',
  reddit: '🟠',
  discord: '💬',
  forum: '💭',
  organization: '🏛',
  other: '🔗',
};

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let links = (await safeFetch<CommunityLink[]>(communityLinksQuery, { locale })) ?? [];
  if (links.length === 0) {
    links = seedCommunityLinks;
  }

  return <CommunityContent links={links} />;
}

function CommunityContent({ links }: { links: CommunityLink[] }) {
  const t = useTranslations('nav');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">{t('community')}</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">{t('community')}</h1>
      <p className="mt-4 text-warm-600">
        Connect with the global Duane Syndrome community through these groups, forums, and organizations.
      </p>

      {/* Sub-sections */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/community/mentors"
          className="group rounded-xl border border-warm-200 bg-card p-6 text-center transition-all hover:border-primary-300 hover:shadow-md"
        >
          <span className="text-3xl">🤝</span>
          <h2 className="mt-2 text-lg font-semibold text-primary-700">{t('mentors')}</h2>
          <p className="mt-1 text-sm text-warm-500">Find or become a mentor</p>
        </Link>
        <Link
          href="/community/stories"
          className="group rounded-xl border border-warm-200 bg-card p-6 text-center transition-all hover:border-primary-300 hover:shadow-md"
        >
          <span className="text-3xl">⭐</span>
          <h2 className="mt-2 text-lg font-semibold text-primary-700">{t('stories')}</h2>
          <p className="mt-1 text-sm text-warm-500">Success stories</p>
        </Link>
        <Link
          href="/community/spotlight"
          className="group rounded-xl border border-warm-200 bg-card p-6 text-center transition-all hover:border-primary-300 hover:shadow-md"
        >
          <span className="text-3xl">✨</span>
          <h2 className="mt-2 text-lg font-semibold text-primary-700">{t('spotlight')}</h2>
          <p className="mt-1 text-sm text-warm-500">Known people</p>
        </Link>
        <Link
          href="/community/blog"
          className="group rounded-xl border border-warm-200 bg-card p-6 text-center transition-all hover:border-primary-300 hover:shadow-md"
        >
          <span className="text-3xl">📝</span>
          <h2 className="mt-2 text-lg font-semibold text-primary-700">{t('blog')}</h2>
          <p className="mt-1 text-sm text-warm-500">Community articles</p>
        </Link>
      </div>

      {/* Community Links */}
      {links.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-warm-800">Communities & Groups</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {links.map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-warm-200 bg-card p-5 transition-all hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{platformIcons[link.platform || 'other']}</span>
                  <div>
                    <h3 className="font-semibold text-warm-900 group-hover:text-primary-700">{link.name}</h3>
                    {link.description && (
                      <p className="mt-1 text-sm text-warm-500">{link.description}</p>
                    )}
                    {link.memberCount && (
                      <p className="mt-1 text-xs text-warm-400">{link.memberCount.toLocaleString()} members</p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
          <p className="text-warm-500">
            Community links are being curated. Check back soon or{' '}
            <Link href="/submit" className="text-primary-600 hover:underline">suggest a community</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
