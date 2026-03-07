'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { seedSpotlightPeople } from '@/lib/seed-data';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export function WallOfStars() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const people = seedSpotlightPeople;

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-br from-primary-900 to-primary-800 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-3xl font-bold text-white">
          Wall of Stars
        </h2>

        <div className="relative">
          {/* Scroll buttons */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute start-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute end-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>

          <motion.div
            ref={scrollRef}
            role="list"
            aria-label="Community spotlight carousel"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="scrollbar-hide flex gap-6 overflow-x-auto scroll-smooth px-10 snap-x snap-mandatory"
          >
            {people.map((person) => (
              <motion.div
                key={person._id}
                role="listitem"
                variants={itemVariants}
                className="w-72 shrink-0 snap-center rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="mb-1 text-sm font-medium text-coral-400">
                  {person.profession}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {person.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-warm-300">
                  {person.bio}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
