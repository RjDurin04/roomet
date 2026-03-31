"use client";

import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';


import { type ExplorerHouse } from '../types';

interface ExplorerCardProps {
  bh: ExplorerHouse;
  isActive: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export function ExplorerCard({ bh, isActive, isHovered, onMouseEnter, onMouseLeave, onClick }: ExplorerCardProps) {
  return (
    <motion.div 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`flex gap-3.5 px-4 py-3.5 cursor-pointer transition-all border-b border-border/30 ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : isHovered ? 'bg-muted/40' : 'hover:bg-muted/20 border-l-2 border-l-transparent'}`}
    >
      <div className="w-[100px] h-[76px] rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/50 relative group">
         <img src={bh.images[0] ?? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2340&auto=format&fit=crop'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
         {!bh.available && (
           <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
             <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-destructive/80 px-2 py-0.5 rounded">Full</span>
           </div>
         )}
         <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
           <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {bh.rating > 0 ? bh.rating : 'New'}
         </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4 className={`text-[13px] font-bold truncate mb-0.5 transition-colors ${isActive ? 'text-primary' : 'text-foreground'}`}>{bh.name}</h4>
          <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />{bh.address}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-[15px] font-extrabold text-foreground tabular-nums">₱{bh.price.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground font-medium"> /mo</span>
          </div>
          <div className="flex items-center gap-1.5">
            {bh.amenities.slice(0, 2).map(a => (
              <span key={a} className="bg-muted text-muted-foreground text-[9px] font-medium px-1.5 py-0.5 rounded capitalize">{a.split(' ')[0]}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
