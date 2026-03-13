import type { ResearchArticle } from './types';

const S2_BASE = 'https://api.semanticscholar.org/graph/v1';
const SEARCH_TERM = 'Duane syndrome OR Duane retraction syndrome';
const BATCH_FIELDS =
  'title,abstract,authors,journal,year,publicationDate,externalIds,isOpenAccess,openAccessPdf,citationCount';

// ── Rate limiter (1 req/s cumulative across all endpoints) ──────────

let lastRequestTime = 0;

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1050) {
    // 1050ms to stay safely under 1 req/s
    await new Promise((r) => setTimeout(r, 1050 - elapsed));
  }
  lastRequestTime = Date.now();
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'DuaneSyndromePortal/1.0 (research aggregator)',
  };
  const apiKey = process.env.S2_API_KEY;
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  return headers;
}

async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 2
): Promise<Response> {
  const headers = { ...getHeaders(), ...options?.headers };
  for (let i = 0; i < retries; i++) {
    await throttle();
    const res = await fetch(url, { ...options, headers });
    if (res.status !== 429) return res;
    const wait = 15000 * (i + 1); // 15s, 30s — gentle backoff
    console.log(`Semantic Scholar 429, retrying in ${wait / 1000}s...`);
    await new Promise((r) => setTimeout(r, wait));
  }
  await throttle();
  return fetch(url, { ...options, headers }); // final attempt
}

// ── Search (daily cron — new articles) ──────────────────────────────

export async function searchSemanticScholar(maxResults = 10): Promise<ResearchArticle[]> {
  const params = new URLSearchParams({
    query: SEARCH_TERM,
    limit: String(maxResults),
    fields: BATCH_FIELDS,
  });

  const res = await fetchWithRetry(`${S2_BASE}/paper/search?${params}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`Semantic Scholar search error: ${res.status} — ${body.slice(0, 200)}`);
    return [];
  }

  const data = await res.json();
  return parsePapers(data.data ?? []);
}

// ── Bulk search (import script — all historical articles) ───────────

export async function searchSemanticScholarBulk(
  maxResults = 2000
): Promise<ResearchArticle[]> {
  const allPapers: ResearchArticle[] = [];
  let token: string | undefined;

  const baseParams = new URLSearchParams({
    query: SEARCH_TERM,
    fields: BATCH_FIELDS,
  });

  while (allPapers.length < maxResults) {
    const params = new URLSearchParams(baseParams);
    if (token) params.set('token', token);

    const res = await fetchWithRetry(`${S2_BASE}/paper/search/bulk?${params}`);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`S2 bulk search error: ${res.status} — ${body.slice(0, 200)}`);
      break;
    }

    const data = await res.json();
    const papers = data.data ?? [];
    if (papers.length === 0) break;

    allPapers.push(...parsePapers(papers));
    token = data.token;
    if (!token) break; // no more pages
  }

  return allPapers.slice(0, maxResults);
}

// ── Scan (historical crawl — one page per cron run) ─────────────────

/** Fetch one page from S2 bulk search. Returns articles + next token (null when done). */
export async function scanSemanticScholar(
  token: string | null
): Promise<{ articles: ResearchArticle[]; nextToken: string | null }> {
  const params = new URLSearchParams({
    query: SEARCH_TERM,
    fields: BATCH_FIELDS,
  });
  if (token) params.set('token', token);

  const res = await fetchWithRetry(`${S2_BASE}/paper/search/bulk?${params}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`S2 scan error: ${res.status} — ${body.slice(0, 200)}`);
    return { articles: [], nextToken: null };
  }

  const data = await res.json();
  const papers = data.data ?? [];

  if (papers.length === 0) {
    return { articles: [], nextToken: null };
  }

  return {
    articles: parsePapers(papers),
    nextToken: data.token ?? null,
  };
}

// ── Batch lookup (enrichment — update existing articles) ────────────

export interface S2EnrichmentResult {
  s2Id: string;
  doi: string | null;
  pubmedId: string | null;
  pmcId: string | null;
  citationCount: number;
  isOpenAccess: boolean;
  oaPdfUrl: string | null;
  abstract: string | null;
}

/**
 * Look up papers by DOI or PMID via the S2 batch endpoint.
 * Accepts up to 500 IDs per call. Returns a map of input ID → enrichment data.
 * Papers not found in S2 are omitted from the result.
 */
export async function batchLookupPapers(
  ids: { inputId: string; s2Query: string }[]
): Promise<Map<string, S2EnrichmentResult>> {
  const results = new Map<string, S2EnrichmentResult>();
  if (ids.length === 0) return results;

  // Process in chunks of 500 (S2 batch limit)
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500);
    const s2Ids = chunk.map((c) => c.s2Query);

    const res = await fetchWithRetry(`${S2_BASE}/paper/batch?fields=${BATCH_FIELDS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: s2Ids }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`S2 batch lookup error: ${res.status} — ${body.slice(0, 200)}`);
      continue;
    }

    const papers: (Record<string, unknown> | null)[] = await res.json();

    for (let j = 0; j < papers.length; j++) {
      const paper = papers[j];
      if (!paper) continue; // not found in S2

      const externalIds = (paper.externalIds ?? {}) as Record<string, string>;
      const oaPdf = paper.openAccessPdf as { url?: string } | null;

      results.set(chunk[j].inputId, {
        s2Id: String(paper.paperId ?? ''),
        doi: externalIds.DOI ?? null,
        pubmedId: externalIds.PubMed ?? null,
        pmcId: externalIds.PubMedCentral ? `PMC${externalIds.PubMedCentral}` : null,
        citationCount: Number(paper.citationCount ?? 0),
        isOpenAccess: Boolean(paper.isOpenAccess),
        oaPdfUrl: oaPdf?.url || null,
        abstract: paper.abstract ? String(paper.abstract) : null,
      });
    }
  }

  return results;
}

// ── Helpers ──────────────────────────────────────────────────────────

function parsePapers(papers: Record<string, unknown>[]): ResearchArticle[] {
  return papers
    .filter((p) => p.title)
    .map((p) => {
      const externalIds = (p.externalIds ?? {}) as Record<string, string>;
      const oaPdf = p.openAccessPdf as { url?: string } | null;

      return {
        pubmedId: externalIds.PubMed ?? '',
        doi: externalIds.DOI ?? null,
        pmcId: externalIds.PubMedCentral ? `PMC${externalIds.PubMedCentral}` : null,
        s2Id: String(p.paperId ?? ''),
        title: String(p.title),
        abstract: String(p.abstract ?? ''),
        authors: formatS2Authors(p.authors),
        journal: (p.journal as { name?: string })?.name ?? '',
        publishedDate: formatS2Date(p),
        isOpenAccess: Boolean(p.isOpenAccess),
        openAccessPdfUrl: oaPdf?.url || null,
        source: 'semanticscholar' as const,
        citationCount: Number(p.citationCount ?? 0),
      };
    });
}

function formatS2Authors(authors: unknown): string {
  if (!Array.isArray(authors)) return '';
  return authors
    .map((a: { name?: string }) => a.name ?? '')
    .filter(Boolean)
    .join(', ');
}

function formatS2Date(p: Record<string, unknown>): string {
  // Prefer precise publicationDate (YYYY-MM-DD) over just year
  if (p.publicationDate && typeof p.publicationDate === 'string') {
    return p.publicationDate;
  }
  return `${p.year ?? ''}-01-01`;
}
