"use client";

import { User, Check, Loader2 } from 'lucide-react';

interface PersonalSectionProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string | null | undefined;
  profileSuccess: string;
  isSavingProfile: boolean;
  onSaveProfile: () => void;
}

export function PersonalSection({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  profileSuccess,
  isSavingProfile,
  onSaveProfile,
}: PersonalSectionProps) {
  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-[14px] font-bold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Personal Information</h3>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">First Name</label>
            <input type="text" value={firstName} onChange={e => { setFirstName(e.target.value); }} className="w-full h-10 bg-background border border-border/60 focus:border-primary rounded-xl px-4 text-[13px] outline-none transition-colors" />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Last Name</label>
            <input type="text" value={lastName} onChange={e => { setLastName(e.target.value); }} className="w-full h-10 bg-background border border-border/60 focus:border-primary rounded-xl px-4 text-[13px] outline-none transition-colors" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Email Address</label>
          <input type="email" value={email ?? ''} readOnly className="w-full h-10 bg-muted border border-border/60 rounded-xl px-4 text-[13px] text-muted-foreground outline-none cursor-not-allowed" />
          <p className="text-[10px] text-muted-foreground mt-1.5 tracking-wide">
            Email addresses are tied to your authentication and cannot be changed here.
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] font-medium text-green-500">{profileSuccess}</div>
          <button 
            onClick={onSaveProfile}
            disabled={isSavingProfile}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl text-[12px] font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} 
            Save Changes
          </button>
        </div>
      </div>
    </section>
  );
}
