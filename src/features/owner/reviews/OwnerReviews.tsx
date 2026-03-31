"use client";
/* eslint-disable no-magic-numbers, max-lines, max-lines-per-function, complexity */

import { AnimatePresence, motion } from 'framer-motion';
import { Star, MessageSquare, CheckCircle, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Inbox, Send, Flag, Building2 } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { useSearchParams } from 'react-router-dom';

import { useOwnerReviews } from './hooks/useOwnerReviews';

const REVIEWS_PER_PAGE = 15;

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  const w = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_: any, i: any) => (
        <Star key={i} className={`${w} ${i < rating ? 'fill-amber-500 text-amber-500' : 'fill-muted text-muted'}`} />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Reported') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
        <AlertTriangle className="w-3 h-3" /> Reported
      </span>
    );
  }
  if (status === 'replied') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
        <CheckCircle className="w-3 h-3" /> Replied
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
      <MessageSquare className="w-3 h-3" /> Pending
    </span>
  );
}

 
export function OwnerReviews() {
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('reviewId') || searchParams.get('highlight');
  
  const or = useOwnerReviews(targetId);

  const [expandedId, setExpandedId] = useState<string | null>(targetId ?? null);
  const [page, setPage] = useState(1);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  const handleFilterChange = (f: 'all' | 'pending' | 'replied') => {
    or.setFilter(f);
    setPage(1);
  };



  // Auto-focus reply textarea
  useEffect(() => {
    if (or.replyingTo) {
      setTimeout(() => replyInputRef.current?.focus(), 100);
    }
  }, [or.replyingTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(or.filteredReviews.length / REVIEWS_PER_PAGE));
  const pagedReviews = useMemo(() => {
    const start = (page - 1) * REVIEWS_PER_PAGE;
    return or.filteredReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [or.filteredReviews, page]);

  if (or.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const { stats } = or;
  const replyRate = stats.total === 0 ? 100 : Math.round(((stats.total - stats.unreplied) / stats.total) * 100);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
    // Close reply form if collapsing
    if (expandedId === id && or.replyingTo === id) {
      or.setReplyingTo(null);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Header Bar */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-10 pt-6 pb-4 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">Reviews & Feedback</h1>
            <p className="text-[11px] md:text-[12px] text-muted-foreground font-medium mt-0.5">
              {stats.total} reviews · {stats.average.toFixed(1)} avg · {stats.unreplied} awaiting reply
            </p>
          </div>

          {/* Compact Stats Inline */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Rating Pill */}
            <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 md:px-4 py-1.5 md:py-2">
              < Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-amber-500 text-amber-500" />
              <span className={`text-base md:text-lg font-black tabular-nums ${stats.average >= 4 ? 'text-emerald-500' : stats.average < 3 ? 'text-rose-500' : 'text-amber-500'}`}>
                {stats.average.toFixed(1)}
              </span>
              <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold">/5</span>
            </div>

            {/* Reply Rate Pill */}
            <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 md:px-4 py-1.5 md:py-2">
              <CheckCircle className={`w-3.5 h-3.5 md:w-4 md:h-4 ${replyRate === 100 ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-base md:text-lg font-black tabular-nums">{replyRate}%</span>
              <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold">replied</span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/50 overflow-x-auto scrollbar-none">
              {(['all', 'pending', 'replied'] as const).map((f: any) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold capitalize transition-all whitespace-nowrap ${
                    or.filter === f
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}{f === 'pending' && stats.unreplied > 0 ? ` (${stats.unreplied})` : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1fr_160px_100px_100px_80px] gap-4 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/30">
            <span>Tenant & Comment</span>
            <span>Property</span>
            <span>Rating</span>
            <span>Status</span>
            <span className="text-right">Date</span>
          </div>

          {/* Review Rows */}
          <div className="divide-y divide-border/30">
            {pagedReviews.map((review: any) => {
              const isExpanded = expandedId === review.id;
              const isTarget = targetId === review.id;
              const isReplying = or.replyingTo === review.id;

              return (
                <div 
                  key={review.id} 
                  className={`transition-all duration-500 ${isTarget ? 'bg-amber-500/5 ring-1 ring-inset ring-amber-500/30 shadow-[inset_4px_0_0_0_rgba(245,158,11,1)] relative z-10' : ''}`}
                >
                  {/* Compact Row */}
                  <button
                    onClick={() => toggleExpand(review.id)}
                    className={`w-full text-left grid grid-cols-1 md:grid-cols-[1fr_160px_100px_100px_80px] gap-2 md:gap-4 items-center px-5 py-3.5 hover:bg-muted/30 transition-colors group ${isExpanded ? 'bg-muted/20' : ''}`}
                  >
                    {/* Tenant + Comment Preview */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={review.avatar}
                        alt={review.tenant}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-border/50 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold truncate">{review.tenant}</p>
                        <p className="text-[12px] text-muted-foreground truncate">
                          {review.comment || <span className="italic opacity-60">No comment</span>}
                        </p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} opacity-0 group-hover:opacity-100`} />
                    </div>

                    {/* Property */}
                    <div className="hidden md:flex items-center gap-1.5 min-w-0">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[12px] font-medium text-muted-foreground truncate">{review.property}</span>
                    </div>

                    {/* Rating */}
                    <div className="hidden md:block">
                      <StarRating rating={review.rating} size="xs" />
                    </div>

                    {/* Status */}
                    <div className="hidden md:block">
                      <StatusBadge status={review.status} />
                    </div>

                    {/* Date */}
                    <span className="hidden md:block text-right text-[11px] font-medium text-muted-foreground tabular-nums">
                      {review.date}
                    </span>
                  </button>

                  {/* Expanded Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 ml-11 md:ml-[44px] border-l-2 border-primary/20 space-y-3">
                          {/* Mobile-only metadata */}
                          <div className="flex md:hidden items-center gap-3 flex-wrap">
                            <StarRating rating={review.rating} />
                            <StatusBadge status={review.status} />
                            <span className="text-[11px] text-muted-foreground">{review.date}</span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {review.property}
                            </span>
                          </div>

                          {/* Full Comment */}
                          {review.comment && (
                            <p className="text-[13px] text-foreground/90 leading-relaxed">
                              "{review.comment}"
                            </p>
                          )}

                          {/* Existing Reply */}
                          {review.reply && (
                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Your Response</span>
                                {review.replyDate && (
                                  <span className="text-[10px] text-muted-foreground ml-auto">{review.replyDate}</span>
                                )}
                              </div>
                              <p className="text-[13px] text-foreground/80 leading-relaxed">{review.reply}</p>
                            </div>
                          )}

                          {/* Reply Form */}
                          {!review.reply && isReplying && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-muted/20 rounded-xl p-3 border border-border/40 space-y-2"
                            >
                              <textarea
                                ref={replyInputRef}
                                value={or.replyText[review.id] ?? ''}
                                onChange={e => or.setReplyText(review.id, e.target.value)}
                                placeholder="Write a public response..."
                                rows={3}
                                className="w-full bg-background border border-border/50 rounded-lg p-3 text-[13px] resize-none outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => { or.setReplyingTo(null); or.setReplyText(review.id, ''); }}
                                  className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => void or.handleReplySubmit(review.id)}
                                  disabled={!(or.replyText[review.id] ?? '').trim()}
                                  className="px-4 py-1.5 bg-primary text-primary-foreground text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                  <Send className="w-3 h-3" /> Publish
                                </button>
                              </div>
                            </motion.div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            {!review.reply && !isReplying && (
                              <button
                                onClick={(e) => { e.stopPropagation(); or.setReplyingTo(review.id); }}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Reply
                              </button>
                            )}
                            {review.status !== 'Reported' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); or.handleReport(review.id); }}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Flag className="w-3.5 h-3.5" /> Report
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {or.filteredReviews.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <h3 className="text-sm font-bold text-muted-foreground mb-1">No reviews found</h3>
              <p className="text-[11px] text-muted-foreground/60">Try changing your filter settings</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-5 border-t border-border/30 mt-2">
              <p className="text-[11px] text-muted-foreground font-medium">
                Showing {(page - 1) * REVIEWS_PER_PAGE + 1}–{Math.min(page * REVIEWS_PER_PAGE, or.filteredReviews.length)} of {or.filteredReviews.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show pages around current page
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-bold transition-colors ${
                        page === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
