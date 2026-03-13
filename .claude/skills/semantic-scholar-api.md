# Semantic Scholar API Reference

## Overview
Semantic Scholar (S2) is an AI-powered academic search engine by Allen Institute for AI.
- **214 million papers**, 2.49 billion citations, 79 million authors
- Indexes PubMed (~98% coverage for medical research), arXiv, Springer Nature, and more
- Updated daily

## Authentication
- **Header:** `x-api-key: <key>` (case-sensitive)
- **Env var:** `S2_API_KEY` (used in `lib/research/semanticscholar.ts`)
- **Rate limit (our key):** 1 request/second cumulative across ALL endpoints
- **Without key:** shared pool of 1000 req/s across all unauthenticated users (unreliable)

## Base URL
```
https://api.semanticscholar.org/graph/v1
```

## Key Endpoints

### Paper Search (daily cron)
```
GET /paper/search?query=...&fields=...&limit=100&offset=0
```
- Max 100 per page, 1000 results total
- Relevance-ranked
- Filters: `publicationTypes`, `year`, `openAccessPdf`, `minCitationCount`, `fieldsOfStudy`, `venue`

### Bulk Search (import scripts)
```
GET /paper/search/bulk?query=...&fields=...
```
- Boolean queries: `+` (AND), `|` (OR), `-` (NOT), `"..."` (phrase)
- Up to 10M results via `token` pagination (1000 per page)
- Returns `token` field for next page (null when done)

### Batch Lookup (enrichment — most important for us)
```
POST /paper/batch?fields=...
Body: { "ids": ["DOI:10.1234/...", "PMID:12345678", ...] }
```
- **Up to 500 paper IDs per request**
- Supports ID prefixes: `DOI:`, `PMID:`, `PMCID:`, `ARXIV:`, `CorpusId:`, `MAG:`, `ACL:`
- Returns array in same order as input (null for not-found papers)
- **This is how we enrich all existing articles efficiently**

### Single Paper
```
GET /paper/{paper_id}?fields=...
```
- `paper_id` can be S2 ID, `DOI:...`, `PMID:...`, etc.

### Paper Title Match
```
GET /paper/search/match?query=<exact title>&fields=...
```
- Finds paper by exact or close title match

### Citations & References
```
GET /paper/{paper_id}/citations?fields=...&limit=1000
GET /paper/{paper_id}/references?fields=...&limit=1000
```

### Author Endpoints
```
GET /author/{author_id}?fields=...
POST /author/batch?fields=...  (max 1000 IDs)
GET /author/search?query=...
GET /author/{author_id}/papers?fields=...
```

## Paper Fields (request via `fields` param, comma-separated)

Only `paperId` is returned by default. Request others explicitly:

| Field | Description |
|-------|-------------|
| `paperId` | S2 unique ID (always returned) |
| `corpusId` | Internal corpus ID |
| `externalIds` | `{ DOI, PubMed, PubMedCentral, ArXiv, MAG, ACL, DBLP }` |
| `url` | S2 paper page URL |
| `title` | Paper title |
| `abstract` | Abstract text (not always available) |
| `venue` | Publication venue |
| `publicationVenue` | Structured: `{ id, name, type, issn, url }` |
| `year` | Publication year |
| `publicationDate` | ISO date `YYYY-MM-DD` |
| `publicationTypes` | Array: JournalArticle, Conference, Review, CaseReport, ClinicalTrial, MetaAnalysis, etc. |
| `journal` | `{ name, volume, pages }` |
| `referenceCount` | Number of references |
| `citationCount` | Total citations |
| `influentialCitationCount` | S2-computed influential citations |
| `isOpenAccess` | Boolean |
| `openAccessPdf` | `{ url, status }` |
| `fieldsOfStudy` | Broad fields: "Medicine", "Biology", etc. |
| `s2FieldsOfStudy` | Granular S2 field classifications |
| `authors` | `[{ authorId, name }]` |
| `citations` | Nested paper objects (citing papers) |
| `references` | Nested paper objects (cited papers) |
| `tldr` | AI-generated one-sentence summary |
| `embedding` | SPECTER paper embedding vector |

## External ID Prefixes (for lookups)

Use these to look up papers by external identifier:
- `PMID:19872477` — PubMed ID
- `PMCID:PMC2323736` — PubMed Central ID
- `DOI:10.1234/example` — DOI
- `ARXIV:2106.15928` — ArXiv ID
- `CorpusId:215416146` — S2 corpus ID

## Rate Limiting Best Practices

1. **Our limit: 1 req/s cumulative** — must throttle across all endpoints
2. Use batch endpoints to minimize request count (500 papers/batch)
3. Request only needed fields (reduces response size)
4. Handle HTTP 429 with exponential backoff (15s, 30s)
5. All responses capped at 10 MB

## Search Filters

Available on `/paper/search`:
- `publicationTypes` — e.g., `JournalArticle,Review,ClinicalTrial`
- `year` — range like `2020-2024`
- `publicationDateOrYear` — ISO range `2020-01-01:2024-12-31`
- `openAccessPdf` — only OA papers
- `minCitationCount` — citation threshold
- `fieldsOfStudy` — e.g., `Medicine`
- `venue` — venue filter

## Comparison with PubMed for Our Use Case

- **S2 is NOT a replacement for PubMed** — PubMed has MeSH indexing (precise medical search)
- **S2 is NOT a replacement for Europe PMC** — EPMC provides full-text XML (conclusions extraction)
- **S2 adds value:** citation counts, OA PDF links, TLDR summaries, broader coverage
- **Best approach:** use all 3 sources, deduplicate, use S2 batch endpoint for enrichment

## Our Integration Points

- `lib/research/semanticscholar.ts` — S2 client (search, batch lookup, bulk search)
- `app/api/cron/fetch-research/route.ts` — daily cron uses S2 for new articles + enrichment
- `scripts/import-all-research.mjs` — bulk import uses S2 bulk search
- `lib/research/deduplicate.ts` — merges S2 data with PubMed/EPMC data
