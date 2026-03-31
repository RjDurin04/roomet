"use client";

import { ShieldCheck, Plus, X, MessageSquare } from 'lucide-react';
import { useState } from 'react';
/* eslint-disable max-lines-per-function */

import { type PropertyFormData } from '../types';

interface StepAmenitiesProps {
  formData: PropertyFormData;
  setFormData: (data: PropertyFormData) => void;
}

export function StepAmenities({ formData, setFormData }: StepAmenitiesProps) {
  const [customInput, setCustomInput] = useState('');

  const toggleAmenity = (label: string) => {
    const newAmenities = formData.amenities.includes(label)
      ? formData.amenities.filter(a => a !== label)
      : [...formData.amenities, label];
    setFormData({ ...formData, amenities: newAmenities });
  };

  const addCustomAmenity = () => {
    if (customInput.trim() && !formData.amenities.includes(customInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, customInput.trim()]
      });
      setCustomInput('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight italic uppercase">Property Features</h3>
            <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">List what your boarding house offers</p>
          </div>
        </div>

        {/* Unified Amenities Input */}
        <div className="bg-card border border-border/60 rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black tracking-tight italic uppercase">Add Features</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-8">
            <div className="relative flex-1 group">
              <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomAmenity()}
                placeholder="WiFi, Shared Kitchen, etc..."
                className="w-full h-14 pl-12 pr-4 bg-muted/30 border border-border group-hover:border-primary/30 focus:border-primary rounded-xl md:rounded-2xl text-sm font-bold transition-all outline-none"
              />
            </div>
            <button
              onClick={addCustomAmenity}
              disabled={!customInput.trim()}
              className="w-full sm:w-auto px-8 h-14 bg-primary text-primary-foreground rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
            >
              Add Feature
            </button>
          </div>

          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block ml-1">Included in your listing:</label>

          {/* Combined Selected Amenities Tags */}
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 animate-in zoom-in-50 duration-300"
              >
                {amenity}
                <button onClick={() => toggleAmenity(amenity)} className="hover:text-rose-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {formData.amenities.length === 0 && (
              <span className="text-[10px] font-bold text-muted-foreground/40 italic uppercase tracking-widest py-1 ml-1">No features added yet</span>
            )}
          </div>
        </div>

        {/* House Rules Section */}
        <div className="bg-muted/30 rounded-[28px] md:rounded-[32px] p-6 md:p-8 border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-black tracking-tight italic uppercase">House Rules</h3>
          </div>
          <textarea
            value={formData.rules}
            onChange={e => setFormData({ ...formData, rules: e.target.value })}
            placeholder="e.g. No curfews, visiting hours until 9 PM, no pets allowed..."
            className="w-full h-40 bg-background/50 border border-border/50 focus:border-primary rounded-2xl p-4 text-sm font-medium outline-none transition-all resize-none placeholder:text-muted-foreground/40 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
