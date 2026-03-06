import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/config';

const baseUrl = 'https://duane-syndrome.com';

const staticPages = [
  '',
  '/about',
  '/about/types',
  '/about/treatments',
  '/about/faq',
  '/community/blog',
  '/research',
  '/specialists',
  '/tools/gaze-simulator',
  '/tools/screening',
  '/tools/one-pager',
  '/tools/explain-templates',
  '/tools/emergency-card',
  '/tools/exercise-tracker',
  '/community',
  '/community/mentors',
  '/community/stories',
  '/community/spotlight',
  '/life-hacks',
  '/legal',
  '/submit',
  '/subscribe',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    const alternates: Record<string, string> = {};
    for (const locale of locales) {
      alternates[locale] = `${baseUrl}/${locale}${page}`;
    }

    entries.push({
      url: `${baseUrl}/en${page}`,
      lastModified: new Date(),
      alternates: {
        languages: alternates,
      },
    });
  }

  return entries;
}
