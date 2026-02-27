import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { EmergencyCard } from '@/components/tools/emergency-card';

export default async function EmergencyCardPage({
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
        <span className="text-warm-600">Emergency Card</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">Emergency Medical ID Card</h1>
      <p className="mt-4 text-warm-600">
        Generate a wallet-sized medical ID card noting your Duane Syndrome. Useful for ER visits
        where doctors unfamiliar with the condition might misinterpret your eye alignment as a
        sign of a neurological emergency (like stroke or nerve palsy).
      </p>

      <div className="mt-4 rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm text-accent-700">
        <strong>Why carry this?</strong> In emergency rooms, abnormal eye movement is often a red flag
        for acute neurological events. Duane Syndrome can be mistaken for a new-onset sixth nerve palsy,
        leading to unnecessary and stressful tests. This card helps ER staff understand your baseline.
      </div>

      <div className="mt-8">
        <EmergencyCard />
      </div>
    </div>
  );
}
