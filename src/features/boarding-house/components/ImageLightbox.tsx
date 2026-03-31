import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: string[];
  activeIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ImageLightbox({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
}: ImageLightboxProps) {
  return (
    <AnimatePresence>
      {activeIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-20 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer z-[120]"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center gap-8 group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className={cn(
                "p-5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all opacity-40 hover:opacity-100 border border-white/5",
                images.length <= 1 && "hidden"
              )}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <motion.div
              key={activeIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-5xl max-h-full aspect-auto rounded-[32px] overflow-hidden shadow-2xl bg-black border border-white/10"
            >
              {activeIndex !== null && images[activeIndex] && (
                <img src={images[activeIndex]} className="w-full h-full object-contain" alt="" />
              )}
            </motion.div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className={cn(
                "p-5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all opacity-40 hover:opacity-100 border border-white/5",
                images.length <= 1 && "hidden"
              )}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
          <div className="absolute bottom-10 flex items-center gap-3">
            {images.length > 1 && images.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  idx === activeIndex
                    ? "w-12 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                    : "w-1.5 bg-white/10"
                )}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
