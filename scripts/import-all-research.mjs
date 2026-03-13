/**
 * One-time bulk import of ALL historical Duane Syndrome research articles.
 * Inserts without AI summaries — the daily cron fills those in gradually.
 *
 * Usage:
 *   source <(grep -E '^(TURSO_|S2_API_KEY|SERPAPI_KEY)' .env.local | sed 's/^/export /')
 *   node scripts/import-all-research.mjs
 */

import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── PubMed ──────────────────────────────────────────────────────────

async function fetchAllPubMed() {
  console.log('\n── PubMed: fetching IDs... ──');
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent('"Duane syndrome" OR "Duane retraction syndrome"')}&retmax=2000&sort=date&retmode=json`;
  const res = await fetch(searchUrl);
  const data = await res.json();
  const ids = data.esearchresult?.idlist ?? [];
  console.log(`  Found ${ids.length} PubMed IDs`);

  // Fetch details in batches of 100
  const articles = [];
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    process.stdout.write(`  Fetching details ${i + 1}-${Math.min(i + 100, ids.length)}...`);
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${batch.join(',')}&retmode=xml`;
    const res = await fetch(fetchUrl);
    const xml = await res.text();

    const articleMatches = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
    for (const articleXml of articleMatches) {
      const title = extractTag(articleXml, 'ArticleTitle');
      const abstract = extractTag(articleXml, 'AbstractText');
      const journal = extractTag(articleXml, 'Title');
      const pmid = extractTag(articleXml, 'PMID');
      const doi = extractArticleId(articleXml, 'doi');
      const pmcId = extractArticleId(articleXml, 'pmc');
      const year = extractTag(articleXml, 'Year') || '';
      const month = extractTag(articleXml, 'Month') || '';

      const authorMatches = articleXml.match(/<Author[\s\S]*?<\/Author>/g) || [];
      const authors = authorMatches.map((a) => {
        const ln = extractTag(a, 'LastName') || '';
        const ini = extractTag(a, 'Initials') || '';
        return `${ln} ${ini}`.trim();
      }).filter(Boolean).join(', ');

      if (title) {
        articles.push({
          pubmedId: pmid,
          doi,
          pmcId,
          s2Id: null,
          title,
          abstract,
          authors,
          journal,
          publishedDate: year ? `${year}-${month || '01'}-01` : null,
          isOpenAccess: false,
          oaPdfUrl: null,
          source: 'pubmed',
          citationCount: 0,
        });
      }
    }
    console.log(` ${articleMatches.length} parsed`);
    await sleep(500); // NCBI asks for max 3 req/s without API key
  }

  console.log(`  Total PubMed articles: ${articles.length}`);
  return articles;
}

// ── Europe PMC ──────────────────────────────────────────────────────

