import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { safeFetch } from '@/lib/sanity/client';
import { spotlightPeopleQuery, featuredAdvocatesQuery } from '@/lib/sanity/queries';
import { Badge } from '@/components/ui/badge';
import { seedSpotlightPeople, seedFeaturedAdvocates } from '@/lib/seed-data';
import { AdvocateCarousel } from '@/components/community/advocate-carousel';
import type { FeaturedAdvocate } from '@/components/community/advocate-carousel';
import { fetchFollowerCount } from '@/lib/social-stats';

interface SpotlightPerson {
  _id: string;
  name: string;
  profession?: string;
  bio?: string;
  syndromeType?: string;
}

/** Enrich social links with live follower counts (Sanity values take precedence). */
async function enrichWithFollowerCounts(
  advocates: FeaturedAdvocate[],
): Promise<FeaturedAdvocate[]> {
  return Promise.all(
    advocates.map(async (advocate) => {
      if (!advocate.socialLinks?.length) return advocate;

      const enrichedLinks = await Promise.all(
        advocate.socialLinks.map(async (link) => {
          // If Sanity already has a manual value, keep it
          if (link.followers) return link;
          const count = await fetchFollowerCount(link.url);
          return count ? { ...link, followers: count } : link;
        }),
      );

      return { ...advocate, socialLinks: enrichedLinks };
    }),
  );
}

export default async function SpotlightPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let people = (await safeFetch<SpotlightPerson[]>(spotlightPeopleQuery, { locale })) ?? [];
  if (people.length === 0) {
    people = seedSpotlightPeople;
  }

  let advocates = (await safeFetch<FeaturedAdvocate[]>(featuredAdvocatesQuery, { locale })) ?? [];
  if (advocates.length === 0) {
    advocates = seedFeaturedAdvocates;
  }

  // Fetch live follower counts (cached 24h, graceful fallback)
  advocates = await enrichWithFollowerCounts(advocates);

  return <SpotlightContent people={people} advocates={advocates} />;
}

function SpotlightContent({
  people,
  advocates,
}: {
  people: SpotlightPerson[];
  advocates: FeaturedAdvocate[];
}) {
  const t = useTranslations('nav');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">{t('spotlight')}</h1>
      <p className="mt-4 text-warm-600">
        Inspiring public figures who have Duane Syndrome. Their success shows that Duane Syndrome
        doesn&apos;t define or limit what you can achieve.
      </p>

      {/* Featured Advocates Carousel */}
      {advocates.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-warm-900">Featured Advocates</h2>
          <p className="mt-2 text-warm-500">
            Public figures raising awareness about Duane Syndrome.
          </p>
          <div className="mt-6">
            <AdvocateCarousel advocates={advocates} />
          </div>
        </section>
      )}

      {/* Spotlight People */}
      {people.length === 0 ? (
        <div className="mt-12 rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
          <p className="text-warm-500">
            Spotlight profiles are being added. Know someone who should be featured?{' '}
            <Link href="/submit" className="text-primary-600 hover:underline">Let us know</Link>.
          </p>
        </div>
      ) : (
        <>
          <hr className="mt-12 border-warm-200" />
          <h2 className="mt-10 text-2xl font-bold text-warm-900">Community Spotlight</h2>
          <p className="mt-2 text-warm-500">
            More people in our community making a difference.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <div
                key={person._id}
                className="rounded-xl border border-warm-200 bg-card p-5"
              >
                <h3 className="text-lg font-semibold text-warm-900">{person.name}</h3>
                {person.profession && (
                  <p className="mt-1 text-sm text-primary-600">{person.profession}</p>
                )}
                {person.bio && (
                  <p className="mt-2 text-sm text-warm-500 line-clamp-3">{person.bio}</p>
                )}
                {person.syndromeType && (
                  <Badge className="mt-2" variant="primary">
                    {person.syndromeType.replace('type', 'Type ')}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
