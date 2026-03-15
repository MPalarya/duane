# Skill: SEO Guidelines for Duane Syndrome Portal

## When to use
When creating new pages, adding content, modifying routes, building components, or making any change that affects what users or search engines see. Apply these rules proactively — do not wait to be asked.

## Context: YMYL Medical Website
This is a **Your Money or Your Life (YMYL)** health/medical website. Google applies heightened E-E-A-T scrutiny (Experience, Expertise, Authoritativeness, Trustworthiness). Every guideline below reflects that higher standard.

---

## 1. Page-Level Metadata (REQUIRED for every page)

Every `page.tsx` MUST export metadata or `generateMetadata()`.

### Static pages
```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title Here',              // unique, <60 chars, primary keyword near start
  description: 'One or two sentences.',   // unique, <155 chars, includes call-to-action
};
```

### Dynamic pages (DB/CMS content)
```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchData(slug);
  if (!data) return {};

  return {
    title: data.title,
    description: data.description,
    openGraph: { title: data.title, description: data.description },
  };
}
```

### Rules
- Title: unique per page, 50–60 characters, front-load the primary keyword
- Description: unique per page, 120–155 characters, summarize value + include CTA
- Never duplicate titles/descriptions across pages
- The root layout template (`%s | Duane Syndrome - Global Information & Community Portal`) appends automatically — page titles should NOT repeat the site name

---

## 2. Structured Data (JSON-LD)

Add JSON-LD `<script>` tags in page components. Use `@graph` for multiple schemas on one page.

### Required schemas by page type

| Page type | Schema(s) |
|-----------|-----------|
| Homepage | `Organization`, `WebSite` (already in root layout) |
| Medical info pages | `MedicalCondition` or `MedicalWebPage` |
| FAQ pages | `FAQPage` with `Question`/`Answer` |
| Blog posts | `Article` with `author`, `datePublished`, `dateModified` |
| Specialist profiles | `Physician` with `PostalAddress` |
| Research papers | `ScholarlyArticle` |
| Tool pages | `SoftwareApplication` or `WebApplication` |

### Template
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: excerpt,
      datePublished: publishedAt,
      dateModified: updatedAt,
      author: { '@type': 'Person', name: authorName },
      publisher: {
        '@type': 'Organization',
        name: 'Duane Syndrome Portal',
        url: 'https://duane-syndrome.com',
      },
    }),
  }}
/>
```

### Rules
- Always include `@context` and `@type`
- Use ISO 8601 dates
- Include `dateModified` when content has been updated
- For medical content, add `medicalAudience` and `lastReviewed` when applicable
- Validate with Google Rich Results Test before deploying

---

## 3. Heading Hierarchy

- Exactly ONE `<h1>` per page — the page's main topic
- `<h2>` for major sections, `<h3>` for subsections
- Never skip levels (h1 → h3 without h2)
- Headings must be descriptive (not "Section 1") and include relevant keywords naturally
- Do not use headings for visual styling — use CSS classes instead

---

## 4. Links and Navigation

### Internal links
- Always use `next/link` (`<Link>`) for internal navigation — never raw `<a>` tags
- Use descriptive anchor text: "Learn about Duane Syndrome types" not "click here"
- Link related content to each other (blog posts → specialist pages → tools)
- Ensure every page is reachable within 3 clicks from the homepage
- Google discovers pages by following links — orphan pages (no inbound links) may never be indexed even if in the sitemap

### External links
- Add `rel="noopener noreferrer"` and `target="_blank"` for external links
- Add `rel="nofollow"` for user-generated content links (comments, submissions)
- Add `rel="sponsored"` for paid/affiliate links, `rel="ugc"` for user-generated content
- Link to authoritative medical sources (PubMed, WHO, medical journals) to strengthen E-E-A-T

### Crawlable link format
- Links must be `<a href="...">` — Google cannot follow links rendered only via JavaScript `onclick` handlers or `window.location`
- Fragment-only links (`#section`) are not followed as separate URLs by crawlers

---

## 5. Images

