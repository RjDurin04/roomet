"use client";

import { Phone } from 'lucide-react';

import { type PropertyFormData } from '../types';

interface BasicsContactDetailsProps {
  formData: PropertyFormData;
  setFormData: (data: PropertyFormData) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

export function BasicsContactDetails({ formData, setFormData, errors, setErrors }: BasicsContactDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Phone className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold">Contact Person</h3>
      </div>
      <div className={`bg-muted/60 dark:bg-muted/30 p-6 rounded-[28px] border ${(errors['phone'] || errors['email']) ? 'border-red-500/30' : 'border-border dark:border-border/50'} space-y-5`}>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60 dark:text-muted-foreground mb-1.5 block">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9+\-\s()]/g, '');
              setFormData({ ...formData, phone: val });
              if (errors['phone']) setErrors({ ...errors, phone: '' });
            }}
            placeholder="09123456789"
            className="w-full h-12 bg-background border border-border dark:border-border/60 focus:border-primary rounded-xl px-4 text-[13px] outline-none transition-colors placeholder:text-foreground/40 dark:placeholder:text-muted-foreground/50"
          />
          {errors['phone'] && <p className="text-red-500 text-[10px] font-bold mt-1">{errors['phone']}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60 dark:text-muted-foreground mb-1.5 block">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={e => {
              setFormData({ ...formData, email: e.target.value });
              if (errors['email']) setErrors({ ...errors, email: '' });
            }}
            placeholder="owner@example.com"
            className="w-full h-12 bg-background border border-border dark:border-border/60 focus:border-primary rounded-xl px-4 text-[13px] outline-none transition-colors placeholder:text-foreground/40 dark:placeholder:text-muted-foreground/50"
          />
          {errors['email'] && <p className="text-red-500 text-[10px] font-bold mt-1">{errors['email']}</p>}
        </div>
      </div>

    </div>
  );
}
