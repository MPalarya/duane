import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations('nav');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">{t('about')}</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900 sm:text-4xl">
        About Duane Syndrome
      </h1>

      <div className="mt-6 space-y-6 text-warm-700 leading-relaxed">
        <p>
          <strong>Duane Syndrome</strong> (also called <strong>Duane Retraction Syndrome</strong> or DRS)
          is a rare congenital (present from birth) eye movement disorder. It affects approximately
          1 in 1,000 people and accounts for about 1-5% of all strabismus (eye misalignment) cases.
        </p>

        <p>
          The condition occurs due to abnormal development of the sixth cranial nerve (abducens nerve)
          during early pregnancy. This nerve normally controls the lateral rectus muscle, which moves
          the eye outward. When this nerve doesn&apos;t develop properly, the brain compensates by
          &quot;mis-wiring&quot; branches of the third cranial nerve (oculomotor nerve) to the lateral
          rectus muscle — causing the characteristic movement limitations and globe retraction.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-warm-800">Key Facts</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Affects approximately <strong>1 in 1,000 people</strong> worldwide</li>
          <li>More common in females (about 60% of cases)</li>
          <li>The <strong>left eye</strong> is affected more often (about 60%)</li>
          <li>About 80% of cases are <strong>unilateral</strong> (one eye only)</li>
          <li>Most cases are <strong>sporadic</strong> (not inherited), though some families show a genetic pattern</li>
          <li>Usually detected in childhood, often by age 10</li>
          <li>Does not typically worsen over time</li>
        </ul>

        <h2 className="mt-8 text-2xl font-semibold text-warm-800">What It Looks Like</h2>
        <p>
          People with Duane Syndrome typically have limited ability to move the affected eye in one or
          more directions. The most noticeable feature is <strong>globe retraction</strong> — when
          trying to look toward the nose, the eyeball pulls back into the eye socket, causing the
          eyelid opening to narrow. Some people also experience <strong>upshoot</strong> or
          <strong> downshoot</strong> movements.
        </p>
        <p>
          Many people with Duane Syndrome develop a <strong>compensatory head turn</strong> — they
          turn their head slightly to maintain binocular vision and avoid double vision. This is
          actually a healthy adaptation, not a problem that needs correction.
        </p>
      </div>

      {/* Sub-section Links */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link
          href="/about/types"
          className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-primary-700 group-hover:text-primary-800">
            {t('types')}
          </h3>
          <p className="mt-2 text-sm text-warm-500">
            Type 1, 2, and 3 — how they differ and what each means
          </p>
        </Link>
        <Link
          href="/about/treatments"
          className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-primary-700 group-hover:text-primary-800">
            {t('treatments')}
          </h3>
          <p className="mt-2 text-sm text-warm-500">
            Surgery, prisms, therapy, and other approaches
          </p>
        </Link>
        <Link
          href="/about/faq"
          className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-primary-700 group-hover:text-primary-800">
            {t('faq')}
          </h3>
          <p className="mt-2 text-sm text-warm-500">
            Common questions from patients and parents
          </p>
        </Link>
      </div>

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalCondition',
            name: 'Duane Syndrome',
            alternateName: ['Duane Retraction Syndrome', 'DRS', 'Stilling-Turk-Duane Syndrome'],
            description: 'A rare congenital eye movement disorder caused by abnormal development of the sixth cranial nerve, resulting in limited eye movement, globe retraction, and characteristic upshoot/downshoot movements.',
            medicalSpecialty: 'Ophthalmology',
            epidemiology: 'Affects approximately 1 in 1,000 people, 1-5% of strabismus cases',
            signOrSymptom: [
              { '@type': 'MedicalSignOrSymptom', name: 'Limited eye abduction' },
              { '@type': 'MedicalSignOrSymptom', name: 'Globe retraction' },
              { '@type': 'MedicalSignOrSymptom', name: 'Palpebral fissure narrowing' },
              { '@type': 'MedicalSignOrSymptom', name: 'Compensatory head turn' },
            ],
          }),
        }}
      />

      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://duane-syndrome.com' },
              { '@type': 'ListItem', position: 2, name: 'About Duane Syndrome', item: 'https://duane-syndrome.com/en/about' },
            ],
          }),
        }}
      />
    </div>
  );
}
