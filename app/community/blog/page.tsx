import Link from 'next/link';
import { safeFetch } from '@/lib/sanity/client';
import { allBlogPostsQuery } from '@/lib/sanity/queries';
import { Badge } from '@/components/ui/badge';
import { seedBlogPosts } from '@/lib/seed-data';

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

export default async function BlogPage() {
  let posts = (await safeFetch<BlogPost[]>(allBlogPostsQuery)) ?? [];
  if (posts.length === 0) {
    posts = seedBlogPosts;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Blog</h1>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
          <p className="text-warm-500">
            No blog posts yet. Check back soon for stories, insights, and updates from the Duane Syndrome community.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/community/blog/${post.slug.current}`}
              className="group block rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-warm-900 group-hover:text-primary-700">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-warm-500 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-warm-400">
                    {post.author?.name && <span>{post.author.name}</span>}
                    {post.publishedAt && (
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                    {post.readingTime && <span>{post.readingTime} min read</span>}
                  </div>
                </div>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="primary">{tag}</Badge>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/submit"
          className="text-primary-600 hover:text-primary-700 hover:underline"
        >
          Contribute &rarr;
        </Link>
      </div>
    </div>
  );
}
