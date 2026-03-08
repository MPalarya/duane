'use client';

import { Suspense, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ClerkEmailPrefill } from '@/lib/auth/use-clerk-email';

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeContent />
    </Suspense>
  );
}

function SubscribeContent() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get('confirmed') === 'true';

  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    confirmed ? 'success' : 'idle'
  );
  const [subMsg, setSubMsg] = useState(confirmed ? 'Your subscription is confirmed! Welcome aboard.' : '');

  const [unsubEmail, setUnsubEmail] = useState('');
  const [unsubStatus, setUnsubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [unsubMsg, setUnsubMsg] = useState('');

  const prefillEmail = useCallback((email: string) => {
    setSubEmail((prev) => prev || email);
    setUnsubEmail((prev) => prev || email);
  }, []);

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubStatus('loading');
    setSubMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubStatus('success');
        if (data.message === 'Already subscribed') {
          setSubMsg('You\'re already subscribed!');
        } else if (data.message === 'Subscribed') {
          setSubMsg('You\'re subscribed! Welcome aboard.');
        } else {
          setSubMsg('Check your email to confirm your subscription.');
        }
      } else {
        setSubStatus('error');
        setSubMsg(data.error || 'Something went wrong');
      }
    } catch {
      setSubStatus('error');
      setSubMsg('Something went wrong. Please try again.');
    }
  }

  async function handleUnsubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUnsubStatus('loading');
    setUnsubMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unsubEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setUnsubStatus('success');
        setUnsubMsg('You have been unsubscribed.');
      } else {
        setUnsubStatus('error');
        setUnsubMsg(data.error || 'Something went wrong');
      }
    } catch {
      setUnsubStatus('error');
      setUnsubMsg('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      <ClerkEmailPrefill onEmail={prefillEmail} />

      <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">Newsletter</h1>
      <p className="mt-4 text-warm-600">
        Stay updated with the latest Duane Syndrome research, community stories, and portal updates.
      </p>

      {/* Subscribe section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-warm-800">Subscribe</h2>

        {subStatus === 'success' ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-green-800">{subMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-4 flex gap-3">
            <Input
              id="sub-email"
              type="email"
              placeholder="your@email.com"
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={subStatus === 'loading'}>
              {subStatus === 'loading' ? 'Joining...' : 'Join'}
            </Button>
          </form>
        )}

        {subStatus === 'error' && (
          <p className="mt-2 text-sm text-coral-500">{subMsg}</p>
        )}
      </div>

      {/* Unsubscribe section */}
      <div className="mt-10 border-t border-warm-200 pt-8">
        <h2 className="text-xl font-semibold text-warm-800">Unsubscribe</h2>
        <p className="mt-2 text-sm text-warm-500">
          No longer want to receive emails? Enter your address below.
        </p>

        {unsubStatus === 'success' ? (
          <div className="mt-4 rounded-lg border border-warm-200 bg-warm-50 p-4">
            <p className="text-warm-700">{unsubMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="mt-4 flex gap-3">
            <Input
              id="unsub-email"
              type="email"
              placeholder="your@email.com"
              value={unsubEmail}
              onChange={(e) => setUnsubEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" variant="outline" disabled={unsubStatus === 'loading'}>
              {unsubStatus === 'loading' ? 'Processing...' : 'Unsubscribe'}
            </Button>
          </form>
        )}

        {unsubStatus === 'error' && (
          <p className="mt-2 text-sm text-coral-500">{unsubMsg}</p>
        )}
      </div>
    </div>
  );
}
