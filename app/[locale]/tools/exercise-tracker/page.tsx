import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { ExerciseTracker } from '@/components/tools/exercise-tracker';

export default async function ExerciseTrackerPage({
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
        <span className="text-warm-600">Exercise Tracker</span>
      </nav>

      <h1 className="text-3xl font-bold text-warm-900">Eye Exercise Tracker</h1>
      <p className="mt-4 text-warm-600">
        If your ophthalmologist has recommended vision therapy exercises, use this tracker to
        build a consistent daily habit. Track your exercises, set reminders, and see your streak.
      </p>

      <div className="mt-4 rounded-lg border border-coral-200 bg-coral-50 p-4 text-sm text-coral-500">
        <strong>Note:</strong> Only do exercises that your eye doctor has specifically prescribed.
        Not all people with Duane Syndrome need or benefit from exercises. Always follow your
        doctor&apos;s guidance.
      </div>

      <div className="mt-8">
        <ExerciseTracker />
      </div>
    </div>
  );
}
