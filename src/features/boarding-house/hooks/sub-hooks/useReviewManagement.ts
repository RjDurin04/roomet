import { useMutation } from 'convex/react';
import { useState } from 'react';

import { api } from '../../../../../convex/_generated/api';

import { DEFAULT_RATING } from '@/lib/constants';

export function useReviewManagement(propertyId: string) {
  const submitReviewMutation = useMutation(api.reviews.create);
  const updateReviewMutation = useMutation(api.reviews.update);
  const deleteReviewMutation = useMutation(api.reviews.remove);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(DEFAULT_RATING);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await submitReviewMutation({ 
        propertyId: propertyId as any, 
        rating: newRating, 
        comment: newComment.trim() 
      });
      setNewComment('');
      setNewRating(DEFAULT_RATING);
      setShowReviewForm(false);
    } catch (err: unknown) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReview = async (reviewId: string, rating: number, comment: string) => {
    setIsSubmitting(true);
    try {
      await updateReviewMutation({ id: reviewId as any, rating, comment: comment.trim() });
      setEditingReviewId(null);
    } catch (err: unknown) {
      console.error('Failed to update review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    setIsSubmitting(true);
    try {
      await deleteReviewMutation({ id: reviewId as any });
    } catch (err: unknown) {
      console.error('Failed to delete review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showReviewForm, setShowReviewForm,
    editingReviewId, setEditingReviewId,
    newRating, setNewRating,
    newComment, setNewComment,
    isSubmitting, handleSubmitReview,
    handleUpdateReview, handleDeleteReview,
  };
}
