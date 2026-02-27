import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { PersonaSelector } from '@/components/layout/persona-selector';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('home');
  const nav = useTranslations('nav');

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-900 sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-xl text-primary-700 sm:text-2xl">
            {t('hero.subtitle')}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-warm-600">
            {t('hero.description')}
          </p>
        </div>
      </section>

      {/* Persona Selector */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-semibold text-warm-800">
            {t('persona.title')}
          </h2>
          <PersonaSelector />
        </div>
      </section>

      {/* Featured Content */}
      <section className="bg-warm-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-semibold text-warm-800">
            {t('featured.title')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* About Duane Syndrome */}
            <Link
              href="/about"
              className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">👁</div>
              <h3 className="text-lg font-semibold text-warm-800 group-hover:text-primary-700">
                {nav('about')}
              </h3>
              <p className="mt-2 text-sm text-warm-500">
                Learn about types, symptoms, and treatments
              </p>
            </Link>

            {/* Specialist Directory */}
            <Link
              href="/specialists"
              className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">🏥</div>
              <h3 className="text-lg font-semibold text-warm-800 group-hover:text-primary-700">
                {nav('specialists')}
              </h3>
              <p className="mt-2 text-sm text-warm-500">
                Find experienced eye specialists worldwide
              </p>
            </Link>

            {/* Gaze Simulator */}
            <Link
              href="/tools/gaze-simulator"
              className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">🔬</div>
              <h3 className="text-lg font-semibold text-warm-800 group-hover:text-primary-700">
                {nav('gazeSimulator')}
              </h3>
              <p className="mt-2 text-sm text-warm-500">
                Interactive tool to understand eye movement
              </p>
            </Link>

            {/* Community */}
            <Link
              href="/community"
              className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">🤝</div>
              <h3 className="text-lg font-semibold text-warm-800 group-hover:text-primary-700">
                {nav('community')}
              </h3>
              <p className="mt-2 text-sm text-warm-500">
                Connect with others who understand
              </p>
            </Link>

            {/* Research */}
            <Link
              href="/research"
              className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">📚</div>
              <h3 className="text-lg font-semibold text-warm-800 group-hover:text-primary-700">
                {nav('research')}
              </h3>
              <p className="mt-2 text-sm text-warm-500">
                Latest research with AI-powered summaries
              </p>
            </Link>

            {/* Life Hacks */}
            <Link
              href="/life-hacks"
              className="group rounded-xl border border-warm-200 bg-card p-6 transition-all hover:border-primary-300 hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">💡</div>
              <h3 className="text-lg font-semibold text-warm-800 group-hover:text-primary-700">
                {nav('lifeHacks')}
              </h3>
              <p className="mt-2 text-sm text-warm-500">
                Practical tips for daily life
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-primary-600 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-4 text-lg font-medium text-white">
            {t('cta.newsletter')}
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder={t('cta.emailPlaceholder')}
              className="flex-1 rounded-lg border-0 bg-white/90 px-4 py-2 text-warm-900 placeholder:text-warm-400 focus:bg-white focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-white px-6 py-2 font-medium text-primary-700 transition-colors hover:bg-primary-50"
            >
              {t('cta.subscribeButton')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
