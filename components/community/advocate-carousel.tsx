'use client';

import { useRef } from 'react';
import { platformConfig } from './platform-icons';

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

const CARD_WIDTH = 300;
const GAP = 16;
const SCROLL_STEP = CARD_WIDTH + GAP;

function AdvocateCard({ advocate }: { advocate: FeaturedAdvocate }) {
  const isTikTok = advocate.videoUrl.includes('tiktok.com');

  return (
    <div className="w-[300px] flex-shrink-0 overflow-hidden rounded-xl border border-warm-200 bg-card shadow-sm">
      {/* Uniform video container — clips each platform's embed to a consistent height */}
      <div className="relative h-[540px] overflow-hidden bg-warm-50">
        <iframe
          src={advocate.videoUrl}
          className={`absolute inset-x-0 top-0 w-full border-0 ${
            isTikTok ? 'h-[740px]' : 'h-[640px]'
          }`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={`Video featuring ${advocate.name}`}
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-warm-900">{advocate.name}</h3>

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

        {advocate.socialLinks && advocate.socialLinks.length > 0 && (
          <div className="mt-3 flex items-center gap-3">
            {advocate.socialLinks.map((link) => {
              const cfg = platformConfig[link.platform];
              if (!cfg) return null;
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={cfg.label}
                  className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                >
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-white ${cfg.bg}`}>
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

export function AdvocateCarousel({ advocates, trailing }: { advocates: FeaturedAdvocate[]; trailing?: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return;
    const delta = direction === 'left' ? -SCROLL_STEP : SCROLL_STEP;
    scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  }

  return (
    <div>
      {/* Controls row — arrows + optional trailing element */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => scroll('left')}
          aria-label="Previous"
          className="rounded-full border border-warm-200 bg-white p-1.5 shadow-sm transition-colors hover:bg-warm-50"
        >
          <svg className="h-4 w-4 text-warm-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="Next"
          className="rounded-full border border-warm-200 bg-white p-1.5 shadow-sm transition-colors hover:bg-warm-50"
        >
          <svg className="h-4 w-4 text-warm-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        {trailing}
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth"
      >
        {advocates.map((advocate) => (
          <AdvocateCard key={advocate._id} advocate={advocate} />
        ))}
      </div>
    </div>
  );
}
