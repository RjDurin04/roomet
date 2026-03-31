import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

import { CHART_MIN_OPACITY, PERCENT_BASE, CHART_DELAY_BASE, CHART_DELAY_STEP } from '@/lib/constants';

interface MonthlyTrend {
  month: string;
  inquiries: number;
}

interface InquiryChartProps {
  monthlyTrends: MonthlyTrend[];
}

export function InquiryChart({ monthlyTrends }: InquiryChartProps) {
  const maxInquiries = Math.max(...monthlyTrends.map((t: any) => t.inquiries), 1);

  return (
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
          {monthlyTrends.map((trend: any, index: any) => {
            const heightPercentage = Math.max(CHART_MIN_OPACITY, (trend.inquiries / maxInquiries) * PERCENT_BASE);
            return (
              <div key={trend.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="w-full relative flex items-end justify-center h-full max-h-[160px] md:max-h-[200px] rounded-t-lg overflow-hidden bg-muted/20">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{ 
                      duration: 0.8, 
                      delay: CHART_DELAY_BASE + index * CHART_DELAY_STEP, 
                      type: "spring", 
                      bounce: 0.2 
                    }}
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
  );
}
