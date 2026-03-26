'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Eye,
  Brain,
  Heart,
  Activity,
  Scissors,
  Glasses,
  HelpCircle,
  Stethoscope,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

/* ─── animation ─── */
const easeOut = [0.0, 0.0, 0.2, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: easeOut } },
};
const fadeRight = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: easeOut } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function Anim({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── SVG decoratives ─── */
function WaveDivider({ flip = false, color = '#D1E8E2' }: { flip?: boolean; color?: string }) {
  return (
    <div className={`relative w-full leading-[0] ${flip ? 'rotate-180' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-[60px] w-full sm:h-[80px] lg:h-[100px]">
        <path
          d="M0,40 C240,100 480,0 720,60 C960,120 1200,20 1440,80 L1440,120 L0,120 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

function BlobShape({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path
        d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.5,81.4,29,72.4,41.1C63.4,53.2,51,62.9,37.4,70.4C23.8,77.9,8.9,83.2,-5.2,82.1C-19.3,81,-38.6,73.5,-52.2,62.1C-65.8,50.7,-73.7,35.4,-78.5,19C-83.3,2.6,-85,-14.9,-79.6,-29.9C-74.2,-44.9,-61.7,-57.4,-47.6,-64.6C-33.5,-71.8,-16.8,-73.7,-0.4,-73C16,-72.3,30.6,-83.6,44.7,-76.4Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

function DotGrid({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {Array.from({ length: 25 }).map((_, i) => (
        <circle
          key={i}
          cx={(i % 5) * 22 + 11}
          cy={Math.floor(i / 5) * 22 + 11}
          r="2.5"
          fill="currentColor"
          opacity="0.3"
        />
      ))}
    </svg>
  );
}

function CircleFrame({
  children,
  size = 'lg',
  color = 'primary',
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'coral';
}) {
  const sizeMap = { sm: 'h-16 w-16', md: 'h-24 w-24', lg: 'h-32 w-32' };
  const colorMap = {
    primary: 'bg-primary-100 text-primary-700 ring-primary-200',
    accent: 'bg-accent-100 text-accent-700 ring-accent-300',
    coral: 'bg-coral-100 text-coral-700 ring-coral-300',
  };
  return (
    <div
      className={`flex items-center justify-center rounded-full ring-4 ${sizeMap[size]} ${colorMap[color]}`}
    >
      {children}
    </div>
  );
}

/* ─── 1-in-1000 dot visualization ─── */
function ThousandDots() {
  // 50 cols x 20 rows = 1000 dots, horizontal layout
  const cols = 50;
  const rows = 20;
  const highlightIndex = 524;
  const r = 1.6;
  const gap = 4.2;
  const w = cols * gap;
  const h = rows * gap;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 w-full"
      role="img"
      aria-label="Visualization of 1 in 1,000: a grid of 1,000 dots with one highlighted"
    >
      {Array.from({ length: cols * rows }).map((_, i) => {
        const cx = (i % cols) * gap + gap / 2;
        const cy = Math.floor(i / cols) * gap + gap / 2;
        const isHighlight = i === highlightIndex;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={isHighlight ? r * 2.2 : r}
            fill={isHighlight ? 'var(--color-coral-500)' : 'var(--color-warm-400)'}
            opacity={isHighlight ? 1 : 0.3}
          />
        );
      })}
    </svg>
  );
}

/* ─── donut chart SVG ─── */
function DonutChart() {
  const total = 100;
  const segments = [
    { percent: 78, color: '#2b3a6d', label: 'Type 1' },
    { percent: 15, color: '#FFCB05', label: 'Type 3' },
    { percent: 7, color: '#52a08c', label: 'Type 2' },
  ];
  const r = 70;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-56 sm:w-56">
      {segments.map((seg) => {
        const dashLen = (seg.percent / total) * circ;
        const dashOffset = -offset;
        offset += dashLen;
        return (
          <circle
            key={seg.label}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="28"
            strokeDasharray={`${dashLen} ${circ - dashLen}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
          />
        );
      })}
      <text x="100" y="92" textAnchor="middle" className="fill-primary-900 text-2xl font-extrabold">
        3
      </text>
      <text x="100" y="116" textAnchor="middle" className="fill-warm-500 text-xs font-medium">
        Types
      </text>
    </svg>
  );
}

