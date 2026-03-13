import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { researchCache, scanProgress } from '@/lib/db/schema';
import { searchPubMed, fetchArticleDetails, scanPubMed } from '@/lib/research/pubmed';
import {
  searchEuropePmc,
  fetchFullTextXml,
  extractConclusions,
  scanEuropePmc,
} from '@/lib/research/europepmc';
import {
  searchSemanticScholar,
  batchLookupPapers,
  scanSemanticScholar,
} from '@/lib/research/semanticscholar';
import { deduplicateArticles } from '@/lib/research/deduplicate';
import { summarizeResearch } from '@/lib/research/summarize';
import type { ResearchArticle } from '@/lib/research/types';
import { eq, isNull, isNotNull, or, sql } from 'drizzle-orm';

export const maxDuration = 300; // 5 minutes

const TAG = '[research-cron]';

function log(step: string, msg: string, data?: Record<string, unknown>) {
  const parts = [TAG, step, msg];
  if (data) parts.push(JSON.stringify(data));
  console.log(parts.join(' '));
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  log('start', 'Research cron triggered');

  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    log('auth', 'Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDbConfigured) {
    log('db', 'Database not configured');
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // ── 1. Fetch latest articles from all 3 sources (3 each) ────────
    log('step-1', 'Fetching latest articles from 3 sources');
    const [pubmedIds, epmcArticles, s2Articles] = await Promise.allSettled([
      searchPubMed(3),
      searchEuropePmc(3),
      searchSemanticScholar(3),
    ]).then((results) => {
      for (const [i, label] of ['pubmed', 'europepmc', 's2'].entries()) {
        if (results[i].status === 'rejected') {
          log('step-1', `${label} fetch failed`, { error: String(results[i].reason) });
        }
      }
      return [
        results[0].status === 'fulfilled' ? results[0].value : [],
        results[1].status === 'fulfilled' ? results[1].value : [],
        results[2].status === 'fulfilled' ? results[2].value : [],
      ];
    }) as [string[], ResearchArticle[], ResearchArticle[]];

    const pubmedArticles = await fetchArticleDetails(pubmedIds);
    log('step-1', 'Fetched latest articles', {
      pubmed: pubmedArticles.length,
      europepmc: epmcArticles.length,
      s2: s2Articles.length,
    });

    // ── 2. Deduplicate & insert new articles (with AI summaries) ────
    const allArticles = [...epmcArticles, ...s2Articles, ...pubmedArticles];
    const unique = deduplicateArticles(allArticles);
    log('step-2', `Deduplicated to ${unique.length} unique articles`);

    let newCount = 0;
    let fullTextCount = 0;
    const sourceCounts = { pubmed: 0, europepmc: 0, semanticscholar: 0 };

    for (const article of unique) {
      if (!article.pubmedId && !article.doi) continue;

      const conditions = [];
      if (article.pubmedId) conditions.push(eq(researchCache.pubmedId, article.pubmedId));
      if (article.doi) conditions.push(eq(researchCache.doi, article.doi));

      const existing = await db
        .select({ id: researchCache.id })
        .from(researchCache)
        .where(conditions.length > 1 ? or(...conditions) : conditions[0])
        .limit(1);

      if (existing.length > 0) continue;

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

      if (newCount > 0) await new Promise((r) => setTimeout(r, 4000));
      const summaries = await summarizeResearch(article.title, article.abstract, conclusions);

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

      log('step-2', `Inserted new article: "${article.title.slice(0, 80)}"`, {
        source: article.source,
        pmid: article.pubmedId || undefined,
        doi: article.doi || undefined,
        hasSummary: !!summaries,
        hasConclusions: !!conclusions,
      });

      sourceCounts[article.source]++;
      newCount++;
    }

    log('step-2', `New articles inserted: ${newCount}`, { sourceCounts, fullTextCount });

    // ── 3. Historical scan: crawl each source progressively ─────────
    let scanInserted = 0;
    const scanStats = { pubmed: 0, europepmc: 0, semanticscholar: 0 };

    const existingRows = await db
      .select({ pubmedId: researchCache.pubmedId, doi: researchCache.doi })
      .from(researchCache);
    const existingPmids = new Set(
      existingRows.map((r) => r.pubmedId).filter(Boolean) as string[]
    );
    const existingDois = new Set(
      existingRows.map((r) => r.doi?.toLowerCase()).filter(Boolean) as string[]
    );
    log('step-3', `DB has ${existingRows.length} articles for dedup`);

    let progressRows: { source: string; offsetValue: number | null; cursorToken: string | null }[];
    try {
      progressRows = await db.select().from(scanProgress);
    } catch {
      progressRows = [];
      log('step-3', 'scan_progress table not found — skipping historical scan');
    }
    const getProgress = (src: string) => progressRows.find((p) => p.source === src);

    async function insertScannedArticles(articles: ResearchArticle[], src: string) {
      let count = 0;
      for (const article of articles) {
        if (!article.pubmedId && !article.doi) continue;
        if (article.pubmedId && existingPmids.has(article.pubmedId)) continue;
        if (article.doi && existingDois.has(article.doi.toLowerCase())) continue;

        try {
          await db.insert(researchCache).values({
            id: crypto.randomUUID(),
            pubmedId: article.pubmedId || null,
            title: article.title,
            abstract: article.abstract || null,
            authors: article.authors || null,
            journal: article.journal || null,
            publishedDate: article.publishedDate,
            doi: article.doi || null,
            pmcId: article.pmcId || null,
            s2Id: article.s2Id || null,
            isOpenAccess: article.isOpenAccess,
            oaPdfUrl: article.openAccessPdfUrl || null,
            source: article.source,
            citationCount: article.citationCount ?? 0,
          });
          if (article.pubmedId) existingPmids.add(article.pubmedId);
          if (article.doi) existingDois.add(article.doi.toLowerCase());
          count++;
        } catch {
          // unique constraint violation — skip
        }
      }
      scanStats[src as keyof typeof scanStats] += count;
      scanInserted += count;
      return count;
    }

    async function upsertProgress(
      src: string,
      offset: number,
      cursor: string | null,
      completed: boolean
    ) {
      try {
        await db
          .insert(scanProgress)
          .values({
            source: src,
            offsetValue: offset,
            cursorToken: cursor,
            completedAt: completed ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: scanProgress.source,
            set: {
              offsetValue: offset,
              cursorToken: cursor,
              completedAt: completed ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            },
          });
      } catch {
        // table might not exist yet
      }
    }

    if (progressRows !== undefined) {
      // 3a. PubMed scan (100 per day, offset-based)
      try {
        const pmProg = getProgress('pubmed');
        const pmOffset = pmProg?.offsetValue ?? 0;
        log('step-3a', `PubMed scan starting at offset ${pmOffset}`);
        const pmResult = await scanPubMed(pmOffset, 100);
        const pmInserted = await insertScannedArticles(pmResult.articles, 'pubmed');
        const pmCompleted = pmResult.nextOffset === null;
        await upsertProgress('pubmed', pmResult.nextOffset ?? 0, null, pmCompleted);
        log('step-3a', `PubMed scan done`, {
          fetched: pmResult.articles.length,
          inserted: pmInserted,
          total: pmResult.total,
          nextOffset: pmResult.nextOffset ?? 'COMPLETE — resetting',
        });
      } catch (e) {
        log('step-3a', `PubMed scan error: ${e}`);
      }

      // 3b. Europe PMC scan (100 per day, cursor-based)
      try {
        const epmcProg = getProgress('europepmc');
        const epmcCursor = epmcProg?.cursorToken || '*';
        log('step-3b', `Europe PMC scan starting`, {
          cursor: epmcCursor.slice(0, 20) + (epmcCursor.length > 20 ? '...' : ''),
        });
        const epmcResult = await scanEuropePmc(epmcCursor, 100);
        const epmcInserted = await insertScannedArticles(epmcResult.articles, 'europepmc');
        const epmcCompleted = epmcResult.nextCursor === null;
        await upsertProgress('europepmc', 0, epmcResult.nextCursor ?? '*', epmcCompleted);
        log('step-3b', `Europe PMC scan done`, {
          fetched: epmcResult.articles.length,
          inserted: epmcInserted,
          completed: epmcCompleted,
        });
      } catch (e) {
        log('step-3b', `Europe PMC scan error: ${e}`);
      }

      // 3c. Semantic Scholar scan (up to 1000 per day, token-based)
      if (process.env.S2_API_KEY) {
        try {
          const s2Prog = getProgress('semanticscholar');
          const s2Token = s2Prog?.cursorToken || null;
          log('step-3c', `S2 scan starting`, { hasToken: !!s2Token });
          const s2Result = await scanSemanticScholar(s2Token);
          const s2Inserted = await insertScannedArticles(s2Result.articles, 'semanticscholar');
          const s2Completed = s2Result.nextToken === null;
          await upsertProgress('semanticscholar', 0, s2Result.nextToken, s2Completed);
          log('step-3c', `S2 scan done`, {
            fetched: s2Result.articles.length,
            inserted: s2Inserted,
            completed: s2Completed,
          });
        } catch (e) {
          log('step-3c', `S2 scan error: ${e}`);
        }
      } else {
        log('step-3c', 'S2 scan skipped — no S2_API_KEY');
      }
    }

    log('step-3', `Historical scan total: ${scanInserted} inserted`, scanStats);

    // ── 4. Backfill: unsummarized articles (max 20) ─────────────────
    let summarized = 0;
    const unsummarized = await db
      .select()
      .from(researchCache)
      .where(isNull(researchCache.aiSummarySimple))
      .limit(20);

    log('step-4', `Found ${unsummarized.length} unsummarized articles`);

    for (let i = 0; i < unsummarized.length; i++) {
      const article = unsummarized[i];
      if (!article.abstract) continue;
      if (i > 0) await new Promise((r) => setTimeout(r, 4000));
      const summaries = await summarizeResearch(
        article.title,
        article.abstract,
        article.conclusions
      );
      if (!summaries) {
        log('step-4', `Summarization failed for "${article.title.slice(0, 60)}"`);
        continue;
      }

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

    log('step-4', `Summarized ${summarized}/${unsummarized.length} articles`);

    // ── 5. Backfill: missing abstracts (max 10) ────────────────────
    let abstractsBackfilled = 0;
    const missingAbstract = await db
      .select()
      .from(researchCache)
      .where(isNull(researchCache.abstract))
      .limit(10);

    log('step-5', `Found ${missingAbstract.length} articles missing abstracts`);

    for (const article of missingAbstract) {
      let abstract: string | null = null;

      if (!abstract && article.pubmedId) {
        try {
          const details = await fetchArticleDetails([article.pubmedId]);
          if (details[0]?.abstract) abstract = details[0].abstract;
        } catch { /* skip */ }
      }

      if (!abstract) {
        try {
          const query = article.pubmedId
            ? `EXT_ID:${article.pubmedId} AND SRC:MED`
            : article.doi
              ? `DOI:"${article.doi}"`
              : null;
          if (query) {
            const params = new URLSearchParams({ query, resultType: 'core', format: 'json' });
            const res = await fetch(
              `https://www.ebi.ac.uk/europepmc/webservices/rest/search?${params}`
            );
            if (res.ok) {
              const data = await res.json();
              const result = data.resultList?.result?.[0];
              if (result?.abstractText) abstract = String(result.abstractText);
            }
          }
        } catch { /* skip */ }
      }

      if (abstract) {
        await db
          .update(researchCache)
          .set({ abstract })
          .where(eq(researchCache.id, article.id));
        abstractsBackfilled++;
      }
    }

    log('step-5', `Backfilled ${abstractsBackfilled}/${missingAbstract.length} abstracts`);

    // ── 6. Backfill: OA status for old records (max 5) ──────────────
    let backfilled = 0;
    const missingOa = await db
      .select()
      .from(researchCache)
      .where(isNull(researchCache.source))
      .limit(5);

    for (const article of missingOa) {
      if (!article.pubmedId) continue;
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
                source: 'pubmed',
              })
              .where(eq(researchCache.id, article.id));
            backfilled++;
          }
        }
      } catch {
        // skip
      }
    }

    log('step-6', `OA backfill: ${backfilled}/${missingOa.length}`);

    // ── 7. S2 enrichment: refresh all articles via batch endpoint ────
    let s2Enriched = 0;
    if (process.env.S2_API_KEY) {
      const allDbArticles = await db
        .select({
          id: researchCache.id,
          doi: researchCache.doi,
          pubmedId: researchCache.pubmedId,
          s2Id: researchCache.s2Id,
        })
        .from(researchCache)
        .where(or(isNotNull(researchCache.doi), isNotNull(researchCache.pubmedId)));

      const lookupIds = allDbArticles
        .map((a) => ({
          inputId: a.id,
          s2Query: a.doi ? `DOI:${a.doi}` : `PMID:${a.pubmedId}`,
        }))
        .filter((a) => a.s2Query !== 'PMID:null' && a.s2Query !== 'DOI:null');

      log('step-7', `S2 enrichment: looking up ${lookupIds.length} articles`);

      if (lookupIds.length > 0) {
        const enrichMap = await batchLookupPapers(lookupIds);
        log('step-7', `S2 batch returned ${enrichMap.size} matches`);

        for (const article of allDbArticles) {
          const enrichment = enrichMap.get(article.id);
          if (!enrichment) continue;

          const updates: Record<string, unknown> = {};
          if (enrichment.s2Id && !article.s2Id) updates.s2Id = enrichment.s2Id;
          if (enrichment.citationCount > 0) updates.citationCount = enrichment.citationCount;
          if (enrichment.isOpenAccess) updates.isOpenAccess = true;
          if (enrichment.oaPdfUrl) updates.oaPdfUrl = enrichment.oaPdfUrl;

          if (Object.keys(updates).length > 0) {
            await db
              .update(researchCache)
              .set(updates)
              .where(eq(researchCache.id, article.id));
            s2Enriched++;
          }
        }
      }

      log('step-7', `S2 enrichment: updated ${s2Enriched} articles`);
    } else {
      log('step-7', 'S2 enrichment skipped — no S2_API_KEY');
    }

    // ── DB totals ───────────────────────────────────────────────────
    const [totals] = await db
      .select({
        total: sql<number>`count(*)`,
        withAbstract: sql<number>`count(${researchCache.abstract})`,
        withSummary: sql<number>`count(${researchCache.aiSummarySimple})`,
        withS2Id: sql<number>`count(${researchCache.s2Id})`,
      })
      .from(researchCache);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    const result = {
      newArticles: newCount,
      sources: sourceCounts,
      fullTextConclusions: fullTextCount,
      scan: { inserted: scanInserted, ...scanStats },
      summarized,
      abstractsBackfilled,
      oaBackfilled: backfilled,
      s2Enriched,
      dbTotals: totals,
      elapsedSeconds: Number(elapsed),
    };

    log('done', `Completed in ${elapsed}s`, result);
    return NextResponse.json(result);
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log('error', `Fatal error after ${elapsed}s: ${error}`);
    console.error('Research fetch error:', error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
