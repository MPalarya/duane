import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { db, isDbConfigured } from '@/lib/db/client';
import { researchCache } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { ResearchCard } from '@/components/content/research-card';
import { seedResearchPapers } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

interface ResearchPaper {
  id: string;
  pubmedId: string | null;
  title: string;
  abstract: string | null;
  authors: string | null;
  journal: string | null;
  publishedDate: string | null;
  aiSummarySimple: string | null;
  aiSummaryAdult: string | null;
  aiSummaryProfessional: string | null;
  isOpenAccess: boolean | null;
  oaPdfUrl: string | null;
  conclusions: string | null;
  source: string | null;
}

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let papers: ResearchPaper[] = [];
  if (isDbConfigured) {
    try {
      papers = await db
        .select()
        .from(researchCache)
        .orderBy(desc(researchCache.publishedDate))
        .limit(20);
    } catch {
      // DB not ready
    }
  }
  if (papers.length === 0) {
    papers = seedResearchPapers;
  }

  return <ResearchContent papers={papers} />;
}

function ResearchContent({ papers }: { papers: ResearchPaper[] }) {
  const t = useTranslations('nav');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">{t('research')}</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">{t('research')}</h1>
      <p className="mt-4 text-warm-600">
        Latest research papers about Duane Syndrome from PubMed, Europe PMC, and Semantic Scholar,
        with AI-generated summaries at different reading levels.
      </p>

      {papers.length === 0 ? (
        <div className="mt-8 rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
          <p className="text-lg text-warm-500">
            The research feed will auto-populate once the database is connected.
            Papers are fetched daily from PubMed.
          </p>
          <p className="mt-3 text-warm-400">
            Search{' '}
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/?term=%22Duane+syndrome%22+OR+%22Duane+retraction+syndrome%22"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              PubMed directly
            </a>
            {' '}in the meantime.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {papers.map((paper) => (
            <ResearchCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}
