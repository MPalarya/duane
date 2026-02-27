import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { ScreeningWizard } from '@/components/screening/screening-wizard';

export default async function ScreeningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ScreeningContent />;
}

function ScreeningContent() {
  const t = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/about" className="hover:text-primary-600">About</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">{t('screening')}</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">{t('screening')}</h1>
      <p className="mt-4 text-warm-600">
        Answer a few questions to help understand your eye movement pattern. This is not
        a medical diagnosis — always consult an ophthalmologist for proper evaluation.
      </p>

      <div className="mt-4 rounded-lg border border-coral-200 bg-coral-50 p-4 text-sm text-coral-500">
        <strong>Important:</strong> {common('disclaimer')}
      </div>

      <div className="mt-8">
        <ScreeningWizard />
      </div>
    </div>
  );
}
