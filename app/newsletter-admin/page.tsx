'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function NewsletterForm() {
  const { user, isLoaded } = useUser();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState('');

  const previewHtml = useMemo(() => {
    if (!body) return '';
    return marked.parse(body, { async: false }) as string;
  }, [body]);

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

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setResult('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getSecret()}`,
        },
        body: JSON.stringify({ subject, html: previewHtml }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setResult(`${data.message}${data.failed > 0 ? ` (${data.failed} failed)` : ''}`);
        setSubject('');
        setBody('');
      } else {
        setStatus('error');
        setResult(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setResult('Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSend} className="mt-8 space-y-6">
      <Input
        id="subject"
        label="Subject"
        placeholder="March Update — New Research & Tools"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />

      <div>
        <p className="mb-1.5 text-sm font-medium text-warm-700">Body (Markdown)</p>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Editor */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={16}
            placeholder={"# Hello everyone!\n\nHere's what's new this month:\n\n- **New research** on cranial nerve development\n- Updated [specialist directory](/specialists)\n- Community spotlight: *Jane's story*"}
            className="min-h-[300px] rounded-lg border border-warm-300 bg-white px-4 py-3 font-mono text-sm text-warm-900 placeholder:text-warm-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />

          {/* Preview */}
          <div className="min-h-[300px] rounded-lg border border-warm-200 bg-white px-4 py-3 overflow-auto">
            {previewHtml ? (
              <div
                className="newsletter-preview max-w-none text-sm text-warm-800 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_a]:text-primary-600 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_hr]:my-4 [&_hr]:border-warm-200 [&_blockquote]:border-l-4 [&_blockquote]:border-warm-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-warm-600 [&_code]:bg-warm-100 [&_code]:px-1 [&_code]:rounded [&_img]:max-w-full [&_img]:rounded-lg"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <p className="text-sm text-warm-400 italic">Preview will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {result && (
        <p className={`text-sm ${status === 'success' ? 'text-green-700' : 'text-coral-500'}`}>
          {result}
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Send to All Subscribers'}
      </Button>
    </form>
  );
}

async function getSecret(): Promise<string> {
  const res = await fetch('/api/newsletter/secret');
  if (!res.ok) return '';
  const data = await res.json();
  return data.secret || '';
}

export default function NewsletterAdminPage() {
  if (!isClerkConfigured) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-warm-900">Newsletter Admin</h1>
        <p className="mt-4 text-warm-600">Authentication is not configured. Set up Clerk to use this page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Newsletter Admin</h1>
      <p className="mt-4 text-warm-600">
        Compose and send a newsletter to all confirmed subscribers. Use Markdown for formatting.
      </p>
      <NewsletterForm />
    </div>
  );
}
