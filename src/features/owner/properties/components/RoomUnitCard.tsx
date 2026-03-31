"use client";

/* eslint-disable no-magic-numbers */
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { type RoomFormData } from '../types';

import { RoomAmenitiesSection } from './RoomAmenitiesSection';
import { RoomCapacitySection } from './RoomCapacitySection';
import { RoomPriceSection } from './RoomPriceSection';
import { UnitTypeSelect } from './UnitTypeSelect';

interface RoomUnitCardProps {
  room: RoomFormData;
  idx: number;
  errors: Record<string, string>;
  onUpdate: (idx: number, updates: Partial<RoomFormData>) => void;
  onRemove: (id: string) => void;
}

 
export function RoomUnitCard({ room, idx, errors, onUpdate, onRemove }: RoomUnitCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const roomErrors = Object.keys(errors).filter(key => key.startsWith(`rooms.${idx}.`));
  const hasErrors = roomErrors.length > 0;
   
  const nameError = errors[`rooms.${idx}.name`];
   
  const typeError = errors[`rooms.${idx}.type`];
   
  const priceError = errors[`rooms.${idx}.price`];

  return (
    <div className={`bg-muted/30 rounded-[28px] md:rounded-[32px] border ${hasErrors || errors['rooms'] ? 'border-red-500/30 ring-1 ring-red-500/20' : 'border-border/50'} overflow-hidden transition-all duration-500`}>
      <div className="px-4 md:px-6 py-4 md:py-5 flex items-center justify-between cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs italic transition-colors ${hasErrors ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
            #{idx + 1}
          </div>
          <div>
            <h4 className={`font-black text-sm tracking-tight uppercase italic transition-colors ${hasErrors ? 'text-red-500' : ''}`}>{room.name || 'New Unit'}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{room.type || 'Incomplete'}</span>
              <span className="text-muted-foreground/30 text-[8px]">•</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{room.price.toLocaleString()} PHP</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {hasErrors && (
            <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
              Incomplete Details
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(room.id); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className={`w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-4 md:px-6 pb-6 md:pb-8 space-y-6 md:space-y-8 border-t border-border/20 pt-6 md:pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className={`text-[11px] font-semibold uppercase tracking-widest mb-1.5 block transition-colors ${nameError ? 'text-red-500' : 'text-foreground/60 dark:text-muted-foreground'}`}>Unit Identifier / Name</label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={e => onUpdate(idx, { name: e.target.value })}
                      placeholder="e.g. Room 301, Unit B"
                      className={`w-full h-12 bg-background border rounded-xl px-4 text-[13px] font-bold outline-none transition-all placeholder:text-foreground/40 dark:placeholder:text-muted-foreground/50 ${nameError ? 'border-red-500/50 focus:border-red-500' : 'border-border dark:border-border/60 focus:border-primary'}`}
                    />
                    {nameError && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{nameError}</p>}
                  </div>
                  <UnitTypeSelect currentType={room.type} currentGender={room.gender} onUpdate={updates => onUpdate(idx, updates)} error={typeError} />
                  <RoomCapacitySection capacity={room.capacity} occupied={room.occupied} onChange={updates => onUpdate(idx, updates)} />
                </div>
                <div className="space-y-8">
                  <RoomPriceSection price={room.price} priceType={room.priceType} onChange={updates => onUpdate(idx, updates)} error={priceError} />
                  <RoomAmenitiesSection amenities={room.amenities} onChange={amenities => onUpdate(idx, { amenities })} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
