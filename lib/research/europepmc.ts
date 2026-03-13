import type { ResearchArticle } from './types';

const EPMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
const SEARCH_TERM = '"Duane syndrome" OR "Duane retraction syndrome"';

export async function searchEuropePmc(maxResults = 10): Promise<ResearchArticle[]> {
  const params = new URLSearchParams({
    query: SEARCH_TERM,
    resultType: 'core',
    pageSize: String(maxResults),
    sort: 'DATE_CREATED desc',
    format: 'json',
  });

  const res = await fetch(`${EPMC_BASE}/search?${params}`);
  if (!res.ok) {
    console.error(`Europe PMC search error: ${res.status}`);
    return [];
  }

  const data = await res.json();
  const results = data.resultList?.result ?? [];

  return results.map((r: Record<string, unknown>) => ({
    pubmedId: String(r.pmid ?? ''),
    doi: (r.doi as string) ?? null,
    pmcId: (r.pmcid as string) ?? null,
    s2Id: null,
    title: String(r.title ?? 'Untitled'),
    abstract: String(r.abstractText ?? ''),
    authors: formatAuthors(r.authorList),
    journal: String(r.journalTitle ?? ''),
    publishedDate: formatDate(r),
    isOpenAccess: r.isOpenAccess === 'Y',
    openAccessPdfUrl: null, // filled in later if OA
    source: 'europepmc' as const,
    citationCount: Number(r.citedByCount ?? 0),
  }));
}

/** Paginated scan for historical crawl. Uses cursor-based pagination. */
export async function scanEuropePmc(
  cursor: string,
  batchSize = 100
): Promise<{ articles: ResearchArticle[]; nextCursor: string | null }> {
  const params = new URLSearchParams({
    query: SEARCH_TERM,
    resultType: 'core',
    pageSize: String(batchSize),
    sort: 'FIRST_PDATE desc',
    format: 'json',
    cursorMark: cursor,
  });

  const res = await fetch(`${EPMC_BASE}/search?${params}`);
  if (!res.ok) {
    console.error(`Europe PMC scan error: ${res.status}`);
    return { articles: [], nextCursor: null };
  }

  const data = await res.json();
  const results = data.resultList?.result ?? [];

  if (results.length === 0) {
    return { articles: [], nextCursor: null };
  }

  const articles = results.map((r: Record<string, unknown>) => ({
    pubmedId: String(r.pmid ?? ''),
    doi: (r.doi as string) ?? null,
    pmcId: (r.pmcid as string) ?? null,
    s2Id: null,
    title: String(r.title ?? 'Untitled'),
    abstract: String(r.abstractText ?? ''),
    authors: formatAuthors(r.authorList),
    journal: String(r.journalTitle ?? ''),
    publishedDate: formatDate(r),
    isOpenAccess: r.isOpenAccess === 'Y',
    openAccessPdfUrl: null,
    source: 'europepmc' as const,
    citationCount: Number(r.citedByCount ?? 0),
  }));

  const nextCursor =
    data.nextCursorMark && data.nextCursorMark !== cursor
      ? data.nextCursorMark
      : null;

  return { articles, nextCursor };
}

export async function fetchFullTextXml(pmcId: string): Promise<string | null> {
  try {
    const res = await fetch(`${EPMC_BASE}/${pmcId}/fullTextXML`);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export function extractConclusions(xml: string): string | null {
  // Try <sec sec-type="conclusions"> first, then <sec> with "conclusion" in title
  const patterns = [
    /<sec[^>]*sec-type="conclusions?"[^>]*>([\s\S]*?)<\/sec>/i,
    /<sec[^>]*>\s*<title[^>]*>[^<]*(?:conclusion|summary)[^<]*<\/title>([\s\S]*?)<\/sec>/i,
    /<sec[^>]*sec-type="discussion"[^>]*>([\s\S]*?)<\/sec>/i,
  ];

  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match) {
      const text = stripXmlTags(match[1]).trim();
      if (text.length > 50) {
        return text.slice(0, 3000);
      }
    }
  }

  return null;
}

function stripXmlTags(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAuthors(authorList: unknown): string {
  if (!authorList || typeof authorList !== 'object') return '';
  const list = (authorList as { author?: Array<{ lastName?: string; initials?: string }> }).author;
  if (!Array.isArray(list)) return '';
  return list
    .map((a) => `${a.lastName ?? ''} ${a.initials ?? ''}`.trim())
    .filter(Boolean)
    .join(', ');
}

function formatDate(r: Record<string, unknown>): string {
  const year = r.pubYear ?? r.firstPublicationDate?.toString().slice(0, 4) ?? '';
  return `${year}-01-01`;
}
