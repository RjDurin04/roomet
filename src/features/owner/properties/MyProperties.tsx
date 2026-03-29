import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Image as ImageIcon, MapPin, Star, Building2, BedDouble, Search, Eye, EyeOff, Loader2, Trash2, X, Info, Users, Phone, Mail } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Link, useNavigate } from 'react-router-dom';

/* --- Modal Components --- */

function PropertyDetailsModal({ property, onClose }: { property: any, onClose: () => void }) {
  if (!property) return null;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="w-full max-w-2xl max-h-[90vh] bg-[#0a0a0a] text-white rounded-[24px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col"
      >
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all z-20">
          <X className="w-4 h-4 text-white/70" />
        </button>
        
        <div className="overflow-y-auto custom-scrollbar p-6 sm:p-7 flex flex-col gap-6 w-full h-full">
          <div className="pr-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">{property.name}</h2>
            <p className="text-white/60 flex items-start gap-1.5 text-xs max-w-lg leading-relaxed">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-70"/> 
              {property.location.address}
            </p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Description */}
            <motion.div variants={itemVariants} className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-inner">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2.5">Description</h3>
              <p className="text-xs sm:text-[13px] font-medium leading-relaxed text-white/90 whitespace-pre-wrap">{property.description || 'No description provided'}</p>
            </motion.div>
            
            {/* Contact */}
            {(property.contact?.phone || property.contact?.email) && (
              <motion.div variants={itemVariants} className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-inner">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">Contact</h3>
                <div className="space-y-2.5">
                  {property.contact?.phone && (
                    <p className="text-xs sm:text-[13px] font-medium text-white/90 flex items-center gap-2.5">
                       <Phone className="w-3.5 h-3.5 text-white/40" /> {property.contact.phone}
                    </p>
                  )}
                  {property.contact?.email && (
                    <p className="text-xs sm:text-[13px] font-medium text-white/90 flex items-center gap-2.5">
                       <Mail className="w-3.5 h-3.5 text-white/40" /> {property.contact.email}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* House Rules */}
            {property.rules && (
              <motion.div variants={itemVariants} className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-inner">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2.5">House Rules</h3>
                <p className="text-xs sm:text-[13px] font-medium leading-relaxed text-white/90 whitespace-pre-wrap">{property.rules}</p>
              </motion.div>
            )}
            {/* Property Amenities */}
            <motion.div variants={itemVariants} className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-inner">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">Property Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-bold text-white/70 border border-white/10 drop-shadow-sm">
                      {amenity}
                    </span>
                  ))
                ) : (
                  <span className="text-[13px] font-medium text-white/30 italic">None specified</span>
                )}
              </div>
            </motion.div>
            
            {/* Available Units */}
            <motion.div variants={itemVariants} className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-white/5 shadow-inner">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">Available Units ({property.rooms?.length || 0})</h3>
              <div className="space-y-2.5">
                {property.rooms?.map((room: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-3.5 bg-[#0a0a0a] rounded-xl border border-white/5 gap-3 hover:border-white/10 transition-colors">
                    <div className="flex-1 flex flex-col justify-center">
                       <div className="mb-2.5">
                         <span className="text-sm font-bold text-white leading-none tracking-tight">{room.name || 'Unnamed Unit'}</span>
                       </div>
                       <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#cfcfcf] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {room.type}
                          </span>
                          {room.gender && (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1 ${
                               room.gender === 'male' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                               room.gender === 'female' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                               'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                               {room.gender}
                            </span>
                          )}
                       </div>
                       <p className="text-[11px] text-white/50 font-medium flex-wrap flex items-center gap-1.5 leading-relaxed">
                         <Users className="w-3 h-3 opacity-60" /> {room.occupied || 0} / {room.capacity} occupied 
                         {room.amenities?.length > 0 && <span className="opacity-40 mx-0.5">•</span>}
                         {room.amenities?.join(' • ')}
                       </p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col justify-center">
                      <p className="text-sm font-black text-white">₱{room.price?.toLocaleString() || 0}</p>
                      <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold mt-0.5 whitespace-nowrap">/ {room.priceType === 'person' ? 'Head' : 'Unit'}</p>
                    </div>
                  </div>
                ))}
                {(!property.rooms || property.rooms.length === 0) && (
                  <p className="text-xs text-white/40 font-medium py-4 text-center border border-dashed border-white/5 rounded-xl">No units available</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ImageManagerModal({ property, onClose }: { property: any, onClose: () => void }) {
  if (!property) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl border border-border/50 shadow-2xl p-8 relative custom-scrollbar"
      >
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-black tracking-tight mb-2">Property Images</h2>
        <p className="text-muted-foreground font-medium mb-8">Gallery for {property.name}</p>
        
        {property.imageUrls?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {property.imageUrls.map((url: string, idx: number) => (
              <div key={idx} className="aspect-square rounded-[24px] overflow-hidden bg-muted relative group border border-border/50 shadow-sm">
                <img src={url} alt={`Property image ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
                {idx === 0 && <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md">Main Cover</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-1">No images uploaded</h3>
            <p className="text-sm font-medium text-muted-foreground">This property doesn't have any images yet.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* --- Main Component --- */

const getStatusColor = (isVisible: boolean | undefined, legacyStatus: string | undefined) => {
  const visible = isVisible ?? (legacyStatus === 'Active');
  if (visible) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  return 'bg-muted text-muted-foreground border-border/50';
};

const getStatusText = (isVisible: boolean | undefined, legacyStatus: string | undefined) => {
  const visible = isVisible ?? (legacyStatus === 'Active');
  if (visible) return 'Visible on Map';
  return 'Hidden';
};

export function MyProperties() {
  const navigate = useNavigate();
  const properties = useQuery(api.properties.listByOwner) || [];
  const toggleVisibility = useMutation(api.properties.toggleVisibility);
  const removeProperty = useMutation(api.properties.remove);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [viewingDetails, setViewingDetails] = useState<any>(null);
  const [managingImages, setManagingImages] = useState<any>(null);

  const handleToggleVisibility = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (isToggling === id) return;
    setIsToggling(id);
    try {
      await toggleVisibility({ id: id as any });
    } catch (error) {
      console.error("Failed to toggle visibility", error);
    } finally {
      setIsToggling(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (isDeleting === id) return;
    if (!window.confirm("Are you sure you want to completely delete this property? This action cannot be undone.")) return;
    
    setIsDeleting(id);
    try {
      await removeProperty({ id: id as any });
    } catch (error) {
      console.error("Failed to delete property", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isVisible = p.isVisible ?? (p.status === 'Active');
    const matchesFilter = activeFilter === 'All' || 
                          (activeFilter === 'Visible' && isVisible) || 
                          (activeFilter === 'Hidden' && !isVisible);
                          
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-full px-8 py-10 lg:px-12 max-w-[1600px] mx-auto flex flex-col">
      <AnimatePresence>
        {viewingDetails && <PropertyDetailsModal property={viewingDetails} onClose={() => { setViewingDetails(null); }} />}
        {managingImages && <ImageManagerModal property={managingImages} onClose={() => { setManagingImages(null); }} />}
      </AnimatePresence>

      {/* Header Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col mb-10 gap-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">My Properties</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" /> You are managing {properties === undefined ? "..." : properties.length} properties
            </p>
          </div>
          <Link to="/owner/properties/add">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 h-12 px-6 rounded-full bg-white text-black font-bold text-sm shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:bg-white/95 transition-all cursor-pointer border border-white/20"
            >
              <Plus className="w-5 h-5 text-black" />
              Add Boarding House
            </motion.div>
          </Link>
        </div>

        {/* Toolbar: Search and Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-card p-2 pl-6 rounded-2xl border border-border/50 shadow-sm">
          <div className="relative w-full lg:w-96 flex items-center">
            <Search className="absolute left-0 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search properties by name..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); }}
              className="w-full h-10 pl-8 bg-transparent border-none outline-none font-medium text-sm placeholder:text-muted-foreground/60 focus:ring-0"
            />
          </div>
          <div className="w-full lg:w-auto overflow-x-auto flex items-center gap-1 bg-muted/30 p-1.5 rounded-xl border border-border/50 shrink-0 custom-scrollbar">
            {['All', 'Visible', 'Hidden'].map(filter => (
              <button
                key={filter}
                onClick={() => { setActiveFilter(filter); }}
                className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${
                  activeFilter === filter 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Grid Area */}
      <div className="flex-1">
        <AnimatePresence mode="popLayout">
          {filteredProperties.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredProperties.map((property, index) => (
                <motion.div
                  layout
                  key={property._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-card rounded-[28px] border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Image Header */}
                  <div className="relative h-[200px] w-full overflow-hidden shrink-0">
                    <img 
                      src={property.imageUrls?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'} 
                      alt={property.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 opacity-60 mix-blend-multiply" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm ${getStatusColor(property.isVisible, property.status)}`}>
                        {getStatusText(property.isVisible, property.status)}
                      </span>
                    </div>

                    {/* Quick Analytics Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
                       <h2 className="text-xl font-black text-white line-clamp-1 drop-shadow-md" title={property.name}>{property.name}</h2>
                       <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          <span className="text-xs font-bold text-white">New</span>
                       </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-muted-foreground text-[13px] font-medium flex items-center gap-1.5 mb-3 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {property.location.address}
                    </p>

                    {/* General Perks Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {property.amenities?.slice(0, 3).map((amenity: string) => (
                        <span key={amenity} className="px-2 py-0.5 rounded-md bg-muted/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 border border-border/50">
                          {amenity}
                        </span>
                      ))}
                      {(property.amenities?.length || 0) > 3 && (
                        <span className="text-[9px] font-black text-muted-foreground/40 self-center">
                          +{(property.amenities?.length || 0) - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-6 bg-muted/20 p-4 rounded-2xl border border-border/40">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Units</p>
                        <p className="text-sm font-black flex items-center gap-1.5 text-primary">
                          <BedDouble className="w-4 h-4" /> {property.rooms?.length || 1} Types
                        </p>
                      </div>
                      <div className="w-px h-8 bg-border/50" />
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Price Range</p>
                        <p className="text-sm font-black text-foreground tabular-nums">
                          {property.rooms && property.rooms.length > 0 ? (
                            <>
                              ₱{Math.min(...property.rooms.map((r: any) => r.price)).toLocaleString()} 
                              {property.rooms.length > 1 && ` - ₱${Math.max(...property.rooms.map((r: any) => r.price)).toLocaleString()}`}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-auto grid grid-cols-5 gap-2 pt-4 border-t border-border/50">
                      <button 
                        onClick={() => { setViewingDetails(property); }}
                        className="col-span-1 h-10 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" 
                        title="View Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setManagingImages(property); }}
                        className="col-span-1 h-10 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" 
                        title="View Images"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigate(`/owner/properties/edit/${property._id}`)}
                        className="col-span-1 h-10 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" 
                        title="Edit Info"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleToggleVisibility(property._id, e)}
                        disabled={isToggling === property._id}
                        className={`col-span-1 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          (property.isVisible ?? (property.status === 'Active'))
                            ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                        }`}
                        title={(property.isVisible ?? (property.status === 'Active')) ? 'Hide from Map' : 'Publish to Map'}
                      >
                        {isToggling === property._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (property.isVisible ?? (property.status === 'Active')) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button 
                        onClick={(e) => handleDelete(property._id, e)}
                        disabled={isDeleting === property._id}
                        className="col-span-1 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                        title="Delete Property"
                      >
                         {isDeleting === property._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-black mb-2">No properties here</h3>
              <p className="text-muted-foreground font-medium max-w-sm">
                You haven't added any properties matching this status yet.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                className="mt-6 text-sm font-bold text-primary hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
