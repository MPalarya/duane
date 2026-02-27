import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db/client';
import { researchCache } from '@/lib/db/schema';
import { searchPubMed, fetchArticleDetails } from '@/lib/research/pubmed';
import { summarizeAbstract } from '@/lib/research/summarize';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDbConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // Search PubMed for recent Duane Syndrome papers
    const ids = await searchPubMed(5);
    const articles = await fetchArticleDetails(ids);

    let newCount = 0;

    for (const article of articles) {
      // Check if we already have this paper
      const existing = await db
        .select()
        .from(researchCache)
        .where(eq(researchCache.pubmedId, article.pubmedId))
        .limit(1);

      if (existing.length > 0) continue;

      // Generate AI summaries
      const summaries = await summarizeAbstract(article.title, article.abstract);

      await db.insert(researchCache).values({
        id: crypto.randomUUID(),
        pubmedId: article.pubmedId,
        title: article.title,
        abstract: article.abstract,
        authors: article.authors,
        journal: article.journal,
        publishedDate: article.publishedDate,
        aiSummarySimple: summaries?.simple ?? null,
        aiSummaryAdult: summaries?.adult ?? null,
        aiSummaryProfessional: summaries?.professional ?? null,
      });

      newCount++;
    }

    return NextResponse.json({
      message: `Fetched ${articles.length} articles, ${newCount} new`,
    });
  } catch (error) {
    console.error('Research fetch error:', error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
