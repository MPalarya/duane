'use client';

import { useState, useRef } from 'react';
import type { Value } from 'platejs';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichEditor, plateValueToHtml } from '@/components/blog-editor/rich-editor';
import Link from 'next/link';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const EMPTY_VALUE: Value = [{ type: 'p', children: [{ text: '' }] }];

function isEditorEmpty(value: Value): boolean {
  if (!value || value.length === 0) return true;
  if (value.length === 1) {
    const node = value[0] as Record<string, unknown>;
    const children = node.children as Array<Record<string, unknown>>;
    if (children?.length === 1 && (children[0].text as string) === '') return true;
  }
  return false;
}

function SubmitPostForm() {
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const editorValueRef = useRef<Value>(EMPTY_VALUE);
  const [hasContent, setHasContent] = useState(false);
  const [tags, setTags] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isLoaded) return <p className="text-warm-500">Loading...</p>;

  if (!user) {
    return (
      <div className="rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-warm-900 mb-2">Sign in to submit a post</h2>
        <p className="text-warm-600 mb-4">
          You need to be signed in to submit a blog post for review.
        </p>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </div>
    );
  }

  function handleEditorChange(value: Value) {
    editorValueRef.current = value;
    setHasContent(!isEditorEmpty(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const editorValue = editorValueRef.current;
    if (isEditorEmpty(editorValue) || !title.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const bodyHtml = plateValueToHtml(editorValue);
      const bodyJson = JSON.stringify(editorValue);

      const res = await fetch('/api/blog-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim(),
          bodyHtml,
          bodyJson,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          featuredImageUrl: featuredImageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Your post has been submitted for review! An admin will review it shortly.');
        setTitle('');
        setExcerpt('');
        setTags('');
        setFeaturedImageUrl('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
        <p className="text-sm text-primary-800">
          Submitting as <strong>{user.fullName || user.emailAddresses?.[0]?.emailAddress}</strong>.
          Your post will be reviewed by an admin before being published.
        </p>
      </div>

      <Input
        id="title"
        label="Post Title"
        placeholder="e.g., My Journey Living with Duane Syndrome"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="excerpt" className="text-sm font-medium text-warm-700">
          Short Summary
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A brief summary of your post (1-2 sentences). This appears in the blog listing."
          rows={2}
          className="rounded-lg border border-warm-300 bg-white px-4 py-2 text-warm-900 placeholder:text-warm-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-warm-700">
          Post Content
        </label>
        <RichEditor onChange={handleEditorChange} />
      </div>

      <Input
        id="tags"
        label="Tags (comma-separated)"
        placeholder="e.g., personal story, sports, tips"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <Input
        id="featuredImage"
        label="Featured Image URL (optional)"
        placeholder="https://example.com/image.jpg"
        value={featuredImageUrl}
        onChange={(e) => setFeaturedImageUrl(e.target.value)}
        type="url"
      />

      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            status === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-coral-50 text-coral-700 border border-coral-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={status === 'loading' || !title.trim() || !hasContent}>
          {status === 'loading' ? 'Submitting...' : 'Submit for Review'}
        </Button>
        <Link href="/community" className="text-sm text-warm-500 hover:text-warm-700">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default function SubmitPostPage() {
  if (!isClerkConfigured) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-warm-900">Submit a Blog Post</h1>
        <p className="mt-4 text-warm-600">
          Authentication is not configured. Set up Clerk to use this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Submit a Blog Post</h1>
      <p className="mt-2 text-warm-600">
        Share your experience, tips, or insights with the Duane Syndrome community.
        Posts are reviewed before publishing.
      </p>
      <div className="mt-8">
        <SubmitPostForm />
      </div>
    </div>
  );
}
