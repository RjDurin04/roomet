"use client";

import { Upload, X } from 'lucide-react';

import { type ImageItem } from '../types';

interface StepGalleryProps {
  images: ImageItem[];
  setImages: (images: ImageItem[]) => void;
  errors: Record<string, string>;
}

export function StepGallery({ images, setImages, errors }: StepGalleryProps) {
  const MAX_IMAGES = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) return;

    const files = Array.from(e.target.files || []).slice(0, remainingSlots);
    const newItems = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setImages([...images, ...newItems]);
  };

  const removeImage = (idx: number) => {
    const newImages = [...images];
    const removed = newImages.splice(idx, 1)[0];
    if (removed && !removed.storageId) {
      URL.revokeObjectURL(removed.url);
    }
    setImages(newImages);
  };

  const isLimitReached = images.length >= MAX_IMAGES;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-black tracking-tight italic uppercase">Property Gallery</h3>
          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {isLimitReached ? <span className="text-primary">Limit Reached ({MAX_IMAGES}/{MAX_IMAGES})</span> : `Add up to ${MAX_IMAGES} photos to showcase your property`}
          </p>
        </div>
        <label 
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${isLimitReached ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' : 'bg-primary text-primary-foreground cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20'}`}
        >
          <Upload className="w-4 h-4" /> Add Photos
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
            disabled={isLimitReached}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="group relative aspect-square rounded-[24px] md:rounded-[32px] overflow-hidden border border-border/50 bg-muted/30">
            <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => removeImage(idx)}
                className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {idx === 0 && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                Cover Photo
              </div>
            )}
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full py-12 md:py-20 border-2 border-dashed border-border/50 rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center gap-4 text-muted-foreground bg-muted/5">
             <div className="p-4 bg-muted rounded-2xl">
               <Upload className="w-8 h-8 opacity-20" />
             </div>
             <p className="text-xs font-bold uppercase tracking-widest opacity-40">No photos uploaded yet</p>
          </div>
        )}
      </div>
      {Boolean(errors['images']) && <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1">{errors['images']}</p>}
    </div>
  );
}
