'use client';

import { useRef, useState } from 'react';

export interface FeaturedAdvocate {
  _id: string;
  name: string;
  tags?: string[];
  bio?: string;
  videoUrl: string;
  directVideoUrl?: string;
  thumbnailUrl?: string;
  socialLinks?: { platform: string; url: string; followers?: string }[];
}

const CARD_W = 325;
const SCROLL_STEP = CARD_W + 16;

function AdvocateCard({ advocate }: { advocate: FeaturedAdvocate }) {
  const [activated, setActivated] = useState(false);

  if (!advocate.videoUrl) return null;

  return (
    <div className="w-[325px] flex-shrink-0">
      {activated ? (
        <iframe
          src={advocate.videoUrl}
          width={325}
          height={750}
          className="rounded-xl border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`Video featuring ${advocate.name}`}
        />
      ) : (
        <button
          onClick={() => setActivated(true)}
          className="group relative h-[750px] w-[325px] overflow-hidden rounded-xl bg-black"
        >
          {/* Thumbnail */}
          {advocate.thumbnailUrl && (
            <img
              src={advocate.thumbnailUrl}
              alt={advocate.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/40 p-5 backdrop-blur-sm transition-transform group-hover:scale-110">
              <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Bottom gradient with name */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-16">
            <p className="text-base font-bold text-white drop-shadow-sm">{advocate.name}</p>
            {advocate.tags && advocate.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {advocate.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white/90">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </button>
      )}
    </div>
  );
}

export function AdvocateCarousel({ advocates, trailing }: { advocates: FeaturedAdvocate[]; trailing?: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -SCROLL_STEP : SCROLL_STEP, behavior: 'smooth' });
  }

  return (
    <div>
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
