import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';

export default async function TypesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/about" className="hover:text-primary-600">About</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">Types</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">
        Duane Syndrome Types
      </h1>

      <p className="mt-4 text-warm-600 leading-relaxed">
        Duane Syndrome is classified into three types based on which eye movements are affected.
        The classification was developed by Huber in 1974 based on electromyographic studies.
      </p>

      {/* Type 1 */}
      <section className="mt-10">
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-6">
          <h2 className="text-2xl font-bold text-primary-800">Type 1 — Limited Abduction</h2>
          <p className="mt-1 text-sm font-medium text-primary-600">Most common (~78% of cases)</p>
          <div className="mt-4 space-y-3 text-warm-700">
            <p>
              <strong>What happens:</strong> The affected eye has significantly limited or absent
              ability to move <strong>outward</strong> (away from the nose). Movement inward
              (toward the nose) is normal or near-normal.
            </p>
            <p>
              <strong>Globe retraction:</strong> When attempting to look inward, the eyeball
              retracts into the socket, and the eyelid opening narrows.
            </p>
            <p>
              <strong>In daily life:</strong> People with Type 1 often develop a slight head turn
              toward the affected side to compensate, maintaining good binocular vision in their
              functional range.
            </p>
          </div>
        </div>
      </section>

      {/* Type 2 */}
      <section className="mt-6">
        <div className="rounded-xl border border-accent-200 bg-accent-50 p-6">
          <h2 className="text-2xl font-bold text-accent-800">Type 2 — Limited Adduction</h2>
          <p className="mt-1 text-sm font-medium text-accent-600">Less common (~7% of cases)</p>
          <div className="mt-4 space-y-3 text-warm-700">
            <p>
              <strong>What happens:</strong> The affected eye has limited ability to move
              <strong> inward</strong> (toward the nose). Outward movement is normal or near-normal.
            </p>
            <p>
              <strong>Globe retraction:</strong> Retraction occurs when attempting to look inward,
              similar to Type 1.
            </p>
            <p>
              <strong>In daily life:</strong> Head turns may be adopted to compensate. This type
              is sometimes confused with other forms of strabismus.
            </p>
          </div>
        </div>
      </section>

      {/* Type 3 */}
      <section className="mt-6">
        <div className="rounded-xl border border-coral-200 bg-coral-50 p-6">
          <h2 className="text-2xl font-bold text-coral-500">Type 3 — Limited Both Directions</h2>
          <p className="mt-1 text-sm font-medium text-coral-400">Least common (~15% of cases)</p>
          <div className="mt-4 space-y-3 text-warm-700">
            <p>
              <strong>What happens:</strong> The affected eye has limited movement in
              <strong> both directions</strong> — inward and outward.
            </p>
            <p>
              <strong>Globe retraction:</strong> Retraction may occur when attempting to look
              in either direction.
            </p>
            <p>
              <strong>In daily life:</strong> This type may present with a more notable head
              position. The degree of limitation can vary significantly.
            </p>
          </div>
        </div>
      </section>

      {/* Additional Notes */}
      <section className="mt-10 space-y-4 text-warm-700">
        <h2 className="text-2xl font-semibold text-warm-800">Common Features Across All Types</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Globe retraction:</strong> The hallmark feature. When the eye tries to adduct
            (look inward), the eyeball pulls back into the orbit.
          </li>
          <li>
            <strong>Upshoot and downshoot:</strong> Abnormal vertical eye movements that occur
            during attempted adduction, caused by co-contraction of horizontal eye muscles.
          </li>
          <li>
            <strong>Palpebral fissure narrowing:</strong> The eyelid opening becomes smaller
            during certain eye movements due to the globe retraction.
          </li>
          <li>
            <strong>Compensatory head turn:</strong> A natural adaptation that allows maintaining
            binocular vision in the functional gaze range.
          </li>
        </ul>
      </section>

      <p className="mt-8 text-sm text-warm-400 italic">
        This information is for educational purposes. Consult an ophthalmologist for diagnosis and management.
      </p>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Duane Syndrome Types',
            description: 'Detailed explanation of Duane Syndrome Types 1, 2, and 3, their differences, symptoms, and daily life impact.',
            lastReviewed: '2024-01-01',
            medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
          }),
        }}
      />
    </div>
  );
}
