"use client";

import { X } from "lucide-react";
import MapLibreGL, { type PopupOptions } from "maplibre-gl";
import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { useMap } from "./MapContext";

import { cn } from "@/lib/utils";


export type MapPopupProps = {
  /** Longitude coordinate for popup position */
  longitude: number;
  /** Latitude coordinate for popup position */
  latitude: number;
  /** Callback when popup is closed */
  onClose?: () => void;
  /** Popup content */
  children: ReactNode;
  /** Additional CSS classes for the popup container */
  className?: string;
  /** Show a close button in the popup (default: false) */
  closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

const DEFAULT_OFFSET = 16;

// eslint-disable-next-line max-lines-per-function -- Popup component is cohesive and doesn't warrant splitting
export function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MapPopupProps) {
  const { map } = useMap();
  const popupOptionsRef = useRef(popupOptions);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const container = useMemo(() => {
    if (typeof document === "undefined") return null;
    return document.createElement("div");
  }, []);

  const popup = useMemo(() => {
    const safeLng = typeof longitude === 'number' ? longitude : 0;
    const safeLat = typeof latitude === 'number' ? latitude : 0;

    const popupInstance = new MapLibreGL.Popup({
      offset: DEFAULT_OFFSET,
      ...popupOptions,
      closeButton: false,
    })
      .setMaxWidth("none")
      .setLngLat([safeLng, safeLat]);

    return popupInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map || !container) return;

    const onCloseProp = () => onCloseRef.current?.();

    popup.on("close", onCloseProp);
    popup.setDOMContent(container);
    popup.addTo(map);

    return () => {
      popup.off("close", onCloseProp);
      if (popup.isOpen()) {
        popup.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, container]);

  if (popup.isOpen()) {
    const prev = popupOptionsRef.current;

    const safeLng2 = typeof longitude === 'number' ? longitude : 0;
    const safeLat2 = typeof latitude === 'number' ? latitude : 0;

    if (
      popup.getLngLat().lng !== safeLng2 ||
      popup.getLngLat().lat !== safeLat2
    ) {
      popup.setLngLat([safeLng2, safeLat2]);
    }

    if (prev.offset !== popupOptions.offset) {
      popup.setOffset(popupOptions.offset ?? DEFAULT_OFFSET);
    }
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
      popup.setMaxWidth(popupOptions.maxWidth ?? "none");
    }
    popupOptionsRef.current = popupOptions;
  }

  const handleClose = () => {
    popup.remove();
  };

  if (!container) return null;

  return createPortal(
    <div
      className={cn(
        "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 relative rounded-md border p-3 shadow-md",
        className,
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="ring-offset-background focus:ring-ring absolute top-1 right-1 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>,
    container,
  );
}
