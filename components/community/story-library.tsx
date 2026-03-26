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

interface BlogLibraryProps {
  blogPosts: BlogPost[];
}

const FONT_KEY = 'duane-story-font-size';

export function StoryLibrary({ blogPosts }: BlogLibraryProps) {
  const [fontSize, setFontSize] = useState(1); // 0=small, 1=normal, 2=large

  useEffect(() => {
    const saved = localStorage.getItem(FONT_KEY);
    if (saved) setFontSize(Number(saved));
  }, []);

  function changeFontSize(size: number) {
    setFontSize(size);
    localStorage.setItem(FONT_KEY, String(size));
  }

  const textClass = ['text-sm', 'text-base', 'text-lg'][fontSize];

  return (
    <section id="stories">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">Blog</h2>
          <p className="mt-1 text-warm-500">Posts and insights from the community.</p>
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
        {blogPosts.map((post) => (
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
        ))}
      </div>

      <div className="mt-6 flex justify-center">
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
