import type { ResearchArticle } from './types';

// Priority: europepmc > semanticscholar > pubmed (richest OA metadata wins)
const SOURCE_PRIORITY: Record<string, number> = {
  europepmc: 3,
  semanticscholar: 2,
  pubmed: 1,
};

export function deduplicateArticles(articles: ResearchArticle[]): ResearchArticle[] {
  const byDoi = new Map<string, ResearchArticle>();
  const byPmid = new Map<string, ResearchArticle>();
  const unique: ResearchArticle[] = [];

  for (const article of articles) {
    const doi = article.doi?.toLowerCase();
    const pmid = article.pubmedId;

    // Check for duplicate by DOI (primary) or PubMed ID (fallback)
    const existingByDoi = doi ? byDoi.get(doi) : undefined;
    const existingByPmid = pmid ? byPmid.get(pmid) : undefined;
    const existing = existingByDoi ?? existingByPmid;

    if (existing) {
      // Keep the one with higher source priority, merging useful fields
      const merged = mergeArticles(existing, article);
      const idx = unique.indexOf(existing);
      if (idx !== -1) unique[idx] = merged;
      if (doi) byDoi.set(doi, merged);
      if (pmid) byPmid.set(pmid, merged);
    } else {
      unique.push(article);
      if (doi) byDoi.set(doi, article);
      if (pmid) byPmid.set(pmid, article);
    }
  }

  return unique;
}

function mergeArticles(a: ResearchArticle, b: ResearchArticle): ResearchArticle {
  const priorityA = SOURCE_PRIORITY[a.source] ?? 0;
  const priorityB = SOURCE_PRIORITY[b.source] ?? 0;
  const primary = priorityA >= priorityB ? a : b;
  const secondary = primary === a ? b : a;

  return {
    ...primary,
    // Fill in missing identifiers from the other source
    pubmedId: primary.pubmedId || secondary.pubmedId,
    doi: primary.doi || secondary.doi,
    pmcId: primary.pmcId || secondary.pmcId,
    s2Id: primary.s2Id || secondary.s2Id,
    // Prefer non-empty abstract
    abstract: primary.abstract || secondary.abstract,
    // Prefer OA info
    isOpenAccess: primary.isOpenAccess || secondary.isOpenAccess,
    openAccessPdfUrl: primary.openAccessPdfUrl || secondary.openAccessPdfUrl,
  };
}
