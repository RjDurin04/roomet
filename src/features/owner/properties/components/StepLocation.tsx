"use client";

import { MapPin, Home } from 'lucide-react';
/* eslint-disable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-misused-promises, no-magic-numbers, react-hooks/exhaustive-deps, @typescript-eslint/naming-convention, @typescript-eslint/prefer-nullish-coalescing */
import { useState, useRef, useEffect, useMemo } from 'react';

import { Map, MapControls, MapMarker, ZoomControl, LocateControl, FullscreenControl } from '../../../../components/ui/map';
import { type PropertyFormData } from '../types';

import { LocationCoordsDisplay } from './LocationCoordsDisplay';

import { UI_CONSTANTS } from '@/lib/constants';

interface StepLocationProps {
  formData: PropertyFormData;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
}

// eslint-disable-next-line max-lines-per-function -- Map integration with geocoding needs unified state management
export function StepLocation({ formData, updateFormData }: StepLocationProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MapLibre GL instance
  const mapRef = useRef<any>(null);
  const [query, setQuery] = useState(formData.address || '');
  const [isSearching, setIsSearching] = useState(false);

  // Memoize marker content to prevent the maplibregl marker from being destroyed/recreated on every render
  const markerContent = useMemo(() => (
    <div className="relative flex flex-col items-center -mt-8">
      <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-2xl border-4 border-background transition-all hover:scale-110">
        <Home className="w-5 h-5" />
      </div>
      <div className="absolute -bottom-1 w-2 h-2 bg-primary rotate-45" />
    </div>
  ), []);



  // 2. Auto-geolocation on initial load if no address is set and at default location
  useEffect(() => {
    const COORD_EPSILON = 0.0001;
    const isDefaultLoc = 
      Math.abs(formData.mapPin.lat - UI_CONSTANTS.MAP_DEFAULT_LAT) < COORD_EPSILON && 
      Math.abs(formData.mapPin.lng - UI_CONSTANTS.MAP_DEFAULT_LNG) < COORD_EPSILON;

    // Only auto-locate if it's potentially a fresh entry
    if (!formData.address && isDefaultLoc && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          
          updateFormData({
            mapPin: { lat, lng },
            address: 'Locating...'
          });

          // Resolve address
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
            const data = await resp.json();
            if (data?.display_name) {
              updateFormData({ address: data.display_name });
            }
          } catch (err) {
            console.error("[StepLocation] Auto-geocode failed:", err);
            const COORD_PRECISION = 6;
            updateFormData({ address: `${lat.toFixed(COORD_PRECISION)}, ${lng.toFixed(COORD_PRECISION)}` });
          }

          // Move map when instance is ready - use a reliable polling/ready check
          const moveMap = () => {
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 17,
                essential: true,
                duration: 2000
              });
            } else {
              setTimeout(moveMap, 100);
            }
          };
          moveMap();
        },
        (error) => {
          console.warn("[StepLocation] Geolocation blocked or failed:", error);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []); // Run exactly once on mount

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query === 'Locating...') return;

    setIsSearching(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await resp.json();
      if (data?.[0]) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        updateFormData({
          address: display_name,
          mapPin: {
            lat: newLat,
            lng: newLng
          }
        });

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [newLng, newLat],
            zoom: 18,
            essential: true
          });
        }
      }
    } catch (err) {
      console.error("[StepLocation] Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MapLibre GL drag event
  const onMarkerDragEnd = async (e: any) => {
    const { lng, lat } = e.target.getLngLat();
    
    // 1. Immediate coordinate sync
    updateFormData({
      mapPin: { lat, lng },
      address: 'Locating...'
    });

    // 2. Reverse Geocode for address sync with higher precision zoom=18
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
      const data = await resp.json();
      
      const COORD_PRECISION = 6;
      const resolvedAddress = data?.display_name || `${lat.toFixed(COORD_PRECISION)}, ${lng.toFixed(COORD_PRECISION)}`;
      updateFormData({ address: resolvedAddress });
    } catch (err) {
      console.error("[StepLocation] Reverse geocoding failed:", err);
      const COORD_PRECISION = 6;
      const fallback = `${lat.toFixed(COORD_PRECISION)}, ${lng.toFixed(COORD_PRECISION)}`;
      updateFormData({ address: fallback });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Side: Search & Details */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-card border border-border rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-xl">
            <h3 className="text-lg font-black italic uppercase tracking-tight mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              Location Details
            </h3>

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Search Address</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter full address..."
                    className="w-full h-14 pl-12 pr-4 bg-muted/30 border border-border group-hover:border-primary/30 focus:border-primary rounded-2xl text-sm font-bold transition-all outline-none"
                  />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-2 top-2 h-10 px-4 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Find'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Display Name (Optional Override)</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  placeholder="Drag the pin on the map or search to set your location..."
                  className="w-full h-32 p-4 bg-muted/30 border border-border hover:border-primary/30 focus:border-primary rounded-2xl text-sm font-bold transition-all outline-none resize-none"
                />
              </div>
            </form>
          </div>

          <LocationCoordsDisplay 
            lat={formData.mapPin.lat}
            lng={formData.mapPin.lng}
          />
        </div>

        {/* Right Side: Map */}
        <div className="relative lg:h-[500px] h-[350px] md:h-[400px] rounded-[32px] md:rounded-[40px] overflow-hidden border border-border shadow-2xl group">
          <Map
            ref={mapRef}
            viewport={{
              center: [formData.mapPin.lng, formData.mapPin.lat],
              zoom: 15
            }}
            className="w-full h-full"
          >
            <MapControls>
              <ZoomControl />
              <LocateControl />
              <FullscreenControl />
            </MapControls>

            <MapMarker
              longitude={formData.mapPin.lng}
              latitude={formData.mapPin.lat}
              draggable
              onDragEnd={onMarkerDragEnd}
            >
              {markerContent}
            </MapMarker>
          </Map>
          
          <div className="absolute top-6 left-6 right-6 pointer-events-none">
             <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border inline-flex items-center gap-3 shadow-lg">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Coordinate Sync</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