async function fetchAllEuropePmc() {
  console.log('\n── Europe PMC: fetching... ──');
  const query = '"Duane syndrome" OR "Duane retraction syndrome"';
  const articles = [];
  let cursor = '*';
  let page = 0;

  while (true) {
    page++;
    process.stdout.write(`  Page ${page}...`);
    const params = new URLSearchParams({
      query,
      resultType: 'core',
      format: 'json',
      pageSize: '500',
      cursorMark: cursor,
    });
    const res = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?${params}`);
    if (!res.ok) { console.log(` error ${res.status}`); break; }

    const data = await res.json();
    const results = data.resultList?.result ?? [];
    console.log(` ${results.length} articles`);

    for (const r of results) {
      if (!r.title) continue;
      articles.push({
        pubmedId: r.pmid || null,
        doi: r.doi || null,
        pmcId: r.pmcid || null,
        s2Id: null,
        title: String(r.title),
        abstract: r.abstractText ? String(r.abstractText) : null,
        authors: formatEpmcAuthors(r.authorList),
        journal: r.journalTitle ? String(r.journalTitle) : null,
        publishedDate: formatEpmcDate(r),
        isOpenAccess: r.isOpenAccess === 'Y',
        oaPdfUrl: null,
        source: 'europepmc',
        citationCount: Number(r.citedByCount ?? 0),
      });
    }

    if (!data.nextCursorMark || data.nextCursorMark === cursor || results.length === 0) break;
    cursor = data.nextCursorMark;
    await sleep(500);
  }

  console.log(`  Total Europe PMC articles: ${articles.length}`);
  return articles;
}

// ── Deduplicate & Insert ────────────────────────────────────────────

async function importArticles(allArticles) {
  console.log(`\n── Deduplicating ${allArticles.length} articles... ──`);

  // Deduplicate by DOI first, then pubmedId
  const seen = new Map(); // key -> article
  for (const a of allArticles) {
    const doiKey = a.doi ? `doi:${a.doi.toLowerCase()}` : null;
    const pmidKey = a.pubmedId ? `pmid:${a.pubmedId}` : null;

    if (doiKey && seen.has(doiKey)) {
      // Merge: prefer article with abstract
      const existing = seen.get(doiKey);
      if (!existing.abstract && a.abstract) {
        existing.abstract = a.abstract;
      }
      if (!existing.pubmedId && a.pubmedId) existing.pubmedId = a.pubmedId;
      if (!existing.doi && a.doi) existing.doi = a.doi;
      if (!existing.pmcId && a.pmcId) existing.pmcId = a.pmcId;
      if (a.citationCount > (existing.citationCount || 0)) existing.citationCount = a.citationCount;
      continue;
    }
    if (pmidKey && seen.has(pmidKey)) {
      const existing = seen.get(pmidKey);
      if (!existing.abstract && a.abstract) existing.abstract = a.abstract;
      if (!existing.doi && a.doi) existing.doi = a.doi;
      if (!existing.pmcId && a.pmcId) existing.pmcId = a.pmcId;
      if (a.citationCount > (existing.citationCount || 0)) existing.citationCount = a.citationCount;
      continue;
    }

    if (doiKey) seen.set(doiKey, a);
    if (pmidKey) seen.set(pmidKey, a);
    if (!doiKey && !pmidKey) seen.set(`title:${a.title.toLowerCase().substring(0, 100)}`, a);
  }

  const unique = [...new Set(seen.values())];
  console.log(`  Unique articles: ${unique.length}`);

  // Check which already exist in DB
  const existingPmids = new Set();
  const existingDois = new Set();

  const dbRows = await db.execute('SELECT pubmed_id, doi FROM research_cache');
  for (const row of dbRows.rows) {
    if (row.pubmed_id) existingPmids.add(String(row.pubmed_id));
    if (row.doi) existingDois.add(String(row.doi).toLowerCase());
  }
  console.log(`  Already in DB: ${dbRows.rows.length}`);

  // Filter: articles older than 2 years must have citations
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const cutoff = twoYearsAgo.toISOString().slice(0, 10);

  const toInsert = unique.filter((a) => {
    if (a.pubmedId && existingPmids.has(a.pubmedId)) return false;
    if (a.doi && existingDois.has(a.doi.toLowerCase())) return false;
    // Older than 2 years with no citations → skip
    if (a.publishedDate && a.publishedDate < cutoff && !(a.citationCount > 0)) return false;
    return true;
  });

  const skippedOld = unique.length - toInsert.length - [...unique].filter(a =>
    (a.pubmedId && existingPmids.has(a.pubmedId)) || (a.doi && existingDois.has(a.doi.toLowerCase()))
  ).length;
  console.log(`  New to insert: ${toInsert.length} (skipped ${skippedOld} old uncited)`);

  // Insert in batches
  let inserted = 0;
  for (const a of toInsert) {
    try {
      await db.execute({
        sql: `INSERT INTO research_cache (id, pubmed_id, title, abstract, authors, journal, published_date, doi, pmc_id, s2_id, is_open_access, oa_pdf_url, source, citation_count)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          a.pubmedId || null,
          a.title,
          a.abstract || null,
          a.authors || null,
          a.journal || null,
          a.publishedDate || null,
          a.doi || null,
          a.pmcId || null,
          a.s2Id || null,
          a.isOpenAccess ? 1 : 0,
          a.oaPdfUrl || null,
          a.source,
          a.citationCount || 0,
        ],
      });
      inserted++;
    } catch (e) {
      // Skip duplicates from unique constraint
      if (!String(e).includes('UNIQUE')) {
        console.error(`  Error inserting "${a.title.substring(0, 50)}":`, e.message);
      }
    }
  }

  console.log(`\n  Inserted: ${inserted} new articles`);
  console.log(`  Skipped: ${toInsert.length - inserted} (duplicates)`);

  // Stats
  const stats = await db.execute('SELECT count(*) as total, count(abstract) as with_abstract, count(ai_summary_simple) as with_summary FROM research_cache');
  const s = stats.rows[0];
  console.log(`\n── DB totals ──`);
  console.log(`  Total articles: ${s.total}`);
  console.log(`  With abstract: ${s.with_abstract}`);
  console.log(`  With AI summary: ${s.with_summary}`);
  console.log(`  Days to summarize all: ~${Math.ceil((Number(s.total) - Number(s.with_summary)) / 20)}`);
}

