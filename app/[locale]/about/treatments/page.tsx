import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';

export default async function TreatmentsPage({
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
        <span className="text-warm-600">Treatments</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">
        Treatment Options
      </h1>

      <p className="mt-4 text-warm-600 leading-relaxed">
        Many people with Duane Syndrome live full lives without needing treatment. Treatment is
        considered when there is a significant head turn, noticeable misalignment in primary gaze,
        double vision, or cosmetic concerns. The choice of treatment depends on the specific type,
        severity, and individual circumstances.
      </p>

      {/* When Treatment Is Needed */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-warm-800">When Is Treatment Considered?</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-warm-700">
          <li>Significant compensatory head turn (especially in children)</li>
          <li>Misalignment of the eyes in the primary (straight-ahead) gaze position</li>
          <li>Double vision in a functional gaze range</li>
          <li>Severe upshoot or downshoot movements</li>
          <li>Cosmetic concerns affecting quality of life</li>
        </ul>
      </section>

      {/* Surgery */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-warm-800">Surgical Options</h2>
        <div className="mt-4 space-y-4 text-warm-700">
          <div className="rounded-lg border border-warm-200 bg-card p-5">
            <h3 className="font-semibold text-warm-900">Recession Surgery</h3>
            <p className="mt-2">
              The most common surgical approach. It involves weakening (recessing) one or more
              eye muscles to reduce the abnormal forces. This can improve head position, reduce
              misalignment, and decrease globe retraction.
            </p>
          </div>
          <div className="rounded-lg border border-warm-200 bg-card p-5">
            <h3 className="font-semibold text-warm-900">Transposition Procedures</h3>
            <p className="mt-2">
              For some cases, particularly where there is significant limitation of movement,
              vertical rectus muscles can be repositioned to improve horizontal movement.
            </p>
          </div>
          <div className="rounded-lg border border-warm-200 bg-card p-5">
            <h3 className="font-semibold text-warm-900">Y-Splitting</h3>
            <p className="mt-2">
              A technique where the lateral rectus muscle is split and reattached in a Y-pattern
              to reduce upshoot and downshoot movements while preserving horizontal function.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-warm-500">
          Surgery does not restore normal eye movement. The goal is to improve alignment in
          primary gaze, reduce head turn, and minimize co-contraction effects.
        </p>
      </section>

      {/* Non-Surgical */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-warm-800">Non-Surgical Approaches</h2>
        <div className="mt-4 space-y-4 text-warm-700">
          <div className="rounded-lg border border-warm-200 bg-card p-5">
            <h3 className="font-semibold text-warm-900">Prism Glasses</h3>
            <p className="mt-2">
              Prisms can be ground into eyeglasses or applied as stick-on (Fresnel) prisms to
              help reduce or eliminate head turn and improve alignment without surgery.
            </p>
          </div>
          <div className="rounded-lg border border-warm-200 bg-card p-5">
            <h3 className="font-semibold text-warm-900">Botulinum Toxin (Botox)</h3>
            <p className="mt-2">
              Injection of botulinum toxin into a tight eye muscle can provide temporary
              improvement. Sometimes used as a diagnostic tool before surgery or as an
              alternative in mild cases.
            </p>
          </div>
          <div className="rounded-lg border border-warm-200 bg-card p-5">
            <h3 className="font-semibold text-warm-900">Observation</h3>
            <p className="mt-2">
              Many cases, especially mild ones with minimal head turn and good alignment in
              primary gaze, are best managed with observation. Regular follow-up with an
              ophthalmologist ensures any changes are caught early.
            </p>
          </div>
        </div>
      </section>

      {/* What Organizations Say */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-warm-800">What Professional Organizations Recommend</h2>
        <div className="mt-4 space-y-3 text-warm-700">
          <p>
            The <strong>American Academy of Ophthalmology (AAO)</strong> and the{' '}
            <strong>American Association for Pediatric Ophthalmology and Strabismus (AAPOS)</strong>{' '}
            consider surgical intervention appropriate when Duane Syndrome causes functionally
            significant head turn, misalignment in primary gaze, or significant cosmetic impact.
          </p>
          <p>
            They emphasize that treatment should be individualized, and that a compensatory head
            turn alone (without other complications) is not necessarily an indication for surgery
            if the patient functions well and has good binocular vision.
          </p>
        </div>
      </section>

      <p className="mt-8 text-sm text-warm-400 italic">
        This information is for educational purposes. Treatment decisions should be made in
        consultation with a qualified ophthalmologist experienced with Duane Syndrome.
      </p>

      {/* Find a Specialist CTA */}
      <div className="mt-8 rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
        <p className="text-primary-800">Looking for a specialist experienced with Duane Syndrome?</p>
        <Link
          href="/specialists"
          className="mt-2 inline-block rounded-lg bg-primary-600 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-700"
        >
          Browse Specialist Directory
        </Link>
      </div>
    </div>
  );
}
