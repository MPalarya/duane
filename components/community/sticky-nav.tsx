'use client';

import { useEffect, useState, useRef } from 'react';

const sections = [
  { id: 'spotlights', label: 'Advocates' },
  { id: 'stories', label: 'Blog' },
  { id: 'note-board', label: 'Note Board' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'groups', label: 'Groups' },
] as const;

export function StickyNav() {
  const [active, setActive] = useState<string>('spotlights');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );

    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      ref={navRef}
      className="sticky top-16 z-30 -mx-4 border-b border-warm-200 bg-background/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <div className="scrollbar-hide flex gap-1 overflow-x-auto py-3">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === s.id
                ? 'bg-primary-600 text-white'
                : 'text-warm-500 hover:bg-warm-200 hover:text-warm-700'
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
