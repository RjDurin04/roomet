"use client";

import { Users, User, ArrowRight } from 'lucide-react';

interface RoomCapacitySectionProps {
  capacity: number;
  occupied: number;
  onChange: (updates: { capacity?: number; occupied?: number }) => void;
}

export function RoomCapacitySection({ capacity, occupied, onChange }: RoomCapacitySectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60 dark:text-muted-foreground mb-1.5 block flex items-center gap-1.5">
          <Users className="w-3 h-3" /> Max Capacity
        </label>
        <div className="relative group">
          <input
            type="number"
            min={1}
            value={capacity === 0 ? '' : capacity}
            onChange={e => onChange({ capacity: e.target.value === '' ? 0 : Number(e.target.value) })}
            placeholder="0"
            className="w-full h-10 bg-background border border-border dark:border-border/60 focus:border-primary rounded-xl px-4 text-[13px] font-bold outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60 dark:text-muted-foreground mb-1.5 block flex items-center gap-1.5">
          <User className="w-3 h-3" /> Occupied
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={capacity}
            value={occupied === 0 ? '' : occupied}
            onChange={e => onChange({ occupied: e.target.value === '' ? 0 : Number(e.target.value) })}
            placeholder="0"
            className="w-16 h-10 bg-background border border-border dark:border-border/60 focus:border-primary rounded-xl px-3 text-[13px] font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
            <ArrowRight className="w-3 h-3" />
            <span>of {capacity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
