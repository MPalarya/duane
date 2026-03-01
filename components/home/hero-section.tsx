'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CobeGlobe, type GlobeMarker } from './cobe-globe';

// ISO alpha-2 → [lat, lng]
const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [38.9, -77.0], IL: [31.8, 35.2], GB: [51.5, -0.1], DE: [52.5, 13.4],
  FR: [48.9, 2.3], IN: [28.6, 77.2], CA: [45.4, -75.7], AU: [-35.3, 149.1],
  BR: [-15.8, -47.9], ES: [40.4, -3.7], IT: [41.9, 12.5], NL: [52.4, 4.9],
  JP: [35.7, 139.7], KR: [37.6, 127.0], MX: [19.4, -99.1], SE: [59.3, 18.1],
  ZA: [-25.7, 28.2], AR: [-34.6, -58.4], PL: [52.2, 21.0], TR: [39.9, 32.9],
  SG: [1.3, 103.8], NZ: [-41.3, 174.8], CH: [46.9, 7.4], NO: [59.9, 10.8],
  IE: [53.3, -6.3], RU: [55.8, 37.6], CN: [39.9, 116.4], NG: [9.1, 7.5],
  EG: [30.0, 31.2], TH: [13.8, 100.5], PH: [14.6, 121.0], CO: [4.7, -74.1],
  CL: [-33.4, -70.7], KE: [-1.3, 36.8], PK: [33.7, 73.0], UA: [50.4, 30.5],
  CZ: [50.1, 14.4], PT: [38.7, -9.1], AT: [48.2, 16.4], FI: [60.2, 24.9],
  DK: [55.7, 12.6], BE: [50.8, 4.4], RO: [44.4, 26.1], GR: [37.9, 23.7],
  HU: [47.5, 19.0], SA: [24.7, 46.7], AE: [24.5, 54.4], MY: [3.1, 101.7],
  ID: [-6.2, 106.8], VN: [21.0, 105.8],
};

interface VisitorData {
  code: string;
  count: number;
}

export function HeroSection() {
  const t = useTranslations('home.hero');
  const [markers, setMarkers] = useState<GlobeMarker[]>([]);
  const [totalLogins, setTotalLogins] = useState(0);

  useEffect(() => {
    fetch('/api/visitor-map')
      .then((r) => r.json())
      .then((data: VisitorData[]) => {
        const maxCount = Math.max(...data.map((d) => d.count), 1);
        let total = 0;
        const mapped: GlobeMarker[] = [];
        for (const { code, count } of data) {
          total += count;
          const coords = COUNTRY_COORDS[code];
          if (coords) {
            mapped.push({
              location: coords,
              size: 0.05 + (count / maxCount) * 0.2,
              code,
              count,
            });
          }
        }
        setMarkers(mapped);
        setTotalLogins(total);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 to-primary-900 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      {/* Decorative mint accent blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 end-[-6rem] h-72 w-72 rounded-full bg-accent-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-4rem] start-[-4rem] h-56 w-56 rounded-full bg-accent-400/15 blur-2xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Text content */}
        <div className="text-center lg:text-start">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t('title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-4 text-xl text-accent-200 sm:text-2xl"
          >
            {t('subtitle')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-warm-300 lg:mx-0"
          >
            {t('description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link
              href="/about"
              className="inline-flex items-center rounded-lg bg-coral-500 px-6 py-3 text-base font-semibold text-primary-900 transition-colors hover:bg-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2 focus:ring-offset-primary-900"
            >
              {t('ctaPrimary')}
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center rounded-lg border-2 border-white/30 px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary-900"
            >
              {t('ctaSecondary')}
            </Link>
          </motion.div>
        </div>

        {/* Globe — mobile: ~90vw, desktop: sized to match text column height */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-full max-w-[85vw] sm:max-w-sm lg:max-w-md">
            <CobeGlobe markers={markers} showLabels />
          </div>
          {totalLogins > 0 && (
            <p className="mt-3 text-center text-sm font-medium text-accent-200/80">
              {t('globalCommunity')} — {t('loginCount', { count: totalLogins })}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
