'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { motion, useInView } from 'framer-motion';
import { HelpCircle, FlaskConical, MessageCircle, Lightbulb } from 'lucide-react';

const cards = [
  { key: 'understand', icon: HelpCircle, href: '/about' as const },
  { key: 'research', icon: FlaskConical, href: '/research' as const },
  { key: 'connect', icon: MessageCircle, href: '/community' as const },
  { key: 'thrive', icon: Lightbulb, href: '/life-hacks' as const },
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
  const t = useTranslations('home.paths');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-3xl font-bold text-primary-900">
          {t('title')}
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
              <motion.div key={card.key} variants={cardVariants}>
                <Link
                  href={card.href}
                  className="group flex items-start gap-4 rounded-xl border border-warm-300 bg-card p-6 transition-all hover:border-coral-400 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700 transition-transform group-hover:scale-110">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 group-hover:text-coral-700">
                      {t(`${card.key}.title`)}
                    </h3>
                    <p className="mt-1 text-warm-600">
                      {t(`${card.key}.desc`)}
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
