import { MapPin } from 'lucide-react';

import { Map, MapMarker } from '../../../components/ui/map';

interface MapWidgetProps {
  lng: number;
  lat: number;
  address: string;
}

export function MapWidget({ lng, lat, address }: MapWidgetProps) {
  return (
    <div className="col-span-full space-y-3">
      <div className="flex items-center gap-2 px-1">
        <MapPin className="w-3 h-3 text-primary" />
        <h4 className="text-[9px] font-black uppercase tracking-widest text-white/30">Location</h4>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-1 group">
        <div className="h-28 rounded-xl overflow-hidden bg-black/40 relative">
          <Map
            viewport={{
              center: [lng, lat],
              zoom: 15
            }}
            attributionControl={false}
            interactive={false}
            className="w-full h-full pointer-events-none grayscale opacity-60"
          >
            <MapMarker longitude={lng} latitude={lat}>
              <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary animate-pulse" />
            </MapMarker>
          </Map>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="p-3">
          <p className="text-[11px] font-bold italic leading-relaxed text-white/70">{address}</p>
        </div>
      </div>
    </div>
  );
}
