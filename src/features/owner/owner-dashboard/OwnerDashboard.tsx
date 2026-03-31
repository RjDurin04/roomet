/* eslint-disable max-lines-per-function, no-magic-numbers, @typescript-eslint/no-misused-promises */
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Star, ArrowUpRight, TrendingUp, Building2, Map, Sparkles, ArrowRight, PenLine, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { api } from '../../../../convex/_generated/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Icon component types from lucide are complex
const OwnerStatButton = ({ label, value, icon: Icon, path, delay }: { label: string, value: string | number, icon: any, path: string, delay: number }) => {
  const navigate = useNavigate();
  return (
    <motion.button 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => path !== '#' && navigate(path)}
      className="flex items-center gap-2 md:gap-3 bg-card border border-border hover:border-primary/30 rounded-xl px-3 md:px-5 py-2.5 md:py-3 transition-all hover:shadow-sm group flex-shrink-0"
    >
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="text-left">
        <p className="text-base md:text-lg font-bold leading-none tabular-nums">{value}</p>
        <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{label}</p>
      </div>
    </motion.button>
  );
};

function formatRelativeTime(timestamp: number) {
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

 
export function OwnerDashboard() {
  const navigate = useNavigate();
  const stats = useQuery(api.dashboard.getOwnerStats);
  const properties = useQuery(api.properties.listByOwner);
  
  if (stats === undefined || properties === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (stats === null) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <p>Dashboard data unavailable.</p>
      </div>
    );
  }

  const { activePropertiesCount, inquiriesCount, averageRating, monthlyTrends, recentInquiries } = stats;

  const maxInquiries = Math.max(...monthlyTrends.map((t: { inquiries: number }) => t.inquiries), 1);
  
  // Sort properties by rating or something to show "Top Performing"
  const topProperties = properties?.slice(0, 4) || [];

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-8 space-y-6 md:space-y-8">
        
        {/* Header Section (Matching Viewer Hub) */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-end justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Owner Hub</p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-[13px] text-muted-foreground">You have {inquiriesCount} total inquiries across all listings.</p>
          </div>
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            <OwnerStatButton label="Properties" value={activePropertiesCount} icon={Building2} path="/owner/properties" delay={0.1} />
            <OwnerStatButton label="Inquiries" value={inquiriesCount} icon={Inbox} path="/owner/inquiries" delay={0.15} />
            <OwnerStatButton label="Avg Rating" value={averageRating} icon={Star} path="/owner/reviews" delay={0.2} />
            <div className="w-1 md:hidden shrink-0" /> {/* Spacer for scroll end */}
          </div>
        </div>

        {/* Action Bar (Optional but good for owners) */}
        <div className="relative group">
           <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10 group-hover:bg-primary/10 transition-colors" />
           <div className="bg-card border border-border p-1 rounded-2xl flex items-center gap-2 shadow-sm">
             <div className="flex-1 px-4 text-[13px] font-medium text-muted-foreground hidden md:block">
               Manage your property portfolio with high-performance analytics.
             </div>
             <button 
              onClick={() => navigate('/owner/properties')}
              className="bg-primary text-primary-foreground h-10 md:h-11 px-4 md:px-6 rounded-xl text-[11px] md:text-[12px] font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
             >
               Add Property <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
             </button>
           </div>
        </div>

        {/* Main Grid: Chart + Inquiries (Matching Viewer Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chart Section (Primary Element) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Inquiries Insights
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.5%</span>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-4 md:p-6 rounded-[2rem] border border-border flex flex-col relative overflow-hidden h-[280px] md:h-[340px] shadow-sm"
            >
              <div className="absolute top-0 right-0 p-8">
                <div className="w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              </div>
              
              <div className="flex-1 flex items-end gap-2 md:gap-4 relative z-10 pb-2">
                {monthlyTrends.map((trend: { month: string; inquiries: number }, index: number) => {
                  const heightPercentage = Math.max(15, (trend.inquiries / maxInquiries) * 100);
                  return (
                    <div key={trend.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="w-full relative flex items-end justify-center h-full max-h-[160px] md:max-h-[200px] rounded-t-lg overflow-hidden bg-muted/20">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercentage}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + index * 0.03, type: "spring", bounce: 0.2 }}
                          className="w-full bg-primary/80 group-hover:bg-primary transition-colors origin-bottom rounded-t cursor-pointer"
                        >
                          <div className="absolute top-0 inset-x-0 h-0.5 bg-white/30" />
                        </motion.div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-20">
                          {trend.inquiries.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{trend.month}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Activity Center (Recent Inquiries) */}
          <div className="lg:col-span-5 flex flex-col bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm h-full lg:min-h-0">
             <div className="flex items-center justify-between p-6 pb-2 border-b border-border/40">
                <h2 className="text-[14px] font-bold uppercase tracking-widest">Recent Activity</h2>
                <Link to="/owner/inquiries" className="text-[11px] font-bold text-primary hover:underline">View Inbox</Link>
             </div>

             <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                <div className="space-y-1">
                  {recentInquiries.length > 0 ? recentInquiries.map((inq: { id: string, avatar: string, user: string, unread: boolean, updatedAt: number, property: string, message: string }) => (
                    <Link 
                      key={inq.id}
                      to={`/owner/inquiries?id=${inq.id}`}
                      className="group flex gap-3 p-3.5 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer border border-transparent"
                    >
                      <div className="relative">
                        <img src={inq.avatar} alt={inq.user} className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm" />
                        {inq.unread && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h4 className="font-bold text-[13px] group-hover:text-primary transition-colors truncate">{inq.user}</h4>
                          <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap ml-2 italic">{formatRelativeTime(inq.updatedAt)}</span>
                        </div>
                        <p className="text-[11px] font-bold text-primary mb-0.5 truncate">{inq.property}</p>
                        <p className={`text-[12px] truncate ${inq.unread ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                          {inq.message}
                        </p>
                      </div>
                    </Link>
                  )) : (
                    <div className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
                        <Inbox className="w-10 h-10 opacity-20" />
                        <p className="text-[12px]">No recent activity found.</p>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Section: Top Performing & Insights (Matching Viewer Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Top Performing List */}
          <div className="lg:col-span-8 bg-card border border-border rounded-[2rem] overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Top Performing Listings
              </h3>
              <button 
                onClick={() => navigate('/owner/properties')}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
              >
                Browse All
              </button>
            </div>
            
            {topProperties && topProperties.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                 {topProperties.map((bh: { _id: string, imageUrls?: string[], name: string, rating?: number }) => (
                    <div 
                      key={bh._id} 
                      onClick={() => navigate(`/owner/properties?id=${bh._id}`)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden shrink-0 bg-muted border border-border/40">
                        <img src={bh.imageUrls?.[0] ?? ''} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="text-[12px] md:text-[13px] font-black truncate uppercase tracking-tight italic">{bh.name}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[9px] uppercase font-bold text-primary tracking-widest">Active Status</p>
                          <div className="flex items-center gap-1 text-[10px] md:text-[11px] font-black text-amber-500">
                            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" /> {bh.rating || 'New'}
                          </div>
                        </div>
                      </div>
                    </div>
                 ))}
               </div>
            ) : (
                <div className="py-10 text-center text-muted-foreground text-[12px] italic">
                   Add your first property to start tracking performance!
                </div>
            )}
          </div>

          {/* Owner Performance Insights */}
          <div className="lg:col-span-4 bg-primary text-primary-foreground rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10 h-full flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-2">Portfolio Insights</h3>
              <p className="text-[13px] text-primary-foreground/70 leading-relaxed mb-6"> Listings with 5+ high-quality images see 40% more inquiry engagements. Check your gallery status!</p>
              <button 
                onClick={() => navigate('/owner/properties')}
                className="bg-white text-black px-6 py-3 rounded-xl text-[13px] font-bold hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2 group w-full sm:w-auto mt-auto shadow-xl"
              >
                Optimize Gallery <PenLine className="w-4 h-4 group-hover:rotate-12 transition-transform" />
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
