import Link from 'next/link';
import { AdvocateCarousel } from './advocate-carousel';

export interface FeaturedAdvocate {
  _id: string;
  name: string;
  tags?: string[];
  bio?: string;
  videoUrl: string;
  socialLinks?: { platform: string; url: string; followers?: string }[];
}

interface VisionariesSectionProps {
  advocates: FeaturedAdvocate[];
}

export function VisionariesSection({ advocates }: VisionariesSectionProps) {
  return (
    <section id="spotlights">
      <h2 className="text-2xl font-bold text-warm-900">Visionaries</h2>
      <p className="mt-2 text-warm-500">
        Inspiring people who have Duane Syndrome — proving it doesn&apos;t define or limit what you can achieve.
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
