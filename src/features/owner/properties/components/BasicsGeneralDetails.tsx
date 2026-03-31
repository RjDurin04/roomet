"use client";

import { FileText } from 'lucide-react';

import { type PropertyFormData } from '../types';

interface BasicsGeneralDetailsProps {
  formData: PropertyFormData;
  setFormData: (data: PropertyFormData) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

export function BasicsGeneralDetails({ formData, setFormData, errors, setErrors }: BasicsGeneralDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <FileText className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold">General Details</h3>
      </div>
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60 dark:text-muted-foreground mb-1.5 block">Property Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => {
            setFormData({ ...formData, name: e.target.value });
            if (errors['name']) setErrors({ ...errors, name: '' });
          }}
          placeholder="e.g. The Zenith Residencia"
          className={`w-full h-12 bg-background border ${errors['name'] ? 'border-red-500 focus:border-red-500' : 'border-border dark:border-border/60 focus:border-primary'} rounded-xl px-4 text-[13px] outline-none transition-colors placeholder:text-foreground/40 dark:placeholder:text-muted-foreground/50`}
        />
        {errors['name'] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors['name']}</p>}
      </div>
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60 dark:text-muted-foreground mb-1.5 block">Description</label>
        <textarea
          value={formData.description}
          onChange={e => {
            setFormData({ ...formData, description: e.target.value });
            if (errors['description']) setErrors({ ...errors, description: '' });
          }}
          placeholder="What makes your boarding house special?"
          className={`w-full h-40 p-4 bg-background border ${errors['description'] ? 'border-red-500 focus:border-red-500' : 'border-border dark:border-border/60 focus:border-primary'} rounded-xl text-[13px] outline-none transition-colors resize-none placeholder:text-foreground/40 dark:placeholder:text-muted-foreground/50 leading-relaxed`}
        />
        {errors['description'] && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors['description']}</p>}
      </div>

    </div>
  );
}
