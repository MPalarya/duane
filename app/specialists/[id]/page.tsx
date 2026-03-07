import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db, isDbConfigured } from '@/lib/db/client';
import { specialists, reviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';

export default async function SpecialistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isDbConfigured) {
    notFound();
  }

  let specialist;
  let specialistReviews: { id: string; rating: number; text: string | null; createdAt: string | null }[] = [];

  try {
    const results = await db.select().from(specialists).where(eq(specialists.id, id)).limit(1);
    specialist = results[0];

    if (specialist) {
      specialistReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.specialistId, id));
    }
  } catch {
    notFound();
  }

  if (!specialist) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-bold text-warm-900">{specialist.name}</h1>
        {specialist.verified && <Badge variant="success">Verified</Badge>}
      </div>

      <div className="mt-4 space-y-2 text-warm-600">
        <p>{specialist.city ? `${specialist.city}, ` : ''}{specialist.country}</p>
        {specialist.specialty && <p>Specialty: {specialist.specialty}</p>}
        {specialist.type && (
          <p>Treats: {specialist.type === 'child' ? 'Children' : specialist.type === 'adult' ? 'Adults' : 'All Ages'}</p>
        )}
        {specialist.website && (
          <p>
            Website:{' '}
            <a
              href={specialist.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              {specialist.website}
            </a>
          </p>
        )}
        {specialist.phone && <p>Phone: {specialist.phone}</p>}
      </div>

      {/* Rating */}
      {specialist.ratingCount != null && specialist.ratingCount > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-2xl text-amber-500">
            {'★'.repeat(Math.round(specialist.ratingAvg ?? 0))}
            {'☆'.repeat(5 - Math.round(specialist.ratingAvg ?? 0))}
          </span>
          <span className="text-warm-500">
            {specialist.ratingAvg?.toFixed(1)} ({specialist.ratingCount} reviews)
          </span>
        </div>
      )}

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-warm-800">Reviews</h2>
        {specialistReviews.length === 0 ? (
          <p className="mt-4 text-warm-400">No reviews yet. Be the first to leave a review.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {specialistReviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-warm-200 bg-card p-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">{'★'.repeat(review.rating)}</span>
                  {review.createdAt && (
                    <span className="text-sm text-warm-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {review.text && <p className="mt-2 text-warm-600">{review.text}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Physician',
            name: specialist.name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: specialist.city,
              addressCountry: specialist.country,
            },
            medicalSpecialty: specialist.specialty || 'Ophthalmology',
            url: specialist.website,
          }),
        }}
      />
    </div>
  );
}
