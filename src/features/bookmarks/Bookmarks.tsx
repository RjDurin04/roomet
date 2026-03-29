import { useState } from 'react';
import { Bookmark as BookmarkIcon, Star, MapPin, Trash2, Grid3X3, List, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

type ViewMode = 'grid' | 'list';

export function Bookmarks() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const items = useQuery(api.bookmarks.getUserBookmarks) || [];
  const toggleBookmark = useMutation(api.bookmarks.toggle);

  const removeItem = async (id: string) => {
    await toggleBookmark({ propertyId: id as Id<"properties"> });
  };

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Collection</p>
            <h1 className="text-2xl font-bold tracking-tight">Saved Places</h1>
            <p className="text-[13px] text-muted-foreground mt-1">{items.length} boarding houses bookmarked</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setViewMode('grid'); }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${viewMode === 'grid' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setViewMode('list'); }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${viewMode === 'list' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookmarkIcon className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-[15px] font-semibold text-muted-foreground">No saved places yet</p>
            <p className="text-[13px] text-muted-foreground/70 mt-1 mb-6">Tap the heart icon on any listing to save it here.</p>
            <button onClick={() => navigate('/tenant/map')} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-primary/90 transition-colors">
              Explore Map
            </button>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {items.map((bh, i) => (
                <motion.div 
                  key={bh.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all"
                >
                  {/* Image */}
                  <div className="h-[180px] relative overflow-hidden">
                    <img src={bh.images[0]} alt={bh.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Overlay Actions */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeItem(bh.id); }} 
                        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-destructive/80 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {bh.rating}
                    </div>
                    {/* Availability */}
                    <div className={`absolute bottom-3 left-3 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur ${bh.available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {bh.available ? 'Available' : 'Full'}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 
                        onClick={() => navigate(`/tenant/map/roomet/${bh.id}`)} 
                        className="font-bold text-[14px] truncate cursor-pointer hover:text-primary transition-colors"
                      >
                        {bh.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {bh.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(bh.amenities || []).slice(0, 3).map((a: string) => (
                        <span key={a} className="text-[9px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div>
                        <span className="text-lg font-extrabold tabular-nums">₱{bh.priceRange.min.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground font-medium"> /mo</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/tenant/map/roomet/${bh.id}`)}
                        className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        Details <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && items.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            <AnimatePresence>
              {items.map((bh, _i) => (
                <motion.div
                  key={bh.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                    <img src={bh.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/tenant/map/roomet/${bh.id}`)}>
                      {bh.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" /> {bh.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-[12px] font-bold shrink-0">
                    <Star className="w-3 h-3 fill-current" /> {bh.rating}
                  </div>
                  <div className="shrink-0 text-right w-24">
                    <p className="font-bold text-[14px] tabular-nums">₱{bh.priceRange.min.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">per month</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => navigate(`/tenant/map/roomet/${bh.id}`)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeItem(bh.id)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
