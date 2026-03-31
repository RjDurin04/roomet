import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function BoardingHouseLoading() {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 w-full sm:w-[500px] bg-[#0a0a0a] text-white border-l border-white/10 shadow-2xl flex flex-col items-center justify-center z-40 rounded-l-[2rem]"
    >
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
      </div>
      <p className="mt-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Loading details</p>
    </motion.div>
  );
}
