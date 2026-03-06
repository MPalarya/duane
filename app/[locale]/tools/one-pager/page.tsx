import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { OnePagerGenerator } from '@/components/tools/one-pager-generator';

export default async function OnePagerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OnePagerContent />;
}

function OnePagerContent() {
  const t = useTranslations('common');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">My Duane Syndrome Card</h1>
      <p className="mt-4 text-warm-600">
        Generate a printable one-page card about your Duane Syndrome. Customize it with your
        specific type and details, then print it to give to teachers, coaches, new doctors,
        or anyone who needs to understand your condition.
      </p>

      <div className="mt-8">
        <OnePagerGenerator />
      </div>

      <p className="mt-6 text-sm text-warm-400 italic">{t('disclaimer')}</p>
    </div>
  );
}
