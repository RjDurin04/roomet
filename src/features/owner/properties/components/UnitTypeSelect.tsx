"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BedDouble, Users } from 'lucide-react';
import { useState } from 'react';

interface UnitTypeSelectProps {
  currentType: string;
  currentGender: string;
  onUpdate: (updates: { type?: string; gender?: string }) => void;
  error?: string | undefined;
}

export function UnitTypeSelect({ currentType, currentGender, onUpdate, error }: UnitTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const types = ['Shared', 'Single', 'Studio', 'Suite'];
  const genders = ['mixed', 'male', 'female'];

  return (
    <div className="space-y-4">
      <div>
        <label className={`text-[11px] font-semibold uppercase tracking-widest mb-1.5 block flex items-center gap-1.5 transition-colors ${error ? 'text-red-500' : 'text-foreground/60 dark:text-muted-foreground'}`}>
          <BedDouble className="w-3 h-3" /> Unit Type
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between bg-background border rounded-xl px-4 h-12 text-[13px] font-bold transition-all ${error ? 'border-red-500/50 hover:border-red-500' : 'border-border dark:border-border/60 hover:border-primary'}`}
          >
            <span>{currentType || 'Select Type'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {error && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{error}</p>}
          
          <AnimatePresence>
            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1"
                >
                  {types.map((t: any) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { onUpdate({ type: t }); setIsOpen(false); }}
                      className={`w-full px-4 py-2 text-left text-xs font-bold hover:bg-primary/10 transition-colors ${currentType === t ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
                    >
                      {t}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60 dark:text-muted-foreground mb-1.5 block flex items-center gap-1.5">
          <Users className="w-3 h-3" /> Gender Policy
        </label>
        <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
          {genders.map((g: any) => (
            <button
              key={g}
              type="button" // Important for forms
              onClick={() => onUpdate({ gender: g })}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${currentGender === g ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
