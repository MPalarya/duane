import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for the Duane Syndrome Portal.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">Terms of Use</h1>
      <p className="mt-4 text-warm-600">Last updated: March 2026</p>

      <div className="mt-8 space-y-8 text-warm-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Acceptance of Terms</h2>
          <p className="mt-3">
            By accessing and using duane-syndrome.com, you agree to these terms of use.
            If you do not agree, please do not use this website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Medical Disclaimer</h2>
          <p className="mt-3">
            This website provides <strong>educational information only</strong> and is not a substitute
            for professional medical advice, diagnosis, or treatment. Always consult a qualified
            healthcare provider with questions about a medical condition. Never disregard professional
            medical advice because of something you read on this site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">User Contributions</h2>
          <p className="mt-3">
            Content submitted by users (specialist recommendations, personal stories, blog posts) is
            reviewed before publication. We reserve the right to edit or remove any submission. By
            submitting content, you grant us permission to publish it on this platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Intellectual Property</h2>
          <p className="mt-3">
            All original content on this website, including text, design, and graphics, is the property
            of the Duane Syndrome Portal. User-submitted content remains the property of the respective
            authors but is licensed for use on this platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Limitation of Liability</h2>
          <p className="mt-3">
            This website is provided &quot;as is&quot; without warranties of any kind. We are not liable
            for any damages arising from your use of this website or reliance on its content. This
            includes, but is not limited to, any health decisions made based on information found here.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Changes to These Terms</h2>
          <p className="mt-3">
            We may update these terms from time to time. Continued use of the website after changes
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Contact</h2>
          <p className="mt-3">
            Questions about these terms? Reach out via our{' '}
            <Link href="/contact" className="text-primary-600 hover:underline">contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
