/**
 * Sanity write client for creating documents via the Mutations API.
 * Uses the project token (not the CDN read client).
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

export const isSanityWriteConfigured = Boolean(projectId && token);

interface SanityMutation {
  create?: Record<string, unknown>;
  createOrReplace?: Record<string, unknown>;
  patch?: { id: string; set?: Record<string, unknown> };
}

export async function sanityMutate(mutations: SanityMutation[]) {
  if (!isSanityWriteConfigured) {
    console.log('[Sanity Write] Not configured. Would mutate:', mutations);
    return null;
  }

  const res = await fetch(
    `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sanity mutation failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Upload an image to Sanity from a URL and return the asset reference.
 */
export async function sanityUploadImageFromUrl(
  imageUrl: string
): Promise<string | null> {
  if (!isSanityWriteConfigured) return null;

  // Fetch the image
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) return null;

  const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
  const buffer = await imgRes.arrayBuffer();

  // Upload to Sanity
  const uploadRes = await fetch(
    `https://${projectId}.api.sanity.io/v2024-01-01/assets/images/${dataset}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${token}`,
      },
      body: buffer,
    }
  );

  if (!uploadRes.ok) return null;

  const data = await uploadRes.json();
  return data.document?._id || null;
}
