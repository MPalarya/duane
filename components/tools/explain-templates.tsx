'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Template {
  id: string;
  label: string;
  icon: string;
  generate: (name: string, type: string, eye: string) => string;
}

const templates: Template[] = [
  {
    id: 'teacher',
    label: 'Teacher',
    icon: '🏫',
    generate: (name, type, eye) =>
      `Hi! I wanted to let you know that ${name || 'I'} ha${name ? 's' : 've'} a condition called Duane Syndrome. It's a rare eye condition that ${name || 'I'} was born with — it means ${name ? 'their' : 'my'} ${eye} eye doesn't move fully in ${type === '1' ? 'the outward direction' : type === '2' ? 'the inward direction' : 'either direction'}.

You might notice that ${name || 'I'} turn${name ? 's' : ''} ${name ? 'their' : 'my'} head slightly to the side — this is actually a really smart adaptation that helps ${name || 'me'} see clearly with both eyes. It's not a habit or posture issue, so please don't ask ${name || 'me'} to "look straight ahead."

The best seating position is where ${name ? 'their' : 'my'} natural head turn faces the board directly. Other than that, ${name || 'I'} can do everything other students do — reading, sports, screen work, all of it.

${name ? `${name}'s` : 'My'} vision is completely normal; it's just the eye movement that's different. It doesn't get worse over time and it's nothing to worry about.

Thank you for understanding! If you have questions, duane-syndrome.com is a great resource.`,
  },
  {
    id: 'coach',
    label: 'Coach',
    icon: '⚽',
    generate: (name, type, eye) =>
      `Hey Coach! Quick heads up — ${name || 'I'} ha${name ? 's' : 've'} something called Duane Syndrome. It's an eye condition ${name || 'I'} was born with that limits how far ${name ? 'their' : 'my'} ${eye} eye can move ${type === '1' ? 'outward' : type === '2' ? 'inward' : 'in certain directions'}.

The important thing: it does NOT affect ${name ? 'their' : 'my'} ability to play sports or do physical activity. ${name || 'I'} can participate fully in everything.

${name || 'I'} might turn ${name ? 'their' : 'my'} head a bit more than usual to see things to the side — that's totally normal for ${name || 'me'}. ${name ? 'Their' : 'My'} depth perception works great and ${name || 'I'}'ve adapted naturally.

No special accommodations needed — just wanted you to know in case you notice the head turn or the eye looking different sometimes. Thanks!`,
  },
  {
    id: 'employer',
    label: 'Employer / Coworker',
    icon: '💼',
    generate: (name, _type, eye) =>
      `I wanted to mention something briefly — I have a condition called Duane Syndrome. It's a congenital eye movement condition that affects my ${eye} eye. You might occasionally notice I turn my head slightly to one side.

It doesn't affect my vision, my ability to work at a computer, read documents, drive, or anything else. I've had it since birth and it's completely stable.

I'm mentioning it just so you're not wondering about the head turn. It's my eye's way of keeping everything aligned. No accommodations needed — just awareness. Thanks for understanding!`,
  },
  {
    id: 'date',
    label: 'Date / New Friend',
    icon: '💬',
    generate: (name, type, eye) =>
      `So you might have noticed my eye does something a little different — I have something called Duane Syndrome. It basically means the nerve that controls my ${eye} eye didn't develop quite right before I was born, so it doesn't move all the way ${type === '1' ? 'to the side' : type === '2' ? 'inward' : 'in certain directions'}.

That's why I sometimes turn my head a bit — it's just how I keep things lined up. My vision is totally normal, and I've had this my whole life, so it's just... my normal!

About 1 in 1,000 people have it. It's one of those things most people never hear about until they meet someone who has it. Now you know a fun rare fact about me! 😄`,
  },
  {
    id: 'doctor',
    label: 'Doctor (unfamiliar with DS)',
    icon: '🏥',
    generate: (name, type, eye) =>
      `I have Duane Retraction Syndrome, Type ${type || '[type]'}, affecting my ${eye} eye. This is a congenital cranial nerve miswiring condition — the sixth nerve (abducens) didn't develop, so the lateral rectus is innervated by branches of the third nerve (oculomotor).

Key clinical features:
- Limited ${type === '1' ? 'abduction' : type === '2' ? 'adduction' : 'abduction and adduction'} of the ${eye} eye
- Globe retraction and palpebral fissure narrowing on attempted adduction
- Compensatory head turn to maintain binocular vision
- ${type === '1' ? 'Possible upshoot/downshoot on adduction' : 'Variable upshoot/downshoot'}

This is a stable condition — it does not progress. I'm followed by my ophthalmologist. Please note: my abnormal eye movement is my baseline and is NOT indicative of a new neurological event.

For more clinical information: OMIM #126800, ICD-10 H50.81`,
  },
  {
    id: 'child-classmate',
    label: "Kid's Classmate",
    icon: '👦',
    generate: (name, _type, eye) =>
      `Hey! You know how ${name || 'I'} sometimes turn${name ? 's' : ''} ${name ? 'their' : 'my'} head a little bit? That's because ${name ? 'their' : 'my'} ${eye} eye works a little differently than most people's eyes.

It's called Duane Syndrome. ${name || 'I'} was born with it — it just means one eye doesn't move all the way in one direction. It doesn't hurt and ${name || 'I'} can see perfectly fine!

${name || 'I'} can do everything you can do — play sports, read, play video games, ride a bike, everything. ${name ? 'Their' : 'My'} eye just looks a tiny bit different sometimes, and that's totally okay. Everyone's body is a little different!

If you're curious about it, that's cool — ${name || 'I'} don't mind talking about it. 😊`,
  },
];

export function ExplainTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('teacher');
  const [name, setName] = useState('');
  const [duaneType, setDuaneType] = useState('1');
  const [affectedEye, setAffectedEye] = useState('left');
  const [copied, setCopied] = useState(false);

  const template = templates.find((t) => t.id === selectedTemplate)!;
  const generatedText = template.generate(name, duaneType, affectedEye);

  async function handleCopy() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="rounded-xl border border-warm-200 bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase text-warm-500">Customize</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            id="explain-name"
            label="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
          />
          <Select
            id="explain-type"
            label="Duane Type"
            value={duaneType}
            onChange={(e) => setDuaneType(e.target.value)}
            options={[
              { value: '1', label: 'Type 1' },
              { value: '2', label: 'Type 2' },
              { value: '3', label: 'Type 3' },
            ]}
          />
          <Select
            id="explain-eye"
            label="Affected Eye"
            value={affectedEye}
            onChange={(e) => setAffectedEye(e.target.value)}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
              { value: 'both', label: 'Both' },
            ]}
          />
        </div>
      </div>

      {/* Template selector */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase text-warm-500">Explain to my...</h3>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedTemplate === t.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated text */}
      <div className="rounded-xl border border-warm-200 bg-warm-50 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-warm-700">
            {template.icon} For: {template.label}
          </h3>
          <Button
            variant={copied ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-warm-700">
          {generatedText}
        </p>
      </div>
    </div>
  );
}
