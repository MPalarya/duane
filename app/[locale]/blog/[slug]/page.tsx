import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { safeFetch } from '@/lib/sanity/client';
import { blogPostBySlugQuery } from '@/lib/sanity/queries';
import { PortableTextContent } from '@/components/content/portable-text';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/lib/i18n/navigation';
import type { Metadata } from 'next';

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  body: Parameters<typeof PortableTextContent>[0]['value'];
  excerpt?: string;
  publishedAt?: string;
  readingTime?: number;
  tags?: string[];
  author?: { name: string; bio?: string };
  seoTitle?: string;
  seoDescription?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const post = await safeFetch<BlogPost>(blogPostBySlugQuery, { slug, locale });
  if (!post) return {};

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await safeFetch<BlogPost>(blogPostBySlugQuery, { slug, locale });

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-primary-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">{post.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-warm-500">
          {post.author?.name && (
            <span className="font-medium text-warm-700">{post.author.name}</span>
          )}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
          {post.readingTime && <span>{post.readingTime} min read</span>}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="primary">{tag}</Badge>
            ))}
          </div>
        )}
      </header>

      {/* Article Body */}
      <div className="prose-custom">
        {post.body && <PortableTextContent value={post.body} />}
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            author: post.author
              ? { '@type': 'Person', name: post.author.name }
              : undefined,
          }),
        }}
      />
    </article>
  );
}
