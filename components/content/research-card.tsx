'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { LockOpen, Lock, FileText, ExternalLink, Heart, MessageCircle, Link2, Check, Share2, Send, Loader2 } from 'lucide-react';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

interface Comment {
  id: string;
  text: string;
  createdAt: string | null;
  userName: string | null;
  userImage: string | null;
}

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

export type SummaryLevel = 'simple' | 'adult' | 'professional' | 'abstract';

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
  engagement = { copy: 0, share: 0 },
  onEngagement,
  commentCount = 0,
  onCommentCountChange,
  autoOpenComments = false,
  initialLevel,
}: {
  paper: Paper;
  likeCount?: number;
  onLikeChange?: (paperId: string, delta: number) => void;
  engagement?: { copy: number; share: number };
  onEngagement?: (paperId: string, type: 'copy' | 'share') => void;
  commentCount?: number;
  onCommentCountChange?: (paperId: string, delta: number) => void;
  autoOpenComments?: boolean;
  initialLevel?: SummaryLevel;
}) {
  // Default tab: URL param > aiSummaryAdult > 'abstract'
  const defaultLevel: SummaryLevel = initialLevel ?? (paper.aiSummaryAdult ? 'adult' : 'abstract');
  const [level, setLevel] = useState<SummaryLevel>(defaultLevel);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const trackedEngagement = useRef(new Set<string>());

  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(autoOpenComments);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsFetched, setCommentsFetched] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = useCallback(async () => {
    if (commentsFetched || commentsLoading) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/research-comments?paperId=${encodeURIComponent(paper.id)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        setCommentsFetched(true);
      }
    } catch {
      // ignore
    } finally {
      setCommentsLoading(false);
    }
  }, [paper.id, commentsFetched, commentsLoading]);

  const toggleComments = useCallback(() => {
    setCommentsOpen((prev) => {
      const next = !prev;
      if (next && !commentsFetched) fetchComments();
      return next;
    });
  }, [commentsFetched, fetchComments]);

  // Auto-focus textarea when comments open
  useEffect(() => {
    if (commentsOpen && textareaRef.current) {
      // Small delay to ensure section is rendered
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [commentsOpen]);

  // Auto-open: fetch comments on mount if autoOpenComments
  useEffect(() => {
    if (autoOpenComments && !commentsFetched) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenComments]);

  const submitComment = useCallback(async () => {
    const trimmed = commentText.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setCommentError(null);
    try {
      const res = await fetch('/api/research-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id, text: trimmed }),
      });
      if (res.ok) {
        const newComment: Comment = await res.json();
        setComments((prev) => [newComment, ...prev]);
        setCommentText('');
        onCommentCountChange?.(paper.id, 1);
      } else {
        const data = await res.json().catch(() => null);
        setCommentError(data?.error || 'Failed to post comment');
      }
    } catch {
      setCommentError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  }, [commentText, submitting, paper.id, onCommentCountChange]);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && 'share' in navigator);

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

  const getShareUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('paper', paper.id);
    url.searchParams.set('level', level);
    return url.toString();
  }, [paper.id, level]);

  const trackEngagement = useCallback((type: 'copy' | 'share') => {
    if (trackedEngagement.current.has(type)) return;
    trackedEngagement.current.add(type);
    onEngagement?.(paper.id, type);
    const visitorId = getVisitorId();
    fetch('/api/research-engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperId: paper.id, visitorId, type }),
    }).catch(() => {});
  }, [paper.id, onEngagement]);

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(getShareUrl()).then(() => {
      trackEngagement('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [getShareUrl, trackEngagement]);

  const nativeShare = useCallback(() => {
    navigator.share({
      title: paper.title,
      url: getShareUrl(),
    }).then(() => {
      trackEngagement('share');
    }).catch(() => {});
  }, [paper.title, getShareUrl, trackEngagement]);

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
    simple: 'Simple',
    adult: 'Standard',
    professional: 'Technical',
    abstract: 'Original',
  };

  return (
    <div id={`paper-${paper.id}`} className="overflow-hidden rounded-xl border border-warm-200 bg-card p-5 transition-shadow duration-500">
      {/* Badges + link: separate row on mobile, inline with title on desktop */}
      {(paper.isOpenAccess != null || articleUrl) && (
        <div className="mb-2 flex items-center justify-end gap-2 sm:hidden">
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
                <LockOpen className="h-3 w-3" /> Open Access
              </Badge>
            ) : (
              <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
                <Lock className="h-3 w-3" /> Paywalled
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
          <span className="text-xs">{paper.citationCount} citations</span>
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

      {/* Card footer */}
      <div className="mt-4 flex items-center gap-2 border-t border-warm-100 pt-3">
        <button
          onClick={toggleLike}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            liked
              ? 'bg-coral-100 text-coral-700'
              : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
          }`}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
          {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
        </button>

        <button
          onClick={toggleComments}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            commentsOpen
              ? 'bg-primary-100 text-primary-700'
              : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
          }`}
          aria-label="Comments"
        >
          <MessageCircle className={`h-3.5 w-3.5 ${commentsOpen ? 'fill-current' : ''}`} />
          {commentCount > 0 && <span className="tabular-nums">{commentCount}</span>}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={copyShareLink}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
            }`}
            aria-label="Copy link"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {engagement.copy > 0 && <span className="tabular-nums">{engagement.copy}</span>}
          </button>
          {canNativeShare && (
            <button
              onClick={nativeShare}
              className="inline-flex items-center gap-1.5 rounded-full bg-warm-100 px-2.5 py-1.5 text-xs font-medium text-warm-600 transition-colors hover:bg-warm-200"
              aria-label="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
              {engagement.share > 0 && <span className="tabular-nums">{engagement.share}</span>}
            </button>
          )}
        </div>
      </div>

      {/* Inline comments section */}
      {commentsOpen && (
        <div className="mt-3 border-t border-warm-100 pt-3">
          {commentsLoading && !commentsFetched ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-warm-400" />
            </div>
          ) : (
            <>
              {/* Comment list */}
              {comments.length > 0 && (
                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      {c.userImage ? (
                        <img
                          src={c.userImage}
                          alt=""
                          className="h-6 w-6 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warm-200 text-xs font-medium text-warm-600">
                          {(c.userName || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium text-warm-700">
                            {c.userName || 'Anonymous'}
                          </span>
                          {c.createdAt && (
                            <span className="text-xs text-warm-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-warm-600">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment input */}
              <div className="mt-3">
                {!isClerkConfigured ? (
                  <p className="text-xs italic text-warm-400">
                    Comments are unavailable (authentication not configured).
                  </p>
                ) : (
                  <>
                    <SignedOut>
                      <div className="flex items-center gap-2 rounded-lg border border-warm-100 bg-warm-50 p-3">
                        <p className="text-sm text-warm-500">
                          <SignInButton mode="modal">
                            <button className="font-medium text-primary-600 hover:underline">
                              Sign in
                            </button>
                          </SignInButton>
                          {' '}to join the discussion
                        </p>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex gap-2">
                        <textarea
                          ref={textareaRef}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                              e.preventDefault();
                              submitComment();
                            }
                          }}
                          placeholder="Add a comment..."
                          maxLength={1000}
                          rows={2}
                          className="min-h-[2.5rem] flex-1 resize-none rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-700 placeholder:text-warm-400 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
                        />
                        <button
                          onClick={submitComment}
                          disabled={submitting || commentText.trim().length === 0}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Send comment"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {commentError && (
                        <p className="mt-1.5 text-xs text-red-600">{commentError}</p>
                      )}
                    </SignedIn>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
