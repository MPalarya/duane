import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { db, isDbConfigured } from '@/lib/db/client';
import { researchCache, researchLikes } from '@/lib/db/schema';
import { desc, isNotNull, sql } from 'drizzle-orm';
import { seedResearchPapers } from '@/lib/seed-data';
import { ResearchPageClient, type ResearchPaper } from '@/components/content/research-page-client';

export const dynamic = 'force-dynamic';

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let papers: ResearchPaper[] = [];
  let likeCounts: Record<string, number> = {};

  if (isDbConfigured) {
    try {
      papers = await db
        .select()
        .from(researchCache)
        .where(isNotNull(researchCache.abstract))
        .orderBy(desc(researchCache.publishedDate))
        .limit(50);

      const counts = await db
        .select({
          paperId: researchLikes.paperId,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(researchLikes)
        .groupBy(researchLikes.paperId);

      for (const row of counts) {
        likeCounts[row.paperId] = row.count;
      }
    } catch {
      // DB not ready
    }
  }
  if (papers.length === 0) {
    papers = seedResearchPapers;
  }

  return <ResearchContent papers={papers} likeCounts={likeCounts} />;
}

function ResearchContent({
  papers,
  likeCounts,
}: {
  papers: ResearchPaper[];
  likeCounts: Record<string, number>;
}) {
  const t = useTranslations('research');
  const tn = useTranslations('nav');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">{tn('home')}</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">{tn('research')}</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">{t('title')}</h1>
      <p className="mt-4 text-warm-600">{t('description')}</p>

      {papers.length === 0 ? (
        <div className="mt-8 rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
          <p className="text-lg text-warm-500">{t('emptyState')}</p>
          <p className="mt-3 text-warm-400">
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/?term=%22Duane+syndrome%22+OR+%22Duane+retraction+syndrome%22"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              {t('searchPubmed')}
            </a>
          </p>
        </div>
      ) : (
        <ResearchPageClient papers={papers} likeCounts={likeCounts} />
      )}
    </div>
  );
}
