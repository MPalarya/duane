'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Paper {
  id: string;
  pubmedId: string | null;
  title: string;
  abstract: string | null;
  authors: string | null;
  journal: string | null;
  publishedDate: string | null;
  aiSummarySimple: string | null;
  aiSummaryAdult: string | null;
  aiSummaryProfessional: string | null;
}

type SummaryLevel = 'simple' | 'adult' | 'professional' | 'abstract';

export function ResearchCard({ paper }: { paper: Paper }) {
  const [level, setLevel] = useState<SummaryLevel>('adult');

  const summaryContent = {
    simple: paper.aiSummarySimple,
    adult: paper.aiSummaryAdult,
    professional: paper.aiSummaryProfessional,
    abstract: paper.abstract,
  };

  const pubmedUrl = paper.pubmedId
    ? `https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}/`
    : null;

  return (
    <div className="rounded-xl border border-warm-200 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-warm-900">{paper.title}</h3>
        {pubmedUrl && (
          <a
            href={pubmedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs text-primary-600 hover:underline"
          >
            PubMed
          </a>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-sm text-warm-400">
        {paper.journal && <span>{paper.journal}</span>}
        {paper.publishedDate && (
          <span>{new Date(paper.publishedDate).getFullYear()}</span>
        )}
      </div>
      {paper.authors && (
        <p className="mt-1 text-sm text-warm-400 line-clamp-1">{paper.authors}</p>
      )}

      {/* Summary Level Selector */}
      <div className="mt-4 flex gap-1">
        {(['simple', 'adult', 'professional', 'abstract'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              level === l
                ? 'bg-primary-600 text-white'
                : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
            }`}
          >
            {l === 'simple' ? 'Simple' : l === 'adult' ? 'Standard' : l === 'professional' ? 'Technical' : 'Original'}
          </button>
        ))}
      </div>

      {/* Summary Content */}
      <div className="mt-3 text-sm text-warm-600 leading-relaxed">
        {summaryContent[level] ? (
          <p>{summaryContent[level]}</p>
        ) : (
          <p className="text-warm-400 italic">
            {level === 'abstract' ? 'No abstract available.' : 'AI summary not available for this paper.'}
          </p>
        )}
      </div>
    </div>
  );
}
