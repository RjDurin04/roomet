"use client";

import { Minus, Plus, Locate, Maximize } from "lucide-react";
import { useState, useEffect, useRef } from "react";


import { useMap } from "./MapContext";

import { UI_CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MapControls({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("absolute right-4 top-4 z-10 flex flex-col gap-2", className)}>
      {children}
    </div>
  );
}

export function ZoomControl() {
  const { map } = useMap();
  const [zoom, setZoom] = useState<number>(UI_CONSTANTS.MAP_DEFAULT_ZOOM);

  useEffect(() => {
    if (!map) return;
    const updateZoom = () => { setZoom(map.getZoom()); };
    map.on("zoom", updateZoom);
    return () => { map.off("zoom", updateZoom); };
  }, [map]);

  const onZoomIn = () => { map?.zoomIn(); };
  const onZoomOut = () => { map?.zoomOut(); };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-background/80 shadow-lg backdrop-blur-md">
      <button
        onClick={onZoomIn}
        disabled={zoom >= UI_CONSTANTS.MAP_MAX_ZOOM}
        className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-muted disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className="h-px bg-border/50" />
      <button
        onClick={onZoomOut}
        disabled={zoom <= UI_CONSTANTS.MAP_MIN_ZOOM}
        className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-muted disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function FullscreenControl() {
  const { map } = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!map) return;
    containerRef.current = map.getContainer() as HTMLDivElement;
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => { document.removeEventListener("fullscreenchange", onFullscreenChange); };
  }, [map]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen().catch(console.error);
    } else {
      void document.exitFullscreen().catch(console.error);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/80 shadow-lg backdrop-blur-md transition-colors hover:bg-muted"
    >
      <Maximize className={cn("h-4 w-4 transition-transform duration-300", isFullscreen ? "scale-110 text-primary" : "")} />
    </button>
  );
}

export function LocateControl() {
  const { map } = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const locate = () => {
    if (!map || isLocating) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: UI_CONSTANTS.MAP_DEFAULT_ZOOM,
          essential: true,
        });
        setIsLocating(false);
      },
      () => { setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <button
      onClick={locate}
      disabled={isLocating}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/80 shadow-lg backdrop-blur-md transition-colors hover:bg-muted disabled:opacity-50"
    >
      <Locate className={cn("h-4 w-4", isLocating ? "animate-pulse text-primary" : "")} />
    </button>
  );
}
