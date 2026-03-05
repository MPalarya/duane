'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { ResearchCard } from './research-card';
import {
  ResearchFilters,
  type SortOption,
  type SourceFilter,
  type AccessFilter,
  type ActiveFilter,
} from './research-filters';

export interface ResearchPaper {
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
  isOpenAccess: boolean | null;
  oaPdfUrl: string | null;
  conclusions: string | null;
  source: string | null;
  doi: string | null;
  citationCount: number | null;
}

interface Props {
  papers: ResearchPaper[];
  likeCounts: Record<string, number>;
}

export function ResearchPageClient({ papers, likeCounts: initialLikeCounts }: Props) {
  const t = useTranslations('research');

  // Lifted like counts state so popularity sort updates immediately
  const [likeCounts, setLikeCounts] = useState(initialLikeCounts);

  const handleLikeChange = useCallback((paperId: string, delta: number) => {
    setLikeCounts((prev) => ({
      ...prev,
      [paperId]: Math.max(0, (prev[paperId] || 0) + delta),
    }));
  }, []);

  // Filter state
  const [sort, setSort] = useState<SortOption>('newest');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [source, setSource] = useState<SourceFilter>('all');
  const [year, setYear] = useState('all');
  const [access, setAccess] = useState<AccessFilter>('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasActiveFilters =
    sort !== 'newest' ||
    keywords.length > 0 ||
    source !== 'all' ||
    year !== 'all' ||
    access !== 'all';

  const clearAll = useCallback(() => {
    setSort('newest');
    setKeywords([]);
    setSource('all');
    setYear('all');
    setAccess('all');
  }, []);

  // Build active filters list for chip display
  const sourceLabels: Record<SourceFilter, string> = {
    all: t('sourceAll'),
    pubmed: 'PubMed',
    europepmc: 'Europe PMC',
    semanticscholar: 'Semantic Scholar',
  };
  const sortLabels: Record<SortOption, string> = {
    newest: t('sortNewest'),
    popular: t('sortPopular'),
    cited: t('sortCited'),
  };
  const accessLabels: Record<AccessFilter, string> = {
    all: t('accessAll'),
    open: t('accessOpen'),
    paywalled: t('accessPaywalled'),
  };

  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];
    if (sort !== 'newest') {
      filters.push({ type: 'sort', label: `${t('sortLabel')}: ${sortLabels[sort]}`, value: sort });
    }
    for (const kw of keywords) {
      filters.push({ type: 'keyword', label: `"${kw}"`, value: kw });
    }
    if (source !== 'all') {
      filters.push({ type: 'source', label: sourceLabels[source], value: source });
    }
    if (year !== 'all') {
      filters.push({ type: 'year', label: year, value: year });
    }
    if (access !== 'all') {
      filters.push({ type: 'access', label: accessLabels[access], value: access });
    }
    return filters;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, keywords, source, year, access]);

  const removeFilter = useCallback((filter: ActiveFilter) => {
    switch (filter.type) {
      case 'sort':
        setSort('newest');
        break;
      case 'keyword':
        setKeywords((prev) => prev.filter((k) => k !== filter.value));
        break;
      case 'source':
        setSource('all');
        break;
      case 'year':
        setYear('all');
        break;
      case 'access':
        setAccess('all');
        break;
    }
  }, []);

  // Derive available years from data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    for (const p of papers) {
      if (p.publishedDate) {
        years.add(new Date(p.publishedDate).getFullYear().toString());
      }
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [papers]);

  // Filtered + sorted papers
  const filtered = useMemo(() => {
    let result = papers;

    if (source !== 'all') {
      result = result.filter((p) => (p.source || 'pubmed') === source);
    }
    if (year !== 'all') {
      result = result.filter(
        (p) => p.publishedDate && new Date(p.publishedDate).getFullYear().toString() === year
      );
    }
    if (access === 'open') {
      result = result.filter((p) => p.isOpenAccess === true);
    } else if (access === 'paywalled') {
      result = result.filter((p) => p.isOpenAccess === false);
    }
    if (keywords.length > 0) {
      result = result.filter((p) => {
        const text = `${p.title} ${p.abstract || ''}`.toLowerCase();
        return keywords.every((kw) => text.includes(kw));
      });
    }

    if (sort === 'popular') {
      result = [...result].sort((a, b) => {
        const diff = (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0);
        if (diff !== 0) return diff;
        return (b.publishedDate || '').localeCompare(a.publishedDate || '');
      });
    } else if (sort === 'cited') {
      result = [...result].sort((a, b) => {
        const diff = (b.citationCount || 0) - (a.citationCount || 0);
        if (diff !== 0) return diff;
        return (b.publishedDate || '').localeCompare(a.publishedDate || '');
      });
    } else {
      result = [...result].sort((a, b) =>
        (b.publishedDate || '').localeCompare(a.publishedDate || '')
      );
    }

    return result;
  }, [papers, source, year, access, keywords, sort, likeCounts]);

  const filterProps = {
    sort,
    onSortChange: setSort,
    keywords,
    onKeywordsChange: setKeywords,
    source,
    onSourceChange: setSource,
    year,
    onYearChange: setYear,
    availableYears,
    access,
    onAccessChange: setAccess,
  };

  return (
    <div className="mt-8 flex gap-6">
      {/* Desktop sidebar — narrower */}
      <aside className="hidden w-48 shrink-0 lg:block">
        <div className="sticky top-24">
          <ResearchFilters {...filterProps} />
        </div>
      </aside>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 end-0 z-50 w-72 overflow-y-auto bg-white p-6 shadow-xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-warm-900">{t('filters')}</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-lg p-1 text-warm-400 hover:bg-warm-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ResearchFilters {...filterProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Paper list */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Header row: count + filter icon (mobile) */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-400">
            {t('paperCount', { filtered: filtered.length, total: papers.length })}
          </p>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="rounded-lg p-1.5 text-warm-400 hover:bg-warm-100 lg:hidden"
            aria-label={t('filters')}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <span
                key={`${f.type}-${f.value}`}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs text-primary-700"
              >
                {f.label}
                <button
                  onClick={() => removeFilter(f)}
                  className="rounded-full p-0.5 hover:bg-primary-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="text-xs font-medium text-primary-600 hover:underline"
            >
              {t('clearAll')}
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
            <p className="text-warm-500">{t('noResults')}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((paper) => (
              <motion.div
                key={paper.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ResearchCard
                  paper={paper}
                  likeCount={likeCounts[paper.id] || 0}
                  onLikeChange={handleLikeChange}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
