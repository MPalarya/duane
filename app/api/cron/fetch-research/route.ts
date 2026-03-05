import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { researchCache } from '@/lib/db/schema';
import { searchPubMed, fetchArticleDetails } from '@/lib/research/pubmed';
import { searchEuropePmc, fetchFullTextXml, extractConclusions } from '@/lib/research/europepmc';
import { searchSemanticScholar } from '@/lib/research/semanticscholar';
import { deduplicateArticles } from '@/lib/research/deduplicate';
import { summarizeResearch } from '@/lib/research/summarize';
import type { ResearchArticle } from '@/lib/research/types';
import { eq, isNull, or } from 'drizzle-orm';

export const maxDuration = 300; // 5 minutes

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDbConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // 1. Fetch from all 3 sources in parallel
    const [pubmedIds, epmcArticles, s2Articles] = await Promise.allSettled([
      searchPubMed(5),
      searchEuropePmc(10),
      searchSemanticScholar(10),
    ]).then((results) => [
      results[0].status === 'fulfilled' ? results[0].value : [],
      results[1].status === 'fulfilled' ? results[1].value : [],
      results[2].status === 'fulfilled' ? results[2].value : [],
    ]) as [string[], ResearchArticle[], ResearchArticle[]];

    // Fetch PubMed article details
    const pubmedArticles = await fetchArticleDetails(pubmedIds);

    // 2. Deduplicate across all sources
    const allArticles = [...epmcArticles, ...s2Articles, ...pubmedArticles];
    const unique = deduplicateArticles(allArticles);

    let newCount = 0;
    let fullTextCount = 0;
    const sourceCounts = { pubmed: 0, europepmc: 0, semanticscholar: 0 };

    for (const article of unique) {
      if (!article.pubmedId && !article.doi) continue;

      // 3. Check if we already have this paper (by pubmedId or DOI)
      const conditions = [];
      if (article.pubmedId) {
        conditions.push(eq(researchCache.pubmedId, article.pubmedId));
      }
      if (article.doi) {
        conditions.push(eq(researchCache.doi, article.doi));
      }

      const existing = await db
        .select({ id: researchCache.id })
        .from(researchCache)
        .where(conditions.length > 1 ? or(...conditions) : conditions[0])
        .limit(1);

      if (existing.length > 0) continue;

      // 4. For OA articles with pmcId, fetch full-text conclusions
      let conclusions: string | null = null;
      let fullTextSource: string | null = null;

      if (article.isOpenAccess && article.pmcId) {
        const xml = await fetchFullTextXml(article.pmcId);
        if (xml) {
          conclusions = extractConclusions(xml);
          if (conclusions) {
            fullTextSource = 'europepmc';
            fullTextCount++;
          }
        }
      }

      // 5. Summarize with conclusions when available (with delay to avoid rate limits)
      if (newCount > 0) await new Promise((r) => setTimeout(r, 4000));
      const summaries = await summarizeResearch(article.title, article.abstract, conclusions);

      // 6. Insert with all new fields
      await db.insert(researchCache).values({
        id: crypto.randomUUID(),
        pubmedId: article.pubmedId || null,
        title: article.title,
        abstract: article.abstract || null,
        authors: article.authors || null,
        journal: article.journal || null,
        publishedDate: article.publishedDate,
        aiSummarySimple: summaries?.simple ?? null,
        aiSummaryAdult: summaries?.adult ?? null,
        aiSummaryProfessional: summaries?.professional ?? null,
        doi: article.doi || null,
        pmcId: article.pmcId || null,
        s2Id: article.s2Id || null,
        isOpenAccess: article.isOpenAccess,
        oaPdfUrl: article.openAccessPdfUrl || null,
        conclusions,
        fullTextSource,
        source: article.source,
        citationCount: article.citationCount ?? 0,
      });

      sourceCounts[article.source]++;
      newCount++;
    }

    // 7. Retry: unsummarized articles (max 20)
    let summarized = 0;
    const unsummarized = await db
      .select()
      .from(researchCache)
      .where(isNull(researchCache.aiSummarySimple))
      .limit(20);

    for (let i = 0; i < unsummarized.length; i++) {
      const article = unsummarized[i];
      if (!article.abstract) continue;
      if (i > 0) await new Promise((r) => setTimeout(r, 4000));
      const summaries = await summarizeResearch(
        article.title,
        article.abstract,
        article.conclusions
      );
      if (!summaries) continue;

      await db
        .update(researchCache)
        .set({
          aiSummarySimple: summaries.simple,
          aiSummaryAdult: summaries.adult,
          aiSummaryProfessional: summaries.professional,
        })
        .where(eq(researchCache.id, article.id));
      summarized++;
    }

    // 8. Backfill OA status for old records missing it (max 5)
    let backfilled = 0;
    const missingOa = await db
      .select()
      .from(researchCache)
      .where(isNull(researchCache.source))
      .limit(5);

    for (const article of missingOa) {
      if (!article.pubmedId) continue;

      // Try to enrich via Europe PMC
      try {
        const params = new URLSearchParams({
          query: `EXT_ID:${article.pubmedId} AND SRC:MED`,
          resultType: 'core',
          format: 'json',
        });
        const res = await fetch(
          `https://www.ebi.ac.uk/europepmc/webservices/rest/search?${params}`
        );
        if (res.ok) {
          const data = await res.json();
          const result = data.resultList?.result?.[0];
          if (result) {
            await db
              .update(researchCache)
              .set({
                doi: result.doi ?? article.doi,
                pmcId: result.pmcid ?? article.pmcId,
                isOpenAccess: result.isOpenAccess === 'Y',
                source: 'pubmed', // mark as backfilled
              })
              .where(eq(researchCache.id, article.id));
            backfilled++;
          }
        }
      } catch {
        // skip on error
      }
    }

    return NextResponse.json({
      message: `Fetched ${unique.length} unique articles, ${newCount} new, ${summarized} summarized, ${backfilled} backfilled`,
      sources: sourceCounts,
      fullTextConclusions: fullTextCount,
    });
  } catch (error) {
    console.error('Research fetch error:', error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
