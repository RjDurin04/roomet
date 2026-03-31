import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OwnerStatButtonProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  path: string;
  delay: number;
}

export function OwnerStatButton({ label, value, icon: Icon, path, delay }: OwnerStatButtonProps) {
  const navigate = useNavigate();
  return (
    <motion.button 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => { if (path !== '#') void navigate(path); }}
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
}
