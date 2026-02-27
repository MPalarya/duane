import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { ExplainTemplates } from '@/components/tools/explain-templates';

export default async function ExplainTemplatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-warm-400">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools/gaze-simulator" className="hover:text-primary-600">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-600">Explain Templates</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">&quot;Explain to My...&quot; Templates</h1>
      <p className="mt-4 text-warm-600">
        Pre-written scripts to help you explain Duane Syndrome to different people in your life.
        Customize them with your specific type, then copy and use however you need.
      </p>

      <div className="mt-8">
        <ExplainTemplates />
      </div>
    </div>
  );
}
