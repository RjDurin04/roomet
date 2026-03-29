import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams, useOutlet } from 'react-router-dom';
import { Map, MapControls, MapMarker, MarkerContent, MarkerTooltip } from '@/components/ui/map';
import { Star, SlidersHorizontal, Search, Settings2, MapPin, Check, Loader2, Building2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

type SortMode = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export function MapExplorer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const properties = useQuery(api.properties.listPublic) || [];
  const isDetailsOpen = location.pathname.includes('/roomet/');
  const [searchParams] = useSearchParams();
  const outlet = useOutlet();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const CEBU_CENTER = { lat: 10.3119, lng: 123.8962 };

  const [viewport, setViewport] = useState<{ center?: [number, number], zoom?: number }>({
    center: [CEBU_CENTER.lng, CEBU_CENTER.lat],
    zoom: 13,
  });
  const [isGeocoded, setIsGeocoded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<any>(null);
  const [mapBounds, setMapBounds] = useState<{west: number, east: number, south: number, north: number} | null>(null);

  // Default to user location on mount and capture initial map bounds
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setViewport(prev => ({
          ...prev,
          center: [position.coords.longitude, position.coords.latitude],
        }));
      }, (error) => {
        console.error("Geolocation error or denied:", error);
      });
    }

    // Attempt to grab initial map bounds once loaded
    const interval = setInterval(() => {
      if (mapRef.current) {
        const b = mapRef.current.getBounds();
        if (b && (b.getWest() !== 0 || b.getEast() !== 0)) {
          setMapBounds({ west: b.getWest(), east: b.getEast(), south: b.getSouth(), north: b.getNorth() });
          clearInterval(interval);
        }
      }
    }, 300);

    return () => { clearInterval(interval); };
  }, []);

  const handleViewportChange = (v: any) => {
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
          zoom: 14
        }));
        setIsGeocoded(true);
      } else {
        setIsGeocoded(false);
      }
    } catch (error) {
      console.error("Geocoding failed", error);
      setIsGeocoded(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Extract dynamic amenities from all public properties (property-level and room-level)
  const ALL_AMENITIES = Array.from(new Set(
    properties.flatMap(p => [
      ...(p.amenities || []),
      ...(p.rooms ? p.rooms.flatMap((r: any) => r.amenities || []) : [])
    ])
  )).filter(Boolean).sort();

  const houses = properties.map(p => {
    const minPrice = p.rooms.length > 0 ? Math.min(...p.rooms.map((r: any) => r.price)) : 0;
    const isAvailable = p.rooms.some((r: any) => (r.occupied ?? 0) < r.capacity);
    const centerLng = viewport.center ? viewport.center[0] : CEBU_CENTER.lng;
    const centerLat = viewport.center ? viewport.center[1] : CEBU_CENTER.lat;
    
    // Calculate live distance against active viewport center
    const distance = getDistance(centerLat, centerLng, p.location.lat, p.location.lng);
    
    return {
      id: p._id,
      name: p.name,
      address: p.location.address,
      coordinates: [p.location.lng, p.location.lat],
      price: minPrice,
      images: p.imageUrls || [],
      amenities: p.amenities || [],
      roomAmenities: p.rooms ? p.rooms.flatMap((r: any) => r.amenities || []) : [],
      description: p.description,
      rating: p.rating || 0,
      distance: Number(distance.toFixed(1)),
      available: isAvailable,
      roomTypes: Array.from(new Set(p.rooms.map((r: any) => r.type)))
    };
  });

  const filteredHouses = houses
    .filter(bh => {
       // Check if outside map viewport bounds
       if (mapBounds) {
         const [lng, lat] = bh.coordinates;
         if (lng < mapBounds.west || lng > mapBounds.east || lat < mapBounds.south || lat > mapBounds.north) {
           return false;
         }
       }
       
       // Only filter by rigid text if we didn't successfully geocode a place
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

  const paginatedHouses = filteredHouses.slice(0, 20);

  const activeFiltersCount = [availabilityOnly, selectedAmenities.length > 0].filter(Boolean).length;

  const customStyles = {
    light: "https://tiles.openfreemap.org/styles/bright",
    dark: "https://tiles.openfreemap.org/styles/bright"
  };

  return (
    <div className="flex w-full h-full relative">
      
      {/* Sidebar List panel */}
      <div className="w-[380px] h-full flex flex-col border-r border-border bg-card z-20 flex-shrink-0 relative">
        
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-border bg-card sticky top-0 z-30 space-y-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative group">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            )}
            <input 
              type="text" 
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                if (e.target.value === '') setIsGeocoded(false);
              }}
              placeholder="Search by name or place..." 
              className="w-full h-9 pl-9 pr-4 bg-muted/50 hover:bg-muted focus:bg-background border border-border/50 focus:border-ring rounded-lg text-[13px] transition-all outline-none placeholder:text-muted-foreground/70 text-foreground"
            />
          </form>
          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {filteredHouses.length > 20 ? (
                <>Showing <strong className="text-foreground tabular-nums">20</strong> of <strong className="text-foreground tabular-nums">{filteredHouses.length}</strong> stays in this area</>
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

        {/* Dropdown Filter Panel */}
        <AnimatePresence>
          {showFilters && (
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
                   <button onClick={() => {setQuery(''); setAvailabilityOnly(false); setSelectedAmenities([]);}} className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors">Clear All</button>
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
                     {ALL_AMENITIES.map(a => {
                       const isOn = selectedAmenities.includes(a);
                       return (
                         <button
                           key={a}
                           onClick={() => { setSelectedAmenities(prev => isOn ? prev.filter(x => x !== a) : [...prev, a]); }}
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
          )}
        </AnimatePresence>

        {/* Listing Cards */}
        <div className="flex-1 overflow-y-auto modern-scrollbar">
          {paginatedHouses.map((bh, _idx) => {
            const isActive = id === bh.id;
            const isHovered = hoveredId === bh.id;
            return (
              <motion.div 
                key={bh.id}
                onMouseEnter={() => { setHoveredId(bh.id); }}
                onMouseLeave={() => { setHoveredId(null); }}
                onClick={() => {
                  setViewport(prev => ({
                    ...prev,
                    center: [bh.coordinates[0], bh.coordinates[1]],
                    zoom: 16
                  }));
                  navigate(`/tenant/map/roomet/${bh.id}`);
                }}
                className={`flex gap-3.5 px-4 py-3.5 cursor-pointer transition-all border-b border-border/30 ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : isHovered ? 'bg-muted/40' : 'hover:bg-muted/20 border-l-2 border-l-transparent'}`}
              >
                {/* Thumbnail */}
                <div className="w-[100px] h-[76px] rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/50 relative group">
                   <img src={bh.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2340&auto=format&fit=crop'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   {!bh.available && (
                     <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                       <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-destructive/80 px-2 py-0.5 rounded">Full</span>
                     </div>
                   )}
                   <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                     <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {bh.rating > 0 ? bh.rating : 'New'}
                   </div>
                </div>

                {/* Info */}
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
          })}
          {paginatedHouses.length === 0 && (
             <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
               <Search className="w-8 h-8 text-muted-foreground/30 mb-3" />
               <p className="text-[13px] text-muted-foreground font-medium">No stays found in this specific area</p>
               <p className="text-[11px] text-muted-foreground/70 mt-1">Try panning the map somewhere else or zooming out</p>
             </div>
          )}
        </div>
      </div>

      {/* Map Content View */}
      <div className="flex-1 relative bg-muted z-10">
        <Map 
          ref={mapRef}
          viewport={viewport}
          onViewportChange={handleViewportChange}
          className="w-full h-full"
          styles={customStyles}
          projection={{ type: 'mercator' }}
        >
          <MapControls 
            position="top-right" 
            showLocate={true} 
            showZoom={true} 
            onLocate={(coords) => { setViewport(prev => ({ ...prev, center: [coords.longitude, coords.latitude] })); }}
          />
          
          {filteredHouses.map((bh) => {
             const isActive = id === bh.id;
             const isHovered = hoveredId === bh.id;
             return (
               <MapMarker key={bh.id} longitude={bh.coordinates[0]} latitude={bh.coordinates[1]}>
                 <MarkerContent>
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       navigate(`/tenant/map/roomet/${bh.id}`);
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
                         {/* Main Marker Circle */}
                         <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-xl border-[3px] border-background z-20 transition-colors ${!bh.available ? 'bg-muted text-muted-foreground' : isHovered ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background'}`}>
                           <Building2 className="w-4 h-4" />
                         </div>
                         {/* Marker Tail */}
                         <div className={`absolute -bottom-[4px] w-3 h-3 rotate-45 z-10 rounded-sm transition-colors ${!bh.available ? 'bg-muted' : isHovered ? 'bg-primary' : 'bg-foreground'}`} />
                         {/* Ground Shadow */}
                         <div className="absolute -bottom-1 w-5 h-2 bg-black/30 blur-[2px] rounded-full -z-10" />
                       </div>
                     )}
                   </button>
                 </MarkerContent>
                 <MarkerTooltip className="!bg-card !text-foreground !border !border-border !rounded-xl !px-3 !py-2 !shadow-xl !text-[12px]">
                   <p className="font-bold">{bh.name}</p>
                   <p className="text-muted-foreground text-[10px]">{bh.roomTypes.join(', ')}</p>
                 </MarkerTooltip>
               </MapMarker>
             )
          })}
        </Map>

        {/* Map Overlay Stats */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
           <div className="bg-card/90 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-lg text-[11px]">
             <span className="font-bold text-foreground tabular-nums">{filteredHouses.length}</span> <span className="text-muted-foreground">visible</span>
           </div>
           <div className="bg-card/90 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-lg text-[11px]">
             <span className="text-muted-foreground">Avg</span> <span className="font-bold text-foreground tabular-nums">₱{filteredHouses.length > 0 ? Math.round(filteredHouses.reduce((s, b) => s + b.price, 0) / filteredHouses.length).toLocaleString() : 0}</span>
           </div>
        </div>

        {/* Drawer Outlet */}
        <AnimatePresence mode="wait">
          {isDetailsOpen && outlet ? React.cloneElement(outlet, { key: location.pathname }) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
