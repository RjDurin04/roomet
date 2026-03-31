import { UserCircle2, Check, Pencil, Trash2, X, Save, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

interface ReviewItemProps {
  review: {
    _id: string;
    userId: string;
    userName: string;
    userImage?: string;
    createdAt: number;
    rating: number;
    comment?: string;
    reply?: string;
  };
  currentUserProfileId?: string | undefined;
  isTarget: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, rating: number, comment: string) => void;
  onDelete: (id: string) => void;
}

const RATING_STEPS = [1, 2, 3, 4, 5];

export function ReviewItem({ 
  review, 
  currentUserProfileId, 
  isTarget, 
  isEditing, 
  onEdit, 
  onCancelEdit, 
  onUpdate, 
  onDelete 
}: ReviewItemProps) {
  const isOwner = currentUserProfileId === review.userId;
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment || '');

  // Reset local state when editing is toggled
  useEffect(() => {
    if (isEditing) {
      setEditRating(review.rating);
      setEditComment(review.comment || '');
    }
  }, [isEditing, review.rating, review.comment]);

  const handleSave = () => {
    onUpdate(review._id, editRating, editComment);
  };

  return (
    <div
      id={`review-${review._id}`}
      className={cn(
        "p-4 bg-white/[0.02] border rounded-2xl transition-all space-y-3 shadow-sm group relative",
        isTarget
          ? "border-primary/50 bg-primary/[0.03] ring-1 ring-primary/20 shadow-primary/5"
          : "border-white/5 hover:border-white/10",
        isEditing && "border-primary/30 bg-primary/[0.02]"
      )}
    >
      {/* Management Actions */}
      {isOwner && !isEditing && (
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
            title="Edit review"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(review._id)}
            className="p-1.5 hover:bg-rose-500/10 rounded-lg text-white/40 hover:text-rose-500 transition-colors"
            title="Delete review"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
            {review.userImage ? (
              <img src={review.userImage} className="w-full h-full object-cover" alt={review.userName} />
            ) : (
              <UserCircle2 className="w-4 h-4 text-white/20" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-tight">{review.userName}</p>
            <p className="text-[7px] font-black uppercase tracking-widest text-white/20 mt-0.5">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {!isEditing && (
          <div className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20 text-[9px] font-black">
            {review.rating.toFixed(1)}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-1.5">
            {RATING_STEPS.map((star: any) => (
              <button
                key={star}
                onClick={() => setEditRating(star)}
                className={cn(
                  "transition-all",
                  star <= editRating ? "text-amber-500" : "text-white/10 hover:text-white/20"
                )}
              >
                <Star className={cn("w-4 h-4", star <= editRating && "fill-current")} />
              </button>
            ))}
          </div>
          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[11px] font-medium leading-relaxed text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-all resize-none h-20"
            placeholder="Edit your review..."
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Save className="w-3 h-3" />
              Save Changes
            </button>
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {review.comment && <p className="text-xs font-bold leading-relaxed text-white/60">"{review.comment}"</p>}
          {review.reply && (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Owner Reply</span>
              </div>
              <p className="text-[11px] font-medium text-white/50">{review.reply}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