// ── Helpers ──────────────────────────────────────────────────────────

function extractTag(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`));
  return match ? match[1].trim() : null;
}

function extractArticleId(xml, idType) {
  const match = xml.match(new RegExp(`<ArticleId IdType="${idType}">([^<]+)</ArticleId>`));
  return match ? match[1].trim() : null;
}

function formatEpmcAuthors(authorList) {
  if (!authorList?.author) return '';
  return authorList.author
    .map((a) => `${a.lastName || ''} ${a.initials || ''}`.trim())
    .filter(Boolean)
    .join(', ');
}

function formatEpmcDate(r) {
  if (r.firstPublicationDate) return r.firstPublicationDate;
  if (r.pubYear) return `${r.pubYear}-01-01`;
  return null;
}

// ── Semantic Scholar ─────────────────────────────────────────────────

const S2_API_KEY = process.env.S2_API_KEY;
const S2_BASE = 'https://api.semanticscholar.org/graph/v1';
let s2LastRequest = 0;

async function s2Throttle() {
  const elapsed = Date.now() - s2LastRequest;
  if (elapsed < 1050) await sleep(1050 - elapsed);
  s2LastRequest = Date.now();
}

function s2Headers() {
  const headers = { 'User-Agent': 'DuaneSyndromePortal/1.0 (research aggregator)' };
  if (S2_API_KEY) headers['x-api-key'] = S2_API_KEY;
  return headers;
}

async function fetchAllSemanticScholar() {
  if (!S2_API_KEY) {
    console.log('\n── Semantic Scholar: skipped (no S2_API_KEY) ──');
    return [];
  }

  console.log('\n── Semantic Scholar (bulk search): fetching... ──');
  const query = 'Duane syndrome OR Duane retraction syndrome';
  const fields = 'title,abstract,authors,journal,year,publicationDate,externalIds,isOpenAccess,openAccessPdf,citationCount';
  const articles = [];
  let token = undefined;
  let page = 0;

  while (true) {
    page++;
    process.stdout.write(`  Page ${page}...`);

    const params = new URLSearchParams({ query, fields });
    if (token) params.set('token', token);

    await s2Throttle();
    const res = await fetch(`${S2_BASE}/paper/search/bulk?${params}`, { headers: s2Headers() });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.log(` error ${res.status} — ${body.substring(0, 200)}`);
      // Retry on 429
      if (res.status === 429) {
        console.log('  Rate limited, waiting 15s...');
        await sleep(15000);
        continue;
      }
      break;
    }

    const data = await res.json();
    const papers = data.data ?? [];
    console.log(` ${papers.length} articles`);

    if (papers.length === 0) break;

    for (const p of papers) {
      if (!p.title) continue;
      const externalIds = p.externalIds ?? {};
      const oaPdf = p.openAccessPdf;

      articles.push({
        pubmedId: externalIds.PubMed || null,
        doi: externalIds.DOI || null,
        pmcId: externalIds.PubMedCentral ? `PMC${externalIds.PubMedCentral}` : null,
        s2Id: String(p.paperId ?? ''),
        title: String(p.title),
        abstract: p.abstract ? String(p.abstract) : null,
        authors: Array.isArray(p.authors)
          ? p.authors.map((a) => a.name || '').filter(Boolean).join(', ')
          : '',
        journal: p.journal?.name || null,
        publishedDate: p.publicationDate || (p.year ? `${p.year}-01-01` : null),
        isOpenAccess: Boolean(p.isOpenAccess),
        oaPdfUrl: oaPdf?.url || null,
        source: 'semanticscholar',
        citationCount: Number(p.citationCount ?? 0),
      });
    }

    token = data.token;
    if (!token) break;
  }

  console.log(`  Total Semantic Scholar articles: ${articles.length}`);
  return articles;
}

// ── Google Scholar ───────────────────────────────────────────────────

// ── Google Scholar via SerpAPI ───────────────────────────────────────

const SERPAPI_KEY = process.env.SERPAPI_KEY;

async function fetchAllGoogleScholar() {
  if (!SERPAPI_KEY) {
    console.log('\n── Google Scholar: skipped (no SERPAPI_KEY) ──');
    return [];
  }

  console.log('\n── Google Scholar (via SerpAPI): fetching... ──');
  const query = '"Duane syndrome" OR "Duane retraction syndrome"';
  const articles = [];
  let searches = 0;

  for (let start = 0; start < 1000; start += 20) {
    process.stdout.write(`  Page ${start / 20 + 1} (offset ${start})...`);

    const params = new URLSearchParams({
      engine: 'google_scholar',
      q: query,
      start: String(start),
      num: '20',
      hl: 'en',
      api_key: SERPAPI_KEY,
    });

    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    searches++;

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.log(` HTTP ${res.status} — ${body.substring(0, 200)}`);
      break;
    }

    const data = await res.json();
    const results = data.organic_results ?? [];
    console.log(` ${results.length} results (search #${searches})`);

    if (results.length === 0) break;

    for (const r of results) {
      // Extract DOI from link URL
      const doiMatch = r.link?.match(/doi\.org\/(.+?)(?:\?|$)/);
      const doi = doiMatch ? decodeURIComponent(doiMatch[1]) : null;

      // Citation count from inline_links
      const citedLink = r.inline_links?.cited_by;
      const citationCount = citedLink?.total ?? 0;

      // PDF resource
      const pdfResource = r.resources?.find((res) => res.file_format === 'PDF');

      articles.push({
        pubmedId: null,
        doi,
        pmcId: null,
        s2Id: null,
        title: r.title || null,
        abstract: r.snippet || null,
        snippet: r.snippet || null,
        authors: r.publication_info?.summary?.split(' - ')[0] || '',
        journal: r.publication_info?.summary?.split(' - ')[1]?.replace(/,?\s*\d{4}.*/, '').trim() || null,
        publishedDate: r.publication_info?.summary?.match(/\b(19|20)\d{2}\b/)?.[0]
          ? `${r.publication_info.summary.match(/\b(19|20)\d{2}\b/)[0]}-01-01`
          : null,
        isOpenAccess: Boolean(pdfResource),
        oaPdfUrl: pdfResource?.link || null,
        source: 'scholar',
        citationCount,
        scholarUrl: r.link || null,
      });
    }

    // Small delay between SerpAPI calls
    await sleep(1000);
  }

  console.log(`  Total Google Scholar articles: ${articles.length} (used ${searches} SerpAPI searches)`);
  return articles;
}

