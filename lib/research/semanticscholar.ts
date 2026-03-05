import type { ResearchArticle } from './types';

const S2_BASE = 'https://api.semanticscholar.org/graph/v1';
const SEARCH_TERM = 'Duane syndrome OR Duane retraction syndrome';

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

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  const headers = getHeaders();
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers });
    if (res.status !== 429) return res;
    const wait = 15000 * (i + 1); // 15s, 30s — gentle backoff
    console.log(`Semantic Scholar 429, retrying in ${wait / 1000}s...`);
    await new Promise((r) => setTimeout(r, wait));
  }
  return fetch(url, { headers }); // final attempt
}

export async function searchSemanticScholar(maxResults = 10): Promise<ResearchArticle[]> {
  const params = new URLSearchParams({
    query: SEARCH_TERM,
    limit: String(maxResults),
    fields: 'title,abstract,authors,journal,year,externalIds,isOpenAccess,openAccessPdf,citationCount',
  });

  const res = await fetchWithRetry(`${S2_BASE}/paper/search?${params}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`Semantic Scholar search error: ${res.status} — ${body.slice(0, 200)}`);
    return [];
  }

  const data = await res.json();
  const papers = data.data ?? [];

  return papers
    .filter((p: Record<string, unknown>) => p.title)
    .map((p: Record<string, unknown>) => {
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
        publishedDate: `${p.year ?? ''}-01-01`,
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
