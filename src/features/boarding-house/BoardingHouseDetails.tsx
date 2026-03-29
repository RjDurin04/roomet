import { useState, useMemo, type FormEvent } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { X, Check, UserCircle2, Heart, AlertCircle, Star, Map, Users, Loader2, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

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
  const [isLightboxOpen, setIsLightboxOpen] = useState<{open: boolean, img: string}>({open: false, img: ''});

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
  
  // Review Form States (Mock for now as we don't have review mutations yet)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (bhData === undefined) {
    return (
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        className="absolute top-0 right-0 bottom-0 w-[420px] bg-[#0a0a0a] border-l border-white/5 shadow-2xl flex items-center justify-center z-40 rounded-l-[1.5rem]"
      >
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </motion.div>
    );
  }

  if (bhData === null) {
    return (
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        className="absolute top-0 right-0 bottom-0 w-[420px] bg-[#0a0a0a] text-white border-l border-white/5 shadow-2xl flex flex-col items-center justify-center z-40 rounded-l-[1.5rem] p-8 text-center"
      >
        <AlertCircle className="w-12 h-12 text-rose-500/80 mb-4" />
        <h3 className="text-xl font-bold">Property Not Found</h3>
        <p className="text-white/50 mt-2 text-sm">The listing you're looking for might have been removed or is no longer available.</p>
        <button onClick={() => navigate('/tenant/map')} className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 transition-colors text-white rounded-xl font-bold text-sm">Back to Map</button>
      </motion.div>
    );
  }

  // Map Convex data to UI expectations
  const bh = {
    ...bhData,
    id: bhData._id,
    images: bhData.imageUrls,
    available: bhData.rooms.some(r => (r.occupied ?? 0) < r.capacity),
    rating: stats?.rating || 0,
    reviewsCount: stats?.count || 0,
    distance: 1.2, // Mock relative distance
    houseRules: bhData.rules.split('\n').filter(r => r.trim()),
    reviews: sortedReviews || [],
    owner: {
      name: 'Property Owner', // We'd need to fetch owner details separately if needed
    },
    priceRange: {
      min: Math.min(...(bhData.rooms.length > 0 ? bhData.rooms.map(r => r.price) : [0])),
      max: Math.max(...(bhData.rooms.length > 0 ? bhData.rooms.map(r => r.price) : [0]))
    }
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to leave a review.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createReview({
        propertyId: id as Id<"properties">,
        rating: newRating,
        comment: newComment || undefined,
      });
      setShowReviewForm(false);
      setNewComment('');
      setNewRating(5);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute top-0 right-0 bottom-0 w-[420px] bg-[#0a0a0a] text-white border-l border-white/10 shadow-2xl flex flex-col z-40 rounded-l-[1.5rem] overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center justify-between px-4">
          <button 
            onClick={() => navigate('/tenant/map')}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
             <button 
               onClick={async () => {
                 if (!currentUser) { alert("Please log in to bookmark this property."); return; }
                 await toggleBookmark({ propertyId: id as Id<"properties"> });
               }} 
               className={`w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 transition-colors ${isBookmarked ? 'text-rose-500' : 'text-white/90'}`}
             >
                <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
             </button>
          </div>
        </div>

        {/* Hero Gallery */}
        <div className="w-full h-[240px] flex-shrink-0 relative flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {bh.images.map((img, i) => (
            <div key={i} className="w-full h-full flex-shrink-0 snap-start cursor-pointer" onClick={() => { setIsLightboxOpen({open: true, img: img || ''}); }}>
               <img src={img || ''} alt={`${bh.name} ${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur py-1 px-2 rounded-md text-[10px] text-white font-bold tracking-widest uppercase shadow-sm">
             1 / {bh.images.length || 0}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-[#0a0a0a] sticky top-0 z-20">
           <button onClick={() => { setActiveTab('info'); }} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest relative transition-colors ${activeTab==='info' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
              Overview
              {activeTab === 'info' && <motion.div layoutId="tabMarker" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
           </button>
           <button onClick={() => { setActiveTab('reviews'); }} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest relative transition-colors ${activeTab==='reviews' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
              Reviews ({bh.reviewsCount})
              {activeTab === 'reviews' && <motion.div layoutId="tabMarker" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div 
                key="info" 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }} 
                className="space-y-4"
              >
                
                {/* Header Info */}
                <motion.div variants={itemVariants} className="mb-2">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h1 className="text-2xl font-black tracking-tight text-white leading-tight">{bh.name}</h1>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shrink-0 ${bh.available ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                       {bh.available ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                     <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                       <Star className="w-3.5 h-3.5 fill-current" /> {bh.rating}
                     </div>
                  </div>
                  
                  <div className="bg-[#141414] p-3 rounded-2xl flex items-center gap-3 border border-white/5 text-white/70 hover:text-white cursor-pointer transition-colors shadow-inner">
                     <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5"><Map className="w-4 h-4 text-white/50" /></div>
                     <p className="text-xs font-medium leading-relaxed">{bh.location.address}</p>
                  </div>
                </motion.div>

                {/* Contact Information */}
                {bh.contact && (bh.contact.phone || bh.contact.email) && (
                  <motion.div variants={itemVariants} className="bg-[#141414] p-5 rounded-3xl border border-white/5 shadow-inner">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">Contact Info</h3>
                    <div className="space-y-3">
                      {bh.contact.phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 text-white/50">
                            <Phone className="w-4 h-4" />
                          </div>
                          <a href={`tel:${bh.contact.phone}`} className="text-[13px] font-medium text-white/90 hover:text-white hover:underline transition-colors">{bh.contact.phone}</a>
                        </div>
                      )}
                      {bh.contact.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 text-white/50">
                            <Mail className="w-4 h-4" />
                          </div>
                          <a href={`mailto:${bh.contact.email}`} className="text-[13px] font-medium text-white/90 truncate hover:text-white hover:underline transition-colors">{bh.contact.email}</a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* About & Rules */}
                <motion.div variants={itemVariants} className="bg-[#141414] p-5 rounded-3xl border border-white/5 shadow-inner">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">Description</h3>
                  <p className="text-[13px] font-medium leading-relaxed text-white/90 mb-5">{bh.description}</p>
                  
                  {bh.houseRules.length > 0 && (
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                       <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/40 mb-3 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Policies</p>
                       <ul className="text-xs text-white/70 space-y-2 list-disc pl-4 font-medium">
                         {bh.houseRules.map((rule,i) => <li key={i}>{rule}</li>)}
                       </ul>
                    </div>
                  )}
                </motion.div>

                {/* Amenities */}
                {bh.amenities.length > 0 && (
                  <motion.div variants={itemVariants} className="bg-[#141414] p-5 rounded-3xl border border-white/5 shadow-inner">
                     <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">Amenities</h3>
                     <div className="flex flex-wrap gap-2">
                       {bh.amenities.map(amenity => (
                         <span key={amenity} className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-bold text-white/70 border border-white/10 drop-shadow-sm">
                           {amenity}
                         </span>
                       ))}
                     </div>
                  </motion.div>
                )}

                {/* Units */}
                <motion.div variants={itemVariants} className="bg-[#141414] p-5 rounded-3xl border border-white/5 shadow-inner">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">Available Units ({bh.rooms?.length || 0})</h3>
                  <div className="space-y-2.5">
                    {bh.rooms.map((room, i) => (
                      <div key={room.id || i} className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-4 space-y-3 relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/10 group-hover:bg-white/30 transition-colors" />
                        <div className="flex justify-between items-center">
                          <div className="flex-1 flex flex-col justify-center">
                             {room.name && (
                               <div className="mb-2">
                                 <span className="text-sm font-bold text-white leading-none tracking-tight">{room.name}</span>
                               </div>
                             )}
                             <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                               <span className="text-[9px] font-black uppercase tracking-widest text-[#cfcfcf] bg-white/5 px-2 py-0.5 rounded border border-white/10">{room.type}</span>
                               <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1 ${
                                 room.gender === 'male' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                 room.gender === 'female' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                                 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                               }`}>
                                 {room.gender}
                               </span>
                             </div>
                             <p className="text-[11px] text-white/50 font-medium flex-wrap flex items-center gap-1.5 leading-relaxed">
                               <Users className="w-3 h-3 opacity-60" /> {room.occupied || 0} / {room.capacity} occupied
                               {room.amenities?.length > 0 && <span className="opacity-40 mx-0.5">•</span>}
                               {room.amenities?.join(' • ')}
                             </p>
                          </div>
                          <div className="text-right shrink-0 flex flex-col justify-center ml-2">
                            <p className="text-[15px] font-black text-white">₱{room.price?.toLocaleString() || 0}</p>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mt-0.5">
                              / {room.priceType === 'person' ? 'Head' : 'Unit'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!bh.rooms || bh.rooms.length === 0) && (
                      <p className="text-xs text-white/40 font-medium py-4 text-center border border-dashed border-white/5 rounded-xl">No units available</p>
                    )}
                  </div>
                </motion.div>
                
              </motion.div>
            ) : (
              <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                 {/* Rating Summary */}
                 <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center py-8 shadow-inner">
                   <h2 className="text-5xl font-black text-white mb-2">{bh.rating.toFixed(1)}</h2>
                   <div className="flex items-center gap-1 text-amber-400 mb-2">
                     {[1,2,3,4,5].map(star => (
                       <Star key={star} className={`w-5 h-5 ${star <= Math.round(bh.rating) ? 'fill-current' : 'text-white/10'}`} />
                     ))}
                   </div>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{bh.reviewsCount} Reviews</p>
                 </div>

                 {/* Write a review button (only if not already reviewed) */}
                 {currentUser && !bh.reviews.some(r => r.userName === (currentUser.name || "Anonymous User")) && !showReviewForm && (
                   <button onClick={() => { setShowReviewForm(true); }} className="w-full py-3.5 bg-white hover:bg-white/90 text-black font-black rounded-xl transition-all shadow-[-0_0_20px_rgba(255,255,255,0.1)] text-sm tracking-wide">
                     Write a Review
                   </button>
                 )}

                 {/* Review Form */}
                 {showReviewForm && (
                   <form onSubmit={handleSubmitReview} className="bg-[#141414] p-5 rounded-3xl border border-white/10 space-y-4 shadow-inner">
                     <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-widest">Your Rating</h3>
                     <div className="flex items-center gap-2 mb-4">
                       {[1,2,3,4,5].map(star => (
                         <button type="button" key={star} onClick={() => { setNewRating(star); }} className={`transition-colors focus:outline-none ${star <= newRating ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-white/20 hover:text-white/40'}`}>
                           <Star className="w-8 h-8 fill-current" />
                         </button>
                       ))}
                     </div>
                     <textarea 
                       value={newComment} onChange={e => { setNewComment(e.target.value); }} 
                       placeholder="Share your experience (optional)" 
                       className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-xs font-medium leading-relaxed text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none h-24"
                     />
                     <div className="flex gap-3">
                       <button type="button" onClick={() => { setShowReviewForm(false); }} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-bold rounded-xl transition-colors text-sm">Cancel</button>
                       <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-white hover:bg-white/90 text-black font-black rounded-xl transition-all shadow-[-0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 text-sm">
                         {isSubmitting ? 'Posting...' : 'Post Review'}
                       </button>
                     </div>
                   </form>
                 )}

                 {/* Reviews List */}
                 <div className="space-y-4 pt-2">
                   {bh.reviews.length === 0 ? (
                     <p className="text-xs text-white/40 text-center py-8 font-medium border border-dashed border-white/5 rounded-2xl">No reviews available for this property yet.</p>
                   ) : (
                     bh.reviews.map((review) => {
                       const isTarget = review._id === targetReviewId;
                       return (
                       <div key={review._id} className={`p-5 rounded-2xl space-y-4 transition-colors shadow-inner overflow-hidden ${isTarget ? 'bg-[#181818] border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)] relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-500 hover:border-amber-500/60' : 'bg-[#141414] border border-white/5 hover:border-white/10'}`}>
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             {review.userImage ? (
                               <img src={review.userImage} className="w-9 h-9 rounded-full bg-white/10 object-cover border border-white/10" />
                             ) : (
                               <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                 <UserCircle2 className="w-5 h-5 text-white/50" />
                               </div>
                             )}
                             <div>
                               <p className="text-xs font-bold text-white/90">{review.userName}</p>
                               <p className="text-[10px] text-white/40 mt-0.5 font-medium tracking-wide">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-0.5 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 shadow-inner">
                             <Star className="w-3.5 h-3.5 fill-current" />
                             <span className="text-[11px] font-black">{review.rating}</span>
                           </div>
                         </div>
                         {review.comment && (
                           <p className="text-[13px] text-white/80 leading-relaxed font-medium">{review.comment}</p>
                         )}
                         {review.reply && (
                           <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-3 relative">
                             <div className="flex items-center gap-1.5 mb-2">
                               <Check className="w-3.5 h-3.5 text-emerald-400" />
                               <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Owner Response</span>
                             </div>
                             <p className="text-xs text-white/70 leading-relaxed font-medium">{review.reply}</p>
                           </div>
                         )}
                       </div>
                     );
                   })
                   )}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-between gap-4 z-20">
           <div>
             <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-white/40 mb-0.5">Starting at</p>
             <p className="text-xl font-black text-white">₱{bh.priceRange.min}<span className="text-[10px] font-bold text-white/30 tracking-[0.1em] uppercase ml-1">/ mo</span></p>
           </div>
           <button 
             onClick={async () => {
                if (!currentUser) { alert("Please log in to inquire."); return; }
                if (String((currentUser as any).role) === 'owner' && String(bh.ownerId) === String(currentUser._id)) {
                   alert("You cannot inquire about your own property."); return;
                }
                try {
                  const convId = await startConversation({ propertyId: id as Id<"properties"> });
                  navigate(`/tenant/inquiries?id=${convId}`);
                } catch (e: unknown) {
                  alert(e instanceof Error ? e.message : "Failed to start conversation");
                }
             }}
             className="flex-1 h-12 bg-white hover:bg-white/90 text-black font-black rounded-xl border border-white/20 shadow-[-0_0_30px_rgba(255,255,255,0.15)] transition-all text-[13px] tracking-wide"
           >
             Inquire Now
           </button>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
         {isLightboxOpen.open && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setIsLightboxOpen({open: false, img: ''}); }}>
             <button className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white border border-white/10 transition-colors"><X className="w-5 h-5"/></button>
             <img src={isLightboxOpen.img} className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
           </motion.div>
         )}
      </AnimatePresence>
    </>
  );
}
