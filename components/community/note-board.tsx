'use client';

import Link from 'next/link';
import { useState } from 'react';

interface MentorPost {
  id: string;
  role: string;
  bio: string;
  contactMethod: string | null;
  anonymous: boolean | null;
  locale: string | null;
  active: boolean | null;
  createdAt: string | null;
}

interface NoteBoardProps {
  posts: MentorPost[];
}

const pastelColors = [
  'bg-yellow-100 border-yellow-300',
  'bg-pink-100 border-pink-300',
  'bg-blue-100 border-blue-300',
  'bg-green-100 border-green-300',
  'bg-purple-100 border-purple-300',
  'bg-orange-100 border-orange-300',
];

const rotations = [
  '-rotate-1',
  'rotate-1',
  '-rotate-2',
  'rotate-2',
  'rotate-0',
  '-rotate-1',
];

export function NoteBoard({ posts }: NoteBoardProps) {
  const [filter, setFilter] = useState<'all' | 'mentor' | 'mentee'>('all');

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.role === filter);

  return (
    <section id="note-board">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">Note Board</h2>
          <p className="mt-1 text-warm-500">Find a mentor or become one. Leave a note for the community.</p>
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1 rounded-lg border border-warm-200 bg-warm-50 p-1">
          {(['all', 'mentor', 'mentee'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filter === role
                  ? 'bg-white text-warm-900 shadow-sm'
                  : 'text-warm-400 hover:text-warm-600'
              }`}
            >
              {role === 'all' ? 'All' : role === 'mentor' ? 'Mentor' : 'Mentee'}
            </button>
          ))}
        </div>
      </div>

      {/* Cork board */}
      <div className="mt-6 rounded-2xl bg-amber-50 p-4 sm:p-6">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-warm-500">
            No notes matching this filter yet. Be the first!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <div
                key={post.id}
                className={`relative rounded-lg border-2 p-4 shadow-sm transition-transform hover:scale-[1.02] ${
                  pastelColors[i % pastelColors.length]
                } ${rotations[i % rotations.length]}`}
              >
                {/* Pin decoration */}
                <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-red-400 shadow-sm" />

                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    post.role === 'mentor'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-accent-100 text-accent-700'
                  }`}>
                    {post.role === 'mentor' ? 'Mentor' : 'Looking for Mentor'}
                  </span>
                  {post.anonymous && (
                    <span className="text-xs text-warm-400">Anonymous</span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-warm-700">{post.bio}</p>

                {post.contactMethod && (
                  <p className="mt-2 text-xs text-warm-500">
                    Contact: {post.contactMethod}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary-300 bg-primary-50 px-5 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
        >
          + Leave a Note
        </Link>
      </div>
    </section>
  );
}
