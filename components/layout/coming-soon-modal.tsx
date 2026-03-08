'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ClerkEmailPrefill } from '@/lib/auth/use-clerk-email';

const STORAGE_KEY = 'coming-soon-dismissed';

export function ComingSoonModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const prefillEmail = useCallback((clerkEmail: string) => {
    setEmail((prev) => prev || clerkEmail);
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  // Auto-focus email input when modal opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function handleClose() {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  }

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
          setMessage('You\'re already on the list!');
        } else if (data.message === 'Subscribed') {
          setMessage('You\'re in! We\'ll notify you when we launch.');
        } else {
          setMessage('Check your email to confirm your subscription.');
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <ClerkEmailPrefill onEmail={prefillEmail} />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-warm-400 hover:text-warm-600 transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="Duane Syndrome" width={80} height={69} />
        </div>

        <h2 className="text-2xl font-bold text-warm-900 text-center">
          We&apos;re Building Something Special
        </h2>
        <p className="mt-3 text-sm text-warm-600 text-center leading-relaxed">
          The Duane Syndrome Portal is still under construction. We&apos;re creating a comprehensive
          resource for the international Duane Syndrome community — and we&apos;d love for you to be
          part of it from day one.
        </p>

        {/* Subscribe form */}
        <div className="mt-6">
          {status === 'success' ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                ref={inputRef}
                type="email"
                placeholder="Your email address"
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
                {status === 'loading' ? '...' : 'Keep Me Updated'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="mt-2 text-xs text-coral-500">{message}</p>
          )}
        </div>

        {/* Links */}
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <Link
            href="/about/mission"
            onClick={handleClose}
            className="text-primary-600 hover:underline"
          >
            Our Mission
          </Link>
          <span className="text-warm-300">·</span>
          <Link
            href="/contact"
            onClick={handleClose}
            className="text-primary-600 hover:underline"
          >
            Contact Us
          </Link>
        </div>

        {/* Skip */}
        <button
          onClick={handleClose}
          className="mt-4 w-full text-center text-xs text-warm-400 hover:text-warm-600 transition-colors"
        >
          Continue browsing
        </button>
      </div>
    </div>
  );
}
