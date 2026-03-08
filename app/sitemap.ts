import type { MetadataRoute } from 'next';

const baseUrl = 'https://duane-syndrome.com';

const staticPages = [
  '',
  '/about',
  '/about/types',
  '/about/treatments',
  '/about/faq',
  '/about/mission',
  '/community/blog',
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
  '/community/mentors',
  '/community/stories',
  '/community/spotlight',
  '/life-hacks',
  '/legal',
  '/submit',
  '/subscribe',
  '/privacy',
  '/terms',
  '/contact',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
  }));
}
