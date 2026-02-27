'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';

interface Question {
  id: string;
  question: string;
  options: { label: string; value: string; description?: string }[];
}

const questions: Question[] = [
  {
    id: 'which-eye',
    question: 'Which eye seems to have limited movement?',
    options: [
      { label: 'Left eye', value: 'left' },
      { label: 'Right eye', value: 'right' },
      { label: 'Both eyes', value: 'both' },
      { label: "I'm not sure", value: 'unsure' },
    ],
  },
  {
    id: 'look-outward',
    question: 'When looking outward (away from the nose), does the affected eye:',
    options: [
      { label: 'Move normally', value: 'normal' },
      { label: 'Move partway but gets stuck', value: 'partial' },
      { label: "Barely move or doesn't move at all", value: 'limited' },
      { label: "I'm not sure", value: 'unsure' },
    ],
  },
  {
    id: 'look-inward',
    question: 'When looking inward (toward the nose), does the affected eye:',
    options: [
      { label: 'Move normally', value: 'normal' },
      { label: 'Move but the eye seems to shrink or pull back', value: 'retraction' },
      { label: "Barely move or doesn't move", value: 'limited' },
      { label: "I'm not sure", value: 'unsure' },
    ],
  },
  {
    id: 'eyelid',
    question: 'When the affected eye turns inward, does the eyelid opening:',
    options: [
      { label: 'Stay the same', value: 'same' },
      { label: 'Get narrower (eye appears to squint)', value: 'narrow', description: 'This is a key sign of globe retraction' },
      { label: "I haven't noticed", value: 'unsure' },
    ],
  },
  {
    id: 'head-turn',
    question: 'Do you (or does the person) tend to turn their head to one side?',
    options: [
      { label: 'Yes, head turns to see straight', value: 'yes' },
      { label: 'No noticeable head turn', value: 'no' },
      { label: 'Sometimes', value: 'sometimes' },
    ],
  },
  {
    id: 'upshoot',
    question: 'When looking inward, does the eye move up or down unexpectedly?',
    options: [
      { label: 'Yes, it shoots upward', value: 'upshoot' },
      { label: 'Yes, it shoots downward', value: 'downshoot' },
      { label: 'No abnormal vertical movement', value: 'none' },
      { label: "I haven't noticed", value: 'unsure' },
    ],
  },
];

type ResultType = 'type1' | 'type2' | 'type3' | 'possible' | 'unlikely';

function analyzeAnswers(answers: Record<string, string>): ResultType {
  const outward = answers['look-outward'];
  const inward = answers['look-inward'];
  const eyelid = answers['eyelid'];

  // Type 1: Limited abduction (outward), normal or retraction on adduction
  if ((outward === 'limited' || outward === 'partial') && (inward === 'normal' || inward === 'retraction')) {
    return 'type1';
  }

  // Type 2: Limited adduction (inward), normal abduction
  if (outward === 'normal' && (inward === 'limited' || inward === 'retraction')) {
    return 'type2';
  }

  // Type 3: Both limited
  if ((outward === 'limited' || outward === 'partial') && (inward === 'limited' || inward === 'retraction')) {
    return 'type3';
  }

  // Some signs present
  if (eyelid === 'narrow' || inward === 'retraction') {
    return 'possible';
  }

  return 'unlikely';
}

const resultContent: Record<ResultType, { title: string; description: string; color: string }> = {
  type1: {
    title: 'Possible Duane Syndrome Type 1',
    description: 'Your answers suggest limited outward eye movement with globe retraction on inward gaze — consistent with Type 1 Duane Syndrome, the most common form. Type 1 accounts for about 78% of cases.',
    color: 'primary',
  },
  type2: {
    title: 'Possible Duane Syndrome Type 2',
    description: 'Your answers suggest limited inward eye movement — consistent with Type 2 Duane Syndrome. This is less common, accounting for about 7% of cases.',
    color: 'accent',
  },
  type3: {
    title: 'Possible Duane Syndrome Type 3',
    description: 'Your answers suggest limited movement in both directions — consistent with Type 3 Duane Syndrome, which accounts for about 15% of cases.',
    color: 'coral',
  },
  possible: {
    title: 'Some Signs Present',
    description: 'You described some features that could be related to Duane Syndrome (like globe retraction or eyelid narrowing), but the pattern isn\'t clearly matching a specific type. A specialist evaluation is recommended.',
    color: 'warm',
  },
  unlikely: {
    title: 'Doesn\'t Clearly Match Duane Syndrome',
    description: 'Based on your answers, the eye movement pattern doesn\'t strongly match Duane Syndrome. However, this screening tool is not a diagnosis. Other conditions like Moebius Syndrome, Brown Syndrome, or sixth nerve palsy can have similar features. Consulting an ophthalmologist is always recommended.',
    color: 'warm',
  },
};

export function ScreeningWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ResultType | null>(null);

  function handleAnswer(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setResult(analyzeAnswers(newAnswers));
    }
  }

  function reset() {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  }

  if (result) {
    const r = resultContent[result];
    return (
      <div className="rounded-xl border border-warm-200 bg-card p-6">
        <h2 className="text-2xl font-bold text-warm-900">{r.title}</h2>
        <p className="mt-3 text-warm-600 leading-relaxed">{r.description}</p>

        <div className="mt-6 space-y-3">
          <p className="font-medium text-warm-800">Recommended next steps:</p>
          <ul className="list-disc space-y-1 pl-5 text-warm-600">
            <li>Schedule an appointment with an ophthalmologist or strabismus specialist</li>
            <li>Print this screening result to bring to your appointment</li>
            <li>
              <Link href="/about/types" className="text-primary-600 hover:underline">
                Learn more about Duane Syndrome types
              </Link>
            </li>
            <li>
              <Link href="/specialists" className="text-primary-600 hover:underline">
                Find a specialist near you
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-coral-200 bg-coral-50 p-3 text-sm text-coral-500">
          This screening is for informational purposes only and is NOT a medical diagnosis.
          Only a qualified eye care professional can diagnose Duane Syndrome.
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={reset}>Start Over</Button>
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.print();
              }
            }}
          >
            Print Results
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentStep];

  return (
    <div className="rounded-xl border border-warm-200 bg-card p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-warm-400">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <button
            onClick={reset}
            className="text-warm-400 hover:text-warm-600"
          >
            Start over
          </button>
        </div>
        <div className="mt-2 h-2 rounded-full bg-warm-100">
          <div
            className="h-2 rounded-full bg-primary-500 transition-all"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-warm-900">{question.question}</h2>

      <div className="mt-4 space-y-3">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(question.id, option.value)}
            className="w-full rounded-lg border border-warm-200 bg-white p-4 text-left transition-all hover:border-primary-300 hover:bg-primary-50"
          >
            <span className="font-medium text-warm-800">{option.label}</span>
            {option.description && (
              <span className="mt-1 block text-sm text-warm-400">{option.description}</span>
            )}
          </button>
        ))}
      </div>

      {currentStep > 0 && (
        <button
          onClick={() => setCurrentStep(currentStep - 1)}
          className="mt-4 text-sm text-warm-400 hover:text-warm-600"
        >
          ← Previous question
        </button>
      )}
    </div>
  );
}
