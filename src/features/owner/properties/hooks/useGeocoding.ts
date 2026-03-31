"use client";

/* eslint-disable no-magic-numbers */
import { UI_CONSTANTS } from '@/lib/constants';

export function useGeocoding() {
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    let newAddress = `${Math.abs(lat).toFixed(UI_CONSTANTS.COORDINATE_PRECISION)}°${lat > 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(UI_CONSTANTS.COORDINATE_PRECISION)}°${lng > 0 ? 'E' : 'W'}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort(); }, 5000);
    
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { signal: controller.signal }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.display_name) newAddress = data.display_name;
      }
    } catch {
      // Silently ignore geocoding errors
    } finally {
      clearTimeout(timeout);
    }
    
    return newAddress;
  };

  return { reverseGeocode };
}
