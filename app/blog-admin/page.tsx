'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

interface Submission {
  id: string;
  userId: string;
  authorName: string;
  authorBio: string | null;
  title: string;
  excerpt: string | null;
  bodyMarkdown: string;
  bodyHtml: string;
  tags: string[];
  featuredImageUrl: string | null;
  status: string;
  adminNote: string | null;
  sanityDocId: string | null;
  createdAt: string;
}

type TabFilter = 'pending' | 'approved' | 'rejected' | 'all';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-coral-100 text-coral-700',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-warm-100 text-warm-700'}`}>
      {status}
    </span>
  );
}

function SubmissionCard({
  sub,
  onAction,
}: {
  sub: Submission;
  onAction: (id: string, action: 'approve' | 'reject', note?: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // bodyHtml is the pre-rendered HTML from the Plate editor
  const previewHtml = sub.bodyHtml;

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(true);
    await onAction(sub.id, action, note || undefined);
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-warm-200 bg-white overflow-hidden">
      {/* Header */}
      <div
        className="flex items-start justify-between gap-4 p-5 cursor-pointer hover:bg-warm-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={sub.status} />
            <span className="text-xs text-warm-400">
              {new Date(sub.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-warm-900 truncate">
            {sub.title}
          </h3>
          <p className="text-sm text-warm-500">
            by {sub.authorName}
            {sub.tags?.length > 0 && (
              <span className="ml-2">
                {sub.tags.map((t) => `#${t}`).join(' ')}
              </span>
            )}
          </p>
          {sub.excerpt && (
            <p className="mt-1 text-sm text-warm-600 line-clamp-2">{sub.excerpt}</p>
          )}
        </div>
        <span className="text-warm-400 text-xl shrink-0">
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-warm-100">
          {/* Featured image */}
          {sub.featuredImageUrl && (
            <div className="p-5 pb-0">
              <img
                src={sub.featuredImageUrl}
                alt="Featured"
                className="max-h-64 rounded-lg object-cover"
              />
            </div>
          )}

          {/* Content preview */}
          <div className="p-5">
            <h4 className="text-sm font-medium text-warm-500 mb-3">Content Preview</h4>
            <div
              className="rounded-lg border border-warm-100 bg-warm-50 p-5 max-h-[500px] overflow-auto text-warm-800 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-primary-600 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_hr]:my-6 [&_hr]:border-warm-200 [&_blockquote]:border-l-4 [&_blockquote]:border-primary-300 [&_blockquote]:bg-primary-50 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-warm-600 [&_blockquote]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>

          {/* Admin actions */}
          {sub.status === 'pending' && (
            <div className="border-t border-warm-100 p-5 space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Admin note (optional, e.g., reason for rejection)"
                rows={2}
                className="w-full rounded-lg border border-warm-300 bg-white px-4 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleAction('approve')}
                  disabled={loading}
                  size="md"
                >
                  {loading ? 'Publishing...' : 'Approve & Publish'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleAction('reject')}
                  disabled={loading}
                  size="md"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Show admin note if exists */}
          {sub.adminNote && (
            <div className="border-t border-warm-100 p-5">
              <p className="text-sm text-warm-500">
                <strong>Admin note:</strong> {sub.adminNote}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlogAdminDashboard() {
  const { user, isLoaded } = useUser();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TabFilter>('pending');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/blog-submissions');
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to load');
          return;
        }
        const data = await res.json();
        setSubmissions(data.submissions);
      } catch {
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) load();
  }, [isLoaded, user]);

  if (!isLoaded) return <p className="text-warm-500">Loading...</p>;

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = ADMIN_EMAIL && userEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!user || !isAdmin) {
    return (
      <div className="rounded-xl border border-coral-200 bg-coral-50 p-6 text-center">
        <p className="text-coral-700">You must be signed in as an admin to access this page.</p>
      </div>
    );
  }

  async function handleAction(id: string, action: 'approve' | 'reject', note?: string) {
    try {
      const res = await fetch(`/api/blog-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNote: note }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: action === 'approve' ? 'approved' : 'rejected', adminNote: note || null } : s
          )
        );
      } else {
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Something went wrong');
    }
  }

  const filtered =
    filter === 'all'
      ? submissions
      : submissions.filter((s) => s.status === filter);

  const counts = {
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
    all: submissions.length,
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-coral-50 border border-coral-200 p-4 text-sm text-coral-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-warm-100 p-1">
        {(['pending', 'approved', 'rejected', 'all'] as TabFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-white text-warm-900 shadow-sm'
                : 'text-warm-500 hover:text-warm-700'
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-warm-500 text-center py-8">Loading submissions...</p>
      ) : filtered.length === 0 ? (
        <p className="text-warm-500 text-center py-8">No {filter === 'all' ? '' : filter} submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <SubmissionCard key={sub.id} sub={sub} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogAdminPage() {
  if (!isClerkConfigured) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-warm-900">Blog Admin</h1>
        <p className="mt-4 text-warm-600">
          Authentication is not configured. Set up Clerk to use this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Blog Post Review</h1>
      <p className="mt-2 text-warm-600">
        Review and approve community-submitted blog posts. Approved posts are published directly to the site.
      </p>
      <div className="mt-8">
        <BlogAdminDashboard />
      </div>
    </div>
  );
}
