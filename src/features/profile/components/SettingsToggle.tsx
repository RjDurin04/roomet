import { motion } from 'framer-motion';

import { UI_CONSTANTS } from '@/lib/constants';

interface SettingsToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

export function SettingsToggle({ label, description, enabled, onToggle }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button 
        onClick={onToggle} 
        className={`w-10 h-6 rounded-full transition-colors relative ${enabled ? 'bg-primary' : 'bg-foreground/20'}`}
      >
        <motion.div 
          animate={{ x: enabled ? UI_CONSTANTS.ANIM_Y_OFFSET_PX - 2 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}
