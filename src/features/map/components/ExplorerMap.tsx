"use client";

import { Building2 } from 'lucide-react';
import { forwardRef } from 'react';

import { type ExplorerHouse } from '../types';

import { Map, MapControls, MapMarker, ZoomControl, LocateControl, FullscreenControl } from '@/components/ui/map';

interface ExplorerMapProps {
  viewport: { center?: [number, number], zoom?: number };
  onViewportChange: (v: { center: [number, number], zoom: number }) => void;
  filteredHouses: ExplorerHouse[];
  activeId?: string | undefined;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onMarkerClick: (id: string) => void;
}

const customStyles = {
  light: "https://tiles.openfreemap.org/styles/bright",
  dark: "https://tiles.openfreemap.org/styles/bright"
};

export const ExplorerMap = forwardRef<any, ExplorerMapProps>(({
  viewport,
  onViewportChange,
  filteredHouses,
  activeId,
  hoveredId,
  setHoveredId,
  onMarkerClick
}, ref) => {
  return (
    <div className="flex-1 relative bg-muted z-10 min-h-[50vh] md:min-h-0">
      <Map 
        ref={ref}
        viewport={viewport}
        onViewportChange={onViewportChange}
        className="w-full h-full"
        styles={customStyles}
      >
        <MapControls>
          <ZoomControl />
          <LocateControl />
          <FullscreenControl />
        </MapControls>
        
        {filteredHouses.map((bh: any) => {
           const isActive = activeId === bh.id;
           const isHovered = hoveredId === bh.id;
           return (
             <MapMarker 
                key={bh.id} 
                longitude={bh.coordinates[0]} 
                latitude={bh.coordinates[1]}
                className="cursor-pointer"
             >
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     onMarkerClick(bh.id);
                   }}
                   onMouseEnter={() => { setHoveredId(bh.id); }}
                   onMouseLeave={() => { setHoveredId(null); }}
                   className="relative block"
                 >
                   {isActive ? (
                     <div className="relative flex flex-col items-center -mt-6">
                       <div className="flex items-center justify-center bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-2xl border-[3px] border-background z-20 transition-all duration-300 ring-4 ring-primary/20">
                         <Building2 className="w-6 h-6" />
                       </div>
                       <div className="absolute -bottom-[5px] w-4 h-4 bg-primary rotate-45 z-10 rounded-sm" />
                     </div>
                   ) : (
                     <div className={`relative flex flex-col items-center transition-all duration-300 origin-bottom ${isHovered ? 'scale-125 z-40 -mt-6' : 'scale-100 z-10 -mt-5'}`}>
                       <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-xl border-[3px] border-background z-20 transition-colors ${!bh.available ? 'bg-muted text-muted-foreground' : isHovered ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background'}`}>
                         <Building2 className="w-4 h-4" />
                       </div>
                       <div className={`absolute -bottom-[4px] w-3 h-3 rotate-45 z-10 rounded-sm transition-colors ${!bh.available ? 'bg-muted' : isHovered ? 'bg-primary' : 'bg-foreground'}`} />
                       <div className="absolute -bottom-1 w-5 h-2 bg-black/30 blur-[2px] rounded-full -z-10" />
                     </div>
                   )}
                 </button>
             </MapMarker>
           );
        })}
      </Map>

      <div className="absolute top-4 left-4 flex gap-2 z-20">
         <div className="bg-card/90 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-lg text-[11px]">
           <span className="font-bold text-foreground tabular-nums">{filteredHouses.length}</span> <span className="text-muted-foreground">visible</span>
         </div>
         <div className="bg-card/90 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-lg text-[11px]">
           <span className="text-muted-foreground">Avg</span> <span className="font-bold text-foreground tabular-nums">₱{filteredHouses.length > 0 ? Math.round(filteredHouses.reduce((s: any, b: any) => s + b.price, 0) / filteredHouses.length).toLocaleString() : 0}</span>
         </div>
      </div>
    </div>
  );
});

ExplorerMap.displayName = 'ExplorerMap';
