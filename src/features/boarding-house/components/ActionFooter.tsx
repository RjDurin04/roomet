import { Loader2 } from 'lucide-react';

interface ActionFooterProps {
  price: number;
  onInquire: () => void;
  isSubmitting?: boolean;
}

export function ActionFooter({ price, onInquire, isSubmitting }: ActionFooterProps) {
  return (
    <div className="p-5 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl flex items-center justify-between gap-6 z-20">
      <div>
        <p className="text-[8px] uppercase tracking-[0.2em] font-black text-white/20 mb-1">
          Starting Price
        </p>
        <p className="text-2xl font-black text-white tracking-tighter leading-none">
          ₱{price.toLocaleString()}
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1 opacity-50">
            / mo
          </span>
        </p>
      </div>
      <button
        onClick={onInquire}
        disabled={isSubmitting}
        className="flex-1 h-14 bg-white hover:bg-white/90 text-black font-black rounded-[20px] transition-all text-[12px] uppercase tracking-[0.1em] shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Inquire Now"
        )}
      </button>
    </div>
  );
}
