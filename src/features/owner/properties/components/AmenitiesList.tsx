"use client";

/* eslint-disable no-magic-numbers */
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';



interface AmenitiesListProps {
  amenities: string[];
  selectedAmenities: string[];
  onToggle: (amenity: string) => void;
}

export function AmenitiesList({ amenities, selectedAmenities, onToggle }: AmenitiesListProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {amenities.map((amenity, idx) => {
        const isSelected = selectedAmenities.includes(amenity);
        return (
          <motion.button
            key={amenity}
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.02 }}
            onClick={() => onToggle(amenity)}
            className={`flex items-center gap-3 p-5 rounded-3xl border transition-all relative overflow-hidden group ${
              isSelected 
                ? 'bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' 
                : 'bg-card border-border hover:border-primary/30 hover:bg-primary/5 text-foreground'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-white/20' : 'bg-muted group-hover:bg-primary/10'}`}>
              <Check className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`} />
            </div>
            <span className="text-[12px] font-black uppercase tracking-tight">{amenity}</span>
            {isSelected && (
               <motion.div 
                layoutId="active-bg"
                className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60 -z-10"
               />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
