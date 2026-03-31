"use client";

import { motion } from 'framer-motion';
import { Settings2, Check } from 'lucide-react';


interface ExplorerFiltersProps {
  showFilters: boolean;
  availabilityOnly: boolean;
  setAvailabilityOnly: (val: boolean) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (val: string[] | ((prev: string[]) => string[])) => void;
  allAmenities: string[];
  onClear: () => void;
}

export function ExplorerFilters({
  showFilters,
  availabilityOnly,
  setAvailabilityOnly,
  selectedAmenities,
  setSelectedAmenities,
  allAmenities,
  onClear
}: ExplorerFiltersProps) {
  if (!showFilters) return null;

  return (
    <motion.div 
       initial={{ height: 0, opacity: 0 }}
       animate={{ height: 'auto', opacity: 1 }}
       exit={{ height: 0, opacity: 0 }}
       transition={{ duration: 0.2 }}
       className="border-b border-border/50 bg-background/50 overflow-hidden"
    >
       <div className="p-4 space-y-4">
         <div className="flex justify-between items-center mb-4">
           <span className="text-[11px] font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5"><Settings2 className="w-3 h-3" /> Refine Results</span>
           <button onClick={onClear} className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors">Clear All</button>
         </div>

         <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 text-[12px] text-foreground cursor-pointer select-none hover:text-primary transition-colors">
              <input type="checkbox" checked={availabilityOnly} onChange={e => { setAvailabilityOnly(e.target.checked); }} className="rounded accent-primary w-3.5 h-3.5" />
              Available Only
            </label>
         </div>

         <div>
           <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Amenities</label>
           <div className="flex flex-wrap gap-1.5">
             {allAmenities.map((a: any) => {
               const isOn = selectedAmenities.includes(a);
               return (
                 <button
                   key={a}
                   onClick={() => { setSelectedAmenities(prev => isOn ? prev.filter((x: any) => x !== a) : [...prev, a]); }}
                   className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${isOn ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'}`}
                 >
                   {isOn && <Check className="inline w-2.5 h-2.5 mr-0.5" />}{a}
                 </button>
               );
             })}
           </div>
         </div>
       </div>
    </motion.div>
  );
}
