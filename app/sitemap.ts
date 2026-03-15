import type { MetadataRoute } from 'next';
import { safeFetch } from '@/lib/sanity/client';
import { db, isDbConfigured } from '@/lib/db/client';
import { specialists } from '@/lib/db/schema';
import { groq } from 'next-sanity';

const baseUrl = 'https://duane-syndrome.com';

const staticPages = [
  '',
  '/about',
  '/about/types',
  '/about/treatments',
  '/about/faq',
  '/about/mission',
  '/research',
  '/specialists',
  '/tools',
  '/tools/gaze-simulator',
  '/tools/screening',
  '/tools/one-pager',
  '/tools/explain-templates',
  '/tools/emergency-card',
  '/tools/exercise-tracker',
  '/community',
  '/life-hacks',
  '/legal',
  '/submit',
  '/subscribe',
  '/privacy',
  '/terms',
  '/contact',
];

const blogSlugsQuery = groq`
  *[_type == "blogPost" && locale == "en"] | order(publishedAt desc) {
    "slug": slug.current,
    publishedAt
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'weekly' : 'monthly',
    priority: page === '' ? 1.0 : page.startsWith('/about') ? 0.8 : 0.6,
  }));

  // Dynamic blog posts from Sanity
  const blogPosts = await safeFetch<{ slug: string; publishedAt?: string }[]>(blogSlugsQuery);
  const blogEntries: MetadataRoute.Sitemap = (blogPosts ?? []).map((post) => ({
    url: `${baseUrl}/community/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Dynamic specialist pages from database
  let specialistEntries: MetadataRoute.Sitemap = [];
  if (isDbConfigured) {
    try {
      const allSpecialists = await db
        .select({ id: specialists.id })
        .from(specialists);
      specialistEntries = allSpecialists.map((s) => ({
        url: `${baseUrl}/specialists/${s.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch {
      // DB unavailable — skip specialist entries
    }
  }

  return [...staticEntries, ...blogEntries, ...specialistEntries];
}
