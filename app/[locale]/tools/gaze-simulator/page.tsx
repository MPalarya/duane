import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { GazeSimulator } from '@/components/gaze-simulator/gaze-simulator';

export default async function GazeSimulatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GazeSimulatorContent />;
}

function GazeSimulatorContent() {
  const t = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/about" className="hover:text-primary-600">About</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">{t('gazeSimulator')}</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">{t('gazeSimulator')}</h1>
      <p className="mt-4 text-warm-600">
        See how Duane Syndrome affects eye movement. Adjust the controls to explore different
        types and severity levels. Use this tool to explain the condition to teachers, friends, or doctors.
      </p>

      <div className="mt-8">
        <GazeSimulator />
      </div>

      <p className="mt-6 text-sm text-warm-400 italic">
        {common('disclaimer')}
      </p>
    </div>
  );
}
