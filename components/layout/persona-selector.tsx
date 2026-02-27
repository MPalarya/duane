'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { type Persona, getPersona, setPersona } from '@/lib/persona';

const personas: { key: Persona; emoji: string; href: string }[] = [
  { key: 'patient', emoji: '🌟', href: '/about' },
  { key: 'parent', emoji: '💙', href: '/about' },
  { key: 'friend', emoji: '🤝', href: '/about' },
];

export function PersonaSelector() {
  const t = useTranslations('home.persona');
  const router = useRouter();
  const [selected, setSelected] = useState<Persona | null>(null);

  useEffect(() => {
    setSelected(getPersona());
  }, []);

  function handleSelect(persona: Persona, href: string) {
    setPersona(persona);
    setSelected(persona);
    router.push(href);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {personas.map(({ key, emoji, href }) => (
        <button
          key={key}
          onClick={() => handleSelect(key, href)}
          className={`group rounded-xl border p-6 text-center transition-all hover:shadow-lg ${
            selected === key
              ? 'border-primary-400 bg-primary-50 shadow-md'
              : 'border-warm-200 bg-card hover:border-primary-300'
          }`}
        >
          <span className="text-4xl" role="img">
            {emoji}
          </span>
          <h3 className="mt-3 text-lg font-semibold text-warm-800 group-hover:text-primary-700">
            {t(key)}
          </h3>
          <p className="mt-2 text-sm text-warm-500">
            {t(`${key}Desc`)}
          </p>
        </button>
      ))}
    </div>
  );
}