- Always use `next/image` (`<Image>`) — never raw `<img>` except for SVG icons/logos
- Every image MUST have a descriptive `alt` attribute (not empty, not just filename)
- For CMS images: require alt text in Sanity schema; fallback to image caption, never empty string
- Set `priority` on above-the-fold hero/LCP images
- Use `width` and `height` to prevent CLS (layout shift)
- Use WebP/AVIF formats (Next.js handles this automatically)

---

## 6. URL Structure

- Use lowercase, hyphenated slugs: `/about/types` not `/about/Types`
- Keep URLs short and descriptive: `/specialists/dr-smith` not `/specialists/abc123`
- Use directory structure for topical grouping: `/about/types`, `/about/treatments`
- Never change URLs without setting up 301 redirects in `next.config.ts`
- Dynamic routes should use human-readable slugs when possible
- Avoid URL parameters for content variation — use path segments instead (`/blog/topic` not `/blog?topic=x`)
- Do not expose session IDs, tracking params, or internal IDs in crawlable URLs

---

## 7. Canonical URLs and Duplicate Content

- `metadataBase` in root layout (`https://duane-syndrome.com`) makes Next.js auto-generate canonical tags for all pages
- Dynamic pages with query parameters (e.g., `/research?paper=123&level=adult`) must NOT create separate indexable URLs — the canonical should point to the base path (`/research`)
- If the same content is accessible at multiple URLs (with/without trailing slash, www vs non-www), ensure they all resolve to one canonical
- For paginated content: each page gets its own canonical (page 2's canonical is page 2, not page 1)
- Never set a canonical URL that returns a 4xx or 5xx — Google will ignore it

---

## 8. Sitemap and Crawlability

The sitemap (`app/sitemap.ts`) is async and includes static + dynamic routes.

### When adding new pages
- Static pages: add the path to the `staticPages` array in `app/sitemap.ts`
- Dynamic pages (new content types from DB/CMS): add a fetch block to generate URLs dynamically (see existing blog/specialist pattern)

### Rules
- Never include noindex pages, admin pages, or API routes in the sitemap
- Include `lastModified` with actual dates when available (not just `new Date()`)
- Include `changeFrequency` and `priority` hints
- After major content changes, request re-crawl via Google Search Console

---

## 9. Robots, Indexing, and AI Crawler Access

- `app/robots.ts` controls crawler access
- `/api/` and `/admin/` are blocked (correct)
- AI crawlers are explicitly allowed: GPTBot, ChatGPT-User, CCBot, PerplexityBot, Google-Extended, anthropic-ai, ClaudeBot, cohere-ai
- Use `robots: { index: false }` in metadata for pages that should not be indexed (admin, auth, thank-you pages)
- Never block CSS/JS resources that are needed to render page content
- Never block AI crawlers — they drive citations in Perplexity, Gemini AI Overviews, ChatGPT search

---

## 10. Performance (Core Web Vitals)

Google ranking signals — thresholds to meet:
- **LCP** (Largest Contentful Paint): < 2.5 seconds
- **INP** (Interaction to Next Paint): < 200 milliseconds
- **CLS** (Cumulative Layout Shift): < 0.1

### How to maintain them
- Use `next/image` with explicit dimensions (prevents CLS)
- Use `next/font` with `display: 'swap'` (already configured)
- Set `priority` on LCP images (hero images, above-the-fold content)
- Lazy-load below-the-fold content
- Minimize client-side JavaScript — prefer Server Components
- Avoid `use client` unless the component genuinely needs interactivity
- Use `loading.tsx` for route-level loading states (prevents layout shift)
- Do not block rendering with third-party scripts — load them with `next/script` strategy `afterInteractive` or `lazyOnload`

---

## 11. Content Quality (E-E-A-T for Medical/YMYL)

This website is about a medical condition. Content must demonstrate:

### Experience
- Include real patient/parent perspectives where appropriate
- Attribute personal stories clearly

### Expertise
- Cite medical sources (PubMed IDs, DOIs, journal names)
- Include "Last reviewed" dates on medical pages
- Link to original research papers

### Authoritativeness
- Display author bylines with credentials on medical content
- Use the Organization JSON-LD (already in root layout)
- Link to/from other authoritative medical resources

### Trustworthiness
- Include medical disclaimers on health content
- Display clear contact information
- Maintain privacy policy and terms of use (already exist)
- Keep content factually accurate and up-to-date
- Never make unsubstantiated medical claims

---

## 12. Social Sharing (Open Graph + Twitter Cards)

- Root layout has Twitter card metadata + auto-generated OG image (`app/opengraph-image.tsx`)
- For new page types with unique visual identity, create a route-level `opengraph-image.tsx`
- Dynamic content (blog posts) should include `openGraph` in their `generateMetadata()` return
- Always include `og:title`, `og:description`, `og:image` for shareable pages

---

## 13. Publication Dates (Visible + Structured)

Google uses BOTH visible dates and structured data dates. They must match.

- Medical pages: display "Last medically reviewed: [Month Year]" visibly near the disclaimer
- Blog posts: display the publication date visibly (already done) AND include `datePublished` + `dateModified` in Article JSON-LD
- Use ISO 8601 format in structured data: `"2024-01-15T00:00:00+00:00"`
- Never fake or artificially update dates — Google penalizes this

---

## 14. Snippet Control

Root layout sets `max-snippet: -1`, `max-image-preview: large`, `max-video-preview: -1` to allow Google maximum flexibility in showing rich snippets.

- Add `data-nosnippet` attribute to boilerplate elements (footer already has it) that should not appear in search snippets
- Write meta descriptions as self-contained summaries — they may appear as the snippet
- For pages with key facts, structure them as scannable lists — Google extracts these for featured snippets

---

## 15. AI Search Visibility (Perplexity, Gemini, ChatGPT)

AI search systems cite content differently than traditional Google. Key factors:

### What drives AI citations
- **Domain authority + traffic** (strongest signal — SHAP 0.63)
- **Content freshness** — pages updated within 60 days get 1.9x more AI citations
- **FAQ sections** — pages with FAQ blocks get 44% more AI citations
- **Readability** — Grade 6-8 reading level gets more citations than Grade 11+
- **Structured data** — 3x more likely to appear in AI answers with author schema
- **Specific facts/numbers** — AI systems extract and cite claim-level statements

### Content formatting for AI extraction
- Use question-based `<h2>` headings (e.g., "What causes Duane Syndrome?")
- Keep answer paragraphs to 100-150 words — the extraction sweet spot
- Include specific numbers, statistics, and citations to medical sources
- Write clear, factual "claim sentences" that AI can attribute (e.g., "Duane Syndrome affects approximately 1 in 1,000 people")
- Include both simple and technical explanations (different AI systems serve different audiences)

### Platform-specific notes
- **Gemini**: favors brand-owned websites with schema markup (52% of citations from owned domains)
- **Perplexity**: favors niche directories and specialized content; for healthcare, Zocdoc presence helps
- **ChatGPT**: favors content that is consistent across multiple sources; directory listings help

### Technical requirements
- Keep AI crawlers unblocked in robots.txt (already configured)
- Ensure server-side rendering for key content (avoid hiding text behind JavaScript-only rendering)
- Maintain `<details>` content visible in HTML source (Google and AI crawlers can read it)

---

## 16. Redirects

When removing or renaming pages:
1. Add a permanent redirect in `next.config.ts` `redirects()` array
2. Remove the old URL from `sitemap.ts` static pages list
3. Update any internal `<Link>` hrefs pointing to the old URL

Never leave dead URLs — they waste crawl budget and hurt user experience.

---

## 17. Checklist for New Pages

Before merging any new page:

- [ ] Has unique `title` (50-60 chars) and `description` (120-155 chars)
- [ ] Has exactly one `<h1>` with proper heading hierarchy
- [ ] All images use `next/image` with descriptive `alt` text
- [ ] Internal links use `next/link` with descriptive anchor text
- [ ] JSON-LD structured data matches the page type (see table above)
- [ ] Page is added to `app/sitemap.ts` (static array or dynamic fetch)
- [ ] Dynamic pages have `generateMetadata()`
- [ ] No `use client` unless genuinely needed for interactivity
- [ ] Medical content cites sources and includes review dates
- [ ] Page is reachable from navigation or parent pages
