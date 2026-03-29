import React, { useState } from 'react';
import { Star, MapPin, ArrowRight, Sparkles, TrendingUp, Map, Bookmark, MessageSquare, Search, Inbox, PenLine, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inquiries' | 'reviews'>('inquiries');

  // Fetch real data
  const properties = useQuery(api.properties.listPublic);
  const inquiries = useQuery(api.inquiries.getUserConversations);
  const bookmarks = useQuery(api.bookmarks.getUserBookmarks);
  const reviews = useQuery(api.reviews.getUserReviews);

  const isLoading = properties === undefined || inquiries === undefined || bookmarks === undefined || reviews === undefined;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tenant/map?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/tenant/map');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Derived state
  const featured = properties && properties.length > 0 ? properties[0] : null;
  const topRated = properties ? properties.slice(0, 4) : [];
  
  const unreadInquiriesCount = inquiries 
    ? inquiries.filter((inq): inq is NonNullable<typeof inq> => inq !== null).reduce((acc, inq) => acc + (inq.unreadCount > 0 ? 1 : 0), 0)
    : 0;

  const stats = [
    { label: 'Bookmarks', value: bookmarks?.length || 0, icon: Bookmark, path: '/tenant/bookmarks' },
    { label: 'Inquiries', value: unreadInquiriesCount, icon: Inbox, path: '/tenant/inquiries' },
    { label: 'My Reviews', value: reviews?.length || 0, icon: PenLine, path: '#' },
  ];

  // Helper to get min price from property rooms
  const getMinPrice = (property: any) => {
    if (!property.rooms || property.rooms.length === 0) return 0;
    return Math.min(...property.rooms.map((r: any) => r.price));
  };

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-end justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Home Hub</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-[13px] text-muted-foreground">You have {unreadInquiriesCount} unread replies in your inbox.</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0">
            {stats.map(s => (
              <button 
                key={s.label} 
                onClick={() => s.path !== '#' && navigate(s.path)}
                className="flex items-center gap-3 bg-card border border-border hover:border-primary/30 rounded-xl px-5 py-3 transition-all hover:shadow-sm group flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <s.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold leading-none tabular-nums">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{s.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Global Search Tool */}
        <div className="relative">
          <form onSubmit={handleSearch} className="relative z-10">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); }}
              placeholder="Search by name, address, or nearby landmarks..."
              className="w-full h-14 pl-14 pr-32 bg-card border border-border hover:border-primary/40 focus:border-primary rounded-2xl text-[15px] transition-all outline-none shadow-sm focus:shadow-xl"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground h-10 px-6 rounded-xl text-[13px] font-bold hover:bg-primary/90 transition-colors">
              Find Stays
            </button>
          </form>
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
        </div>

        {/* Main Grid: Featured + Inbox/Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Featured Highlight (Left Col) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Featured Stay
              </h2>
              <Link to="/tenant/map" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                Explore Full Map <Map className="w-3 h-3" />
              </Link>
            </div>
            
            {featured ? (
              <motion.div 
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/tenant/map/roomet/${featured._id}`)}
                className="relative rounded-[2rem] overflow-hidden h-[340px] cursor-pointer group border border-border shadow-lg"
              >
                <img src={featured.imageUrls?.[0] ?? ''} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 bg-muted" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                    Verified
                  </span>
                  <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                    Top Recommended
                  </span>
                </div>

                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-3xl font-extrabold text-white mb-2">{featured.name}</h3>
                  <p className="text-white/70 text-[14px] flex items-center gap-1.5 mb-5 truncate">
                    <MapPin className="w-4 h-4 shrink-0" /> {featured.location?.address}
                  </p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">Starts At</p>
                      <p className="text-2xl font-black text-white tabular-nums">₱{getMinPrice(featured)}</p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div>
                      <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">Rating</p>
                      <p className="text-2xl font-black text-amber-400 flex items-center gap-1.5 tabular-nums">
                        <Star className="w-5 h-5 fill-current" /> {featured.rating || 'N/A'}
                      </p>
                    </div>
                    <button className="ml-auto w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all transform group-hover:rotate-[-45deg]">
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-[2rem] border border-border/50 bg-card/50 flex flex-col items-center justify-center h-[340px] text-muted-foreground p-8 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                  <MapPin className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <p className="text-[13px] font-medium max-w-xs">No properties available to feature right now. Browse the map to find your next home.</p>
                <button onClick={() => navigate('/tenant/map')} className="text-[12px] font-bold text-primary hover:underline">Go to Map</button>
              </div>
            )}
          </div>

          {/* Activity Center (Right Col) */}
          <div className="lg:col-span-5 flex flex-col bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
            <div className="flex border-b border-border bg-muted/30">
              <button 
                onClick={() => { setActiveTab('inquiries'); }}
                className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest relative transition-colors ${activeTab === 'inquiries' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Inquiries
                {activeTab === 'inquiries' && <motion.div layoutId="dashTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button 
                onClick={() => { setActiveTab('reviews'); }}
                className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest relative transition-colors ${activeTab === 'reviews' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                My Reviews
                {activeTab === 'reviews' && <motion.div layoutId="dashTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <AnimatePresence mode="wait">
                {activeTab === 'inquiries' ? (
                  <motion.div key="inq" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-1">
                    {inquiries && inquiries.length > 0 ? inquiries.filter((inq): inq is NonNullable<typeof inq> => inq !== null).slice(0, 4).map(inq => (
                      <div key={inq.id} onClick={() => navigate('/tenant/inquiries')} className="p-4 rounded-2xl hover:bg-muted/50 cursor-pointer transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[13px] font-bold group-hover:text-primary transition-colors truncate pr-2">{inq.property.name}</p>
                          <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                            {new Date(inq.lastMessageTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className={`text-[12px] truncate ${inq.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                          {inq.unreadCount > 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2" />}
                          {inq.lastMessageText || 'Sent an attachment'}
                        </p>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3 mt-4">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                        <p className="text-[12px]">No recent inquiries found.</p>
                      </div>
                    )}
                    {inquiries && inquiries.length > 0 && (
                      <button onClick={() => navigate('/tenant/inquiries')} className="w-full py-4 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors">
                        View all conversations
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="rev" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3 p-2">
                    {reviews && reviews.length > 0 ? reviews.slice(0, 3).map((rev: any) => (
                      <div key={rev._id} className="p-4 rounded-2xl border border-border/50 bg-background/50 space-y-2 relative overflow-hidden">
                        <div className="flex justify-between items-start z-10 relative">
                          <p className="text-[12px] font-bold pr-4 truncate">{rev.propertyName}</p>
                          <div className="flex gap-0.5 text-amber-500 shrink-0">
                            {Array.from({length: rev.rating}).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                          </div>
                        </div>
                        <p className="text-[12px] text-muted-foreground line-clamp-2 z-10 relative">"{rev.comment}"</p>
                        <p className="text-[10px] text-muted-foreground/60 z-10 relative">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3 mt-4">
                        <Star className="w-8 h-8 opacity-20" />
                        <p className="text-[12px]">You haven't left any reviews yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Bottom Section: Top Rated & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Rated List */}
          <div className="lg:col-span-2 bg-card border border-border rounded-[2rem] overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Top Trending Listings
              </h3>
              <button onClick={() => navigate('/tenant/map')} className="text-[11px] font-bold text-muted-foreground hover:text-foreground">Browse all</button>
            </div>
            {topRated && topRated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topRated.map((bh: any) => (
                  <div 
                    key={bh._id} 
                    onClick={() => navigate(`/tenant/map/roomet/${bh._id}`)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-muted">
                      <img src={bh.imageUrls?.[0] ?? ''} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="min-w-0 flex-1 py-1">
                      <p className="text-[13px] font-bold truncate">{bh.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] font-bold text-primary tabular-nums">₱{getMinPrice(bh)}</p>
                        <div className="flex items-center gap-1 text-[11px] font-black text-amber-500">
                          <Star className="w-3 h-3 fill-current" /> {bh.rating || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="py-10 text-center text-muted-foreground text-[13px]">
                 No trending properties found at the moment.
               </div>
            )}
          </div>

          {/* Market Insights */}
          <div className="bg-primary text-primary-foreground rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10 h-full flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-2">Finding a room?</h3>
              <p className="text-[13px] text-primary-foreground/70 leading-relaxed mb-6">Current market trends show a 15% increase in availability near the university belt.</p>
              <button 
                onClick={() => navigate('/tenant/map')}
                className="bg-white text-black px-6 py-3 rounded-xl text-[13px] font-bold hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2 group w-full xs:w-auto mt-auto"
              >
                Explore Map <Map className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            {/* Abstract Background Design */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>

        </div>

      </div>
    </div>
  );
}
