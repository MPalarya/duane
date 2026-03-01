'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { Sparkles, ThumbsUp, MessageSquare } from 'lucide-react';
import { seedHackOfWeek } from '@/lib/seed-data';

export function HackWidget() {
  const t = useTranslations('home.hackOfWeek');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [upvoted, setUpvoted] = useState(false);

  const hack = seedHackOfWeek;
  const voteCount = upvoted ? hack.upvotes + 1 : hack.upvotes;

  return (
    <section ref={ref} className="px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl rounded-xl border-2 border-coral-400 bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="mb-4 flex items-center gap-2 text-coral-600">
          <Sparkles size={22} aria-hidden="true" />
          <span className="text-sm font-bold uppercase tracking-wide">
            {t('label')}
          </span>
        </div>

        <h3 className="text-xl font-bold text-primary-900">{hack.title}</h3>
        <p className="mt-2 text-warm-600">{hack.content}</p>
        <p className="mt-3 text-sm text-warm-500">
          {t('submittedBy')} <span className="font-medium">{hack.author}</span>
        </p>

        <div className="mt-5 flex items-center gap-5 border-t border-warm-200 pt-4">
          <button
            onClick={() => setUpvoted(!upvoted)}
            aria-pressed={upvoted}
            aria-label={upvoted ? t('removeUpvote') : t('upvote')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              upvoted
                ? 'bg-coral-100 text-coral-700'
                : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
            }`}
          >
            <ThumbsUp size={16} aria-hidden="true" />
            {voteCount}
          </button>

          <div className="inline-flex items-center gap-1.5 text-sm text-warm-500">
            <MessageSquare size={16} aria-hidden="true" />
            {t('commentCount', { count: hack.comments.length })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
