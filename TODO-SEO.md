# SEO Improvements TODO

## Priority 1: Infrastructure fixes (implement now)

- [x] **1. Fix sitemap to include dynamic routes**
  - Added dynamic blog posts from Sanity to sitemap
  - Added specialist pages from database to sitemap
  - Removed stale redirected URLs (community/blog, community/mentors, community/stories, community/spotlight)

- [x] **2. Add `generateMetadata()` to `/specialists/[id]`**
  - Dynamic title with specialist name
  - Dynamic description with specialty and location

- [x] **3. Add OG image + Twitter card metadata**
  - Auto-generated OG image via `opengraph-image.tsx` (edge runtime)
  - Twitter card metadata (`summary_large_image`) in root layout
  - Twitter image via `twitter-image.tsx`

- [x] **4. Create custom `not-found.tsx`**
  - Branded 404 page with links to 6 key sections
  - noindex + follow robots directive

- [x] **5. Add Organization + WebSite JSON-LD to root layout**
  - Organization schema (name, url, logo, description)
  - WebSite schema (name, url) via @graph

- [x] **6. Add security/caching headers in `next.config.ts`**
  - X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

## Priority 1.5: Research-driven improvements

- [x] **8. Add OpenGraph fields to blog post `generateMetadata()`**
  - Added `openGraph.type: 'article'`, `publishedTime`, `authors`

- [x] **9. Add metadata to research page**
  - Title: "Research Papers"
  - Description with plain-language summary mention

- [x] **10. Review raw `<img>` tags**
  - 4 instances in client components with external dynamic URLs — kept as-is (minimal SEO impact)

## Priority 1.75: AI search visibility + crawling/appearance improvements

- [x] **11. Allow AI crawlers in robots.txt**
  - Explicitly allow GPTBot, ChatGPT-User, CCBot, PerplexityBot, Google-Extended, anthropic-ai, ClaudeBot, cohere-ai

- [x] **12. Enhance WebSite JSON-LD for Google site name**
  - Added `alternateName: ['Duane Syndrome', 'DS Portal']` and trailing slash on url

- [x] **13. Add visible publication dates to medical pages**
  - Blog post Article JSON-LD: added `dateModified` + `publisher` object
  - Types, Treatments, FAQ pages: added visible "Last medically reviewed: January 2024"

- [x] **14. Improve snippet configuration**
  - Root layout: `max-snippet: -1`, `max-image-preview: large`, `max-video-preview: -1`
  - Footer: added `data-nosnippet` to prevent boilerplate in search snippets

- [x] **15. Review FAQ/content structure for AI citations**
  - FAQ page already has excellent question-based headings, 100-150 word answers, FAQPage schema
  - About page has specific facts/numbers that AI systems can extract and cite
  - No additional changes needed

## Priority 2: Content metadata (defer until after restructure)

- [ ] **16. Add page-level metadata to all 24 static pages**
  - homepage, about, about/types, about/treatments, about/faq
  - research, specialists, community, community/submit-post
  - tools, gaze-simulator, screening, one-pager, explain-templates, emergency-card, exercise-tracker
  - life-hacks, legal, submit, subscribe, contact
  - newsletter-admin, blog-admin
