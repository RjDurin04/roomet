import { motion } from 'framer-motion';
import { ChevronLeft, Info } from 'lucide-react';

interface BoardingHouseErrorProps {
  isUnavailable?: boolean;
  onBack: () => void;
}

export function BoardingHouseError({ isUnavailable, onBack }: BoardingHouseErrorProps) {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 w-full sm:w-[500px] bg-[#0a0a0a] text-white border-l border-white/10 shadow-2xl flex flex-col items-center justify-center z-40 rounded-l-[2rem] p-12 text-center"
    >
      <div className="relative mb-8">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <Info className="w-6 h-6 text-primary" />
        </div>
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
      </div>

      <h2 className="text-xl font-bold mb-3">Property Unavailable</h2>
      <p className="text-[13px] text-white/50 leading-relaxed mb-8 max-w-xs">
        {isUnavailable 
          ? "This property is no longer active or has been removed from our listings." 
          : "We encountered an error loading the details. Please try again later."}
      </p>

      <button
        onClick={onBack}
        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-[13px] font-bold hover:bg-white/90 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Explorer
      </button>
    </motion.div>
  );
}
