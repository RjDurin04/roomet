"use client";

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { type PropertyFormData } from '../types';

interface CustomAmenityInputProps {
  formData: PropertyFormData;
  setFormData: (data: PropertyFormData) => void;
}

export function CustomAmenityInput({ formData, setFormData }: CustomAmenityInputProps) {
  const [customInput, setCustomInput] = useState('');

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !formData.amenities.includes(trimmed)) {
      setFormData({ ...formData, amenities: [...formData.amenities, trimmed] });
      setCustomInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative pt-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border dark:border-border/50 dark:border-border/30"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-card text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 dark:text-muted-foreground/50">Or add custom</span>
        </div>
      </div>

      <div className="flex gap-3 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={customInput}
            onChange={e => { setCustomInput(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="e.g. Free Shuttle, Roof Deck..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-background border border-border dark:border-border/60 focus:border-primary outline-none text-[13px] transition-colors shadow-sm placeholder:text-foreground/40 dark:placeholder:text-muted-foreground/50"
          />
        </div>
        <button
          type="button"
          onClick={addCustom}
          className="px-6 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
        >
          Add
        </button>
      </div>
    </div>
  );
}
