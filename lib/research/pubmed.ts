const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const SEARCH_TERM = '"Duane syndrome" OR "Duane retraction syndrome"';

interface PubMedArticle {
  pubmedId: string;
  title: string;
  abstract: string;
  authors: string;
  journal: string;
  publishedDate: string;
}

export async function searchPubMed(maxResults = 10): Promise<string[]> {
  const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(SEARCH_TERM)}&retmax=${maxResults}&sort=date&retmode=json`;

  const res = await fetch(searchUrl);
  const data = await res.json();

  return data.esearchresult?.idlist ?? [];
}

export async function fetchArticleDetails(ids: string[]): Promise<PubMedArticle[]> {
  if (ids.length === 0) return [];

  const fetchUrl = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
  const res = await fetch(fetchUrl);
  const xml = await res.text();

  // Simple XML parsing for article details
  const articles: PubMedArticle[] = [];
  const articleMatches = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];

  for (const articleXml of articleMatches) {
    const title = extractTag(articleXml, 'ArticleTitle') || 'Untitled';
    const abstract = extractTag(articleXml, 'AbstractText') || '';
    const journal = extractTag(articleXml, 'Title') || '';
    const pmid = extractTag(articleXml, 'PMID') || '';

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
      title,
      abstract,
      authors: authorNames.join(', '),
      journal,
      publishedDate: `${year}-${month || '01'}-01`,
    });
  }

  return articles;
}

function extractTag(xml: string, tagName: string): string | null {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`));
  return match ? match[1].trim() : null;
}
