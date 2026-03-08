import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for the Duane Syndrome Portal — how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">Privacy Policy</h1>
      <p className="mt-4 text-warm-600">Last updated: March 2026</p>

      <div className="mt-8 space-y-8 text-warm-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Information We Collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li><strong>Email address</strong> — when you subscribe to our newsletter or submit feedback</li>
            <li><strong>Account information</strong> — if you sign in via Google or Facebook (name, email, profile picture)</li>
            <li><strong>Anonymous analytics</strong> — page views and interactions via Vercel Analytics and Microsoft Clarity</li>
            <li><strong>Content submissions</strong> — specialist suggestions, stories, or other contributions you submit</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">How We Use Your Information</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Deliver newsletter updates about Duane Syndrome research and community news</li>
            <li>Respond to your feedback and questions</li>
            <li>Improve the website based on usage patterns</li>
            <li>Display community contributions (stories, specialist recommendations) after review</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Third-Party Services</h2>
          <p className="mt-3">We use the following services to operate this portal:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li><strong>Clerk</strong> — authentication and user accounts</li>
            <li><strong>Resend</strong> — sending emails (newsletters, confirmations)</li>
            <li><strong>Vercel</strong> — hosting and analytics</li>
            <li><strong>Microsoft Clarity</strong> — anonymous session recording and heatmaps</li>
            <li><strong>Sanity</strong> — content management</li>
            <li><strong>Turso</strong> — database storage</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Cookies</h2>
          <p className="mt-3">
            We use essential cookies for authentication (Clerk session) and analytics (Vercel, Microsoft Clarity).
            We do not use advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Your Rights</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Unsubscribe from the newsletter at any time via our{' '}
              <Link href="/subscribe" className="text-primary-600 hover:underline">subscribe page</Link>
            </li>
            <li>Request deletion of your account and data by{' '}
              <Link href="/contact" className="text-primary-600 hover:underline">contacting us</Link>
            </li>
            <li>Access or correct your personal information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Contact</h2>
          <p className="mt-3">
            For privacy-related questions, please reach out via our{' '}
            <Link href="/contact" className="text-primary-600 hover:underline">contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
