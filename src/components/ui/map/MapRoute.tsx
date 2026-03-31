"use client";

import { useEffect, useId } from "react";

import { useMap } from "./MapContext";

export interface MapRouteProps {
  /**
   * Route coordinates as [longitude, latitude][]
   */
  coordinates: [number, number][];
  /**
   * Line color (hex or CSS color)
   */
  color?: string;
  /**
   * Line width in pixels
   */
  width?: number;
  /**
   * Line opacity (0-1)
   */
  opacity?: number;
}

const DEFAULT_ROUTE_WIDTH = 6;

export function MapRoute({
  coordinates,
  color = "#3b82f6",
  width = DEFAULT_ROUTE_WIDTH,
  opacity = 1,
}: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const id = useId().replace(/:/g, "");
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;

  useEffect(() => {
    if (!map || !isLoaded || coordinates.length < 2) return;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      });

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-width": width,
          "line-opacity": opacity,
        },
      });
    } else {
      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
      });
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, isLoaded, coordinates, color, width, opacity, sourceId, layerId]);

  return null;
}
