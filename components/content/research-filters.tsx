'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export type SortOption = 'newest' | 'popular' | 'cited';
export type SourceFilter = 'all' | 'pubmed' | 'europepmc' | 'semanticscholar';
export type AccessFilter = 'all' | 'open' | 'paywalled';

export interface ActiveFilter {
  type: 'sort' | 'keyword' | 'source' | 'year' | 'access';
  label: string;
  value: string;
}

interface ResearchFiltersProps {
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
  keywords: string[];
  onKeywordsChange: (v: string[]) => void;
  source: SourceFilter;
  onSourceChange: (v: SourceFilter) => void;
  year: string;
  onYearChange: (v: string) => void;
  availableYears: string[];
  access: AccessFilter;
  onAccessChange: (v: AccessFilter) => void;
}

function Pill({
  active,
  onClick,
  children,
  variant,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'green' | 'amber';
}) {
  const activeClass =
    variant === 'green'
      ? 'bg-green-100 text-green-700 ring-green-300'
      : variant === 'amber'
        ? 'bg-amber-100 text-amber-700 ring-amber-300'
        : 'bg-primary-100 text-primary-700 ring-primary-300';

  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? `${activeClass} ring-1`
          : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
      }`}
    >
      {children}
    </button>
  );
}

export function ResearchFilters({
  sort,
  onSortChange,
  keywords,
  onKeywordsChange,
  source,
  onSourceChange,
  year,
  onYearChange,
  availableYears,
  access,
  onAccessChange,
}: ResearchFiltersProps) {
  const t = useTranslations('research');
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed.toLowerCase())) {
      onKeywordsChange([...keywords, trimmed.toLowerCase()]);
    }
    setKeywordInput('');
  };

  return (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-warm-400">
          {t('sortLabel')}
        </p>
        <div className="flex flex-col gap-1.5">
          <Pill active={sort === 'newest'} onClick={() => onSortChange('newest')}>
            {t('sortNewest')}
          </Pill>
          <Pill active={sort === 'popular'} onClick={() => onSortChange('popular')}>
            {t('sortPopular')}
          </Pill>
          <Pill active={sort === 'cited'} onClick={() => onSortChange('cited')}>
            {t('sortCited')}
          </Pill>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-warm-400">
          {t('keywordLabel')}
        </p>
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addKeyword();
            }
          }}
          placeholder={t('keywordPlaceholder')}
          className="w-full rounded-lg border border-warm-200 bg-white px-3 py-1.5 text-sm text-warm-700 placeholder:text-warm-300 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-300"
        />
      </div>

      {/* Source */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-warm-400">
          {t('sourceLabel')}
        </p>
        <div className="flex flex-col gap-1.5">
          {(['all', 'pubmed', 'europepmc', 'semanticscholar'] as const).map((s) => (
            <Pill key={s} active={source === s} onClick={() => onSourceChange(s)}>
              {s === 'all'
                ? t('sourceAll')
                : s === 'europepmc'
                  ? 'Europe PMC'
                  : s === 'pubmed'
                    ? 'PubMed'
                    : 'Semantic Scholar'}
            </Pill>
          ))}
        </div>
      </div>

      {/* Year */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-warm-400">
          {t('yearLabel')}
        </p>
        <div className="flex flex-col gap-1.5">
          <Pill active={year === 'all'} onClick={() => onYearChange('all')}>
            {t('yearAll')}
          </Pill>
          {availableYears.map((y) => (
            <Pill key={y} active={year === y} onClick={() => onYearChange(y)}>
              {y}
            </Pill>
          ))}
        </div>
      </div>

      {/* Access */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-warm-400">
          {t('accessLabel')}
        </p>
        <div className="flex flex-col gap-1.5">
          <Pill active={access === 'all'} onClick={() => onAccessChange('all')}>
            {t('accessAll')}
          </Pill>
          <Pill
            active={access === 'open'}
            onClick={() => onAccessChange('open')}
            variant="green"
          >
            {t('accessOpen')}
          </Pill>
          <Pill
            active={access === 'paywalled'}
            onClick={() => onAccessChange('paywalled')}
            variant="amber"
          >
            {t('accessPaywalled')}
          </Pill>
        </div>
      </div>
    </div>
  );
}
