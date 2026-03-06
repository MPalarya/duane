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
      <h1 className="text-3xl font-bold text-warm-900">{t('gazeSimulator')}</h1>
      <p className="mt-4 text-warm-600">
        See how Duane Syndrome affects eye movement from two perspectives: the <strong>Observer View</strong> shows
        how the eyes appear to others, while the <strong>Patient View</strong> simulates the double vision (diplopia)
        that patients may experience. Adjust the controls to explore different types and severity levels.
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
