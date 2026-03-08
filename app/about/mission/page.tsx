import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Mission',
  description: 'The mission behind the Duane Syndrome Portal — supporting the international Duane Syndrome community through connection and information.',
};

export default function MissionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">Our Mission</h1>
      <p className="mt-4 text-lg text-primary-600 font-medium">
        Supporting the Duane Syndrome community through connection.
      </p>

      <div className="mt-8 space-y-8 text-warm-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Why This Portal Exists</h2>
          <p className="mt-3">
            Duane Syndrome affects approximately 1 in 1,000 people, yet reliable, accessible
            information can be hard to find. Many patients and parents discover the diagnosis
            with little context and few resources. This portal was created to change that — a
            single place where the community can learn, connect, and support each other.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Who We Serve</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li><strong>Patients</strong> — children and adults living with Duane Syndrome</li>
            <li><strong>Parents and families</strong> — navigating diagnosis, treatment, and daily life</li>
            <li><strong>Clinicians</strong> — ophthalmologists and strabismus specialists looking for community insights</li>
            <li><strong>Researchers</strong> — studying eye movement disorders and cranial nerve development</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">What We Do</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Provide clear, accurate information about Duane Syndrome types, treatments, and daily life</li>
            <li>Maintain a directory of specialists with experience treating Duane Syndrome</li>
            <li>Share the latest research with accessible summaries</li>
            <li>Connect community members through stories, mentorship, and shared experiences</li>
            <li>Offer practical tools like the gaze simulator, screening tool, and explanation templates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-warm-800">Built by the Community</h2>
          <p className="mt-3">
            This portal is driven by contributions from people around the world — specialist
            recommendations, personal stories, research tips, and feedback that makes this
            resource better every day. If you&apos;d like to help, we&apos;d love to have you.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="inline-block rounded-lg bg-primary-600 px-5 py-2 font-medium text-white transition-colors hover:bg-primary-700"
            >
              Contribute
            </Link>
            <Link
              href="/contact"
              className="inline-block rounded-lg border border-warm-300 px-5 py-2 font-medium text-warm-700 transition-colors hover:bg-warm-50"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </div>

      {/* Sub-section links */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link
          href="/about/types"
          className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-primary-700 group-hover:text-primary-800">Types</h3>
          <p className="mt-2 text-sm text-warm-500">Type 1, 2, and 3 — how they differ</p>
        </Link>
        <Link
          href="/about/treatments"
          className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-primary-700 group-hover:text-primary-800">Treatments</h3>
          <p className="mt-2 text-sm text-warm-500">Surgery, prisms, therapy, and more</p>
        </Link>
        <Link
          href="/about/faq"
          className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-primary-700 group-hover:text-primary-800">FAQ</h3>
          <p className="mt-2 text-sm text-warm-500">Common questions from patients and parents</p>
        </Link>
      </div>
    </div>
  );
}
