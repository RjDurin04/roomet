import type MapLibreGL from "maplibre-gl";
import { createContext, useContext } from "react";

export interface MapContextValue {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
}

export const MapContext = createContext<MapContextValue | null>(null);

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

export type Theme = "light" | "dark";

export interface MapViewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}
