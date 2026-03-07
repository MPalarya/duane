import { OnePagerGenerator } from '@/components/tools/one-pager-generator';

export default function OnePagerPage() {
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

      <p className="mt-6 text-sm text-warm-400 italic">
        This information is for educational purposes only and should not replace professional medical advice.
      </p>
    </div>
  );
}
