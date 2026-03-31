"use client";

import React from 'react';

interface PreviewSectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

export function PreviewSection({ number, title, children }: PreviewSectionProps) {
  return (
    <div className="group space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground/40 italic font-black text-xs">{number}</div>
        <h4 className="text-xs font-black uppercase tracking-widest text-foreground/40">{title}</h4>
      </div>
      {children}
    </div>
  );
}
