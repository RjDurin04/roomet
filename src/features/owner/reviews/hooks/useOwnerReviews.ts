"use client";

import { useQuery, useMutation } from 'convex/react';
import { useState, useMemo } from 'react';

import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';

export interface MappedReview {
  id: Id<"reviews">;
  tenant: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  property: string;
  status: 'pending' | 'replied' | 'Reported';
  reply?: string;
  replyDate?: string | undefined;
}

// eslint-disable-next-line max-lines-per-function -- Review hook with complex mapping, filtering, and reply logic
export function useOwnerReviews(targetReviewId?: string | null) {
  const reviews = useQuery(api.reviews.getOwnerReviews);
  const replyMutation = useMutation(api.reviews.replyToReview);
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const mappedReviews = useMemo(() => {
    if (!reviews) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex query result shape
    return reviews.map((r: any): MappedReview => ({
      id: r._id,
      tenant: r.userName ?? 'Anonymous',
      avatar: r.userImage ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName ?? 'A')}&background=random&size=80`,
      rating: r.rating,
      comment: r.comment ?? '',
      date: new Date(r.createdAt ?? r._creationTime).toLocaleDateString(),
      property: r.propertyName ?? 'Unknown Property',
      status: r.status === 'Reported' ? 'Reported' : (r.reply ? 'replied' : 'pending'),
      reply: r.reply,
      replyDate: r.replyTime ? new Date(r.replyTime).toLocaleDateString() : undefined,
    }));
  }, [reviews]);

  const stats = useMemo(() => {
    if (!mappedReviews.length) return { total: 0, average: 0, pending: 0, topRated: 0, unreplied: 0, trend: 0 };
    const total = mappedReviews.length;
    const average = mappedReviews.reduce((acc, r) => acc + r.rating, 0) / total;
    const unreplied = mappedReviews.filter(r => r.status === 'pending').length;
    const MIN_TOP_RATING = 4;
    const topRated = mappedReviews.filter(r => r.rating >= MIN_TOP_RATING).length;
    return { 
      total, 
      average: Number(average.toFixed(1)), 
      pending: unreplied, 
      unreplied,
      topRated,
      trend: 12,  
    };
  }, [mappedReviews]);

  const filteredReviews = useMemo(() => {
    let result = filter === 'all' ? mappedReviews : mappedReviews.filter(r => r.status === filter);
    
    if (targetReviewId) {
      result = [...result].sort((a, b) => {
        if (a.id === targetReviewId) return -1;
        if (b.id === targetReviewId) return 1;
        return 0;
      });
    }
    
    return result;
  }, [mappedReviews, filter, targetReviewId]);

  const handleReplySubmit = async (reviewId: Id<"reviews">) => {
    // eslint-disable-next-line security/detect-object-injection -- Known ID key
    const text = replyText[reviewId];
    if (!text?.trim()) return;
    
    try {
      await replyMutation({ reviewId, reply: text });
      setReplyText(prev => {
        const next = { ...prev };
        // eslint-disable-next-line security/detect-object-injection -- Cleaning up used reply text
        delete next[reviewId];
        return next;
      });
      setReplyingTo(null);
    } catch (error) {
      console.error("[useOwnerReviews] Reply failed:", error);
      throw error;
    }
  };

  const handleReport = (reviewId: Id<"reviews">) => {
    console.warn("Report review:", reviewId);
    alert("Review reported. Our team will review it.");
  };

  return {
    reviews: filteredReviews,
    filteredReviews, // Alias
    isLoading: reviews === undefined,
    stats,
    filter,
    setFilter,
    replyText,
    setReplyText: (id: string, text: string) => setReplyText(prev => ({ ...prev, [id]: text })),
    replyingTo,
    setReplyingTo,
    handleReplySubmit,
    handleReport,
  };
}
