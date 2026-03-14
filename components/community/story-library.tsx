'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

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

interface StoryLibraryProps {
  blogPosts: BlogPost[];
  stories: Story[];
}

const FONT_KEY = 'duane-story-font-size';

export function StoryLibrary({ blogPosts, stories }: StoryLibraryProps) {
  const [fontSize, setFontSize] = useState(1); // 0=small, 1=normal, 2=large
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(FONT_KEY);
    if (saved) setFontSize(Number(saved));
  }, []);

  function changeFontSize(size: number) {
    setFontSize(size);
    localStorage.setItem(FONT_KEY, String(size));
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const textClass = ['text-sm', 'text-base', 'text-lg'][fontSize];

  // Interleave blog posts and stories for a mixed feed
  const items: ({ type: 'blog'; data: BlogPost } | { type: 'story'; data: Story })[] = [];
  const maxLen = Math.max(blogPosts.length, stories.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < blogPosts.length) items.push({ type: 'blog', data: blogPosts[i] });
    if (i < stories.length) items.push({ type: 'story', data: stories[i] });
  }

  return (
    <section id="stories">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">Story Library</h2>
          <p className="mt-1 text-warm-500">Blog posts and success stories from the community.</p>
        </div>

        {/* Font size toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-warm-200 bg-warm-50 p-1">
          {(['A-', 'A', 'A+'] as const).map((label, i) => (
            <button
              key={label}
              onClick={() => changeFontSize(i)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                fontSize === i
                  ? 'bg-white text-warm-900 shadow-sm'
                  : 'text-warm-400 hover:text-warm-600'
              }`}
              aria-label={`Font size ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry layout */}
      <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item) => {
          if (item.type === 'blog') {
            const post = item.data;
            return (
              <Link
                key={post._id}
                href={`/community/blog/${post.slug.current}`}
                className="group mb-4 block break-inside-avoid rounded-xl border border-warm-200 bg-card p-5 transition-all hover:border-primary-300 hover:shadow-md"
              >
                <h3 className={`font-semibold text-warm-900 group-hover:text-primary-700 ${textClass}`}>
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className={`mt-2 text-warm-500 line-clamp-3 ${textClass}`}>{post.excerpt}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-warm-400">
                  {post.author?.name && <span>{post.author.name}</span>}
                  {post.publishedAt && (
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  )}
                  {post.readingTime && <span>{post.readingTime} min read</span>}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="primary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </Link>
            );
          }

          // Story card (inline display)
          const story = item.data;
          const isExpanded = expanded.has(story.id);
          return (
            <article
              key={story.id}
              className="mb-4 break-inside-avoid rounded-xl border border-warm-200 bg-card p-5"
            >
              <h3 className={`font-semibold text-warm-900 ${textClass}`}>{story.title}</h3>
              {story.profession && (
                <p className="mt-1 text-sm font-medium text-primary-600">{story.profession}</p>
              )}
              <p className={`mt-2 whitespace-pre-line text-warm-600 leading-relaxed ${textClass} ${
                isExpanded ? '' : 'line-clamp-4'
              }`}>
                {story.content}
              </p>
              {story.content.length > 200 && (
                <button
                  onClick={() => toggleExpand(story.id)}
                  className="mt-1 text-sm font-medium text-primary-600 hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
              {story.createdAt && (
                <p className="mt-2 text-xs text-warm-400">
                  {new Date(story.createdAt).toLocaleDateString()}
                </p>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary-300 bg-primary-50 px-5 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
        >
          + Share Your Story
        </Link>
        <Link
          href="/community/submit-post"
          className="inline-flex items-center gap-1.5 rounded-full border border-accent-300 bg-accent-50 px-5 py-2 text-sm font-medium text-accent-700 transition-colors hover:bg-accent-100"
        >
          + Write a Blog Post
        </Link>
      </div>
    </section>
  );
}
