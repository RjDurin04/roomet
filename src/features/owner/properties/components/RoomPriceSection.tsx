"use client";

import { Banknote, Users, Info } from 'lucide-react';

interface RoomPriceSectionProps {
  price: number;
  priceType: 'person' | 'room';
  onChange: (updates: { price?: number; priceType?: 'person' | 'room' }) => void;
  error?: string;
}

export function RoomPriceSection({ price, priceType, onChange, error }: RoomPriceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className={`text-[11px] font-semibold uppercase tracking-widest mb-1.5 block transition-colors ${error ? 'text-red-500' : 'text-foreground/60 dark:text-muted-foreground'}`}>
          Pricing
        </label>
        <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
          {[
            { id: 'person', label: '/ person', icon: Users },
            { id: 'room', label: '/ unit', icon: Info }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => onChange({ priceType: type.id as 'person' | 'room' })}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${priceType === type.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'}`}
            >
              <type.icon className="w-3 h-3" />
              {type.id}
            </button>
          ))}
        </div>
      </div>
      <div className="relative group">
        <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60 group-focus-within:text-primary transition-colors" />
        <input
          type="number"
          min={0}
          value={price === 0 ? '' : price}
          onChange={e => {
            const val = e.target.value;
            onChange({ price: val === '' ? 0 : Number(val) });
          }}
          placeholder="Monthly rate (e.g. 5000)"
          className={`w-full h-12 pl-12 pr-4 bg-background border rounded-xl text-[13px] font-bold outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${error ? 'border-red-500/50 focus:border-red-500' : 'border-border dark:border-border/60 focus:border-primary'}`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-muted/60 rounded text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          PHP / {priceType}
        </div>
      </div>
      {error && <p className="text-red-500 text-[10px] font-bold ml-1">{error}</p>}
    </div>
  );
}
