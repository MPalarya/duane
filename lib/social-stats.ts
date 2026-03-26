/**
 * Fetches follower counts from Instagram and TikTok.
 * - Instagram: uses the i.instagram.com web profile API (returns JSON)
 * - TikTok: parses "followerCount" from the page HTML
 * Cached for 24 hours. Returns null gracefully on failure.
 */

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

/** Extract username from an Instagram profile URL. */
function extractInstagramUsername(url: string): string | null {
  const match = url.match(/instagram\.com\/([A-Za-z0-9_.]+)/);
  return match?.[1] ?? null;
}

async function fetchInstagramFollowers(profileUrl: string): Promise<string | null> {
  const username = extractInstagramUsername(profileUrl);
  if (!username) return null;

  const apiUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Instagram 275.0.0.27.98',
      'X-IG-App-ID': '936619743392459',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      Referer: 'https://www.instagram.com/',
    },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const count = data?.data?.user?.edge_followed_by?.count;
  return typeof count === 'number' ? formatCount(count) : null;
}

async function fetchTikTokFollowers(profileUrl: string): Promise<string | null> {
  const res = await fetch(profileUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html',
    },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return null;
  const html = await res.text();

  const match = html.match(/"followerCount"\s*:\s*(\d+)/);
  if (match) return formatCount(parseInt(match[1]));

  // Fallback: display text
  const display = html.match(/([\d.]+[KMB]?)\s*Followers/i);
  if (display) return display[1];

  return null;
}

async function fetchYouTubeSubscribers(channelUrl: string): Promise<string | null> {
  const res = await fetch(channelUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return null;
  const html = await res.text();

  // YouTube embeds subscriber count in JSON-LD or page metadata
  // Pattern: "subscriberCountText":"1.23M subscribers"
  const match = html.match(/"subscriberCountText"\s*:\s*"([\d.]+[KMB]?\s*subscribers?)"/i);
  if (match) return match[1].replace(/\s*subscribers?/i, '').trim();

  // Fallback: og:description often contains "X subscribers"
  const ogMatch = html.match(/([\d.]+[KMB]?)\s+subscribers/i);
  if (ogMatch) return ogMatch[1];

  return null;
}

export async function fetchFollowerCount(profileUrl: string): Promise<string | null> {
  try {
    if (profileUrl.includes('instagram.com')) {
      return await fetchInstagramFollowers(profileUrl);
    }
    if (profileUrl.includes('tiktok.com')) {
      return await fetchTikTokFollowers(profileUrl);
    }
    if (profileUrl.includes('youtube.com') || profileUrl.includes('youtu.be')) {
      return await fetchYouTubeSubscribers(profileUrl);
    }
    return null;
  } catch {
    return null;
  }
}
