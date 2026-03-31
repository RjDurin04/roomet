import { X, Heart, Star, Building2 } from 'lucide-react';

import type { Id } from '../../../../convex/_generated/dataModel';

import { cn } from '@/lib/utils';

interface PropertyHeaderProps {
  name: string;
  images: string[];
  available: boolean;
  rating: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onClose: () => void;
  onImageClick: (index: number) => void;
  id: Id<"properties">;
}

export function PropertyHeader({
  name,
  images,
  available,
  rating,
  isBookmarked,
  onToggleBookmark,
  onClose,
  onImageClick,
}: PropertyHeaderProps) {
  return (
    <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div 
          onClick={() => images.length > 0 && onImageClick(0)}
          className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 cursor-pointer hover:border-primary transition-all group"
        >
          {images[0] ? (
            <img src={images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <Building2 className="w-6 h-6" />
            </div>
          )}
        </div>
        
        <div className="min-w-0">
          <h2 className="text-xl font-black uppercase tracking-tighter leading-none mb-1.5 truncate max-w-[200px]">{name}</h2>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
              available ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}>
              {available ? 'Available' : 'Occupied'}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span className="text-[9px] font-bold">{rating > 0 ? rating.toFixed(1) : "New"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <button 
           onClick={onToggleBookmark} 
           className={cn(
             "p-2.5 rounded-xl border transition-all cursor-pointer",
             isBookmarked ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
           )}
           title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
         >
            <Heart className={cn("w-4 h-4", isBookmarked && "fill-current")} />
         </button>
         <button
          onClick={onClose}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer group"
          title="Close details"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        </button>
      </div>
    </div>
  );
}
