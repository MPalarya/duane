import Link from 'next/link';
import { LifeHacksContent } from '@/components/content/life-hacks-content';

export default function LifeHacksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Life Hacks</h1>
      <p className="mt-4 text-warm-600">
        Practical tips for daily life with Duane Syndrome, personalized for your situation.
        Select your perspective to see the most relevant tips.
      </p>

      <LifeHacksContent />

      <div className="mt-10 rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
        <p className="text-primary-800">Have a tip that helped you?</p>
        <Link
          href="/submit"
          className="mt-2 inline-block text-primary-600 font-medium hover:underline"
        >
          Share it with the community
        </Link>
      </div>
    </div>
  );
}
