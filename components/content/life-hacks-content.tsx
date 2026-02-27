'use client';

import { useState, useEffect } from 'react';
import { type Persona, getPersona } from '@/lib/persona';

interface TipCategory {
  title: string;
  icon: string;
  tips: {
    text: string;
    personas: Persona[];
  }[];
}

const categories: TipCategory[] = [
  {
    title: 'School & Education',
    icon: '🏫',
    tips: [
      { text: 'Ask to sit on the side of the classroom that lets you use your head turn naturally — not in the center.', personas: ['patient', 'parent'] },
      { text: 'Talk to the teacher early about head positioning. A brief note explaining Duane Syndrome helps.', personas: ['parent'] },
      { text: 'If a child with Duane Syndrome sits with their head turned, they\'re compensating — don\'t ask them to "look straight ahead."', personas: ['friend'] },
      { text: 'For exams, request to sit where you can see the board comfortably with your natural head position.', personas: ['patient'] },
      { text: 'Prepare a simple one-sentence explanation: "I have a rare eye condition that limits how my eye moves, but it doesn\'t affect my vision."', personas: ['patient', 'parent'] },
    ],
  },
  {
    title: 'Driving',
    icon: '🚗',
    tips: [
      { text: 'Most people with Duane Syndrome can drive! You may need to turn your head more when checking mirrors or blind spots.', personas: ['patient'] },
      { text: 'Practice extra mirror checks and head turns during driving lessons.', personas: ['patient'] },
      { text: 'Consider adding wider mirrors to reduce blind spots.', personas: ['patient'] },
      { text: 'Check your country\'s vision requirements for driving — most people with Duane Syndrome meet them easily.', personas: ['patient', 'parent'] },
    ],
  },
  {
    title: 'Sports & Activities',
    icon: '⚽',
    tips: [
      { text: 'Most sports are perfectly compatible with Duane Syndrome. Don\'t let anyone tell you otherwise!', personas: ['patient', 'parent'] },
      { text: 'For ball sports, you might naturally compensate by turning your head — this is totally normal and effective.', personas: ['patient'] },
      { text: 'Swimming, martial arts, dance, running — all great. Depth perception adapts over time.', personas: ['patient'] },
      { text: 'If coaching a child with Duane Syndrome, let them find their comfortable head position naturally.', personas: ['friend'] },
    ],
  },
  {
    title: 'Social Situations',
    icon: '💬',
    tips: [
      { text: 'People might notice you turn your head in conversation — most are just curious, not judging.', personas: ['patient'] },
      { text: 'Having a casual, confident explanation ready makes it easier: "My eye just doesn\'t turn all the way — been that way since birth!"', personas: ['patient'] },
      { text: 'If someone with Duane Syndrome seems to be looking at you sideways, they may actually be looking straight at you. It\'s just how their eyes work.', personas: ['friend'] },
      { text: 'In photos, find your "good angle" where your eyes look most aligned — many people with Duane Syndrome have a preferred side.', personas: ['patient'] },
    ],
  },
  {
    title: 'Workplace',
    icon: '💼',
    tips: [
      { text: 'Position your monitor or workspace so your natural head position faces it directly.', personas: ['patient'] },
      { text: 'In meetings, sit where your compensatory head turn faces the speaker or screen naturally.', personas: ['patient'] },
      { text: 'You\'re not required to disclose Duane Syndrome at work, but many find it helpful to mention briefly.', personas: ['patient'] },
      { text: 'Duane Syndrome does not limit career choices. Pilots, surgeons, athletes, actors — all have it.', personas: ['patient', 'parent'] },
    ],
  },
  {
    title: 'Dealing with Mocking',
    icon: '🛡',
    tips: [
      { text: 'Kids can be curious or blunt. Having a practiced response helps: "My eye works differently but I see just fine!"', personas: ['patient', 'parent'] },
      { text: 'Educate, don\'t apologize. You have nothing to be ashamed of.', personas: ['patient'] },
      { text: 'If your child is being teased, work with the school to educate classmates. A brief class talk can work wonders.', personas: ['parent'] },
      { text: 'Humor is a powerful tool. Many people with Duane Syndrome use light humor about their condition to break the ice.', personas: ['patient'] },
    ],
  },
];

export function LifeHacksContent() {
  const [persona, setPersona] = useState<Persona | null>(null);

  useEffect(() => {
    setPersona(getPersona());
  }, []);

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    tips: persona
      ? cat.tips.filter((tip) => tip.personas.includes(persona))
      : cat.tips,
  })).filter((cat) => cat.tips.length > 0);

  return (
    <div>
      {/* Persona filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setPersona(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !persona ? 'bg-primary-600 text-white' : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
          }`}
        >
          All Tips
        </button>
        {(['patient', 'parent', 'friend'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPersona(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              persona === p ? 'bg-primary-600 text-white' : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
            }`}
          >
            {p === 'patient' ? 'I have DS' : p === 'parent' ? 'Parent' : 'Friend/Educator'}
          </button>
        ))}
      </div>

      {/* Tips by category */}
      <div className="mt-8 space-y-8">
        {filteredCategories.map((cat) => (
          <section key={cat.title}>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-warm-800">
              <span>{cat.icon}</span> {cat.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {cat.tips.map((tip, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-warm-100 bg-warm-50 p-3 text-warm-700"
                >
                  {tip.text}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
