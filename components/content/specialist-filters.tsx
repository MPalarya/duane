'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';

interface Specialist {
  id: string;
  name: string;
  country: string;
  city: string | null;
  type: string | null;
  specialty: string | null;
  website: string | null;
  verified: boolean | null;
  ratingAvg: number | null;
  ratingCount: number | null;
}

export function SpecialistFilters({ specialists }: { specialists: Specialist[] }) {
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const countries = useMemo(
    () => [...new Set(specialists.map((s) => s.country))].sort(),
    [specialists]
  );

  const filtered = useMemo(() => {
    return specialists.filter((s) => {
      if (countryFilter && s.country !== countryFilter) return false;
      if (typeFilter && s.type !== typeFilter) return false;
      return true;
    });
  }, [specialists, countryFilter, typeFilter]);

  return (
    <div className="mt-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="rounded-lg border border-warm-300 bg-white px-3 py-2 text-sm text-warm-700"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-warm-300 bg-white px-3 py-2 text-sm text-warm-700"
        >
          <option value="">All Types</option>
          <option value="child">Children</option>
          <option value="adult">Adults</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* Results */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((specialist) => (
          <Link
            key={specialist.id}
            href={`/specialists/${specialist.id}`}
            className="group rounded-xl border border-warm-200 bg-card p-5 transition-all hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-warm-900 group-hover:text-primary-700">
                {specialist.name}
              </h3>
              {specialist.verified && (
                <Badge variant="success">Verified</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-warm-500">
              {specialist.city ? `${specialist.city}, ` : ''}{specialist.country}
            </p>
            {specialist.specialty && (
              <p className="mt-1 text-sm text-warm-400">{specialist.specialty}</p>
            )}
            {specialist.type && (
              <Badge className="mt-2" variant="primary">
                {specialist.type === 'child' ? 'Children' : specialist.type === 'adult' ? 'Adults' : 'All Ages'}
              </Badge>
            )}
            {specialist.ratingCount != null && specialist.ratingCount > 0 && (
              <div className="mt-2 flex items-center gap-1 text-sm text-warm-500">
                <span className="text-amber-500">{'★'.repeat(Math.round(specialist.ratingAvg ?? 0))}</span>
                <span>({specialist.ratingCount})</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-center text-warm-400">No specialists match your filters.</p>
      )}
    </div>
  );
}
