"use client";

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing, security/detect-object-injection */
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Building2, BedDouble, Info, Image as ImageIcon, X, Phone, ShieldCheck, 
  MapPin, MessageSquare, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

import { Map, MapMarker } from '../../../../components/ui/map';

interface PropertyDetailsModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic data payload
  property: any;
  isOpen: boolean;
  onClose: () => void;
  _onEdit?: () => void;
  _onDelete?: () => void;
  _isDeleting?: boolean;
}

// eslint-disable-next-line max-lines-per-function -- Modal contains extensive unified property details structure
export function PropertyDetailsModal({
  property,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isDeleting
}: PropertyDetailsModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  if (!property) return null;

  const images = (property.imageUrls || []) as string[];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[85vh] bg-card sm:border border-border/60 sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* 1. COMPACT PROFILE HEADER */}
            <div className="p-5 sm:p-6 flex items-center justify-between border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                {/* Profile-pic Style Feature Image */}
                <div 
                  onClick={() => images.length > 0 && setActiveImageIndex(0)}
                  className="w-14 h-14 rounded-2xl overflow-hidden bg-muted border border-border/40 flex-shrink-0 cursor-pointer hover:border-primary/50 transition-all group"
                >
                  {images[0] ? (
                    <img src={images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20"><Building2 className="w-6 h-6" /></div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter leading-none mb-1.5">{property.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 italic">Dashboard Profile</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span className="text-[9px] font-bold">New Listing</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <button 
                  onClick={() => images.length > 0 && setActiveImageIndex(0)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-xl transition-all cursor-pointer border border-transparent hover:border-border"
                 >
                   <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">View Collection</span>
                 </button>
                 <div className="w-px h-6 bg-border mx-1" />
                 <button
                  onClick={onClose}
                  className="p-2.5 bg-muted/40 hover:bg-muted rounded-xl transition-all cursor-pointer group"
                >
                  <X className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* 2. COMPACT BODY GRID (TWO COLUMNS: Sidebar Left, Detail Right) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
               <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                  
                  {/* --- SIDEBAR SUMMARY (Condensed Info) --- */}
                  <div className="lg:col-span-4 border-r border-border/40 bg-muted/20 p-6 space-y-6">
                     
                     {/* Mini Map Widget */}
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                           <MapPin className="w-3.5 h-3.5 text-primary" />
                           <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">Coordinate Context</h4>
                        </div>
                        <div className="space-y-3">
                           <div className="h-32 rounded-2xl overflow-hidden bg-muted border border-border/40 relative">
                              <Map
                                 viewport={{
                                   center: [property.location.lng, property.location.lat],
                                   zoom: 15
                                 }}
                                 attributionControl={false}
                                 interactive={false}
                                 className="w-full h-full pointer-events-none grayscale opacity-70"
                              >
                                 <MapMarker longitude={property.location.lng} latitude={property.location.lat}>
                                    <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary animate-pulse" />
                                 </MapMarker>
                              </Map>
                           </div>
                           <p className="text-[10px] font-black italic text-foreground/70 leading-relaxed px-1">
                              {property.location.address}
                           </p>
                        </div>
                     </div>

                     {/* Profile Status List */}
                     <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-sm space-y-3">
                           <div className="flex items-center gap-2 mb-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">Global Access</h4>
                           </div>
                           <div className="flex flex-wrap gap-1.5">
                              {property.amenities?.map((am: string, idx: number) => (
                                 <span key={idx} className="px-2 py-1 bg-primary/5 text-primary rounded-lg text-[8px] font-black uppercase tracking-tight border border-primary/5">
                                    {am}
                                 </span>
                              ))}
                              {property.amenities.length === 0 && <span className="text-[8px] italic opacity-30">No amenities</span>}
                           </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm space-y-3">
                           <div className="flex items-center gap-2 mb-1">
                              <Phone className="w-3.5 h-3.5 text-primary" />
                              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">Fast Channels</h4>
                           </div>
                           <div className="space-y-2">
                              <div className="text-[10px] font-black italic text-foreground tracking-tight flex items-center justify-between">
                                 <span className="opacity-40 font-normal">PH</span> {property.contact.phone}
                              </div>
                              <div className="text-[10px] font-black italic text-foreground tracking-tight flex items-center justify-between overflow-hidden">
                                 <span className="opacity-40 font-normal">EM</span> <span className="truncate ml-2">{property.contact.email}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* --- MAIN CONTENT FEED --- */}
                  <div className="lg:col-span-8 p-6 sm:p-8 space-y-8">
                     
                     {/* Identity Section */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Info className="w-4 h-4 text-primary" />
                           <h3 className="text-[10px] font-black uppercase tracking-widest italic text-muted-foreground">The Overview</h3>
                        </div>
                        <div className="p-6 bg-card border border-border/40 rounded-[24px] shadow-sm relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-3xl -translate-y-10 group-hover:bg-primary/10 transition-colors" />
                           <p className="text-sm sm:text-base font-bold italic leading-relaxed text-foreground/80">
                             "{property.description || 'No detailed vision provided.'}"
                           </p>
                        </div>
                     </section>

                     {/* Inventory Section (Compact List Style) */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <BedDouble className="w-4 h-4 text-primary" />
                           <h3 className="text-[10px] font-black uppercase tracking-widest italic text-muted-foreground">Inventory Slots</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic payload */}
                           {property.rooms?.map((room: any, i: number) => (
                              <div key={i} className="flex flex-col p-4 bg-muted/10 border border-border/40 rounded-2xl hover:bg-card transition-all group shadow-sm">
                                 <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[8px] font-black text-muted-foreground">#{i + 1}</span>
                                       <h4 className="text-[11px] font-black uppercase italic tracking-tight group-hover:text-primary transition-colors">{room.name}</h4>
                                    </div>
                                    <div className="flex gap-1">
                                       <span className="text-[7px] font-black uppercase tracking-tighter bg-muted px-2 py-0.5 rounded-md border border-border/50">{room.gender || 'Mixed'}</span>
                                       <span className="text-[7px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/10">{room.type}</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-between gap-4">
                                    <div className="text-[13px] font-black italic text-primary">₱{room.price?.toLocaleString()}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest opacity-40">{room.occupied || 0} / {room.capacity} Slots</div>
                                 </div>

                                 {room.amenities && room.amenities.length > 0 && (
                                   <div className="flex flex-wrap gap-x-2 gap-y-1 pt-3 mt-3 border-t border-border/20">
                                     {room.amenities.map((am: string, idx: number) => (
                                       <span key={idx} className="text-[7.5px] font-bold text-muted-foreground/60 uppercase tracking-tight flex items-center gap-1">
                                         <div className="w-1 h-1 bg-primary/40 rounded-full" /> {am}
                                       </span>
                                     ))}
                                   </div>
                                 )}
                              </div>
                           ))}
                           {property.rooms.length === 0 && <div className="col-span-full py-10 text-center text-[10px] font-black uppercase tracking-widest opacity-20 italic">No inventory added</div>}
                        </div>
                     </section>

                     {/* Rules Section (Tight Card) */}
                     <section className="space-y-4 pb-4">
                        <div className="flex items-center gap-2">
                           <MessageSquare className="w-4 h-4 text-primary" />
                           <h3 className="text-[10px] font-black uppercase tracking-widest italic text-muted-foreground">Living Rules</h3>
                        </div>
                        <div className="p-5 bg-muted/30 border border-border/30 rounded-2xl border-l-4 border-l-primary/40">
                           <p className="text-xs font-medium leading-relaxed italic text-foreground/60 whitespace-pre-wrap">
                              {property.rules || 'Standard rules apply. No custom overrides specified.'}
                           </p>
                        </div>
                     </section>

                  </div>
               </div>
            </div>
            
            {/* 3. SIMPLIFIED STICKY FOOTER ACTION */}
            <div className="p-4 border-t border-border/40 bg-card/60 backdrop-blur-md flex justify-center items-center">
               <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                 <ShieldCheck className="w-3 h-3" /> profile review • read only mode
               </div>
            </div>
          </motion.div>

          {/* 4. LIGHTBOX OVERLAY */}
          <AnimatePresence>
            {activeImageIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-20"
              >
                <button 
                  onClick={() => setActiveImageIndex(null)}
                  className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer z-[120]"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="relative w-full h-full flex items-center justify-center gap-4 group">
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(prev => prev === 0 ? images.length - 1 : (prev || 0) - 1);
                    }}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all opacity-40 hover:opacity-100"
                   >
                     <ChevronLeft className="w-8 h-8" />
                   </button>

                   <motion.div 
                    key={activeImageIndex}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-5xl max-h-full aspect-auto rounded-2xl overflow-hidden shadow-2xl bg-black/40"
                   >
                      <img 
                        src={images[activeImageIndex]} 
                        alt={`Collection View ${activeImageIndex + 1}`} 
                        className="w-full h-full object-contain"
                      />
                   </motion.div>

                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(prev => (prev || 0) === images.length - 1 ? 0 : (prev || 0) + 1);
                    }}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all opacity-40 hover:opacity-100"
                   >
                     <ChevronRight className="w-8 h-8" />
                   </button>
                </div>

                <div className="absolute bottom-10 flex items-center gap-3">
                   {images.map((_, idx: number) => (
                     <div 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${idx === activeImageIndex ? 'w-10 bg-primary' : 'bg-white/10'}`} 
                     />
                   ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
