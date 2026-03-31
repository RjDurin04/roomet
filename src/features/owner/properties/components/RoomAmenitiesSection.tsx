"use client";

import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface RoomAmenitiesSectionProps {
  amenities: string[];
  onChange: (amenities: string[]) => void;
}

export function RoomAmenitiesSection({ amenities, onChange }: RoomAmenitiesSectionProps) {
  const [newAmenity, setNewAmenity] = useState('');

  const addAmenity = () => {
    if (newAmenity.trim()) {
      onChange([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    onChange(amenities.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60 dark:text-muted-foreground mb-1.5 block">
        Unit Amenities
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={newAmenity}
          onChange={e => setNewAmenity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addAmenity()}
          placeholder="e.g. Private Bathroom"
          className="flex-1 h-10 bg-background border border-border dark:border-border/60 focus:border-primary rounded-lg px-4 text-[13px] outline-none transition-colors placeholder:text-foreground/40 dark:placeholder:text-muted-foreground/50"
        />
        <button
          onClick={addAmenity}
          disabled={!newAmenity.trim()}
          className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {amenities.map((amenity, idx) => (
          <span 
            key={idx}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20"
          >
            {amenity}
            <button onClick={() => removeAmenity(idx)} className="hover:text-rose-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
