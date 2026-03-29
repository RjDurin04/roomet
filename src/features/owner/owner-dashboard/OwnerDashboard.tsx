
import { motion } from 'framer-motion';
import { Inbox, Star, ArrowUpRight, TrendingUp, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

const StatCard = ({ title, value, growth, icon: Icon, delay }: { title: string, value: string | number, growth: string, icon: any, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    className="group relative bg-card p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-foreground tracking-tight">{value}</h3>
      </div>
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/20">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
    <div className="relative z-10 mt-3 flex items-center gap-2">
      <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
        <ArrowUpRight className="w-3 h-3" />
        {growth}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">vs last month</span>
    </div>
  </motion.div>
);

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
  const stats = useQuery(api.dashboard.getOwnerStats);
  
  if (stats === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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

  const maxInquiries = Math.max(...monthlyTrends.map((t: any) => t.inquiries), 1);

  return (
    <div className="h-full px-6 py-6 lg:px-10 max-w-[1600px] mx-auto flex flex-col overflow-hidden">
      
      {/* Header (Compact) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-row justify-between items-center mb-6 shrink-0"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Welcome back, Owner
          </h1>
          <p className="text-[13px] text-muted-foreground font-medium mt-1">
            Here's what's happening with your properties today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <StatCard title="Active Properties" value={activePropertiesCount} growth="+1" icon={Building2} delay={0.1} />
        <StatCard title="Total Inquiries" value={inquiriesCount} growth="+5.2%" icon={Inbox} delay={0.15} />
        <StatCard title="Avg Rating" value={averageRating} growth="+0.1" icon={Star} delay={0.2} />
      </div>

      {/* Two columns layout consuming remaining height */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-[24px] border border-border/50 p-6 shadow-sm flex flex-col relative overflow-hidden h-full"
        >
          <div className="absolute top-0 right-0 p-8">
            <div className="w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          </div>
          
          <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
            <div>
              <h2 className="text-lg font-bold mb-0.5">Inquiries Over Time</h2>
              <p className="text-[11px] text-muted-foreground">Monthly engagement across all active listings</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.5%</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex items-end gap-2 lg:gap-4 relative z-10 pb-2">
            {monthlyTrends.map((trend: any, index: number) => {
              const heightPercentage = (trend.inquiries / maxInquiries) * 100;
              return (
                <div key={trend.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full relative flex items-end justify-center h-full max-h-[160px] rounded-t-lg overflow-hidden bg-muted/20">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + index * 0.03, type: "spring", bounce: 0.2 }}
                      className="w-full bg-primary/80 group-hover:bg-primary transition-colors origin-bottom rounded-t cursor-pointer"
                    >
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-white/30" />
                    </motion.div>
                    
                    {/* Tooltip */}
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

        {/* Recent Inquiries List */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-[24px] border border-border/50 p-6 shadow-sm flex flex-col h-full overflow-hidden"
        >
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-lg font-bold">Recent Inquiries</h2>
            <Link to="/inquiries" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentInquiries.map((inq: any) => (
              <Link 
                key={inq.id}
                to={`/inquiries?id=${inq.id}`}
                className="group relative flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50"
              >
                {inq.unread && <div className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />}
                <img src={inq.avatar} alt={inq.user} className="w-10 h-10 rounded-full object-cover shrink-0 ml-1 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-[13px] truncate">{inq.user}</h4>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap ml-2">{formatRelativeTime(inq.updatedAt)}</span>
                  </div>
                  <p className="text-[11px] font-bold text-primary mb-0.5 truncate">{inq.property}</p>
                  <p className={`text-xs truncate ${inq.unread ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                    {inq.message}
                  </p>
                </div>
              </Link>
            ))}

            {recentInquiries.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <Inbox className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-xs font-medium">No recent inquiries.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
