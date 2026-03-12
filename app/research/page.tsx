import { db, isDbConfigured } from '@/lib/db/client';
import { researchCache, researchComments, researchEngagement, researchLikes } from '@/lib/db/schema';
import { and, desc, gt, gte, isNotNull, like, or, sql } from 'drizzle-orm';
import { seedResearchPapers } from '@/lib/seed-data';
import { ResearchPageClient, type ResearchPaper } from '@/components/content/research-page-client';

export const dynamic = 'force-dynamic';

export default async function ResearchPage() {
  let papers: ResearchPaper[] = [];
  let likeCounts: Record<string, number> = {};
  let engagementCounts: Record<string, { copy: number; share: number }> = {};
  let commentCounts: Record<string, number> = {};

  if (isDbConfigured) {
    try {
      // Fetch qualifying articles scored by relevance:
      // - must have abstract
      // - must have "duane" in title OR abstract
      // - must be published in last 2 years
      // Sorted by: citations desc, then date desc
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const cutoff = twoYearsAgo.toISOString().slice(0, 10);

      papers = await db
        .select()
        .from(researchCache)
        .where(
          and(
            isNotNull(researchCache.abstract),
            isNotNull(researchCache.aiSummarySimple),
            or(
              like(sql`lower(${researchCache.title})`, '%duane%'),
              like(sql`lower(${researchCache.abstract})`, '%duane%'),
            ),
            or(
              gte(researchCache.publishedDate, cutoff),
              gt(sql`COALESCE(${researchCache.citationCount}, 0)`, 0),
            ),
          )
        )
        .orderBy(
          desc(sql`COALESCE(${researchCache.citationCount}, 0)`),
          desc(researchCache.publishedDate),
        );

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

      const engagementRows = await db
        .select({
          paperId: researchEngagement.paperId,
          type: researchEngagement.type,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(researchEngagement)
        .groupBy(researchEngagement.paperId, researchEngagement.type);

      for (const row of engagementRows) {
        if (!engagementCounts[row.paperId]) {
          engagementCounts[row.paperId] = { copy: 0, share: 0 };
        }
        if (row.type === 'copy' || row.type === 'share') {
          engagementCounts[row.paperId][row.type] = row.count;
        }
      }

      const commentCountRows = await db
        .select({
          paperId: researchComments.paperId,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(researchComments)
        .groupBy(researchComments.paperId);

      for (const row of commentCountRows) {
        commentCounts[row.paperId] = row.count;
      }
    } catch {
      // DB not ready
    }
  }
  if (papers.length === 0) {
    papers = seedResearchPapers;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Research</h1>
      <p className="mt-4 text-warm-600">
        Latest research papers about Duane Syndrome from PubMed, Europe PMC, and Semantic Scholar, with AI-generated summaries at different reading levels.
      </p>

      {papers.length === 0 ? (
        <div className="mt-8 rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
          <p className="text-lg text-warm-500">
            The research feed will auto-populate once the database is connected. Papers are fetched daily from PubMed.
          </p>
          <p className="mt-3 text-warm-400">
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/?term=%22Duane+syndrome%22+OR+%22Duane+retraction+syndrome%22"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Search PubMed directly
            </a>
          </p>
        </div>
      ) : (
        <ResearchPageClient papers={papers} likeCounts={likeCounts} engagementCounts={engagementCounts} commentCounts={commentCounts} />
      )}
    </div>
  );
}
