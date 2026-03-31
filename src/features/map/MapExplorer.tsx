"use client";

import { useQuery } from 'convex/react';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, cloneElement } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams, useOutlet } from 'react-router-dom';

import { api } from '../../../convex/_generated/api';

import { ExplorerMap } from './components/ExplorerMap';
import { ExplorerSidebar } from './components/ExplorerSidebar';
import { type SortMode, type ExplorerHouse } from './types';

import { UI_CONSTANTS } from '@/lib/constants';
import { getDistance } from '@/lib/geo-utils';


const INITIAL_ZOOM = 13;
const SEARCH_ZOOM = 14;
const CLICK_ZOOM = 16;
const BOUNDS_POLLING_MS = 300;
const CACHE_KEY = 'roomet_last_location';

// eslint-disable-next-line max-lines-per-function, complexity -- MapExplorer integrates location strategy, caching, map bounds, and filtering
export function MapExplorer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const outlet = useOutlet();
  
  const properties = useQuery(api.properties.listPublic) ?? [];
  const isDetailsOpen = location.pathname.includes('/roomet/');
  
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Initialize with cached location if available
  const [viewport, setViewport] = useState<{ center: [number, number], zoom: number }>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.center) && typeof parsed.zoom === 'number') {
            return parsed;
          }
        } catch (e) {
          console.warn("[MapExplorer] Failed to parse cached location", e);
        }
      }
    }
    return {
      center: [UI_CONSTANTS.CEBU_CENTER.lng, UI_CONSTANTS.CEBU_CENTER.lat],
      zoom: INITIAL_ZOOM,
    };
  });

  const [isLocating, setIsLocating] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem(CACHE_KEY);
    }
    return true;
  });
  const [isGeocoded, setIsGeocoded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Third-party map ref
  const mapRef = useRef<any>(null);
  const [mapBounds, setMapBounds] = useState<{west: number, east: number, south: number, north: number} | null>(null);

  useEffect(() => {
    const handleLocationResult = (lng: number, lat: number, zoomLevel: number) => {
      const newVp = { center: [lng, lat] as [number, number], zoom: zoomLevel };
      setViewport(newVp);
      setIsLocating(false);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newVp));
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        handleLocationResult(position.coords.longitude, position.coords.latitude, SEARCH_ZOOM);
      }, (error) => {
        console.warn("[MapExplorer] Geolocation denied/failed, using fallback:", error);
        // Fallback to Cebu if no cached location, otherwise keep cached
        if (!localStorage.getItem(CACHE_KEY)) {
           handleLocationResult(UI_CONSTANTS.CEBU_CENTER.lng, UI_CONSTANTS.CEBU_CENTER.lat, INITIAL_ZOOM);
        } else {
           setIsLocating(false);
        }
      }, { enableHighAccuracy: true, timeout: 5000 });
    } else {
      setIsLocating(false);
    }

    const interval = setInterval(() => {
      if (mapRef.current) {
        const b = mapRef.current.getBounds();
        if (b && (b.getWest() !== 0 || b.getEast() !== 0)) {
          setMapBounds({ west: b.getWest(), east: b.getEast(), south: b.getSouth(), north: b.getNorth() });
          clearInterval(interval);
        }
      }
    }, BOUNDS_POLLING_MS);

    return () => { clearInterval(interval); };
  }, []);


  const handleViewportChange = (v: { center: [number, number], zoom: number }) => {
    setViewport(v);
    if (mapRef.current) {
      const b = mapRef.current.getBounds();
      if (b) {
        setMapBounds({
          west: b.getWest(),
          east: b.getEast(),
          south: b.getSouth(),
          north: b.getNorth(),
        });
      }
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setIsGeocoded(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        setViewport(prev => ({
          ...prev,
          center: [parseFloat(result.lon), parseFloat(result.lat)],
          zoom: SEARCH_ZOOM
        }));
        setIsGeocoded(true);
      } else {
        setIsGeocoded(false);
      }
    } catch (error) {
      console.error("[MapExplorer] Geocoding failed", error);
      setIsGeocoded(false);
    } finally {
      setIsSearching(false);
    }
  };

  const ALL_AMENITIES = Array.from(new Set(
    properties.flatMap(p => [
      ...p.amenities,
      ...p.rooms.flatMap((r: { amenities?: string[] }) => r.amenities ?? [])
    ])
  )).filter(Boolean).sort();

  const houses: ExplorerHouse[] = properties.map(p => {
    const minPrice = p.rooms.length > 0 ? Math.min(...p.rooms.map((r: { price: number }) => r.price)) : 0;
    const isAvailable = p.rooms.some((r: { occupied?: number; capacity: number }) => (r.occupied ?? 0) < r.capacity);
    const centerLng = viewport.center[0];
    const centerLat = viewport.center[1];
    const distance = getDistance(centerLat, centerLng, p.location.lat, p.location.lng);
    
    return {
      id: p._id,
      name: p.name,
      address: p.location.address,
      coordinates: [p.location.lng, p.location.lat],
      price: minPrice,
      images: p.imageUrls.filter((u): u is string => u !== null),
      amenities: p.amenities,
      roomAmenities: p.rooms.flatMap((r: { amenities?: string[] }) => r.amenities ?? []),
      description: p.description,
      rating: p.rating || 0,
      distance: Number(distance.toFixed(1)),
      available: isAvailable,
      roomTypes: Array.from(new Set(p.rooms.map((r: { type: string }) => r.type)))
    };
  });

  const filteredHouses = houses
    .filter(bh => {
       if (mapBounds) {
         const [lng, lat] = bh.coordinates;
         if (lng < mapBounds.west || lng > mapBounds.east || lat < mapBounds.south || lat > mapBounds.north) {
           return false;
         }
       }
       if (!isGeocoded && query && !bh.name.toLowerCase().includes(query.toLowerCase()) && !bh.address.toLowerCase().includes(query.toLowerCase())) return false;
       if (availabilityOnly && !bh.available) return false;
       if (selectedAmenities.length > 0 && !selectedAmenities.every(a => {
           const hasProp = bh.amenities.some((ba: string) => ba.toLowerCase().includes(a.toLowerCase()));
           const hasRoom = bh.roomAmenities.some((ra: string) => ra.toLowerCase().includes(a.toLowerCase()));
           return hasProp || hasRoom;
       })) return false;
       return true;
    })
    .sort((a, b) => {
       if (sortMode === 'price-asc') return a.price - b.price;
       if (sortMode === 'price-desc') return b.price - a.price;
       if (sortMode === 'rating') return b.rating - a.rating;
       return 0;
    });

  const activeFiltersCount = [availabilityOnly, selectedAmenities.length > 0].filter(Boolean).length;

  return (
    <div className="flex flex-col md:flex-row w-full h-full relative">
      <ExplorerSidebar 
        query={query}
        setQuery={(q) => { setQuery(q); if (q === '') setIsGeocoded(false); }}
        isSearching={isSearching}
        onSearchSubmit={(e) => { void handleSearchSubmit(e); }}
        filteredHouses={filteredHouses}
        sortMode={sortMode}
        setSortMode={setSortMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        availabilityOnly={availabilityOnly}
        setAvailabilityOnly={setAvailabilityOnly}
        selectedAmenities={selectedAmenities}
        setSelectedAmenities={setSelectedAmenities}
        allAmenities={ALL_AMENITIES}
        onClearFilters={() => { setQuery(''); setAvailabilityOnly(false); setSelectedAmenities([]); setIsGeocoded(false); }}
        activeId={id}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        onCardClick={(bh) => {
          setViewport(prev => ({ ...prev, center: [bh.coordinates[0], bh.coordinates[1]], zoom: CLICK_ZOOM }));
          void navigate(`/tenant/map/roomet/${bh.id}`);
        }}
      />

      <ExplorerMap 
        ref={mapRef}
        viewport={viewport}
        onViewportChange={handleViewportChange}
        filteredHouses={filteredHouses}
        activeId={id}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        onMarkerClick={(mid) => { void navigate(`/tenant/map/roomet/${mid}`); }}
      />

      {isLocating && !localStorage.getItem(CACHE_KEY) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground animate-pulse">Establishing Connection...</p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isDetailsOpen && outlet ? cloneElement(outlet, { key: location.pathname }) : null}
      </AnimatePresence>
    </div>
  );
}
