"use client";

import { Mail, Phone, BedDouble, MapPin, ShieldCheck, MessageSquare } from 'lucide-react';

import { Map, MapMarker } from '../../../../components/ui/map';
import { type PropertyFormData, type ImageItem } from '../types';

import { PreviewSection } from './PreviewSection';

interface StepPreviewProps {
  formData: PropertyFormData;
  images: ImageItem[];
}

// eslint-disable-next-line max-lines-per-function -- Preview combines all property details into a single large view
export function StepPreview({ formData, images }: StepPreviewProps) {
  const PERCENTAGE_MULTIPLIER = 100;
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-[32px] md:rounded-[40px] p-6 md:p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/10 rounded-full -translate-x-12 -translate-y-12 blur-2xl" />
        <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-3 md:mb-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent italic lowercase">review & publish</h3>
        <p className="text-[13px] md:text-base text-muted-foreground/80 max-w-sm mx-auto leading-relaxed font-medium">Double-check everything before making your property live to potential tenants.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-10">
          {/* 01: Identity */}
          <PreviewSection number="01" title="Identity">
            <div className="bg-card border border-border/50 rounded-[28px] md:rounded-[32px] p-6 md:p-8 transition-all hover:bg-muted/30 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-black mb-4 tracking-tighter italic uppercase">{formData.name || 'Untitled Property'}</h2>
              <div className="p-4 md:p-5 rounded-2xl bg-muted/20 border border-border/30 italic text-sm text-foreground/70 leading-relaxed font-bold">
                "{formData.description || 'No description provided.'}"
              </div>
            </div>
          </PreviewSection>

          {/* 02: Photos (Relocated to main column for visibility) */}
          <PreviewSection number="02" title="Gallery">
            <div className="bg-card border border-border/50 rounded-[28px] md:rounded-[32px] p-4 md:p-6 shadow-sm overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img: any, idx: any) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-border/20 group/img relative">
                    <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt={`Preview ${idx + 1}`} />
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="col-span-full aspect-[4/1] rounded-2xl bg-muted/40 border-2 border-dashed border-border/40 flex items-center justify-center font-bold text-xs text-muted-foreground uppercase tracking-widest italic">
                    No images uploaded
                  </div>
                )}
              </div>
            </div>
          </PreviewSection>

          {/* 03: Inventory/Units */}
          <PreviewSection number="03" title="Inventory">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.rooms.map((room: any) => (
                <div key={room.id} className="p-6 rounded-[28px] bg-card border border-border/50 flex flex-col gap-5 group/item hover:border-primary/40 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <BedDouble className="w-4 h-4 text-primary" />
                       <span className="font-black text-sm tracking-tight capitalize italic">{room.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-[8px] font-black uppercase tracking-widest border border-border/40 capitalize">{room.gender}</span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">{room.type}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-end gap-1.5">
                      <span className="text-2xl font-black text-primary italic">₱{room.price.toLocaleString()}</span>
                      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1.5">/ {room.priceType === 'person' ? 'Head' : 'Unit'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>{room.occupied} / {room.capacity} Occupied</span>
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-primary transition-all duration-500" 
                           style={{ width: `${(room.occupied / Math.max(1, room.capacity)) * PERCENTAGE_MULTIPLIER}%` }} 
                         />
                      </div>
                    </div>
                  </div>

                  {room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-3 border-t border-border/40">
                      {room.amenities.map((amenity: any, idx: any) => (
                        <span key={idx} className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight flex items-center gap-1">
                          <div className="w-1 h-1 bg-primary/40 rounded-full" /> {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {formData.rooms.length === 0 && (
                <div className="col-span-full p-8 rounded-[28px] border-2 border-dashed border-border/40 flex items-center justify-center font-bold text-xs text-muted-foreground uppercase tracking-widest italic bg-muted/5">
                  No rooms added
                </div>
              )}
            </div>
          </PreviewSection>
        </div>

        {/* Sidebar Space Column */}
        <div className="lg:col-span-4 space-y-10">
          {/* 04: Location */}
          <PreviewSection number="04" title="Location">
            <div className="bg-card border border-border/50 rounded-[28px] md:rounded-[32px] overflow-hidden shadow-sm flex flex-col">
              <div className="h-44 w-full relative group">
                <Map
                  viewport={{
                    center: [formData.mapPin.lng, formData.mapPin.lat],
                    zoom: 15
                  }}
                  interactive={false}
                  className="w-full h-full pointer-events-none filter grayscale dark:invert-[0.05]"
                >
                  <MapMarker
                    longitude={formData.mapPin.lng}
                    latitude={formData.mapPin.lat}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary animate-pulse" />
                  </MapMarker>
                </Map>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-xl border border-border shadow-lg">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pin Position</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-bold text-foreground/80 leading-relaxed italic">
                  {formData.address || 'Address not specified'}
                </p>
              </div>
            </div>
          </PreviewSection>

          {/* 05: Features & Rules */}
          <PreviewSection number="05" title="Details">
            <div className="space-y-4">
               {/* Global Amenities */}
               <div className="bg-card border border-border/50 rounded-[28px] md:rounded-[32px] p-6 shadow-sm">
                 <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground italic">Property Features</h4>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity: any, idx: any) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/20">
                        {amenity}
                      </span>
                    ))}
                    {formData.amenities.length === 0 && (
                      <span className="text-[10px] font-bold text-muted-foreground/40 italic">No features listed</span>
                    )}
                 </div>
               </div>

               {/* House Rules */}
               <div className="bg-muted/30 border border-border/50 rounded-[28px] md:rounded-[32px] p-6">
                 <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground italic">House Rules</h4>
                 </div>
                 <p className="text-xs font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">
                   {formData.rules || 'Standard rules apply.'}
                 </p>
               </div>
            </div>
          </PreviewSection>

          {/* 06: Contact */}
          <PreviewSection number="06" title="Contact">
             <div className="bg-card border border-border/50 rounded-[28px] md:rounded-[32px] p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/20 group/contact">
                  <Phone className="w-4 h-4 text-primary/60 group-hover/contact:scale-110 transition-transform" />
                  <span className="text-sm font-bold">{formData.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/20 group/contact">
                  <Mail className="w-4 h-4 text-primary/60 group-hover/contact:scale-110 transition-transform" />
                  <span className="text-sm font-bold truncate">{formData.email || 'No email provided'}</span>
                </div>
              </div>
          </PreviewSection>
        </div>
      </div>
    </div>
  );
}
