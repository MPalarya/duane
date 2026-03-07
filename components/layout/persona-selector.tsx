'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type Persona, getPersona, setPersona } from '@/lib/persona';

const personas: { key: Persona; emoji: string; label: string; desc: string; href: string }[] = [
  { key: 'patient', emoji: '🌟', label: 'A person with Duane Syndrome', desc: 'Tips, community, and tools for living your best life', href: '/about' },
  { key: 'parent', emoji: '💙', label: 'A parent or caregiver', desc: 'Guidance, specialists, and support for your child', href: '/about' },
  { key: 'friend', emoji: '🤝', label: 'A friend, family member, or educator', desc: 'Understand Duane Syndrome and how to be supportive', href: '/about' },
];

export function PersonaSelector() {
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
      {personas.map(({ key, emoji, label, desc, href }) => (
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
            {label}
          </h3>
          <p className="mt-2 text-sm text-warm-500">
            {desc}
          </p>
        </button>
      ))}
    </div>
  );
}
