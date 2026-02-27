'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface ExerciseLog {
  date: string; // YYYY-MM-DD
  exercises: string[];
  notes: string;
}

const STORAGE_KEY = 'duane-exercise-log';

const defaultExercises = [
  { id: 'convergence', name: 'Convergence exercises (pencil push-ups)', duration: '5 min' },
  { id: 'tracking', name: 'Smooth pursuit tracking', duration: '3 min' },
  { id: 'saccades', name: 'Saccadic eye movements', duration: '3 min' },
  { id: 'patching', name: 'Eye patching', duration: 'As prescribed' },
  { id: 'other', name: 'Other (doctor-prescribed)', duration: 'Varies' },
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function ExerciseTracker() {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [todayExercises, setTodayExercises] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const today = getToday();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as ExerciseLog[];
      setLogs(parsed);
      const todayLog = parsed.find((l) => l.date === today);
      if (todayLog) {
        setTodayExercises(todayLog.exercises);
        setNotes(todayLog.notes);
      }
    }
  }, [today]);

  const save = useCallback((exercises: string[], notesVal: string) => {
    setLogs((prev) => {
      const existing = prev.filter((l) => l.date !== today);
      const updated = [...existing, { date: today, exercises, notes: notesVal }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [today]);

  function toggleExercise(id: string) {
    const updated = todayExercises.includes(id)
      ? todayExercises.filter((e) => e !== id)
      : [...todayExercises, id];
    setTodayExercises(updated);
    save(updated, notes);
  }

  function saveNotes(val: string) {
    setNotes(val);
    save(todayExercises, val);
  }

  // Calculate streak
  const logDates = new Set(logs.filter((l) => l.exercises.length > 0).map((l) => l.date));
  let streak = 0;
  const d = new Date();
  while (true) {
    const ds = d.toISOString().split('T')[0];
    if (logDates.has(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  const last30 = getLast30Days();

  return (
    <div className="space-y-6">
      {/* Streak & Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-center">
          <p className="text-3xl font-bold text-primary-700">{streak}</p>
          <p className="text-sm text-primary-600">Day Streak</p>
        </div>
        <div className="rounded-xl border border-warm-200 bg-card p-4 text-center">
          <p className="text-3xl font-bold text-warm-800">{todayExercises.length}</p>
          <p className="text-sm text-warm-500">Done Today</p>
        </div>
        <div className="rounded-xl border border-warm-200 bg-card p-4 text-center">
          <p className="text-3xl font-bold text-warm-800">{logs.filter((l) => l.exercises.length > 0).length}</p>
          <p className="text-sm text-warm-500">Total Days</p>
        </div>
      </div>

      {/* 30-day calendar heatmap */}
      <div className="rounded-xl border border-warm-200 bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-warm-700">Last 30 Days</h3>
        <div className="flex flex-wrap gap-1">
          {last30.map((day) => {
            const log = logs.find((l) => l.date === day);
            const count = log?.exercises.length ?? 0;
            return (
              <div
                key={day}
                className={`h-6 w-6 rounded ${
                  count === 0
                    ? 'bg-warm-100'
                    : count <= 2
                      ? 'bg-primary-200'
                      : count <= 4
                        ? 'bg-primary-400'
                        : 'bg-primary-600'
                }`}
                title={`${day}: ${count} exercise${count !== 1 ? 's' : ''}`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-warm-400">
          <span>Less</span>
          <div className="h-3 w-3 rounded bg-warm-100" />
          <div className="h-3 w-3 rounded bg-primary-200" />
          <div className="h-3 w-3 rounded bg-primary-400" />
          <div className="h-3 w-3 rounded bg-primary-600" />
          <span>More</span>
        </div>
      </div>

      {/* Today's exercises */}
      <div className="rounded-xl border border-warm-200 bg-card p-5">
        <h3 className="mb-4 text-lg font-semibold text-warm-800">
          Today&apos;s Exercises — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </h3>
        <div className="space-y-2">
          {defaultExercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => toggleExercise(ex.id)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                todayExercises.includes(ex.id)
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-warm-200 hover:border-warm-300'
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                  todayExercises.includes(ex.id)
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-warm-300'
                }`}
              >
                {todayExercises.includes(ex.id) && (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${todayExercises.includes(ex.id) ? 'text-primary-700 line-through' : 'text-warm-800'}`}>
                  {ex.name}
                </p>
                <p className="text-xs text-warm-400">{ex.duration}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-warm-700">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
            placeholder="How did today's exercises feel?"
            className="mt-1 w-full rounded-lg border border-warm-300 bg-white px-3 py-2 text-sm text-warm-700 placeholder:text-warm-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
