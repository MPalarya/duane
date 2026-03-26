import Link from 'next/link';
import { AdvocateCarousel } from './advocate-carousel';
import type { FeaturedAdvocate } from './advocate-carousel';

export type { FeaturedAdvocate };

interface AdvocatesSectionProps {
  advocates: FeaturedAdvocate[];
}

export function AdvocatesSection({ advocates }: AdvocatesSectionProps) {
  return (
    <section id="spotlights">
      <h2 className="text-2xl font-bold text-warm-900">Advocates</h2>
      <p className="mt-2 text-warm-500">
        Inspiring people who have Duane Syndrome — proving it doesn&apos;t define or limit what you can achieve.
        <br />
        Listen to their stories, browse through the comments — it&apos;s much more common than you think.
      </p>

      {advocates.length > 0 && (
        <div className="mt-6">
          <AdvocateCarousel
            advocates={advocates}
            trailing={
              <Link
                href="/submit"
                className="ml-2 inline-flex items-center gap-1 rounded-full border border-primary-300 bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
              >
                + Nominate
              </Link>
            }
          />
        </div>
      )}
    </section>
  );
}
