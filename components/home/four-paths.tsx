'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { HelpCircle, FlaskConical, MessageCircle, Lightbulb } from 'lucide-react';

const cards = [
  { title: 'Understand', desc: 'Learn about types, causes, and treatments of Duane Syndrome', icon: HelpCircle, href: '/about' },
  { title: 'Research', desc: 'Explore the latest scientific studies with AI-powered summaries', icon: FlaskConical, href: '/research' },
  { title: 'Connect', desc: 'Join a global community of patients, parents, and allies', icon: MessageCircle, href: '/community' },
  { title: 'Thrive', desc: 'Discover daily tips and life hacks from people who get it', icon: Lightbulb, href: '/life-hacks' },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FourPaths() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-3xl font-bold text-primary-900">
          Your Path Starts Here
        </h2>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid gap-6 sm:grid-cols-2"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.title} variants={cardVariants}>
                <Link
                  href={card.href}
                  className="group flex items-start gap-4 rounded-xl border border-warm-300 bg-card p-6 transition-all hover:border-coral-400 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700 transition-transform group-hover:scale-110">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 group-hover:text-coral-700">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-warm-600">
                      {card.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
