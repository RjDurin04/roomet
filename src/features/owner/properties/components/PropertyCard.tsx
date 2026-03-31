/* eslint-disable complexity, no-magic-numbers, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-floating-promises */
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, BedDouble, Info, Image as ImageIcon, Edit2, EyeOff, Eye, Trash2, Loader2, Home, ChevronRight, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


interface PropertyCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic Convex payload
  property: any;
  index: number;
  onViewDetails: () => void;
  onManageImages: () => void;
  onEdit: () => void;
  onToggleVisibility: (e: React.MouseEvent) => void;
  isToggling: boolean;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting: boolean;
  getStatusColor: (isVisible: boolean | undefined, legacyStatus: string | undefined) => string;
  getStatusText: (isVisible: boolean | undefined, legacyStatus: string | undefined) => string;
}

// eslint-disable-next-line max-lines-per-function -- Multi-action card with contextual edit menu
export function PropertyCard({
  property,
  index,
  onViewDetails,
  onEdit: _onEdit,
  onToggleVisibility,
  isToggling,
  onDelete,
  isDeleting,
  getStatusColor,
  getStatusText,
}: PropertyCardProps) {
  const navigate = useNavigate();
  const [showEditOptions, setShowEditOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isVisible = property.isVisible ?? (property.status === 'Active');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowEditOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const editSteps = [
    { title: 'Basic Info', id: 'info', icon: Info, color: 'text-blue-500' },
    { title: 'Location', id: 'location', icon: MapPin, color: 'text-rose-500' },
    { title: 'Inventory', id: 'rooms', icon: BedDouble, color: 'text-primary' },
    { title: 'Features', id: 'amenities', icon: Home, color: 'text-amber-500' },
    { title: 'Gallery', id: 'images', icon: ImageIcon, color: 'text-emerald-500' },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-card rounded-[28px] border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
    >
      <div className="relative h-[200px] w-full overflow-hidden shrink-0">
        <img 
          src={property.imageUrls?.[0] ?? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'} 
          alt={property.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 opacity-60 mix-blend-multiply" />
        
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm ${getStatusColor(property.isVisible, property.status)}`}>
            {getStatusText(property.isVisible, property.status)}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
           <h2 className="text-xl font-black text-white line-clamp-1 drop-shadow-md" title={property.name}>{property.name}</h2>
           <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span className="text-xs font-bold text-white">New</span>
           </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-muted-foreground text-[13px] font-medium flex items-center gap-1.5 mb-3 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" /> {property.location.address}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {property.amenities?.slice(0, 3).map((amenity: string) => (
            <span key={amenity} className="px-2 py-0.5 rounded-md bg-muted/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 border border-border/50">
              {amenity}
            </span>
          ))}
          {(property.amenities?.length ?? 0) > 3 && (
            <span className="text-[9px] font-black text-muted-foreground/40 self-center">
              +{(property.amenities?.length ?? 0) - 3} more
            </span>
          )}
        </div>

        <div className="mb-6 bg-muted/20 p-4 rounded-2xl border border-border/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1 text-center">Managed Inventory</p>
          <p className="text-sm font-black flex items-center justify-center gap-1.5 text-primary">
            < BedDouble className="w-4 h-4" /> {property.rooms?.length || 0} Room Types Specified
          </p>
        </div>

        <div className="mt-auto grid grid-cols-4 gap-2 pt-4 border-t border-border/50 relative">
          <button 
            onClick={onViewDetails}
            className="col-span-1 h-10 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" 
            title="View Details"
          >
            <Info className="w-4 h-4" />
          </button>
          
          <div className="col-span-1 border-none bg-none p-0 relative" ref={menuRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowEditOptions(!showEditOptions); }}
              className={`w-full h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${showEditOptions ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary'}`} 
              title="Edit Property"
            >
              {showEditOptions ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showEditOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-3 w-48 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-[60]"
                >
                  <div className="p-2 border-b border-border/40 bg-muted/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 italic">Select Revision Step</p>
                  </div>
                  <div className="p-1">
                    {editSteps.map((step) => (
                      <button
                        key={step.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/owner/properties/edit/${property._id}?step=${step.id}&reset=true`);
                          setShowEditOptions(false);
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-xl transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <step.icon className={`w-4 h-4 ${step.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                          <span className="text-[11px] font-bold text-foreground/80 group-hover:text-primary transition-colors">{step.title}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={onToggleVisibility}
            disabled={isToggling}
            className={`col-span-1 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isVisible
                ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
            }`}
            title={isVisible ? 'Hide from Map' : 'Publish to Map'}
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button 
            onClick={onDelete}
            disabled={isDeleting}
            className="col-span-1 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
            title="Delete Property"
          >
             {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
