import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, UserCircle2, Heart, AlertCircle, Star, Loader2, 
  Phone, Building2, BedDouble, Info, ShieldCheck, 
  MapPin, MessageSquare, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Map, MapMarker } from '../../components/ui/map';

import { cn } from '@/lib/utils';

export function BoardingHouseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetTab = searchParams.get('tab') as 'info' | 'reviews' | null;
  const targetReviewId = searchParams.get('reviewId');

  const bhData = useQuery(api.properties.getById, { id: id as Id<"properties"> });
  const stats = useQuery(api.reviews.getStats, { propertyId: id as Id<"properties"> });
  const reviews = useQuery(api.reviews.getByProperty, { propertyId: id as Id<"properties"> });
  const currentUser = useQuery(api.auth.getCurrentUser);
  const createReview = useMutation(api.reviews.create);
  
  const isBookmarked = useQuery(api.bookmarks.check, { propertyId: id as Id<"properties"> }) ?? false;
  const toggleBookmark = useMutation(api.bookmarks.toggle);
  const startConversation = useMutation(api.inquiries.startConversation);

  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>(targetTab === 'reviews' ? 'reviews' : 'info');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const sortedReviews = useMemo(() => {
    if (!reviews) return [];
    if (targetReviewId) {
      const topReview = reviews.find(r => r._id === targetReviewId);
      const otherReviews = reviews.filter(r => r._id !== targetReviewId);
      if (topReview) {
        return [topReview, ...otherReviews];
      }
    }
    return reviews;
  }, [reviews, targetReviewId]);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reviewsScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to target review
  useEffect(() => {
    if (activeTab === 'reviews' && targetReviewId) {
      const element = document.getElementById(`review-${targetReviewId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeTab, targetReviewId, reviews]);

  if (bhData === undefined) {
    return (
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        className="absolute top-0 right-0 bottom-0 w-[500px] bg-[#0a0a0a] border-l border-white/5 shadow-2xl flex items-center justify-center z-40 rounded-l-[1.5rem]"
      >
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </motion.div>
    );
  }

  const isUnavailable = bhData && (bhData.status === "Deleted" || bhData.isVisible === false);
  if (bhData === null || isUnavailable) {
    return (
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        className="absolute top-0 right-0 bottom-0 w-full sm:w-[500px] bg-[#0a0a0a] text-white border-l border-white/5 shadow-2xl flex flex-col items-center justify-center z-40 rounded-l-[1.5rem] p-8 text-center"
      >
        <AlertCircle className="w-12 h-12 text-rose-500/80 mb-4" />
        <h3 className="text-xl font-bold uppercase">{isUnavailable ? "Listing Unavailable" : "Property Not Found"}</h3>
        <p className="text-white/50 mt-2 text-sm">
          {isUnavailable 
            ? "This listing has been taken down or is no longer active." 
            : "We couldn't find the property you're looking for."}
        </p>
        <button onClick={() => navigate('/tenant/map')} className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 transition-all text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5">Back to Map</button>
      </motion.div>
    );
  }

  const bh = {
    ...bhData,
    id: bhData._id,
    images: bhData.imageUrls || [],
    available: bhData.rooms.some(r => (r.occupied ?? 0) < r.capacity),
    rating: stats?.rating || 0,
    reviewsCount: stats?.count || 0,
    houseRules: bhData.rules,
    reviews: sortedReviews || [],
    priceRange: {
      min: Math.min(...(bhData.rooms.length > 0 ? bhData.rooms.map(r => r.price) : [0])),
    }
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await createReview({ propertyId: id as Id<"properties">, rating: newRating, comment: newComment || undefined });
      setShowReviewForm(false);
      setNewComment('');
      setNewRating(5);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute top-0 right-0 bottom-0 w-full sm:w-[500px] bg-[#0a0a0a] text-white border-l border-white/10 shadow-2xl flex flex-col z-40 rounded-l-[2rem] overflow-hidden"
      >
        {/* 1. PROFILE HEADER STYLE */}
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => bh.images.length > 0 && setActiveImageIndex(0)}
              className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 cursor-pointer hover:border-primary transition-all group"
            >
              {bh.images[0] ? (
                <img src={bh.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20"><Building2 className="w-6 h-6" /></div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-none mb-1.5 truncate max-w-[200px]">{bh.name}</h2>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  bh.available ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                  {bh.available ? 'Available' : 'Occupied'}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span className="text-[9px] font-bold">{bh.rating > 0 ? bh.rating.toFixed(1) : "New"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={async () => {
                 if (!currentUser) { alert("Please log in to bookmark this property."); return; }
                 await toggleBookmark({ propertyId: id as Id<"properties"> });
               }} 
               className={cn(
                 "p-2.5 rounded-xl border transition-all cursor-pointer",
                 isBookmarked ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
               )}
             >
                <Heart className={cn("w-4 h-4", isBookmarked && "fill-current")} />
             </button>
             <button
              onClick={() => navigate('/tenant/map')}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer group"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        {/* 2. TAB NAVIGATION */}
        <div className="flex border-b border-white/5 bg-[#0a0a0a]/40 backdrop-blur-sm">
           <button onClick={() => { setActiveTab('info'); }} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest relative transition-all ${activeTab==='info' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
              Information
              {activeTab === 'info' && <motion.div layoutId="tabMarkerDetail" className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary" />}
           </button>
           <button onClick={() => { setActiveTab('reviews'); }} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest relative transition-all ${activeTab==='reviews' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
              Reviews ({bh.reviewsCount})
              {activeTab === 'reviews' && <motion.div layoutId="tabMarkerDetail" className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary" />}
           </button>
        </div>

        {/* 3. STRUCTURED CONTENT FEED */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div 
                key="identity" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* --- SIDEBAR STYLE SUMMARY GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mini Map Widget */}
                  <div className="col-span-full space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-white/30">Location</h4>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-1 group">
                       <div className="h-28 rounded-xl overflow-hidden bg-black/40 relative">
                          <Map
                             viewport={{
                               center: [bh.location.lng, bh.location.lat],
                               zoom: 15
                             }}
                             attributionControl={false}
                             interactive={false}
                             className="w-full h-full pointer-events-none grayscale opacity-60"
                          >
                             <MapMarker longitude={bh.location.lng} latitude={bh.location.lat}>
                                <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary animate-pulse" />
                             </MapMarker>
                          </Map>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                       </div>
                       <div className="p-3">
                         <p className="text-[11px] font-bold italic leading-relaxed text-white/70">{bh.location.address}</p>
                       </div>
                    </div>
                  </div>

                  {/* Channel Access */}
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                       <Phone className="w-3.5 h-3.5 text-primary" />
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-primary/60">Contact Details</h4>
                    </div>
                    <div className="space-y-2">
                      <a href={`tel:${bh.contact.phone}`} className="block text-[11px] font-black hover:text-primary transition-colors truncate">
                         <span className="opacity-30 font-normal mr-2">PH</span> {bh.contact.phone}
                      </a>
                      <a href={`mailto:${bh.contact.email}`} className="block text-[11px] font-black hover:text-primary transition-colors truncate">
                         <span className="opacity-30 font-normal mr-2">EM</span> {bh.contact.email}
                      </a>
                    </div>
                  </div>

                  {/* Global Access (Amenities) */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-white/30">Amenities</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {bh.amenities?.slice(0, 4).map((am: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-white/5 text-[8px] font-black uppercase tracking-tight rounded-md border border-white/5">
                          {am}
                        </span>
                      ))}
                      {bh.amenities.length > 4 && <span className="text-[8px] font-black opacity-30 text-white leading-5">+{bh.amenities.length - 4} MORE</span>}
                    </div>
                  </div>
                </div>

                {/* Identity Vision (Description) */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                     <Info className="w-4 h-4 text-primary" />
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">Description</h3>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[28px] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-y-12 transition-colors group-hover:bg-primary/10" />
                     <p className="text-sm font-bold leading-relaxed text-white/80 relative z-10">{bh.description}</p>
                  </div>
                </section>

                {/* Inventory Slots (Rooms) */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                       <BedDouble className="w-4 h-4 text-primary" />
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Available Rooms</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       {bh.rooms?.map((room: any, i: number) => (
                          <div key={i} className="flex flex-col p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all group relative overflow-hidden">
                             <div className="flex items-center justify-between gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                   <span className="text-[8px] font-black text-white/20">#{i + 1}</span>
                                   <h4 className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors">{room.name}</h4>
                                </div>
                                <div className="flex gap-1.5">
                                   <span className="text-[7px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md border border-white/10">{room.gender}</span>
                                   <span className="text-[7px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/10">{room.type}</span>
                                </div>
                             </div>
                             <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-base font-black text-primary leading-none tracking-tighter">₱{room.price?.toLocaleString()}</div>
                                  <div className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">/{room.priceType || 'slot'}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[10px] font-black uppercase tracking-widest">{room.occupied || 0} <span className="opacity-30">/</span> {room.capacity}</div>
                                  <div className="text-[7px] font-bold uppercase tracking-widest opacity-20">Occupancy</div>
                                </div>
                             </div>
                             {room.amenities && room.amenities.length > 0 && (
                               <div className="flex flex-wrap gap-x-2 gap-y-1 pt-4 mt-4 border-t border-white/5">
                                 {room.amenities.map((am: string, idx: number) => (
                                   <span key={idx} className="text-[7px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                                     <div className="w-1 h-1 bg-primary/40 rounded-full" /> {am}
                                   </span>
                                 ))}
                               </div>
                             )}
                          </div>
                       ))}
                    </div>
                </section>

                {/* Regulation (Rules) */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-primary" />
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">House Rules</h3>
                    </div>
                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[28px] border-l-4 border-l-primary/40">
                       <div className="space-y-4">
                         {bh.rules.split('\n').filter((l: string) => l.trim()).map((rule: string, i: number) => (
                           <div key={i} className="flex gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                             <p className="text-xs font-medium leading-relaxed text-white/60">{rule}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                </section>
              </motion.div>
            ) : (
              <motion.div 
                key="reputation" 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                 {/* Rating High-Impact Card */}
                 <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 flex flex-col items-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <h2 className="text-6xl font-black tracking-tighter text-white mb-2">{bh.rating > 0 ? bh.rating.toFixed(1) : "N/A"}</h2>
                    <div className="flex items-center gap-1.5 text-amber-500 mb-2">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={cn("w-4 h-4", star <= Math.round(bh.rating) ? "fill-current" : "opacity-10")} />
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{bh.reviewsCount} REVIEWS</p>
                 </div>

                 {/* Write Action */}
                 {currentUser && (
                    <button 
                      onClick={() => setShowReviewForm(!showReviewForm)} 
                      className="w-full py-4 bg-white hover:bg-white/90 text-black font-black rounded-2xl transition-all shadow-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 group"
                    >
                      {showReviewForm ? <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> : <Star className="w-4 h-4 fill-black" />}
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>
                 )}

                 {showReviewForm && (
                   <form onSubmit={handleSubmitReview} className="bg-white/5 p-6 rounded-[28px] border border-white/10 space-y-6 items-center">
                     <div className="flex flex-col items-center gap-3">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Rate this property</h3>
                        <div className="flex items-center gap-2.5">
                          {[1,2,3,4,5].map(star => (
                            <button type="button" key={star} onClick={() => setNewRating(star)} className={cn("transition-all", star <= newRating ? "text-amber-500 scale-110" : "text-white/10 hover:text-white/20")}>
                              <Star className={cn("w-8 h-8", star <= newRating && "fill-current")} />
                            </button>
                          ))}
                        </div>
                     </div>
                     <textarea 
                       value={newComment} onChange={e => setNewComment(e.target.value)} 
                       placeholder="Tell us about your stay..." 
                       className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-xs font-bold leading-relaxed text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-all resize-none h-32"
                     />
                     <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary text-primary-foreground font-black rounded-xl transition-all disabled:opacity-50 text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                       {isSubmitting ? 'Submitting...' : 'Submit Review'}
                     </button>
                   </form>
                 )}

                 {/* Reviews Feed */}
                 <div className="space-y-4">
                    {bh.reviews.length === 0 ? (
                      <div className="py-20 text-center space-y-3 opacity-20 italic">
                         <MessageSquare className="w-10 h-10 mx-auto" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Feed Empty</p>
                      </div>
                    ) : (
                      bh.reviews.map((review: any) => (
                        <div 
                          key={review._id} 
                          id={`review-${review._id}`}
                          className={cn(
                            "p-6 bg-white/[0.02] border rounded-[28px] transition-all space-y-4 shadow-sm group",
                            targetReviewId === review._id 
                              ? "border-primary/50 bg-primary/[0.03] ring-1 ring-primary/20 shadow-primary/5" 
                              : "border-white/5 hover:border-white/10"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                {review.userImage ? <img src={review.userImage} className="w-full h-full object-cover" /> : <UserCircle2 className="w-5 h-5 text-white/20" />}
                              </div>
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-tight">{review.userName}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-0.5">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 text-[10px] font-black">
                              {review.rating.toFixed(1)}
                            </div>
                          </div>
                          {review.comment && <p className="text-xs font-bold leading-relaxed text-white/60">"{review.comment}"</p>}
                          {review.reply && (
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-2">
                               <div className="flex items-center gap-2 mb-2">
                                 <Check className="w-3 h-3 text-emerald-500" />
                                 <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Owner Reply</span>
                               </div>
                               <p className="text-[11px] font-medium text-white/50">{review.reply}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. PREMIUM ACTION FOOTER */}
        <div className="p-5 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl flex items-center justify-between gap-6 z-20">
           <div>
             <p className="text-[8px] uppercase tracking-[0.2em] font-black text-white/20 mb-1">Starting Price</p>
             <p className="text-2xl font-black text-white tracking-tighter leading-none">₱{bh.priceRange.min}<span className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1 opacity-50">/ mo</span></p>
           </div>
           <button 
             onClick={async () => {
                if (!currentUser) return alert("Please log in to inquire.");
                try {
                  const convId = await startConversation({ propertyId: id as Id<"properties"> });
                  navigate(`/tenant/inquiries?id=${convId}`);
                } catch (e: unknown) {
                  alert(e instanceof Error ? e.message : "Inquiry failed");
                }
             }}
             className="flex-1 h-14 bg-white hover:bg-white/90 text-black font-black rounded-[20px] transition-all text-[12px] uppercase tracking-[0.1em] shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
           >
             Inquire Now
           </button>
        </div>
      </motion.div>

      {/* 5. OVERLAY LIGHTBOX COLLECTION */}
      <AnimatePresence>
        {activeImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-20 shadow-2xl"
          >
            <button 
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer z-[120]"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full flex items-center justify-center gap-8 group">
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => prev === 0 ? bh.images.length - 1 : (prev || 0) - 1);
                }}
                className="p-5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all opacity-40 hover:opacity-100 border border-white/5"
               >
                 <ChevronLeft className="w-8 h-8" />
               </button>

               <motion.div 
                key={activeImageIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-5xl max-h-full aspect-auto rounded-[32px] overflow-hidden shadow-2xl bg-black border border-white/10"
               >
                  <img src={bh.images[activeImageIndex]} className="w-full h-full object-contain" />
               </motion.div>

               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => (prev || 0) === bh.images.length - 1 ? 0 : (prev || 0) + 1);
                }}
                className="p-5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all opacity-40 hover:opacity-100 border border-white/5"
               >
                 <ChevronRight className="w-8 h-8" />
               </button>
            </div>
            <div className="absolute bottom-10 flex items-center gap-3">
               {bh.images.map((_ : any, idx: number) => (
                 <div key={idx} className={cn("h-1.5 rounded-full transition-all duration-500", idx === activeImageIndex ? "w-12 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "w-1.5 bg-white/10")} />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
