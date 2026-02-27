'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CardData {
  name: string;
  age: string;
  duaneType: string;
  affectedEye: string;
  hasSurgery: string;
  headTurn: string;
  additionalNotes: string;
  recipientType: string;
}

export function OnePagerGenerator() {
  const [data, setData] = useState<CardData>({
    name: '',
    age: '',
    duaneType: '',
    affectedEye: '',
    hasSurgery: 'no',
    headTurn: 'yes',
    additionalNotes: '',
    recipientType: 'teacher',
  });
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  function update(field: keyof CardData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  const typeDescriptions: Record<string, string> = {
    '1': 'Type 1: Limited ability to move the affected eye outward (away from the nose). This is the most common form.',
    '2': 'Type 2: Limited ability to move the affected eye inward (toward the nose).',
    '3': 'Type 3: Limited movement in both directions.',
    unknown: 'Type not yet determined — please refer to the ophthalmologist\'s notes.',
  };

  const recipientIntros: Record<string, string> = {
    teacher: `Dear Teacher/Educator,\n\nThis card explains a medical condition that ${data.name || 'this student'} has. Please read it so you can better support them in the classroom.`,
    coach: `Dear Coach,\n\nThis card explains a medical condition that ${data.name || 'this athlete'} has. It does not affect their ability to participate in sports.`,
    doctor: `Dear Doctor,\n\nThis patient has Duane Retraction Syndrome. This card provides a summary of their specific presentation.`,
    general: `Hello,\n\nThis card explains Duane Syndrome, a condition that ${data.name || 'I'} live${data.name ? 's' : ''} with. Thank you for taking a moment to read it.`,
  };

  return (
    <div>
      {/* Form */}
      {!showPreview && (
        <div className="space-y-4 rounded-xl border border-warm-200 bg-card p-6">
          <Input
            id="name"
            label="Name (or leave blank for privacy)"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="First name or nickname"
          />
          <Input
            id="age"
            label="Age (optional)"
            value={data.age}
            onChange={(e) => update('age', e.target.value)}
            placeholder="e.g., 8"
          />
          <Select
            id="duaneType"
            label="Duane Syndrome Type"
            value={data.duaneType}
            onChange={(e) => update('duaneType', e.target.value)}
            options={[
              { value: '1', label: 'Type 1 (limited outward movement)' },
              { value: '2', label: 'Type 2 (limited inward movement)' },
              { value: '3', label: 'Type 3 (limited both directions)' },
              { value: 'unknown', label: "Not sure / Not yet diagnosed" },
            ]}
            placeholder="Select type..."
          />
          <Select
            id="affectedEye"
            label="Affected Eye"
            value={data.affectedEye}
            onChange={(e) => update('affectedEye', e.target.value)}
            options={[
              { value: 'left', label: 'Left eye' },
              { value: 'right', label: 'Right eye' },
              { value: 'both', label: 'Both eyes' },
            ]}
            placeholder="Select..."
          />
          <Select
            id="headTurn"
            label="Has a compensatory head turn?"
            value={data.headTurn}
            onChange={(e) => update('headTurn', e.target.value)}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'slight', label: 'Slight / Sometimes' },
            ]}
          />
          <Select
            id="hasSurgery"
            label="Has had eye surgery?"
            value={data.hasSurgery}
            onChange={(e) => update('hasSurgery', e.target.value)}
            options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' },
            ]}
          />
          <Select
            id="recipientType"
            label="Who is this card for?"
            value={data.recipientType}
            onChange={(e) => update('recipientType', e.target.value)}
            options={[
              { value: 'teacher', label: 'Teacher / Educator' },
              { value: 'coach', label: 'Coach / Sports instructor' },
              { value: 'doctor', label: 'Doctor (unfamiliar with DS)' },
              { value: 'general', label: 'General (anyone)' },
            ]}
          />
          <Textarea
            id="notes"
            label="Additional notes (optional)"
            value={data.additionalNotes}
            onChange={(e) => update('additionalNotes', e.target.value)}
            placeholder="Anything else the recipient should know..."
            rows={3}
          />
          <Button onClick={() => setShowPreview(true)} size="lg">
            Generate Card
          </Button>
        </div>
      )}

      {/* Printable Preview */}
      {showPreview && (
        <div>
          <div className="mb-4 flex gap-3 print:hidden">
            <Button onClick={handlePrint}>Print / Save as PDF</Button>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Edit
            </Button>
          </div>

          <div
            ref={printRef}
            className="rounded-xl border-2 border-primary-200 bg-white p-8 print:border-0 print:p-0"
          >
            {/* Header */}
            <div className="border-b-2 border-primary-500 pb-4">
              <h2 className="text-2xl font-bold text-primary-700">
                About My Duane Syndrome
              </h2>
              <p className="mt-1 text-sm text-warm-500">
                duane-syndrome.com — A community resource for Duane Retraction Syndrome
              </p>
            </div>

            {/* Introduction */}
            <div className="mt-4 whitespace-pre-line text-sm text-warm-700">
              {recipientIntros[data.recipientType]}
            </div>

            {/* What is Duane Syndrome */}
            <div className="mt-5">
              <h3 className="text-lg font-semibold text-primary-700">What is Duane Syndrome?</h3>
              <p className="mt-1 text-sm text-warm-700">
                Duane Syndrome is a rare, congenital eye movement disorder affecting about 1 in 1,000 people.
                It is caused by abnormal nerve development before birth and results in limited eye movement
                in one or more directions. It is <strong>not progressive</strong> (does not get worse),
                is <strong>not contagious</strong>, and <strong>does not typically affect vision quality</strong>.
              </p>
            </div>

            {/* Personal details */}
            <div className="mt-5">
              <h3 className="text-lg font-semibold text-primary-700">
                {data.name ? `About ${data.name}` : 'My Specifics'}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {data.duaneType && (
                  <div className="col-span-2 rounded bg-primary-50 p-2">
                    <strong>Diagnosis:</strong> {typeDescriptions[data.duaneType]}
                  </div>
                )}
                {data.affectedEye && (
                  <div className="rounded bg-warm-50 p-2">
                    <strong>Affected eye:</strong> {data.affectedEye === 'both' ? 'Both eyes' : `${data.affectedEye.charAt(0).toUpperCase() + data.affectedEye.slice(1)} eye`}
                  </div>
                )}
                {data.headTurn && (
                  <div className="rounded bg-warm-50 p-2">
                    <strong>Head turn:</strong> {data.headTurn === 'yes' ? 'Yes — this is a natural compensation, not a problem' : data.headTurn === 'slight' ? 'Slight / occasional' : 'No'}
                  </div>
                )}
                {data.hasSurgery === 'yes' && (
                  <div className="rounded bg-warm-50 p-2">
                    <strong>Previous surgery:</strong> Yes
                  </div>
                )}
              </div>
            </div>

            {/* What to know */}
            <div className="mt-5">
              <h3 className="text-lg font-semibold text-primary-700">What You Should Know</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-warm-700">
                {data.headTurn !== 'no' && (
                  <li>
                    If {data.name || 'they'} turn{data.name ? 's' : ''} their head to one side,
                    this is a <strong>healthy adaptation</strong> — please do not ask them to &quot;look straight ahead.&quot;
                  </li>
                )}
                <li>
                  {data.name || 'They'} can see normally — Duane Syndrome affects <strong>eye movement</strong>, not vision quality.
                </li>
                <li>
                  The eye may appear to &quot;shrink&quot; when looking in certain directions — this is called
                  <strong> globe retraction</strong> and is a normal part of the condition.
                </li>
                <li>
                  {data.name || 'They'} can participate fully in all activities, including sports, reading, and screen work.
                </li>
                {data.recipientType === 'teacher' && (
                  <li>
                    <strong>Seating:</strong> Placing {data.name || 'the student'} where their natural head position
                    faces the board directly will help them be most comfortable.
                  </li>
                )}
              </ul>
            </div>

            {/* Additional notes */}
            {data.additionalNotes && (
              <div className="mt-5">
                <h3 className="text-lg font-semibold text-primary-700">Additional Notes</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-warm-700">{data.additionalNotes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 border-t border-warm-200 pt-3 text-xs text-warm-400">
              <p>Learn more: duane-syndrome.com | This card is for informational purposes only — not medical advice.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
