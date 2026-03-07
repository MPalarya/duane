import Link from 'next/link';
import { db, isDbConfigured } from '@/lib/db/client';
import { legalEntries } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { seedLegalEntries } from '@/lib/seed-data';

interface LegalEntry {
  id: string;
  country: string;
  topic: string;
  content: string;
  sourcesJson: string | null;
  createdAt: string | null;
}

export default async function LegalPage() {
  let entries: LegalEntry[] = [];
  if (isDbConfigured) {
    try {
      entries = await db
        .select()
        .from(legalEntries)
        .where(eq(legalEntries.approved, true))
        .orderBy(desc(legalEntries.country));
    } catch {
      // DB not ready
    }
  }

  if (entries.length === 0) {
    entries = seedLegalEntries;
  }

  // Group by country
  const byCountry = entries.reduce<Record<string, LegalEntry[]>>((acc, entry) => {
    if (!acc[entry.country]) acc[entry.country] = [];
    acc[entry.country].push(entry);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Legal Information & Rights</h1>
      <p className="mt-4 text-warm-600">
        Community-contributed information about disability rights, insurance coverage,
        driving requirements, school accommodations, and more — organized by country.
      </p>

      <div className="mt-4 rounded-lg border border-coral-200 bg-coral-50 p-4 text-sm text-coral-500">
        <strong>Disclaimer:</strong> This is community-contributed information, not legal advice.
        Always verify with official sources and consult legal professionals in your jurisdiction.
      </div>

      {entries.length === 0 ? (
        <div className="mt-8 rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
          <p className="text-lg text-warm-500">
            Legal information is being collected from the community.
          </p>
          <p className="mt-2 text-warm-400">
            Know about disability rights or Duane Syndrome-related legal info in your country?
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-700"
          >
            Contribute Information
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {Object.entries(byCountry).map(([country, countryEntries]) => (
            <section key={country}>
              <h2 className="text-2xl font-semibold text-warm-800">{country}</h2>
              <div className="mt-3 space-y-4">
                {countryEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-warm-200 bg-card p-5">
                    <h3 className="font-semibold text-warm-900">{entry.topic}</h3>
                    <p className="mt-2 whitespace-pre-line text-warm-600">{entry.content}</p>
                    {entry.sourcesJson && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-warm-500">Sources:</p>
                        <ul className="mt-1 list-disc pl-5 text-sm text-primary-600">
                          {(JSON.parse(entry.sourcesJson) as { title: string; url: string }[]).map(
                            (source, i) => (
                              <li key={i}>
                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {source.title}
                                </a>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
