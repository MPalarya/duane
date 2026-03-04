'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { LockOpen, Lock, FileText, ExternalLink } from 'lucide-react';

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
  isOpenAccess?: boolean | null;
  oaPdfUrl?: string | null;
  conclusions?: string | null;
  source?: string | null;
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

  const hasConclusions = Boolean(paper.conclusions);
  const isAiLevel = level !== 'abstract';

  return (
    <div className="rounded-xl border border-warm-200 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-warm-900">{paper.title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          {paper.isOpenAccess != null && (
            paper.isOpenAccess ? (
              <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                <LockOpen className="h-3 w-3" /> Open Access
              </Badge>
            ) : (
              <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
                <Lock className="h-3 w-3" /> Paywalled
              </Badge>
            )
          )}
          {pubmedUrl && (
            <a
              href={pubmedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline"
            >
              PubMed
            </a>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-warm-400">
        {paper.journal && <span>{paper.journal}</span>}
        {paper.publishedDate && (
          <span>{new Date(paper.publishedDate).getFullYear()}</span>
        )}
        {paper.source && paper.source !== 'pubmed' && (
          <Badge className="text-xs capitalize">
            {paper.source === 'europepmc' ? 'Europe PMC' : 'Semantic Scholar'}
          </Badge>
        )}
      </div>
      {paper.authors && (
        <p className="mt-1 text-sm text-warm-400 line-clamp-1">{paper.authors}</p>
      )}

      {/* PDF link */}
      {paper.oaPdfUrl && (
        <a
          href={paper.oaPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm text-green-700 hover:underline"
        >
          <FileText className="h-3.5 w-3.5" /> Full text PDF
          <ExternalLink className="h-3 w-3" />
        </a>
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
          <>
            <p>{summaryContent[level]}</p>
            {isAiLevel && hasConclusions && (
              <p className="mt-2 text-xs text-warm-400 italic">
                AI summary based on abstract + full-text conclusions
              </p>
            )}
          </>
        ) : (
          <p className="text-warm-400 italic">
            {level === 'abstract' ? 'No abstract available.' : 'AI summary not available for this paper.'}
          </p>
        )}

        {/* Show conclusions in Original tab */}
        {level === 'abstract' && paper.conclusions && (
          <div className="mt-4 rounded-lg border border-warm-100 bg-warm-50 p-3">
            <p className="mb-1 text-xs font-medium text-warm-500">Conclusions</p>
            <p className="text-sm text-warm-600">{paper.conclusions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