/* ─── country populations (millions, approximate 2024) ─── */
const COUNTRY_POP: Record<string, { name: string; pop: number }> = {
  US: { name: 'the United States', pop: 335 },
  GB: { name: 'the United Kingdom', pop: 68 },
  CA: { name: 'Canada', pop: 40 },
  AU: { name: 'Australia', pop: 27 },
  IN: { name: 'India', pop: 1440 },
  DE: { name: 'Germany', pop: 84 },
  FR: { name: 'France', pop: 68 },
  BR: { name: 'Brazil', pop: 216 },
  MX: { name: 'Mexico', pop: 130 },
  ES: { name: 'Spain', pop: 48 },
  IT: { name: 'Italy', pop: 59 },
  NL: { name: 'the Netherlands', pop: 18 },
  JP: { name: 'Japan', pop: 124 },
  KR: { name: 'South Korea', pop: 52 },
  SE: { name: 'Sweden', pop: 10 },
  ZA: { name: 'South Africa', pop: 62 },
  AR: { name: 'Argentina', pop: 46 },
  PL: { name: 'Poland', pop: 37 },
  TR: { name: 'Turkey', pop: 86 },
  IL: { name: 'Israel', pop: 10 },
  SG: { name: 'Singapore', pop: 6 },
  NZ: { name: 'New Zealand', pop: 5 },
  CH: { name: 'Switzerland', pop: 9 },
  NO: { name: 'Norway', pop: 5 },
  IE: { name: 'Ireland', pop: 5 },
  RU: { name: 'Russia', pop: 144 },
  CN: { name: 'China', pop: 1425 },
  NG: { name: 'Nigeria', pop: 230 },
  EG: { name: 'Egypt', pop: 110 },
  PK: { name: 'Pakistan', pop: 240 },
  ID: { name: 'Indonesia', pop: 280 },
  PH: { name: 'the Philippines', pop: 117 },
  CO: { name: 'Colombia', pop: 52 },
  TH: { name: 'Thailand', pop: 72 },
  MY: { name: 'Malaysia', pop: 34 },
  VN: { name: 'Vietnam', pop: 100 },
  SA: { name: 'Saudi Arabia', pop: 37 },
  AE: { name: 'the UAE', pop: 10 },
  CL: { name: 'Chile', pop: 20 },
  PT: { name: 'Portugal', pop: 10 },
  AT: { name: 'Austria', pop: 9 },
  FI: { name: 'Finland', pop: 6 },
  DK: { name: 'Denmark', pop: 6 },
  BE: { name: 'Belgium', pop: 12 },
  GR: { name: 'Greece', pop: 10 },
  CZ: { name: 'Czechia', pop: 11 },
  RO: { name: 'Romania', pop: 19 },
  HU: { name: 'Hungary', pop: 10 },
  KE: { name: 'Kenya', pop: 56 },
  UA: { name: 'Ukraine', pop: 37 },
  PE: { name: 'Peru', pop: 34 },
  BD: { name: 'Bangladesh', pop: 173 },
  MD: { name: 'Moldova', pop: 2.6 },
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString('en-US');
}

