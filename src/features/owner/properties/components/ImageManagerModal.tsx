"use client";

import { motion } from 'framer-motion';
import { X, Image as ImageIcon } from 'lucide-react';


interface ImageManagerModalProps {
  property: { name: string; imageUrls?: string[] } | null;
  onClose: () => void;
}

export function ImageManagerModal({ property, onClose }: ImageManagerModalProps) {
  if (!property) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl border border-border/50 shadow-2xl p-8 relative custom-scrollbar"
      >
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-black tracking-tight mb-2">Property Images</h2>
        <p className="text-muted-foreground font-medium mb-8">Gallery for {property.name}</p>
        
        {(property.imageUrls?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {property.imageUrls?.map((url: string, idx: number) => (
              <div key={idx} className="aspect-square rounded-[24px] overflow-hidden bg-muted relative group border border-border/50 shadow-sm">
                <img src={url} alt={`Property image ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
                {idx === 0 && <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md">Main Cover</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-1">No images uploaded</h3>
            <p className="text-sm font-medium text-muted-foreground">This property doesn't have any images yet.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
