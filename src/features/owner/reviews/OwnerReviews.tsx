import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Star, MessageSquare, AlertTriangle, CheckCircle, Search, MessageCircle, StarHalf } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';

export function OwnerReviews() {
  const [searchParams] = useSearchParams();
  const targetReviewId = searchParams.get('reviewId');

  const reviewsData = useQuery(api.reviews.getOwnerReviews);
  const replyMutation = useMutation(api.reviews.replyToReview);
  const reportMutation = useMutation(api.reviews.reportReview);

  const reviews = useMemo(() => {
    const mapped = (reviewsData || []).map((r: any) => ({
      id: r._id as string,
      property: r.propertyName,
      tenant: r.userName,
      avatar: r.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=random`,
      rating: r.rating,
      date: new Date(r._creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      comment: r.comment || '',
      reply: r.reply,
      status: r.status,
    }));

    if (targetReviewId) {
      const targetList = mapped.filter((r: any) => r.id === targetReviewId);
      const otherList = mapped.filter((r: any) => r.id !== targetReviewId);
      if (targetList.length > 0) return [...targetList, ...otherList];
    }
    return mapped;
  }, [reviewsData, targetReviewId]);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.property.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'All') return true;
    if (filter === 'Needs Reply') return !r.reply && r.status === 'Published';
    if (filter === 'Reported') return r.status === 'Reported';
    return true;
  });

  const handleReplySubmit = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await replyMutation({ reviewId: id as Id<"reviews">, reply: replyText });
      setReplyingTo(null);
      setReplyText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await reportMutation({ reviewId: id as Id<"reviews"> });
    } catch (e) {
      console.error(e);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const needsReplyCount = reviews.filter(r => !r.reply && r.status === 'Published').length;

  return (
    <div className="h-full px-6 py-6 lg:px-10 max-w-[1600px] mx-auto flex flex-col">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6 shrink-0"
      >
        <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-1">
          Reviews & Feedback
        </h1>
        <p className="text-[13px] text-muted-foreground font-medium">
          Manage your reputation across all your properties.
        </p>
      </motion.div>

      {/* Main Layout Grid */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* Left Col: Filters & Stats */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
          
          {/* Stats Card */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-primary text-primary-foreground rounded-[24px] p-6 shadow-md shadow-primary/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary-foreground/70 mb-4">Overall Score</h2>
            <div className="flex items-end gap-3 mb-2 relative z-10">
              <span className="text-6xl font-black leading-none tracking-tighter">{avgRating}</span>
              <div className="pb-1.5 flex gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <StarHalf className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <p className="text-[13px] font-medium text-primary-foreground/80 relative z-10">
              Based on {reviews.length} total reviews
            </p>
          </motion.div>

          {/* Controls Card */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-[24px] border border-border/50 p-6 shadow-sm flex-1 lg:flex-none flex flex-col"
          >
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search reviews..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); }}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted/30 border border-transparent focus:border-border/50 focus:bg-background outline-none transition-all text-sm font-medium" 
              />
            </div>

            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Filters</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'All', id: 'All', icon: Star },
                { label: 'Needs Reply', id: 'Needs Reply', badge: needsReplyCount, icon: MessageCircle },
                { label: 'Reported', id: 'Reported', icon: AlertTriangle }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setFilter(f.id); }}
                  className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
                    filter === f.id 
                    ? 'bg-muted shadow-sm border border-border/50 text-foreground' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <f.icon className="w-4 h-4" />
                    {f.label}
                  </div>
                  {f.badge !== undefined && f.badge > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full">
                      {f.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Right Col: Reviews List */}
        <div className="flex-1 bg-card rounded-[24px] border border-border/50 shadow-sm flex flex-col overflow-hidden relative">
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review, _index) => {
                const isTarget = review.id === targetReviewId;
                return (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 last:mb-0 bg-background rounded-2xl p-5 transition-colors group relative overflow-hidden border ${isTarget ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-500 hover:border-amber-500/60 z-10' : 'border-border/50 hover:border-border'}`}
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    
                    {/* Sidebar info */}
                    <div className="sm:w-48 shrink-0 flex flex-row sm:flex-col gap-3 sm:gap-4 items-center sm:items-start border-b sm:border-b-0 sm:border-r border-border/50 pb-4 sm:pb-0 sm:pr-4">
                      <div className="flex items-center gap-3 w-full">
                        <img src={review.avatar} alt={review.tenant} className="w-10 h-10 rounded-full object-cover ring-2 ring-background shadow-xs shrink-0" />
                        <div className="min-w-0">
                          <h3 className="font-bold text-[13px] leading-tight truncate">{review.tenant}</h3>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted/30 text-muted/30'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Property</p>
                        <p className="text-xs font-bold text-primary truncate max-w-full" title={review.property}>{review.property}</p>
                        <p className="text-[10px] font-semibold text-muted-foreground mt-2">{review.date}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        {/* Mobile property info */}
                        <div className="sm:hidden block">
                           <p className="text-[11px] font-bold text-primary truncate">{review.property}</p>
                           <p className="text-[10px] font-semibold text-muted-foreground">{review.date}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2 sm:mb-0 ml-auto sm:ml-0">
                          {review.status === 'Reported' && (
                            <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Under Review
                            </span>
                          )}
                          {review.status !== 'Reported' && (
                            <button 
                              onClick={(e) => handleReport(review.id, e)}
                              className="text-[10px] font-bold text-muted-foreground hover:text-rose-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/40 hover:bg-rose-500/10 px-2 py-1 rounded-md"
                            >
                              Report
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-foreground/90 leading-relaxed mb-4 font-medium">"{review.comment}"</p>

                      {/* Reply Area */}
                      {review.reply ? (
                        <div className="mt-auto bg-muted/30 rounded-xl p-4 border border-border/50 relative">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Your Response</span>
                          </div>
                          <p className="text-[13px] font-medium leading-relaxed text-foreground/80">{review.reply}</p>
                        </div>
                      ) : (
                        <div className="mt-auto">
                          {replyingTo === review.id ? (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-card p-2 rounded-xl border border-border/50 shadow-sm flex flex-col items-end gap-2"
                            >
                              <textarea 
                                value={replyText}
                                onChange={e => { setReplyText(e.target.value); }}
                                placeholder="Write your public response..."
                                className="w-full h-20 bg-transparent outline-none resize-none p-2 text-[13px] placeholder:text-muted-foreground/60"
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                  className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleReplySubmit(review.id)}
                                  className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                                  disabled={!replyText.trim()}
                                >
                                  Publish Reply
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <button 
                              onClick={() => { setReplyingTo(review.id); }}
                              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg w-fit"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Write Reply
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredReviews.length === 0 && (
              <div className="py-20 h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-1">No reviews found</h3>
                <p className="text-muted-foreground text-[13px] font-medium max-w-sm">We couldn't find any reviews matching your current filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