/* ─── timezone → country code fallback ─── */
const TZ_TO_COUNTRY: Record<string, string> = {
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA',
  'Europe/London': 'GB', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR',
  'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL',
  'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI', 'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH',
  'Europe/Brussels': 'BE', 'Europe/Dublin': 'IE', 'Europe/Lisbon': 'PT',
  'Europe/Athens': 'GR', 'Europe/Prague': 'CZ', 'Europe/Warsaw': 'PL',
  'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO', 'Europe/Kyiv': 'UA',
  'Europe/Moscow': 'RU', 'Europe/Istanbul': 'TR', 'Asia/Jerusalem': 'IL',
  'Asia/Tel_Aviv': 'IL', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR',
  'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'CN', 'Asia/Kolkata': 'IN',
  'Asia/Singapore': 'SG', 'Asia/Bangkok': 'TH', 'Asia/Jakarta': 'ID',
  'Asia/Manila': 'PH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Kuala_Lumpur': 'MY',
  'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE', 'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE', 'Africa/Johannesburg': 'ZA',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU', 'Pacific/Auckland': 'NZ',
  'America/Sao_Paulo': 'BR', 'America/Argentina/Buenos_Aires': 'AR',
  'America/Mexico_City': 'MX', 'America/Bogota': 'CO', 'America/Santiago': 'CL',
  'America/Lima': 'PE',
};

