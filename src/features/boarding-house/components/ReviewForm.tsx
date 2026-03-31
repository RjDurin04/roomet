import { Star, ChevronLeft } from 'lucide-react';
import type { FormEvent } from 'react';

import { cn } from '@/lib/utils';

const RATING_STEPS = [1, 2, 3, 4, 5];

interface ReviewFormProps {
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  newRating: number;
  setNewRating: (rating: number) => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  isSubmitting: boolean;
}

export function ReviewForm({
  onSubmit,
  onCancel,
  newRating,
  setNewRating,
  newComment,
  setNewComment,
  isSubmitting,
}: ReviewFormProps) {
  return (
    <div className="space-y-6 w-full">
      <button
        onClick={onCancel}
        className="w-full py-4 bg-white hover:bg-white/90 text-black font-black rounded-2xl transition-all shadow-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Cancel
      </button>

      <form
        onSubmit={onSubmit}
        className="bg-white/5 p-6 rounded-[28px] border border-white/10 space-y-6 flex flex-col items-center"
      >
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Rate this property
          </h3>
          <div className="flex items-center gap-2.5">
            {RATING_STEPS.map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setNewRating(star)}
                className={cn(
                  "transition-all",
                  star <= newRating ? "text-amber-500 scale-110" : "text-white/10 hover:text-white/20"
                )}
              >
                <Star className={cn("w-8 h-8", star <= newRating && "fill-current")} />
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Tell us about your stay..."
          className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-xs font-bold leading-relaxed text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-all resize-none h-32"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-primary text-primary-foreground font-black rounded-xl transition-all disabled:opacity-50 text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
