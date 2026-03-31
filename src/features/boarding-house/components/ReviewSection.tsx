import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import type { FormEvent } from 'react';

import { ReviewForm } from './ReviewForm';
import { ReviewItem } from './ReviewItem';

import { RATING_STEPS } from '@/lib/constants';
import { cn } from '@/lib/utils';


interface ReviewSectionProps {
  rating: number;
  reviewsCount: number;
  reviews: {
    _id: string;
    userId: string;
    userName: string;
    userImage?: string;
    createdAt: number;
    rating: number;
    comment?: string;
    reply?: string;
  }[];
  currentUser: {
    profileId?: string;
    name?: string;
    image?: string;
  } | null | undefined;
  showReviewForm: boolean;
  setShowReviewForm: (show: boolean) => void;
  newRating: number;
  setNewRating: (rating: number) => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  isSubmitting: boolean;
  onSubmitReview: (e: FormEvent) => void;
  onUpdateReview: (id: string, rating: number, comment: string) => void;
  onDeleteReview: (id: string) => void;
  editingReviewId: string | null;
  setEditingReviewId: (id: string | null) => void;
  targetReviewId: string | null;
}

export function ReviewSection({
  rating,
  reviewsCount,
  reviews,
  currentUser,
  showReviewForm,
  setShowReviewForm,
  newRating,
  setNewRating,
  newComment,
  setNewComment,
  isSubmitting,
  onSubmitReview,
  onUpdateReview,
  onDeleteReview,
  editingReviewId,
  setEditingReviewId,
  targetReviewId,
}: ReviewSectionProps) {
  return (
    <motion.div
      key="reputation"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-6"
    >
      <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <h2 className="text-4xl font-black tracking-tighter text-white mb-1.5">
          {rating > 0 ? rating.toFixed(1) : "N/A"}
        </h2>
        <div className="flex items-center gap-1 text-amber-500 mb-1.5">
          {RATING_STEPS.map((star) => (
            <Star
              key={star}
              className={cn("w-3 h-3", star <= Math.round(rating) ? "fill-current" : "opacity-10")}
            />
          ))}
        </div>
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
          {reviewsCount} REVIEWS
        </p>
      </div>

      {currentUser && (
        <div className="flex flex-col items-center">
          {showReviewForm ? (
            <ReviewForm
              onSubmit={onSubmitReview}
              onCancel={() => setShowReviewForm(false)}
              newRating={newRating}
              setNewRating={setNewRating}
              newComment={newComment}
              setNewComment={setNewComment}
              isSubmitting={isSubmitting}
            />
          ) : (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full py-3.5 bg-white hover:bg-white/90 text-black font-black rounded-xl transition-all shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group"
            >
              <Star className="w-3.5 h-3.5 fill-black" />
              Write a Review
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <ReviewEmptyState />
        ) : (
          reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              currentUserProfileId={currentUser?.profileId}
              isTarget={targetReviewId === review._id}
              isEditing={editingReviewId === review._id}
              onEdit={() => setEditingReviewId(review._id)}
              onCancelEdit={() => setEditingReviewId(null)}
              onUpdate={onUpdateReview}
              onDelete={onDeleteReview}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

function ReviewEmptyState() {
  return (
    <div className="py-20 text-center space-y-3 opacity-20 italic">
      <MessageSquare className="w-10 h-10 mx-auto" />
      <p className="text-[10px] font-black uppercase tracking-widest">Feed Empty</p>
    </div>
  );
}
