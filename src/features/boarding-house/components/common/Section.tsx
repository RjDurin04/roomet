import React from 'react';

interface SectionProps {
  icon: any;
  title: string;
  content: React.ReactNode;
  color?: string;
  accent?: boolean;
}

export function Section({ icon: Icon, title, content, color, accent }: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color || 'text-primary'}`} />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">{title}</h3>
      </div>
      <div className={`p-6 bg-white/5 border border-white/10 rounded-[28px] relative overflow-hidden group ${accent ? 'border-l-4 border-l-primary/40' : ''}`}>
        {!accent && <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-y-12 transition-colors group-hover:bg-primary/10" />}
        {content}
      </div>
    </section>
  );
}
