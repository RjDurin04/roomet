"use client";

import { AnimatePresence } from 'framer-motion';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import React from 'react';

import { type ExplorerHouse, type SortMode } from '../types';

import { ExplorerCard } from './ExplorerCard';
import { ExplorerFilters } from './ExplorerFilters';

interface ExplorerSidebarProps {
  query: string;
  setQuery: (val: string) => void;
  isSearching: boolean;
  onSearchSubmit: (e: React.FormEvent) => void;
  filteredHouses: ExplorerHouse[];
  sortMode: SortMode;
  setSortMode: (val: SortMode) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  activeFiltersCount: number;
  availabilityOnly: boolean;
  setAvailabilityOnly: (val: boolean) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (val: string[] | ((prev: string[]) => string[])) => void;
  allAmenities: string[];
  onClearFilters: () => void;
  activeId?: string | undefined;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onCardClick: (bh: ExplorerHouse) => void;
}

const PAGE_SIZE = 20;

// eslint-disable-next-line max-lines-per-function -- Sidebar integrates search, filters, and list local state
export function ExplorerSidebar({
  query,
  setQuery,
  isSearching,
  onSearchSubmit,
  filteredHouses,
  sortMode,
  setSortMode,
  showFilters,
  setShowFilters,
  activeFiltersCount,
  availabilityOnly,
  setAvailabilityOnly,
  selectedAmenities,
  setSelectedAmenities,
  allAmenities,
  onClearFilters,
  activeId,
  hoveredId,
  setHoveredId,
  onCardClick,
}: ExplorerSidebarProps) {
  const paginatedHouses = filteredHouses.slice(0, PAGE_SIZE);

  return (
    <div className="w-full md:w-[380px] max-h-[40vh] md:max-h-none h-auto md:h-full flex flex-col border-b md:border-b-0 border-r-0 md:border-r border-border bg-card z-20 flex-shrink-0 relative">
      <div className="px-4 pt-4 pb-3 border-b border-border bg-card sticky top-0 z-30 space-y-3">
        <form onSubmit={onSearchSubmit} className="relative group">
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          )}
          <input 
            type="text" 
            value={query}
            onChange={e => { setQuery(e.target.value); }}
            placeholder="Search by name or place..." 
            className="w-full h-9 pl-9 pr-4 bg-muted/50 hover:bg-muted focus:bg-background border border-border/50 focus:border-ring rounded-lg text-[13px] transition-all outline-none placeholder:text-muted-foreground/70 text-foreground"
          />
        </form>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {filteredHouses.length > PAGE_SIZE ? (
              <>Showing <strong className="text-foreground tabular-nums">{PAGE_SIZE}</strong> of <strong className="text-foreground tabular-nums">{filteredHouses.length}</strong> stays</>
            ) : (
              <><strong className="text-foreground tabular-nums">{filteredHouses.length}</strong> stays in this area</>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <select 
              value={sortMode} 
              onChange={e => { setSortMode(e.target.value as SortMode); }}
              className="bg-transparent border border-border/50 rounded-md px-2 py-1 text-[11px] text-muted-foreground outline-none cursor-pointer hover:border-border"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="rating">Top Rated</option>
            </select>
            <button 
              onClick={() => { setShowFilters(!showFilters); }}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border transition-colors ${showFilters || activeFiltersCount > 0 ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'}`}
            >
              <SlidersHorizontal className="w-3 h-3" /> Filter
              {activeFiltersCount > 0 && <span className="ml-0.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[9px] flex items-center justify-center font-bold">{activeFiltersCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <ExplorerFilters 
          showFilters={showFilters}
          availabilityOnly={availabilityOnly}
          setAvailabilityOnly={setAvailabilityOnly}
          selectedAmenities={selectedAmenities}
          setSelectedAmenities={setSelectedAmenities}
          allAmenities={allAmenities}
          onClear={onClearFilters}
        />
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto modern-scrollbar">
        {paginatedHouses.map((bh: any) => (
          <ExplorerCard
            key={bh.id}
            bh={bh}
            isActive={activeId === bh.id}
            isHovered={hoveredId === bh.id}
            onMouseEnter={() => { setHoveredId(bh.id); }}
            onMouseLeave={() => { setHoveredId(null); }}
            onClick={() => { onCardClick(bh); }}
          />
        ))}
        {paginatedHouses.length === 0 && (
           <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
             <Search className="w-8 h-8 text-muted-foreground/30 mb-3" />
             <p className="text-[13px] text-muted-foreground font-medium">No stays found in this specific area</p>
             <p className="text-[11px] text-muted-foreground/70 mt-1">Try panning the map somewhere else or zooming out</p>
           </div>
        )}
      </div>
    </div>
  );
}
