'use client';

import { Fragment, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { platformConfig } from './platform-icons';

export interface FeaturedAdvocate {
  _id: string;
  name: string;
  tags?: string[];
  bio?: string;
  videoUrl: string;
  directVideoUrl?: string;
  thumbnailUrl?: string;
  socialLinks?: { platform: string; url: string; followers?: string }[];
  additionalVideos?: { videoUrl: string; thumbnailUrl?: string }[];
}

const CARD_W = 325;
const GAP = 16;
const SCROLL_STEP = CARD_W + GAP;

/* ------------------------------------------------------------------ */
/*  Single video card                                                  */
/* ------------------------------------------------------------------ */

function AdvocateCard({
  advocate,
  showMeta = true,
  extraCount = 0,
  isExpanded,
  onToggleExpand,
}: {
  advocate: FeaturedAdvocate;
  showMeta?: boolean;
  extraCount?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
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
          className="group relative h-[750px] w-[325px] overflow-hidden rounded-xl bg-black text-left"
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

          {/* Bottom gradient with metadata */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-24">
            <p className="text-base font-bold text-white drop-shadow-sm">{advocate.name}</p>

            {/* Bio (main cards only) */}
            {showMeta && advocate.bio && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/80">
                {advocate.bio}
              </p>
            )}

            {/* Tags */}
            {showMeta && advocate.tags && advocate.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {advocate.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Social links with follower counts */}
            {showMeta && advocate.socialLinks && advocate.socialLinks.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {advocate.socialLinks.map((link) => {
                  const config = platformConfig[link.platform];
                  if (!config) return null;
                  return (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white/90 backdrop-blur-sm transition-colors hover:bg-white/30"
                      onClick={(e) => e.stopPropagation()}
                      title={`${config.label}${link.followers ? ` - ${link.followers} followers` : ''}`}
                    >
                      <span className="text-white [&_svg]:h-3 [&_svg]:w-3">{config.icon}</span>
                      {link.followers && <span>{link.followers}</span>}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Show more / less toggle */}
            {showMeta && extraCount > 0 && onToggleExpand && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
                className="mt-2.5 flex items-center gap-1.5 rounded-full bg-primary-500/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-primary-500"
              >
                {isExpanded ? (
                  <>
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Show less
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    +{extraCount} more video{extraCount > 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Carousel                                                           */
/* ------------------------------------------------------------------ */

export function AdvocateCarousel({
  advocates,
  trailing,
}: {
  advocates: FeaturedAdvocate[];
  trailing?: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleToggle(advocateId: string) {
    setExpandedId((prev) => (prev === advocateId ? null : advocateId));
  }

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -SCROLL_STEP : SCROLL_STEP,
      behavior: 'smooth',
    });
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
        {advocates.map((advocate) => {
          const extras = advocate.additionalVideos ?? [];
          const isExpanded = expandedId === advocate._id;

          return (
            <Fragment key={advocate._id}>
              <AdvocateCard
                advocate={advocate}
                showMeta
                extraCount={extras.length}
                isExpanded={isExpanded}
                onToggleExpand={() => handleToggle(advocate._id)}
              />
              <AnimatePresence>
                {isExpanded &&
                  extras.map((video, i) => (
                    <motion.div
                      key={`${advocate._id}-extra-${i}`}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: CARD_W, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        delay: i * 0.08,
                      }}
                      className="flex-shrink-0 overflow-hidden"
                    >
                      <AdvocateCard
                        advocate={{
                          ...advocate,
                          videoUrl: video.videoUrl,
                          thumbnailUrl: video.thumbnailUrl,
                        }}
                        showMeta={false}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
