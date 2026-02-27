import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { SubmissionForm } from '@/components/content/submission-form';

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SubmitContent />;
}

function SubmitContent() {
  const t = useTranslations('nav');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">{t('submit')}</h1>
      <p className="mt-4 text-warm-600">
        Help grow the Duane Syndrome community. Submit a specialist, share your story,
        suggest a blog post, or contribute a resource. All submissions are reviewed before publishing.
      </p>

      <SubmissionForm />
    </div>
  );
}
