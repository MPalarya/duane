import { safeFetch } from '@/lib/sanity/client';
import {
  featuredAdvocatesQuery,
  allBlogPostsQuery,
  communityLinksQuery,
} from '@/lib/sanity/queries';
import { db, isDbConfigured } from '@/lib/db/client';
import { stories, mentorPosts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fetchFollowerCount } from '@/lib/social-stats';
import { fetchVideoThumbnail } from '@/lib/video-extract';
import {
  seedFeaturedAdvocates,
  seedBlogPosts,
  seedStories,
  seedMentorPosts,
  seedCommunityLinks,
  seedPodcasts,
} from '@/lib/seed-data';
import { StickyNav } from '@/components/community/sticky-nav';
import { VisionariesSection } from '@/components/community/visionaries-section';
import type { FeaturedAdvocate } from '@/components/community/visionaries-section';
import { StoryLibrary } from '@/components/community/story-library';
import { NoteBoard } from '@/components/community/note-board';
import { PodcastsSection } from '@/components/community/podcasts-section';
import { SatelliteHub } from '@/components/community/satellite-hub';

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  readingTime?: number;
  tags?: string[];
  author?: { name: string };
}

interface Story {
  id: string;
  title: string;
  profession: string | null;
  content: string;
  createdAt: string | null;
}

interface MentorPost {
  id: string;
  role: string;
  bio: string;
  contactMethod: string | null;
  anonymous: boolean | null;
  locale: string | null;
  active: boolean | null;
  createdAt: string | null;
}

interface CommunityLink {
  _id: string;
  name: string;
  url: string;
  platform?: string;
  description?: string;
  memberCount?: number;
}

async function enrichWithFollowerCounts(
  advocates: FeaturedAdvocate[],
): Promise<FeaturedAdvocate[]> {
  return Promise.all(
    advocates.map(async (advocate) => {
      if (!advocate.socialLinks?.length) return advocate;
      const enrichedLinks = await Promise.all(
        advocate.socialLinks.map(async (link) => {
          if (link.followers) return link;
          const count = await fetchFollowerCount(link.url);
          return count ? { ...link, followers: count } : link;
        }),
      );
      return { ...advocate, socialLinks: enrichedLinks };
    }),
  );
}

async function fetchStoriesFromDb(): Promise<Story[]> {
  if (!isDbConfigured) return [];
  try {
    return await db
      .select()
      .from(stories)
      .where(eq(stories.approved, true))
      .orderBy(desc(stories.createdAt));
  } catch {
    return [];
  }
}

async function fetchMentorPostsFromDb(): Promise<MentorPost[]> {
  if (!isDbConfigured) return [];
  try {
    return await db
      .select()
      .from(mentorPosts)
      .where(eq(mentorPosts.active, true))
      .orderBy(desc(mentorPosts.createdAt));
  } catch {
    return [];
  }
}

export default async function CommunityPage() {
  const [
    advocates,
    blogPosts,
    dbStories,
    dbMentorPosts,
    communityLinks,
  ] = await Promise.all([
    safeFetch<FeaturedAdvocate[]>(featuredAdvocatesQuery, { locale: 'en' }),
    safeFetch<BlogPost[]>(allBlogPostsQuery, { locale: 'en' }),
    fetchStoriesFromDb(),
    fetchMentorPostsFromDb(),
    safeFetch<CommunityLink[]>(communityLinksQuery, { locale: 'en' }),
  ]);

  // Seed data fallbacks
  let enrichedAdvocates = advocates?.length ? advocates : seedFeaturedAdvocates;
  enrichedAdvocates = await enrichWithFollowerCounts(enrichedAdvocates);

  // Fetch video thumbnails for click-to-load previews (skip if already set in seed/Sanity data)
  enrichedAdvocates = await Promise.all(
    enrichedAdvocates.map(async (a) => {
      // Main video thumbnail
      const mainThumb = a.thumbnailUrl || (await fetchVideoThumbnail(a.videoUrl, a.socialLinks));
      // Additional video thumbnails
      const additionalVideos = a.additionalVideos?.length
        ? await Promise.all(
            a.additionalVideos.map(async (v) => {
              if (v.thumbnailUrl) return v;
              const thumb = await fetchVideoThumbnail(v.videoUrl, a.socialLinks);
              return thumb ? { ...v, thumbnailUrl: thumb } : v;
            }),
          )
        : a.additionalVideos;
      return {
        ...a,
        ...(mainThumb ? { thumbnailUrl: mainThumb } : {}),
        ...(additionalVideos ? { additionalVideos } : {}),
      };
    }),
  );
  const posts = blogPosts?.length ? blogPosts : seedBlogPosts;
  const allStories = dbStories.length > 0 ? dbStories : seedStories;
  const allMentorPosts = dbMentorPosts.length > 0 ? dbMentorPosts : seedMentorPosts;
  const links = communityLinks?.length ? communityLinks : seedCommunityLinks;
  const podcasts = seedPodcasts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Community</h1>
      <p className="mt-4 text-warm-600">
        Your hub for everything Duane Syndrome — stories, mentors, podcasts, and connections.
      </p>

      <StickyNav />

      <div className="mt-8 space-y-16">
        <VisionariesSection advocates={enrichedAdvocates} />
        <StoryLibrary blogPosts={posts} stories={allStories} />
        <NoteBoard posts={allMentorPosts} />
        {/* Podcasts + Groups side by side on desktop */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
          <PodcastsSection podcasts={podcasts} />
          <SatelliteHub links={links} />
        </div>
      </div>
    </div>
  );
}
