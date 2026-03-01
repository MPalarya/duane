'use client';

import { motion, useMotionValue, useAnimationFrame, animate } from 'motion/react';
import { useRef, useState, useMemo, useCallback } from 'react';

interface SocialLink {
  platform: string;
  url: string;
  followers?: string;
}

export interface FeaturedAdvocate {
  _id: string;
  name: string;
  tags?: string[];
  bio?: string;
  videoUrl: string;
  socialLinks?: SocialLink[];
}

const SPEED = 0.2; // pixels per frame
const CARD_WIDTH = 300;
const GAP = 24;
const SCROLL_STEP = CARD_WIDTH + GAP; // 324px per card

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getOriginalVideoUrl(embedUrl: string): string {
  const tiktokMatch = embedUrl.match(/tiktok\.com\/embed\/v2\/(\d+)/);
  if (tiktokMatch) return `https://www.tiktok.com/video/${tiktokMatch[1]}`;

  const igMatch = embedUrl.match(/instagram\.com\/reel\/([^/]+)\/embed/);
  if (igMatch) return `https://www.instagram.com/reel/${igMatch[1]}/`;

  return embedUrl;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/*  Platform icons                                                    */
/* ------------------------------------------------------------------ */

const platformConfig: Record<string, { label: string; icon: React.ReactNode; bg: string }> = {
  instagram: {
    label: 'Instagram',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    bg: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  tiktok: {
    label: 'TikTok',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" />
      </svg>
    ),
    bg: 'bg-black',
  },
  youtube: {
    label: 'YouTube',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    bg: 'bg-red-600',
  },
  twitter: {
    label: 'X',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    bg: 'bg-black',
  },
};

/* ------------------------------------------------------------------ */
/*  Card                                                              */
/* ------------------------------------------------------------------ */

function AdvocateCard({ advocate }: { advocate: FeaturedAdvocate }) {
  const videoLink = getOriginalVideoUrl(advocate.videoUrl);

  return (
    <div className="w-[300px] flex-shrink-0 overflow-hidden rounded-xl border border-warm-200 bg-card shadow-sm">
      {/* Video — iframe is visual-only; play button opens original video */}
      <div className="relative bg-warm-50">
        <iframe
          src={advocate.videoUrl}
          className="pointer-events-none h-[400px] w-full border-0"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
          title={`Video featuring ${advocate.name}`}
        />
        <a
          href={videoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center transition-colors hover:bg-black/10"
          aria-label={`Watch ${advocate.name}'s video`}
        >
          <span className="rounded-full bg-white/90 p-3 shadow-lg transition-transform hover:scale-110">
            <svg className="h-6 w-6 text-warm-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </a>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-warm-900">{advocate.name}</h3>

        {/* Tags — badge with bullet */}
        {advocate.tags && advocate.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {advocate.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-warm-200 bg-warm-50 px-2.5 py-0.5 text-xs font-medium text-warm-600"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Social links — icon + follower count */}
        {advocate.socialLinks && advocate.socialLinks.length > 0 && (
          <div className="mt-3 flex items-center gap-3">
            {advocate.socialLinks.map((link) => {
              const cfg = platformConfig[link.platform];
              if (!cfg) return null;
              return (
                <a
                  key={link.url}
                  href={`${link.url}${link.url.includes('?') ? '&' : '?'}utm_source=duane-portal&utm_medium=spotlight`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={cfg.label}
                  className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-white ${cfg.bg}`}
                  >
                    {cfg.icon}
                  </span>
                  {link.followers && (
                    <span className="text-xs font-medium text-warm-400">
                      {link.followers}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Arrow button                                                      */
/* ------------------------------------------------------------------ */

function ArrowButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      className="absolute top-1/2 z-20 -translate-y-1/2 rounded-full border border-warm-200 bg-white/90 p-2 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
      style={{ [direction === 'left' ? 'left' : 'right']: '0.5rem' }}
    >
      <svg
        className="h-5 w-5 text-warm-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === 'left' ? (
          <path d="M15 18l-6-6 6-6" />
        ) : (
          <path d="M9 18l6-6-6-6" />
        )}
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Carousel                                                          */
/* ------------------------------------------------------------------ */

export function AdvocateCarousel({ advocates }: { advocates: FeaturedAdvocate[] }) {
  const shuffled = useMemo(() => shuffle(advocates), [advocates]);
  const duplicated = useMemo(() => [...shuffled, ...shuffled], [shuffled]);

  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll
  useAnimationFrame(() => {
    if (isPaused || !containerRef.current) return;

    const halfWidth = containerRef.current.scrollWidth / 2;
    if (halfWidth === 0) return;

    let next = x.get() - SPEED;
    if (Math.abs(next) >= halfWidth) next = 0;
    x.set(next);
  });

  // Arrow navigation — smooth scroll by one card
  const scrollByCards = useCallback(
    (direction: 1 | -1) => {
      const el = containerRef.current;
      if (!el) return;
      const half = el.scrollWidth / 2;
      if (half === 0) return;

      let current = x.get();
      let target = current + direction * SCROLL_STEP;

      // If we'd go past the boundary, silently hop to the duplicate zone first
      if (target > 0) {
        current -= half;
        x.set(current);
        target = current + direction * SCROLL_STEP;
      } else if (target < -half) {
        current += half;
        x.set(current);
        target = current + direction * SCROLL_STEP;
      }

      animate(x, target, { duration: 0.35, ease: 'easeInOut' });
    },
    [x],
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation arrows */}
      <ArrowButton direction="left" onClick={() => scrollByCards(1)} />
      <ArrowButton direction="right" onClick={() => scrollByCards(-1)} />

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#F9F7F2] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#F9F7F2] to-transparent" />

      <div className="overflow-hidden">
        <motion.div
          ref={containerRef}
          className="flex gap-6"
          style={{ x }}
        >
          {duplicated.map((advocate, i) => (
            <AdvocateCard key={`${advocate._id}-${i}`} advocate={advocate} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
