import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const isSanityConfigured = Boolean(projectId);

export const sanityClient = createClient({
  projectId: projectId || 'not-configured',
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
});

// Safe fetch that returns null when Sanity is not configured
export async function safeFetch<T>(
  query: string,
  params?: Record<string, string>
): Promise<T | null> {
  if (!isSanityConfigured) return null;
  try {
    if (params) {
      return await sanityClient.fetch<T>(query, params);
    }
    return await sanityClient.fetch<T>(query);
  } catch {
    return null;
  }
}
