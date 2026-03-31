"use client";

import { useEffect, useState } from 'react';

import { useMap } from './MapContext';

/* eslint-disable no-magic-numbers -- Clustering styles require various numerical thresholds */

interface Point {
  id: string;
  longitude: number;
  latitude: number;
  [key: string]: unknown;
}

interface MapClusterLayerProps {
  points: Point[];
  onPointClick?: (id: string, props: Record<string, unknown>) => void;
  clusterColor?: string;
  clusterRadius?: number;
}

// eslint-disable-next-line max-lines-per-function -- Layer initialization requires verbose config
export function MapClusterLayer({
  points,
  onPointClick,
  clusterColor = "#3b82f6",
  clusterRadius = 50,
}: MapClusterLayerProps) {
  const { map } = useMap();
  const [sourceIdState] = useState(() => `cluster-source-${Math.random().toString(36).substr(2, 9)}`);
  const sourceId = sourceIdState;

  // eslint-disable-next-line max-lines-per-function -- Complex layer assembly
  useEffect(() => {
    if (!map) return;

    const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: 'FeatureCollection',
      features: points.map(p => ({
        type: 'Feature',
        properties: { ...p },
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude]
        }
      }))
    };

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId)).setData(geojson);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: clusterRadius
      });

      map.addLayer({
        id: `${sourceId}-clusters`,
        type: 'circle',
        source: sourceId,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            clusterColor,
            100,
            '#f59e0b',
            750,
            '#ef4444'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      map.addLayer({
        id: `${sourceId}-count`,
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      map.addLayer({
        id: `${sourceId}-unclustered`,
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': clusterColor,
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [`${sourceId}-clusters`, `${sourceId}-unclustered`]
      });

      if (!features.length || !features[0]) return;

      const feature = features[0];
      const clusterId = feature.properties["cluster_id"];

      if (clusterId) {
        const source = map.getSource(sourceId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          const geometry = feature.geometry as GeoJSON.Point;
          const [lng, lat] = geometry.coordinates;
          if (typeof lng === 'number' && typeof lat === 'number') {
            map.easeTo({
              center: [lng, lat],
              zoom: zoom
            });
          }
        });
      } else {
        const props = feature.properties;
        onPointClick?.(props["id"], props);
      }
    };

    map.on('click', `${sourceId}-clusters`, handleClick);
    map.on('click', `${sourceId}-unclustered`, handleClick);
    
    const handleMouseEnter = () => { map.getCanvas().style.cursor = 'pointer'; };
    const handleMouseLeave = () => { map.getCanvas().style.cursor = ''; };

    map.on('mouseenter', `${sourceId}-clusters`, handleMouseEnter);
    map.on('mouseleave', `${sourceId}-clusters`, handleMouseLeave);

    return () => {
      map.off('click', `${sourceId}-clusters`, handleClick);
      map.off('click', `${sourceId}-unclustered`, handleClick);
      map.off('mouseenter', `${sourceId}-clusters`, handleMouseEnter);
      map.off('mouseleave', `${sourceId}-clusters`, handleMouseLeave);
      if (map.getLayer(`${sourceId}-clusters`)) {
        map.removeLayer(`${sourceId}-clusters`);
        map.removeLayer(`${sourceId}-count`);
        map.removeLayer(`${sourceId}-unclustered`);
        map.removeSource(sourceId);
      }
    };
  }, [map, points, clusterColor, clusterRadius, onPointClick, sourceId]);

  return null;
}
