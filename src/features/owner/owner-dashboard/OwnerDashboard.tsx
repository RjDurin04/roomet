import { useQuery } from 'convex/react';
import { Star, Building2, ArrowRight, PenLine, Loader2, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../../../convex/_generated/api';

import { InquiryChart } from './components/InquiryChart';
import { OwnerStatButton } from './components/OwnerStatButton';
import { RecentActivity } from './components/RecentActivity';
import { TopPerformingProperties } from './components/TopPerformingProperties';

import { STATS_DELAY_BASE, STATS_DELAY_STEP } from '@/lib/constants';

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
  const topProperties = properties?.slice(0, 4) ?? [];

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-8 space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-end justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Owner Hub</p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-[13px] text-muted-foreground">You have {inquiriesCount} total inquiries across all listings.</p>
          </div>
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            <OwnerStatButton label="Properties" value={activePropertiesCount} icon={Building2} path="/owner/properties" delay={STATS_DELAY_BASE} />
            <OwnerStatButton label="Inquiries" value={inquiriesCount} icon={Inbox} path="/owner/inquiries" delay={STATS_DELAY_BASE + STATS_DELAY_STEP} />
            <OwnerStatButton label="Avg Rating" value={averageRating} icon={Star} path="/owner/reviews" delay={STATS_DELAY_BASE + STATS_DELAY_STEP * 2} />
            <div className="w-1 md:hidden shrink-0" />
          </div>
        </div>

        {/* Action Bar */}
        <div className="relative group">
           <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10 group-hover:bg-primary/10 transition-colors" />
           <div className="bg-card border border-border p-1 rounded-2xl flex items-center gap-2 shadow-sm">
             <div className="flex-1 px-4 text-[13px] font-medium text-muted-foreground hidden md:block">
               Manage your property portfolio with high-performance analytics.
             </div>
             <button 
              onClick={() => { void navigate('/owner/properties'); }}
              className="bg-primary text-primary-foreground h-10 md:h-11 px-4 md:px-6 rounded-xl text-[11px] md:text-[12px] font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
             >
               Add Property <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
             </button>
           </div>
        </div>

        {/* Main Grid: Chart + Inquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <InquiryChart monthlyTrends={monthlyTrends} />
          <RecentActivity recentInquiries={recentInquiries} />
        </div>

        {/* Bottom Section: Top Performing & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <TopPerformingProperties properties={topProperties} />

          {/* Owner Performance Insights */}
          <div className="lg:col-span-4 bg-primary text-primary-foreground rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10 h-full flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-2">Portfolio Insights</h3>
              <p className="text-[13px] text-primary-foreground/70 leading-relaxed mb-6"> Listings with 5+ high-quality images see 40% more inquiry engagements. Check your gallery status!</p>
              <button 
                onClick={() => { void navigate('/owner/properties'); }}
                className="bg-white text-black px-6 py-3 rounded-xl text-[13px] font-bold hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2 group w-full sm:w-auto mt-auto shadow-xl"
              >
                Optimize Gallery <PenLine className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
