import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { db, isDbConfigured } from '@/lib/db/client';
import { specialists } from '@/lib/db/schema';
import { SpecialistFilters } from '@/components/content/specialist-filters';
import { seedSpecialists } from '@/lib/seed-data';

interface Specialist {
  id: string;
  name: string;
  country: string;
  city: string | null;
  type: string | null;
  specialty: string | null;
  website: string | null;
  verified: boolean | null;
  ratingAvg: number | null;
  ratingCount: number | null;
}

export default async function SpecialistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let allSpecialists: Specialist[] = [];
  if (isDbConfigured) {
    try {
      allSpecialists = await db.select().from(specialists);
    } catch {
      // DB not ready
    }
  }
  if (allSpecialists.length === 0) {
    allSpecialists = seedSpecialists;
  }

  return <SpecialistsContent specialists={allSpecialists} />;
}

function SpecialistsContent({ specialists: data }: { specialists: Specialist[] }) {
  const t = useTranslations('nav');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-warm-900">{t('specialists')}</h1>
          <p className="mt-2 text-warm-600">
            Find eye specialists and surgeons experienced with Duane Syndrome.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Suggest a Specialist
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="mt-8 rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
          <p className="text-lg text-warm-500">
            The specialist directory is being built. Know a great Duane Syndrome specialist?
          </p>
          <Link
            href="/submit"
            className="mt-3 inline-block text-primary-600 hover:text-primary-700 hover:underline"
          >
            Submit a recommendation
          </Link>
        </div>
      ) : (
        <SpecialistFilters specialists={data} />
      )}

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Duane Syndrome Specialists Directory',
            description: 'Find ophthalmologists and strabismus surgeons experienced with Duane Syndrome worldwide.',
          }),
        }}
      />
    </div>
  );
}
