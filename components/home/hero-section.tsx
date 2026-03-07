'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
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

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', IL: 'Israel', GB: 'United Kingdom', DE: 'Germany',
  FR: 'France', IN: 'India', CA: 'Canada', AU: 'Australia', BR: 'Brazil',
  ES: 'Spain', IT: 'Italy', NL: 'Netherlands', JP: 'Japan', KR: 'South Korea',
  MX: 'Mexico', SE: 'Sweden', ZA: 'South Africa', AR: 'Argentina',
  PL: 'Poland', TR: 'Turkey', SG: 'Singapore', NZ: 'New Zealand',
  CH: 'Switzerland', NO: 'Norway', IE: 'Ireland', RU: 'Russia',
  CN: 'China', NG: 'Nigeria', EG: 'Egypt', TH: 'Thailand',
  PH: 'Philippines', CO: 'Colombia', CL: 'Chile', KE: 'Kenya',
  PK: 'Pakistan', UA: 'Ukraine', CZ: 'Czechia', PT: 'Portugal',
  AT: 'Austria', FI: 'Finland', DK: 'Denmark', BE: 'Belgium',
  RO: 'Romania', GR: 'Greece', HU: 'Hungary', SA: 'Saudi Arabia',
  AE: 'UAE', MY: 'Malaysia', ID: 'Indonesia', VN: 'Vietnam',
};

function countryFlag(code: string): string {
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

const THETA = 0.25;
const CENTER_THRESHOLD = 0.11;

function markerCenterProximity(lat: number, lng: number, phi: number) {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;
  const wx = Math.cos(latR) * Math.cos(lngR);
  const wy = Math.sin(latR);
  const wz = -Math.cos(latR) * Math.sin(lngR);
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const ct = Math.cos(THETA), st = Math.sin(THETA);
  const camX = cp * wx + sp * wz;
  const camZ = -sp * ct * wx + st * wy + cp * ct * wz;
  return { camX, camZ };
}

interface VisitorData {
  code: string;
  count: number;
}

interface ActivePopup {
  code: string;
  flag: string;
  name: string;
  count: number;
}

export function HeroSection() {
  const [markers, setMarkers] = useState<GlobeMarker[]>([]);
  const [totalLogins, setTotalLogins] = useState(0);
  const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
  const [popups, setPopups] = useState<ActivePopup[]>([]);
  const lastCheck = useRef(0);

  const handlePhi = useCallback(
    (phi: number) => {
      const now = Date.now();
      if (now - lastCheck.current < 350) return;
      lastCheck.current = now;
      if (visitorData.length === 0) return;

      const nearCenter: ActivePopup[] = [];
      for (const entry of visitorData) {
        const coords = COUNTRY_COORDS[entry.code];
        if (!coords) continue;
        const { camX, camZ } = markerCenterProximity(coords[0], coords[1], phi);
        if (Math.abs(camX) < CENTER_THRESHOLD && camZ > 0.3) {
          nearCenter.push({
            code: entry.code,
            flag: countryFlag(entry.code),
            name: COUNTRY_NAMES[entry.code] ?? entry.code,
            count: entry.count,
          });
        }
      }
      setPopups(nearCenter);
    },
    [visitorData],
  );

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
        setVisitorData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 to-primary-900 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
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
            One Shared Vision
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-4 text-xl text-accent-200 sm:text-2xl"
          >
            Your home for research, lived experiences, and meaningful connection in the Duane Syndrome community.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-warm-300 lg:mx-0"
          >
            Whether you&apos;re a patient, a parent, or a medical professional, we provide a space to navigate the unique challenges of DS together. From the latest clinical breakthroughs to the stories that make us feel seen, we are here to bridge the gap between diagnosis and daily life.
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
              Learn About Duane Syndrome
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center rounded-lg border-2 border-white/30 px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary-900"
            >
              Join the Community
            </Link>
          </motion.div>
        </div>

        {/* Globe + popups — fixed height area so nothing shifts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-full max-w-[85vw] sm:max-w-sm lg:max-w-md">
            <CobeGlobe markers={markers} onFramePhi={handlePhi} />
          </div>

          {/* Mobile: single popup at bottom of globe */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[8%] z-10 flex justify-center lg:hidden">
            <AnimatePresence mode="wait">
              {popups[0] && (
                <motion.div
                  key={popups[0].code}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-2 whitespace-nowrap rounded-full bg-black/50 px-3.5 py-1 text-sm backdrop-blur-sm"
                >
                  <span className="leading-none">{popups[0].flag}</span>
                  <span className="font-medium text-white">{popups[0].name}</span>
                  <span className="text-accent-200/70">{popups[0].count.toLocaleString()} visits</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop: stacked popups to the right of globe */}
          <div className="pointer-events-none absolute end-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-[60%] flex-col gap-1.5 lg:flex">
            <AnimatePresence mode="popLayout">
              {popups.map((p) => (
                <motion.div
                  key={p.code}
                  layout
                  initial={{ opacity: 0, x: -12, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -12, scale: 0.95 }}
                  transition={{
                    duration: 0.35,
                    layout: { type: 'spring', stiffness: 300, damping: 25 },
                  }}
                  className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-3.5 py-1 text-sm backdrop-blur-sm"
                >
                  <span className="leading-none">{p.flag}</span>
                  <span className="font-medium text-white">{p.name}</span>
                  <span className="text-accent-200/70">{p.count.toLocaleString()} visits</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {totalLogins > 0 && (
            <p className="mt-2 text-center text-sm font-medium text-accent-200/80">
              Our Global Community — {totalLogins.toLocaleString()} logins worldwide
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
