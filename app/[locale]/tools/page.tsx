import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

const tools = [
  { href: '/tools/gaze-simulator', labelKey: 'gazeSimulator', icon: '👁', descKey: 'gazeSimulatorDesc' },
  { href: '/tools/screening', labelKey: 'screening', icon: '🩺', descKey: 'screeningDesc' },
  { href: '/tools/one-pager', labelKey: 'onePager', icon: '📄', descKey: 'onePagerDesc' },
  { href: '/tools/explain-templates', labelKey: 'explainTemplates', icon: '💬', descKey: 'explainTemplatesDesc' },
  { href: '/tools/emergency-card', labelKey: 'emergencyCard', icon: '🆘', descKey: 'emergencyCardDesc' },
  { href: '/tools/exercise-tracker', labelKey: 'exerciseTracker', icon: '🏋️', descKey: 'exerciseTrackerDesc' },
] as const;

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ToolsContent />;
}

function ToolsContent() {
  const t = useTranslations('nav');
  const td = useTranslations('toolsPage');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">{t('tools')}</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">{t('tools')}</h1>
      <p className="mt-4 text-warm-600">
        {td('description')}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border border-warm-200 bg-card p-6 text-center transition-all hover:border-primary-300 hover:shadow-md"
          >
            <span className="text-3xl">{tool.icon}</span>
            <h2 className="mt-2 text-lg font-semibold text-primary-700">{t(tool.labelKey)}</h2>
            <p className="mt-1 text-sm text-warm-500">{td(tool.descKey)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
