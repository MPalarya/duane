'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ClerkEmailPrefill } from '@/lib/auth/use-clerk-email';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const prefillEmail = useCallback((clerkEmail: string) => {
    setEmail((prev) => prev || clerkEmail);
  }, []);

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        if (data.message === 'Already subscribed') {
          setMessage('Already subscribed!');
        } else if (data.message === 'Subscribed') {
          setMessage('Subscribed!');
        } else {
          setMessage('Check your email to confirm.');
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong');
    }
  }

  return (
    <footer className="border-t border-warm-200 bg-warm-50">
      <ClerkEmailPrefill onEmail={prefillEmail} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.svg"
              alt="Duane Syndrome"
              width={84}
              height={72}
              className="shrink-0"
            />
            <div>
              <span className="text-lg font-semibold text-warm-800">duane-syndrome.com</span>
              <p className="mt-1 text-sm text-warm-500">
                Supporting the Duane Syndrome community through connection.
              </p>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-400">About</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about/mission" className="text-sm text-warm-600 hover:text-primary-600 transition-colors">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-warm-600 hover:text-primary-600 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-400">Community</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/submit" className="text-sm text-warm-600 hover:text-primary-600 transition-colors">
                  How to Contribute
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-warm-600 hover:text-primary-600 transition-colors">
                  Support &amp; Funding
                </Link>
              </li>
            </ul>
          </div>

          {/* Subscribe + Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-400">Stay Updated</h3>

            <div className="mt-3">
              {status === 'success' ? (
                <p className="text-sm text-green-700">{message}</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="min-w-0 flex-1 rounded-lg border border-warm-300 bg-white px-3 py-2 text-sm text-warm-900 placeholder:text-warm-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                  >
                    {status === 'loading' ? '...' : 'JOIN'}
                  </button>
                </form>
              )}

              {status === 'error' && (
                <p className="mt-1 text-xs text-coral-500">{message}</p>
              )}
            </div>

            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/subscribe" className="text-sm text-warm-600 hover:text-primary-600 transition-colors">
                  Unsubscribe
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-warm-600 hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-warm-600 hover:text-primary-600 transition-colors">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
