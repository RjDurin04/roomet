interface SectionHeaderProps {
  icon: any;
  title: string;
  color?: string;
}

export function SectionHeader({ icon: Icon, title, color }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${color || 'text-primary'}`} />
      <h4 className="text-[9px] font-black uppercase tracking-widest opacity-60">{title}</h4>
    </div>
  );
}
