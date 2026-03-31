"use client";

import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

import { useMap } from './MapContext';

interface MapMarkerProps {
  longitude: number;
  latitude: number;
  color?: string;
  draggable?: boolean;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onDragStart?: (e: any) => void;
  onDrag?: (e: any) => void;
  onDragEnd?: (e: any) => void;
  children?: React.ReactNode;
  className?: string;
  offset?: any;
  anchor?: any;
  rotation?: number;
  pitchAlignment?: any;
  rotationAlignment?: any;
  clickTolerance?: number;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export const MapMarker = forwardRef<maplibregl.Marker, MapMarkerProps>(({
  longitude,
  latitude,
  color,
  draggable = false,
  onDragStart,
  onDrag,
  onDragEnd,
  children,
  className,
  offset,
  anchor,
  rotation = 0,
  pitchAlignment = 'auto',
  rotationAlignment = 'auto',
  clickTolerance = 0,
}, ref) => {
  const { map } = useMap();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => markerRef.current!);

  useEffect(() => {
    if (!map) return;

    const options: maplibregl.MarkerOptions = { draggable, rotation, clickTolerance };
    if (offset !== undefined) options.offset = offset;
    if (anchor !== undefined) options.anchor = anchor;
    if (pitchAlignment !== undefined) options.pitchAlignment = pitchAlignment;
    if (rotationAlignment !== undefined) options.rotationAlignment = rotationAlignment;

    if (color) options.color = color;
    if (children && elementRef.current) {
      options.element = elementRef.current;
    }

    const safeLng = typeof longitude === 'number' ? longitude : 0;
    const safeLat = typeof latitude === 'number' ? latitude : 0;

    const marker = new maplibregl.Marker(options)
      .setLngLat([safeLng, safeLat])
      .addTo(map);

    if (className) {
      marker.getElement().classList.add(...className.split(' '));
    }

    markerRef.current = marker;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const handleDragStart = (e: any) => onDragStart?.(e);
    const handleDrag = (e: any) => onDrag?.(e);
    const handleDragEnd = (e: any) => onDragEnd?.(e);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    marker.on('dragstart', handleDragStart);
    marker.on('drag', handleDrag);
    marker.on('dragend', handleDragEnd);

    return () => {
      marker.off('dragstart', handleDragStart);
      marker.off('drag', handleDrag);
      marker.off('dragend', handleDragEnd);
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Re-create marker only on critical changes
  }, [map, children]); // Re-create if children change to update element

  useEffect(() => {
    if (markerRef.current && typeof longitude === 'number' && typeof latitude === 'number') {
      markerRef.current.setLngLat([longitude, latitude]);
    }
  }, [longitude, latitude]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setDraggable(draggable);
    }
  }, [draggable]);

  return (
    <div className="invisible absolute pointer-events-none">
      <div ref={elementRef}>{children}</div>
    </div>
  );
});

MapMarker.displayName = 'MapMarker';