function detectCountryFromTimezone(): string | undefined {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_TO_COUNTRY[tz];
  } catch {
    return undefined;
  }
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export function AboutBrochure({ countryCode }: { countryCode?: string }) {
  const [resolvedCode, setResolvedCode] = useState(countryCode);

  useEffect(() => {
    if (!resolvedCode) {
      setResolvedCode(detectCountryFromTimezone());
    }
  }, [resolvedCode]);

  const country = resolvedCode ? COUNTRY_POP[resolvedCode] : undefined;
  const estimatedPatients = country ? Math.round(country.pop * 1000) : undefined;
  return (
    <div className="flex flex-col overflow-hidden">
      {/* ══════════ HERO ══════════ */}
      <div className="relative bg-primary-900 text-white">
        {/* decorative blobs */}
        <BlobShape className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 fill-accent-400/8 sm:h-[28rem] sm:w-[28rem]" />
        <BlobShape className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 fill-coral-500/8 sm:h-96 sm:w-96" />
        <DotGrid className="pointer-events-none absolute right-8 bottom-12 h-28 w-28 text-white/20 sm:h-36 sm:w-36" />

        {/* diagonal accent strip */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-accent-600/10"
          style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }}
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 sm:py-28 lg:grid-cols-5 lg:px-8">
          {/* text */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-block rounded-full bg-accent-600/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-300"
            >
              Understanding Duane Syndrome
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl"
            >
              A Rare Eye
              <br />
              Condition.
              <br />
              <span className="text-coral-400">A Full Life&nbsp;Ahead.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-primary-200"
            >
              Duane Syndrome affects how the eye <em>moves</em>, not how it{' '}
              <em>sees</em>. Most people enjoy <strong className="text-white">normal vision</strong> and lead{' '}
              <strong className="text-white">full, active lives</strong>.
            </motion.p>
          </div>

          {/* hero visual — layered circles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative mx-auto hidden lg:col-span-2 lg:flex lg:items-center lg:justify-center"
          >
            <div className="relative h-72 w-72">
              {/* outer ring */}
              <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-accent-400/30" />
              {/* middle ring */}
              <div className="absolute inset-6 rounded-full bg-accent-600/10" />
              {/* inner circle with icon */}
              <div className="absolute inset-14 flex items-center justify-center rounded-full bg-accent-500/20">
                <Eye size={56} className="text-accent-300" />
              </div>
              {/* orbiting small circles */}
              <div className="absolute -right-2 top-8 flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-white shadow-lg">
                <Brain size={22} />
              </div>
              <div className="absolute -left-2 bottom-12 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-800 shadow-lg">
                <Heart size={20} />
              </div>
              <div className="absolute bottom-0 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg">
                <Shield size={16} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* wave transition */}
      <WaveDivider color="var(--color-background)" flip />
      <div className="-mt-[1px] bg-background" />

      {/* ══════════ STATS STRIP ══════════ */}
      <div className="relative -mt-14 z-10 px-4 sm:px-6 lg:px-8">
        <Anim className="mx-auto max-w-5xl">
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 gap-3 rounded-3xl bg-white p-4 shadow-xl ring-1 ring-warm-200 sm:grid-cols-4 sm:gap-4 sm:p-6"
          >
            {/* 1 in 1,000 with dot visualization */}
            <div className="flex flex-col items-center rounded-2xl bg-coral-500/10 px-3 py-5 text-center">
              <span className="text-2xl font-extrabold text-coral-700 sm:text-3xl">
                1 in 1,000
              </span>
              <span className="mt-1 text-xs font-medium text-warm-500">8.3M People worldwide</span>
              <ThousandDots />
              {estimatedPatients && country && (
                <p className="mt-2 text-xs leading-snug text-warm-600">
                  approx. <strong className="text-coral-700">{formatCompact(estimatedPatients)}</strong> people in {country.name}
                </p>
              )}
            </div>

            {[
              { val: '60%', sub: 'Female patients' },
              { val: '72%', sub: 'Left eye affected' },
              { val: '90%', sub: 'Cases sporadic' },
            ].map((s) => (
              <div
                key={s.sub}
                className="flex flex-col items-center rounded-2xl bg-warm-50 px-3 py-5 text-center"
              >
                <span className="text-2xl font-extrabold text-primary-800 sm:text-3xl">
                  {s.val}
                </span>
                <span className="mt-1 text-xs font-medium text-warm-500">{s.sub}</span>
              </div>
            ))}
          </motion.div>
        </Anim>
      </div>

      {/* ══════════ WHAT IS IT — asymmetric ══════════ */}
      <div className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        {/* decorative blob behind */}
        <BlobShape className="pointer-events-none absolute -left-40 top-10 h-96 w-96 fill-accent-200/30" />
        <DotGrid className="pointer-events-none absolute right-10 top-20 h-24 w-24 text-primary-200" />

        <Anim className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          {/* text column */}
          <motion.div variants={fadeRight}>
            <span className="mb-3 inline-block rounded-full bg-primary-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-700">
              The Basics
            </span>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight text-primary-900 sm:text-4xl">
              What is Duane
              <br />
              Syndrome?
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-warm-700">
              Also called <strong>Duane Retraction Syndrome (DRS)</strong>, it
              occurs when the 6th cranial nerve fails to develop during weeks
              4-8 of pregnancy. The 3rd nerve compensates by &ldquo;miswiring&rdquo; to the
              wrong muscle — causing limited movement and eye retraction.
            </p>
            <p className="mt-4 leading-relaxed text-warm-600">
              It&apos;s a <strong className="text-primary-800">nerve wiring problem</strong>, not a muscle problem.
              The eye itself is perfectly healthy — visual acuity is typically normal.
            </p>
          </motion.div>

          {/* visual column — layered cards */}
          <motion.div variants={fadeLeft} className="relative">
            {/* background shape */}
            <div className="absolute -inset-4 -rotate-3 rounded-3xl bg-accent-200/40" aria-hidden="true" />
            <div className="relative grid grid-cols-2 gap-4">
              {/* tall card */}
              <div className="row-span-2 flex flex-col items-center justify-center rounded-2xl bg-primary-900 p-6 text-center text-white">
                <CircleFrame size="md" color="accent">
                  <Brain size={32} className="text-accent-700" />
                </CircleFrame>
                <h3 className="mt-4 text-lg font-bold">Nerve Miswiring</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-200">
                  The 6th cranial nerve doesn&apos;t develop. The 3rd nerve sends signals to the wrong muscle.
                </p>
              </div>
              {/* top right */}
              <div className="flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-warm-200">
                <CircleFrame size="sm" color="coral">
                  <Eye size={22} className="text-coral-700" />
                </CircleFrame>
                <h3 className="mt-3 text-sm font-bold text-primary-900">Eye Retraction</h3>
                <p className="mt-1 text-xs leading-relaxed text-warm-500">
                  Both muscles contract, pulling the eye back into the socket.
                </p>
              </div>
              {/* bottom right */}
              <div className="flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-warm-200">
                <CircleFrame size="sm" color="primary">
                  <Shield size={22} className="text-primary-700" />
                </CircleFrame>
                <h3 className="mt-3 text-sm font-bold text-primary-900">Vision Intact</h3>
                <p className="mt-1 text-xs leading-relaxed text-warm-500">
                  The eye is healthy. The issue is movement, not sight.
                </p>
              </div>
            </div>
          </motion.div>
        </Anim>
      </div>

      {/* ══════════ THREE TYPES — with donut chart ══════════ */}
      <div className="relative">
        <WaveDivider color="var(--color-primary-900)" />
        <div className="relative bg-primary-900 px-4 pb-20 pt-8 text-white sm:px-6 lg:px-8">
          <DotGrid className="pointer-events-none absolute left-6 top-16 h-28 w-28 text-white/10" />
          <BlobShape className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 fill-coral-500/5" />

          <Anim className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-5">
            {/* donut chart */}
            <motion.div
              variants={scaleIn}
              className="flex flex-col items-center lg:col-span-2"
            >
              <DonutChart />
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary-700" />
                  Type 1 — 78%
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-coral-500" />
                  Type 3 — 15%
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-accent-600" />
                  Type 2 — 7%
                </span>
              </div>
            </motion.div>

            {/* type details */}
            <div className="space-y-5 lg:col-span-3">
              <motion.h2 variants={fadeUp} className="text-3xl font-extrabold sm:text-4xl">
                The Three Types
              </motion.h2>

              {[
                {
                  type: 'Type 1',
                  pct: '78%',
                  color: 'bg-primary-500',
                  ring: 'ring-primary-400/30',
                  desc: 'Limited outward movement — the most common. Eye has difficulty moving toward the ear.',
                },
                {
                  type: 'Type 2',
                  pct: '7%',
                  color: 'bg-accent-500',
                  ring: 'ring-accent-400/30',
                  desc: 'Limited inward movement — the rarest. Eye has difficulty moving toward the nose.',
                },
                {
                  type: 'Type 3',
                  pct: '15%',
                  color: 'bg-coral-500',
                  ring: 'ring-coral-400/30',
                  desc: 'Limited both directions. Horizontal movement restricted in all directions.',
                },
              ].map((t) => (
                <motion.div
                  key={t.type}
                  variants={fadeUp}
                  className={`flex items-start gap-4 rounded-2xl bg-white/5 p-5 ring-1 ${t.ring}`}
                >
                  <div className={`mt-0.5 h-10 w-10 shrink-0 rounded-full ${t.color} flex items-center justify-center text-sm font-extrabold text-white`}>
                    {t.pct}
                  </div>
                  <div>
                    <h3 className="font-bold">{t.type}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-primary-200">{t.desc}</p>
                  </div>
                </motion.div>
              ))}

              <motion.p variants={fadeUp} className="text-xs text-primary-300">
                All types share the hallmark: eyeball retraction and eyelid narrowing on inward gaze.
              </motion.p>

              <motion.div variants={fadeUp}>
                <Link
                  href="/about/types"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-coral-400 transition-colors hover:text-coral-300"
                >
                  Learn more about the types
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>
          </Anim>
        </div>
        <WaveDivider color="var(--color-background)" flip />
      </div>

      {/* ══════════ SYMPTOMS — magazine layout ══════════ */}
      <div className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <BlobShape className="pointer-events-none absolute -right-28 top-0 h-80 w-80 fill-coral-100/50" />

        <Anim className="relative mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="mb-12 flex items-end gap-4">
            <div>
              <span className="mb-2 inline-block rounded-full bg-coral-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-coral-700">
                Symptoms
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-primary-900 sm:text-4xl">
                What People Notice
              </h2>
            </div>
          </motion.div>

          {/* bento grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* large tile */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl bg-primary-900 p-8 text-white sm:col-span-2 lg:col-span-1 lg:row-span-2"
            >
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent-500/10" aria-hidden="true" />
              <CircleFrame size="lg" color="accent">
                <Eye size={40} className="text-accent-700" />
              </CircleFrame>
              <h3 className="mt-6 text-xl font-bold">Limited Eye Movement</h3>
              <p className="mt-3 leading-relaxed text-primary-200">
                Difficulty moving the eye in one or more directions. Most noticeable when looking sideways. The degree varies — some have subtle limitation, others more pronounced.
              </p>
            </motion.div>

            {/* standard tiles */}
            {[
              {
                icon: Activity,
                title: 'Globe Retraction',
                desc: 'The eyeball visibly pulls back into the socket when looking inward, narrowing the eyelid — the signature feature.',
                bg: 'bg-accent-50',
                iconBg: 'bg-accent-200 text-accent-700',
              },
              {
                icon: Zap,
                title: 'Upshoot / Downshoot',
                desc: 'The eye may jump up or down during certain movements, caused by co-contraction of muscles.',
                bg: 'bg-coral-50',
                iconBg: 'bg-coral-200 text-coral-700',
              },
              {
                icon: Sparkles,
                title: 'Compensatory Head Turn',
                desc: "A subtle head tilt to maintain alignment. It's the brain's smart workaround — not a problem to correct.",
                bg: 'bg-primary-50',
                iconBg: 'bg-primary-200 text-primary-700',
              },
              {
                icon: Eye,
                title: 'Eyelid Narrowing',
                desc: 'The eye opening narrows when looking inward as the eyeball retracts, sometimes described as a partial wink.',
                bg: 'bg-warm-50',
                iconBg: 'bg-warm-200 text-warm-700',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className={`flex gap-4 rounded-2xl ${item.bg} p-6 ring-1 ring-warm-200/50`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                  <item.icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-warm-600">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Anim>
      </div>

      {/* ══════════ KEY FACTS — tiled infographic strip ══════════ */}
      <div className="relative bg-accent-200/30">
        <WaveDivider color="rgb(209 232 226 / 0.3)" />
        <div className="-mt-[1px] bg-accent-200/30 px-4 pb-20 pt-4 sm:px-6 lg:px-8">
          <DotGrid className="pointer-events-none absolute right-12 top-8 h-24 w-24 text-accent-600/20" />

          <Anim className="relative mx-auto max-w-6xl">
            <motion.h2
              variants={fadeUp}
              className="mb-12 text-center text-3xl font-extrabold text-primary-900 sm:text-4xl"
            >
              Key Facts at a Glance
            </motion.h2>

            {/* mosaic tiles */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* wide tile */}
              <motion.div
                variants={fadeUp}
                className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-warm-200 sm:col-span-2"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-100/50" aria-hidden="true" />
                <div className="relative flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <Brain size={28} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-900">Present at Birth</h3>
                    <p className="mt-1 text-sm leading-relaxed text-warm-600">
                      Develops during weeks 4-8 of pregnancy. Congenital and non-progressive — it never gets worse over time.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* small tiles */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col items-center justify-center rounded-2xl bg-primary-900 p-6 text-center text-white"
              >
                <span className="text-4xl font-extrabold">80%</span>
                <span className="mt-1 text-sm text-primary-200">Unilateral</span>
                <span className="mt-1 text-xs text-primary-300">One eye only</span>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex flex-col items-center justify-center rounded-2xl bg-coral-500 p-6 text-center text-white"
              >
                <span className="text-4xl font-extrabold">1-5%</span>
                <span className="mt-1 text-sm text-coral-100">of Strabismus</span>
                <span className="mt-1 text-xs text-coral-200">Cases worldwide</span>
              </motion.div>

              {/* another wide tile */}
              <motion.div
                variants={fadeUp}
                className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-warm-200 sm:col-span-2"
              >
                <div className="pointer-events-none absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-accent-100/60" aria-hidden="true" />
                <div className="relative flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                    <Sparkles size={28} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-900">Smart Adaptation</h3>
                    <p className="mt-1 text-sm leading-relaxed text-warm-600">
                      The brain naturally develops a compensatory head turn to maintain binocular vision — a brilliant, healthy adaptation.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex flex-col items-center justify-center rounded-2xl bg-accent-600 p-6 text-center text-white"
              >
                <span className="text-4xl font-extrabold">90%</span>
                <span className="mt-1 text-sm text-accent-100">Sporadic</span>
                <span className="mt-1 text-xs text-accent-200">No family history</span>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-warm-200"
              >
                <span className="text-4xl font-extrabold text-primary-800">~10%</span>
                <span className="mt-1 text-sm text-warm-600">Inherited</span>
                <span className="mt-1 text-xs text-warm-400">Genetic pattern (CHN1)</span>
              </motion.div>
            </div>
          </Anim>
        </div>
      </div>

      {/* ══════════ TREATMENTS — split layout ══════════ */}
      <div className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <BlobShape className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 fill-primary-100/40" />

        <Anim className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* left panel */}
            <motion.div variants={fadeRight} className="lg:col-span-2">
              <span className="mb-3 inline-block rounded-full bg-accent-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent-700">
                Treatment
              </span>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-primary-900 sm:text-4xl">
                Management
                <br />
                Options
              </h2>
              <p className="mt-5 leading-relaxed text-warm-600">
                While the nerve cannot be repaired, several effective strategies help people thrive with Duane Syndrome.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/about/treatments"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
                >
                  Treatments
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/specialists"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-5 py-2 text-sm font-semibold text-accent-700 transition-colors hover:bg-accent-200"
                >
                  Find a Specialist
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* success stat */}
              <div className="mt-8 rounded-2xl bg-primary-900 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-coral-500">
                    <Scissors size={24} />
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold">79-100%</span>
                    <p className="mt-1 text-sm text-primary-200">Surgery success rate in eliminating abnormal head position</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* right — treatment cards */}
            <div className="space-y-4 lg:col-span-3">
              {[
                {
                  icon: Stethoscope,
                  title: 'Observation',
                  desc: 'Many mild cases need no intervention. Regular monitoring by an ophthalmologist is often sufficient.',
                  color: 'bg-accent-100 text-accent-700',
                  num: '01',
                },
                {
                  icon: Glasses,
                  title: 'Prism Glasses',
                  desc: 'Improved abnormal head posture in 42% of patients completely and 58% to an acceptable level.',
                  color: 'bg-primary-100 text-primary-700',
                  num: '02',
                },
                {
                  icon: Scissors,
                  title: 'Surgery',
                  desc: 'Medial rectus recession, Y-splitting, or vertical transposition. Recommended for significant head turns or misalignment.',
                  color: 'bg-coral-100 text-coral-700',
                  num: '03',
                },
                {
                  icon: Heart,
                  title: 'Supportive Care',
                  desc: 'Strategic classroom seating, patching for amblyopia, and vision therapy for daily comfort.',
                  color: 'bg-accent-100 text-accent-700',
                  num: '04',
                },
              ].map((t) => (
                <motion.div
                  key={t.title}
                  variants={fadeLeft}
                  className="group flex items-start gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-warm-200 transition-shadow hover:shadow-md"
                >
                  <div className="relative">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${t.color}`}>
                      <t.icon size={24} aria-hidden="true" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-900 text-[10px] font-bold text-white">
                      {t.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-900">{t.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-warm-600">{t.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Anim>
      </div>

      {/* ══════════ DID YOU KNOW — ribbon ══════════ */}
      <div className="relative">
        <WaveDivider color="var(--color-coral-50)" />
        <div className="-mt-[1px] bg-coral-50 px-4 pb-20 pt-4 sm:px-6 lg:px-8">
          <DotGrid className="pointer-events-none absolute left-8 bottom-12 h-20 w-20 text-coral-300/30" />

          <Anim className="relative mx-auto max-w-6xl">
            <motion.h2
              variants={fadeUp}
              className="mb-10 text-center text-3xl font-extrabold text-primary-900 sm:text-4xl"
            >
              Did You Know?
            </motion.h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { text: 'The eye literally retracts into the skull when looking inward — one of the most distinctive features of any eye condition.', color: 'border-l-primary-600' },
                { text: "It's a wiring problem, not a muscle problem — nerve signals go to the wrong muscle, like crossed electrical wires.", color: 'border-l-accent-600' },
                { text: 'The compensatory head turn is actually brilliant — the brain figures out the optimal position for binocular vision.', color: 'border-l-coral-500' },
                { text: "72% of cases affect the left eye. Scientists still don't fully understand why.", color: 'border-l-primary-600' },
                { text: 'First described by 3 doctors across 3 countries over 18 years: Germany (1887), Germany (1896), USA (1905).', color: 'border-l-accent-600' },
                { text: "Surgery repositions muscles to work around the problem — like rerouting a road around a broken bridge.", color: 'border-l-coral-500' },
              ].map((fact, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`rounded-xl border-l-4 ${fact.color} bg-white p-5 shadow-sm`}
                >
                  <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-900 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-warm-700">{fact.text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-8 text-center">
              <Link
                href="/about/faq"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary-800 shadow-sm ring-1 ring-warm-200 transition-all hover:shadow-md hover:ring-coral-300"
              >
                <HelpCircle size={16} />
                More questions? Visit our FAQ
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </Anim>
        </div>
      </div>

      {/* ══════════ LIVING WELL — full-bleed split ══════════ */}
      <div className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <BlobShape className="pointer-events-none absolute -right-24 -top-10 h-80 w-80 fill-accent-200/30" />

        <Anim className="relative mx-auto max-w-6xl">
          <div className="grid overflow-hidden rounded-3xl shadow-lg ring-1 ring-warm-200 lg:grid-cols-5">
            {/* colored side panel */}
            <div className="relative bg-accent-600 p-8 text-white lg:col-span-2 lg:p-10">
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
              <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10" aria-hidden="true" />
              <motion.div variants={fadeRight} className="relative">
                <h2 className="text-3xl font-extrabold leading-tight">
                  Living Well
                  <br />
                  with DS
                </h2>
                <p className="mt-5 leading-relaxed text-accent-100">
                  Most people maintain <strong className="text-white">excellent vision</strong> and lead completely normal, active lives.
                </p>
                <p className="mt-3 leading-relaxed text-accent-100">
                  The condition is non-progressive — it will <strong className="text-white">never get worse</strong>. Children adapt remarkably well.
                </p>
                <Link
                  href="/life-hacks"
                  className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/30"
                >
                  Explore Life Hacks
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>

            {/* tips panel */}
            <div className="bg-white p-8 lg:col-span-3 lg:p-10">
              <motion.div variants={fadeLeft}>
                <h3 className="text-xl font-bold text-primary-900">Tips for Parents & Teachers</h3>
                <div className="mt-6 space-y-4">
                  {[
                    { tip: 'Seat children where they can see without straining', detail: 'Position them to minimize head turning toward the affected side.' },
                    { tip: "Don't try to \"correct\" the head turn", detail: "It's a healthy adaptation that helps maintain binocular vision." },
                    { tip: 'Talk about it openly and normalize it', detail: 'Kids who understand their condition feel more confident.' },
                    { tip: 'Encourage all normal activities', detail: 'Sports, bikes, swimming — DS does not limit what kids can do.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-primary-900">{item.tip}</p>
                        <p className="mt-0.5 text-sm text-warm-500">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </Anim>
      </div>

    </div>
  );
}
