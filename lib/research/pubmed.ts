import type { ResearchArticle } from './types';

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const SEARCH_TERM = '"Duane syndrome" OR "Duane retraction syndrome"';

export async function searchPubMed(maxResults = 10): Promise<string[]> {
  const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(SEARCH_TERM)}&retmax=${maxResults}&sort=date&retmode=json`;

  const res = await fetch(searchUrl);
  const data = await res.json();

  return data.esearchresult?.idlist ?? [];
}

export async function fetchArticleDetails(ids: string[]): Promise<ResearchArticle[]> {
  if (ids.length === 0) return [];

  const fetchUrl = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
  const res = await fetch(fetchUrl);
  const xml = await res.text();

  const articles: ResearchArticle[] = [];
  const articleMatches = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];

  for (const articleXml of articleMatches) {
    const title = extractTag(articleXml, 'ArticleTitle') || 'Untitled';
    const abstract = extractTag(articleXml, 'AbstractText') || '';
    const journal = extractTag(articleXml, 'Title') || '';
    const pmid = extractTag(articleXml, 'PMID') || '';

    // Extract DOI and PMC ID from ArticleIdList
    const doi = extractArticleId(articleXml, 'doi');
    const pmcId = extractArticleId(articleXml, 'pmc');

    // Extract authors
    const authorMatches = articleXml.match(/<Author[\s\S]*?<\/Author>/g) || [];
    const authorNames = authorMatches.map((a) => {
      const lastName = extractTag(a, 'LastName') || '';
      const initials = extractTag(a, 'Initials') || '';
      return `${lastName} ${initials}`.trim();
    });

    // Extract date
    const year = extractTag(articleXml, 'Year') || '';
    const month = extractTag(articleXml, 'Month') || '';

    articles.push({
      pubmedId: pmid,
      doi,
      pmcId,
      s2Id: null,
      title,
      abstract,
      authors: authorNames.join(', '),
      journal,
      publishedDate: `${year}-${month || '01'}-01`,
      isOpenAccess: false, // PubMed doesn't tell us directly
      openAccessPdfUrl: null,
      source: 'pubmed',
      citationCount: 0,
    });
  }

  return articles;
}

/** Paginated scan for historical crawl. Returns articles + next offset (null when done). */
export async function scanPubMed(
  offset: number,
  batchSize = 100
): Promise<{ articles: ResearchArticle[]; nextOffset: number | null; total: number }> {
  const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(SEARCH_TERM)}&retstart=${offset}&retmax=${batchSize}&sort=date&retmode=json`;

  const res = await fetch(searchUrl);
  const data = await res.json();
  const ids: string[] = data.esearchresult?.idlist ?? [];
  const total = Number(data.esearchresult?.count ?? 0);

  if (ids.length === 0) {
    return { articles: [], nextOffset: null, total };
  }

  const articles = await fetchArticleDetails(ids);
  const nextOffset = offset + batchSize < total ? offset + batchSize : null;

  return { articles, nextOffset, total };
}

function extractTag(xml: string, tagName: string): string | null {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`));
  return match ? match[1].trim() : null;
}

function extractArticleId(xml: string, idType: string): string | null {
  const match = xml.match(
    new RegExp(`<ArticleId IdType="${idType}">([^<]+)</ArticleId>`)
  );
  return match ? match[1].trim() : null;
}
