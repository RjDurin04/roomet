"use client";



import { UI_CONSTANTS } from '@/lib/constants';

interface LocationCoordsDisplayProps {
  lat: number;
  lng: number;
}

export function LocationCoordsDisplay({ lat, lng }: LocationCoordsDisplayProps) {
  const itemClass = "p-4 rounded-[16px] bg-muted/60 dark:bg-muted/30 border border-border dark:border-border/50 flex flex-col gap-1 shadow-inner group hover:bg-muted/40 transition-colors";
  const labelClass = "text-[9px] font-black text-primary/80 dark:text-primary/40 uppercase tracking-[0.2em]";
  const valueClass = "font-bold text-sm tracking-tight text-foreground/90";

  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div className={itemClass}>
        <span className={labelClass}>Latitude</span>
        <span className={valueClass}>{lat.toFixed(UI_CONSTANTS.COORDINATE_PRECISION)}</span>
      </div>
      <div className={itemClass}>
        <span className={labelClass}>Longitude</span>
        <span className={valueClass}>{lng.toFixed(UI_CONSTANTS.COORDINATE_PRECISION)}</span>
      </div>
    </div>
  );
}
