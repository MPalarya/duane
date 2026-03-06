'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { LockOpen, Lock, FileText, ExternalLink, Heart, MessageCircle } from 'lucide-react';

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
  doi?: string | null;
  citationCount?: number | null;
}

type SummaryLevel = 'simple' | 'adult' | 'professional' | 'abstract';

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('duane-visitor-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('duane-visitor-id', id);
  }
  return id;
}

function getLikedPapers(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('duane-liked-papers');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function setLikedPapers(ids: Set<string>) {
  localStorage.setItem('duane-liked-papers', JSON.stringify([...ids]));
}

export function ResearchCard({
  paper,
  likeCount = 0,
  onLikeChange,
}: {
  paper: Paper;
  likeCount?: number;
  onLikeChange?: (paperId: string, delta: number) => void;
}) {
  const t = useTranslations('research');

  // Default tab: if aiSummaryAdult is null, fall back to 'abstract'
  const defaultLevel: SummaryLevel = paper.aiSummaryAdult ? 'adult' : 'abstract';
  const [level, setLevel] = useState<SummaryLevel>(defaultLevel);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const isLiked = getLikedPapers().has(paper.id);
    setLiked(isLiked);

    // Re-sync: if localStorage says liked but server count is 0, re-POST to DB
    if (isLiked && likeCount === 0) {
      const visitorId = getVisitorId();
      fetch('/api/research-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id, visitorId }),
      }).then((res) => {
        if (res.ok) onLikeChange?.(paper.id, 1);
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper.id]);

  const toggleLike = useCallback(() => {
    const visitorId = getVisitorId();
    const wasLiked = liked;
    const papers = getLikedPapers();

    // Optimistic update
    const delta = wasLiked ? -1 : 1;
    if (wasLiked) {
      papers.delete(paper.id);
      setLiked(false);
    } else {
      papers.add(paper.id);
      setLiked(true);
    }
    setLikedPapers(papers);
    onLikeChange?.(paper.id, delta);

    fetch('/api/research-likes', {
      method: wasLiked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperId: paper.id, visitorId }),
    }).then((res) => {
      if (!res.ok) throw new Error('API error');
    }).catch(() => {
      // Revert on error
      if (wasLiked) {
        papers.add(paper.id);
        setLiked(true);
      } else {
        papers.delete(paper.id);
        setLiked(false);
      }
      setLikedPapers(papers);
      onLikeChange?.(paper.id, -delta);
    });
  }, [liked, paper.id, onLikeChange]);

  const summaryContent = {
    simple: paper.aiSummarySimple,
    adult: paper.aiSummaryAdult,
    professional: paper.aiSummaryProfessional,
    abstract: paper.abstract,
  };

  const pubmedUrl = paper.pubmedId
    ? `https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}/`
    : null;

  const articleUrl = pubmedUrl || (paper.doi ? `https://doi.org/${paper.doi}` : null);
  const articleLabel = pubmedUrl ? 'PubMed' : paper.doi ? 'DOI' : null;

  const hasConclusions = Boolean(paper.conclusions);
  const isAiLevel = level !== 'abstract';

  const tabLabels: Record<SummaryLevel, string> = {
    simple: t('tabSimple'),
    adult: t('tabStandard'),
    professional: t('tabTechnical'),
    abstract: t('tabOriginal'),
  };

  return (
    <div className="overflow-hidden rounded-xl border border-warm-200 bg-card p-5">
      {/* Badges + link: separate row on mobile, inline with title on desktop */}
      {(paper.isOpenAccess != null || articleUrl) && (
        <div className="mb-2 flex items-center justify-end gap-2 sm:hidden">
          {paper.isOpenAccess != null && (
            paper.isOpenAccess ? (
              <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                <LockOpen className="h-3 w-3" /> {t('accessOpen')}
              </Badge>
            ) : (
              <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
                <Lock className="h-3 w-3" /> {t('accessPaywalled')}
              </Badge>
            )
          )}
          {articleUrl && (
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
            >
              {articleLabel} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-warm-900">{paper.title}</h3>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {paper.isOpenAccess != null && (
            paper.isOpenAccess ? (
              <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                <LockOpen className="h-3 w-3" /> {t('accessOpen')}
              </Badge>
            ) : (
              <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
                <Lock className="h-3 w-3" /> {t('accessPaywalled')}
              </Badge>
            )
          )}
          {articleUrl && (
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
            >
              {articleLabel} <ExternalLink className="h-3 w-3" />
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
        {paper.citationCount != null && paper.citationCount > 0 && (
          <span className="text-xs">{t('citations', { count: paper.citationCount })}</span>
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
          <FileText className="h-3.5 w-3.5" /> {t('fullTextPdf')}
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
            {tabLabels[l]}
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
                {t('aiNote')}
              </p>
            )}
          </>
        ) : (
          <p className="text-warm-400 italic">
            {level === 'abstract' ? t('noAbstract') : t('noAiSummary')}
          </p>
        )}

        {/* Show conclusions in Original tab */}
        {level === 'abstract' && paper.conclusions && (
          <div className="mt-4 rounded-lg border border-warm-100 bg-warm-50 p-3">
            <p className="mb-1 text-xs font-medium text-warm-500">{t('conclusionsLabel')}</p>
            <p className="text-sm text-warm-600">{paper.conclusions}</p>
          </div>
        )}
      </div>

      {/* Card footer: Like + Comment */}
      <div className="mt-4 flex items-center gap-4 border-t border-warm-100 pt-3">
        <button
          onClick={toggleLike}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            liked
              ? 'bg-coral-100 text-coral-700'
              : 'bg-warm-50 text-warm-400 hover:bg-warm-100'
          }`}
          aria-label={liked ? t('unlike') : t('like')}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
          {likeCount}
        </button>

        <div className="inline-flex cursor-default items-center gap-1.5 rounded-full bg-warm-50 px-3 py-1 text-xs font-medium text-warm-400">
          <MessageCircle className="h-3.5 w-3.5" />
          0
          <span className="text-warm-300">({t('comingSoon')})</span>
        </div>
      </div>
    </div>
  );
}
