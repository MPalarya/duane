/**
 * Server-side extraction of direct video URLs from TikTok and Instagram.
 * Used to render a clean native <video> player without platform chrome.
 * Falls back gracefully — returns null on any failure.
 *
 * Video URLs are CDN-served and typically expire after several hours.
 * Use with Next.js revalidate to refresh periodically.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * Attempt to extract a direct .mp4 video URL from an embed URL.
 * Returns null if extraction fails for any reason.
 */
export async function extractDirectVideoUrl(
  embedUrl: string,
  socialLinks?: { platform: string; url: string }[],
): Promise<string | null> {
  try {
    if (embedUrl.includes('tiktok.com/embed')) {
      return await extractTikTokVideo(embedUrl, socialLinks);
    }
    if (embedUrl.includes('instagram.com') && embedUrl.includes('/embed')) {
      return await extractInstagramVideo(embedUrl);
    }
    return null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  TikTok                                                            */
/* ------------------------------------------------------------------ */

async function extractTikTokVideo(
  embedUrl: string,
  socialLinks?: { platform: string; url: string }[],
): Promise<string | null> {
  // Extract video ID from embed URL
  const videoIdMatch = embedUrl.match(/embed\/v2\/(\d+)/);
  if (!videoIdMatch) return null;
  const videoId = videoIdMatch[1];

  // Get TikTok username from social links to construct full page URL
  const tiktokLink = socialLinks?.find((l) => l.platform === 'tiktok');
  const usernameMatch = tiktokLink?.url.match(/tiktok\.com\/@([^/?]+)/);
  if (!usernameMatch) return null;
  const username = usernameMatch[1];

  const pageUrl = `https://www.tiktok.com/@${username}/video/${videoId}`;

  const res = await fetch(pageUrl, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return null;
  const html = await res.text();

  // TikTok SSR pages include video data in __UNIVERSAL_DATA_FOR_REHYDRATION__
  const scriptMatch = html.match(
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!scriptMatch) return null;

  try {
    const data = JSON.parse(scriptMatch[1]);
    const detail = data?.__DEFAULT_SCOPE__?.['webapp.video-detail'];
    const video = detail?.itemInfo?.itemStruct?.video;

    // Try playAddr first (direct playback URL)
    if (video?.playAddr) return video.playAddr;

    // Fallback: first bitrate variant
    const bitrateUrl = video?.bitrateInfo?.[0]?.PlayAddr?.UrlList?.[0];
    if (bitrateUrl) return bitrateUrl;

    // Fallback: downloadAddr
    if (video?.downloadAddr) return video.downloadAddr;
  } catch {
    // JSON parse failed
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Instagram                                                         */
/* ------------------------------------------------------------------ */

async function extractInstagramVideo(embedUrl: string): Promise<string | null> {
  // Extract reel ID: /reel/CODE/embed/ → CODE
  const reelMatch = embedUrl.match(/instagram\.com\/reel\/([^/]+)/);
  if (!reelMatch) return null;
  const reelId = reelMatch[1];

  const pageUrl = `https://www.instagram.com/reel/${reelId}/`;

  const res = await fetch(pageUrl, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return null;
  const html = await res.text();

  // Try og:video meta tag
  const ogVideo = html.match(/<meta property="og:video"\s+content="([^"]+)"/);
  if (ogVideo) return decodeEntities(ogVideo[1]);

  // Try og:video:secure_url
  const ogSecure = html.match(/<meta property="og:video:secure_url"\s+content="([^"]+)"/);
  if (ogSecure) return decodeEntities(ogSecure[1]);

  // Try video_url in JSON-LD or embedded script data
  const videoUrl = html.match(/"video_url"\s*:\s*"([^"]+)"/);
  if (videoUrl) return videoUrl[1].replace(/\\u0026/g, '&');

  return null;
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&');
}

/* ------------------------------------------------------------------ */
/*  Thumbnail extraction via oembed APIs                              */
/* ------------------------------------------------------------------ */

/**
 * Fetch a thumbnail URL for a TikTok or Instagram embed.
 * Uses platform oembed APIs. Cached for 24 hours.
 */
export async function fetchVideoThumbnail(
  embedUrl: string,
  socialLinks?: { platform: string; url: string }[],
): Promise<string | null> {
  try {
    if (embedUrl.includes('tiktok.com/embed')) {
      return await fetchTikTokThumbnail(embedUrl, socialLinks);
    }
    if (embedUrl.includes('instagram.com') && embedUrl.includes('/embed')) {
      return await fetchInstagramThumbnail(embedUrl);
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchTikTokThumbnail(
  embedUrl: string,
  socialLinks?: { platform: string; url: string }[],
): Promise<string | null> {
  const videoIdMatch = embedUrl.match(/embed(?:\/v2)?\/(\d+)/);
  if (!videoIdMatch) return null;
  const videoId = videoIdMatch[1];

  const tiktokLink = socialLinks?.find((l) => l.platform === 'tiktok');
  const usernameMatch = tiktokLink?.url.match(/tiktok\.com\/@([^/?]+)/);
  if (!usernameMatch) return null;

  const oembedUrl = `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${usernameMatch[1]}/video/${videoId}`;
  const res = await fetch(oembedUrl, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.thumbnail_url || null;
}

async function fetchInstagramThumbnail(embedUrl: string): Promise<string | null> {
  const reelMatch = embedUrl.match(/reel\/([^/]+)/);
  if (!reelMatch) return null;

  // Instagram's oembed API requires auth now — fetch the reel page
  // and extract the og:image meta tag instead
  const pageUrl = `https://www.instagram.com/reel/${reelMatch[1]}/`;
  const res = await fetch(pageUrl, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return null;
  const html = await res.text();

  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (ogImage) return decodeEntities(ogImage[1]);

  return null;
}
