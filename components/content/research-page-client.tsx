'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { ResearchCard, type SummaryLevel } from './research-card';
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

export interface EngagementCounts {
  copy: number;
  share: number;
}

interface Props {
  papers: ResearchPaper[];
  likeCounts: Record<string, number>;
  engagementCounts: Record<string, EngagementCounts>;
  commentCounts: Record<string, number>;
}

const VALID_LEVELS = new Set<SummaryLevel>(['simple', 'adult', 'professional', 'abstract']);

export function ResearchPageClient({ papers, likeCounts: initialLikeCounts, engagementCounts: initialEngagement, commentCounts: initialCommentCounts }: Props) {
  const searchParams = useSearchParams();
  const focusPaperId = searchParams.get('paper');
  const urlLevel = searchParams.get('level') as SummaryLevel | null;
  const initialLevel = urlLevel && VALID_LEVELS.has(urlLevel) ? urlLevel : undefined;

  // Scroll to the focused paper on mount
  useEffect(() => {
    if (!focusPaperId) return;
    // Delay to ensure DOM is rendered after hydration
    const timer = setTimeout(() => {
      const el = document.getElementById(`paper-${focusPaperId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Brief highlight
        el.classList.add('ring-2', 'ring-primary-400');
        setTimeout(() => el.classList.remove('ring-2', 'ring-primary-400'), 2000);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [focusPaperId]);

  // Lifted counts state so popularity sort updates immediately
  const [likeCounts, setLikeCounts] = useState(initialLikeCounts);
  const [engagementCounts, setEngagementCounts] = useState(initialEngagement);
  const [commentCounts, setCommentCounts] = useState(initialCommentCounts);

  const handleLikeChange = useCallback((paperId: string, delta: number) => {
    setLikeCounts((prev) => ({
      ...prev,
      [paperId]: Math.max(0, (prev[paperId] || 0) + delta),
    }));
  }, []);

  const handleEngagement = useCallback((paperId: string, type: 'copy' | 'share') => {
    setEngagementCounts((prev) => {
      const current = prev[paperId] || { copy: 0, share: 0 };
      return { ...prev, [paperId]: { ...current, [type]: current[type] + 1 } };
    });
  }, []);

  const handleCommentCountChange = useCallback((paperId: string, delta: number) => {
    setCommentCounts((prev) => ({
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
    all: 'All',
    pubmed: 'PubMed',
    europepmc: 'Europe PMC',
    semanticscholar: 'Semantic Scholar',
  };
  const sortLabels: Record<SortOption, string> = {
    newest: 'Newest',
    popular: 'Most Popular',
    cited: 'Most Cited',
  };
  const accessLabels: Record<AccessFilter, string> = {
    all: 'All',
    open: 'Open Access',
    paywalled: 'Paywalled',
  };

  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];
    if (sort !== 'newest') {
      filters.push({ type: 'sort', label: `Sort: ${sortLabels[sort]}`, value: sort });
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
      const popularity = (id: string) => {
        const eng = engagementCounts[id] || { copy: 0, share: 0 };
        return (likeCounts[id] || 0) + eng.copy + eng.share + (commentCounts[id] || 0);
      };
      result = [...result].sort((a, b) => {
        const diff = popularity(b.id) - popularity(a.id);
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
  }, [papers, source, year, access, keywords, sort, likeCounts, engagementCounts, commentCounts]);

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
    <div className="mt-8 lg:flex lg:gap-10">
      {/* Desktop sidebar */}
      <aside className="hidden w-40 shrink-0 lg:block">
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
                <h2 className="text-lg font-semibold text-warm-900">Filters</h2>
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
            {filtered.length} / {papers.length} papers
          </p>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="rounded-lg p-1.5 text-warm-400 hover:bg-warm-100 lg:hidden"
            aria-label="Filters"
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
              Clear all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-warm-200 bg-warm-50 p-8 text-center">
            <p className="text-warm-500">No papers match your filters. Try adjusting or clearing them.</p>
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
                  engagement={engagementCounts[paper.id] || { copy: 0, share: 0 }}
                  onEngagement={handleEngagement}
                  commentCount={commentCounts[paper.id] || 0}
                  onCommentCountChange={handleCommentCountChange}
                  autoOpenComments={paper.id === focusPaperId && (commentCounts[paper.id] || 0) > 0}
                  initialLevel={paper.id === focusPaperId ? initialLevel : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