// ── Enrich Scholar abstracts from paper URLs ────────────────────────

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
};

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

async function fetchAbstractFromUrl(url) {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Standard academic meta tags
    const metaPatterns = [
      /name="citation_abstract"\s+content="([^"]*)"/i,
      /name="citation_abstract"\s+content='([^']*)'/i,
      /content="([^"]*)"\s+name="citation_abstract"/i,
      /name="DC\.description"\s+content="([^"]*)"/i,
      /name="description"\s+content="([^"]*)"/i,
      /property="og:description"\s+content="([^"]*)"/i,
    ];

    for (const pattern of metaPatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const text = stripHtml(match[1]).replace(/\s+/g, ' ').trim();
        if (text.length > 100) return text;
      }
    }

    // Abstract blocks
    const blockPatterns = [
      /<div[^>]*class="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*class="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
      /<div[^>]*id="abstract"[^>]*>([\s\S]*?)<\/div>/i,
    ];

    for (const pattern of blockPatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const text = stripHtml(match[1]).replace(/\s+/g, ' ').trim();
        if (text.length > 100) return text;
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function enrichScholarAbstracts(articles) {
  // Only enrich articles whose abstract is just a snippet (<300 chars)
  const needAbstract = articles.filter((a) => a.scholarUrl && (!a.abstract || a.abstract.length < 300));
  if (needAbstract.length === 0) return;

  console.log(`\n── Fetching full abstracts for ${needAbstract.length} Scholar articles... ──`);
  let fetched = 0;
  let failed = 0;

  for (let i = 0; i < needAbstract.length; i++) {
    const a = needAbstract[i];
    process.stdout.write(`  [${i + 1}/${needAbstract.length}] ${a.title?.substring(0, 50)}...`);

    const abstract = await fetchAbstractFromUrl(a.scholarUrl);
    if (abstract) {
      a.abstract = abstract;
      fetched++;
      console.log(` OK (${abstract.length} chars)`);
    } else {
      failed++;
      console.log(` kept snippet`);
    }

    await sleep(2000 + Math.random() * 1000);
  }

  console.log(`  Full abstracts: ${fetched}, kept snippet: ${failed}`);
}

// ── Run ─────────────────────────────────────────────────────────────

const pubmed = await fetchAllPubMed();
const epmc = await fetchAllEuropePmc();
const s2 = await fetchAllSemanticScholar();
const scholar = await fetchAllGoogleScholar();
// Fetch full abstracts from paper URLs for Scholar-only articles
await enrichScholarAbstracts(scholar);
await importArticles([...pubmed, ...epmc, ...s2, ...scholar]);
