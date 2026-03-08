'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ClerkEmailPrefill } from '@/lib/auth/use-clerk-email';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const form = e.currentTarget;
    const honeypot = new FormData(form).get('website');
    if (honeypot) return;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">Contact Us</h1>
      <p className="mt-4 text-warm-600">
        Have feedback, questions, or suggestions? We&apos;d love to hear from you.
      </p>

      <ClerkEmailPrefill onEmail={(e) => setEmail((prev) => prev || e)} />

      {status === 'success' ? (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-lg font-medium text-green-800">Thank you for your feedback!</p>
          <p className="mt-2 text-green-600">We&apos;ll get back to you if needed.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setStatus('idle')}
          >
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <Input
            id="name"
            label="Your Name"
            placeholder="Optional"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Textarea
            id="message"
            label="Message"
            placeholder="Your feedback, question, or suggestion..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
          />

          {status === 'error' && (
            <p className="text-sm text-coral-500">{errorMsg}</p>
          )}

          <Button type="submit" size="lg" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending...' : 'Send Feedback'}
          </Button>
        </form>
      )}
    </div>
  );
}
