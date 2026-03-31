"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

interface SecuritySectionProps {
  passError: string;
  passSuccess: string;
  hasCredentialAccount: boolean | null;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isUpdatingPassword: boolean;
  onUpdatePassword: () => void;
}

export function SecuritySection({
  passError,
  passSuccess,
  hasCredentialAccount,
  showPassword,
  setShowPassword,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isUpdatingPassword,
  onUpdatePassword,
}: SecuritySectionProps) {
  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-[14px] font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Security</h3>
      </div>
      <div className="p-6 space-y-5">
        <AnimatePresence mode="wait">
          {passError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-[12px] text-destructive font-medium">
              {passError}
            </motion.div>
          )}
          {passSuccess && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-[12px] text-green-600 font-medium">
              {passSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        {hasCredentialAccount === null ? (
          <div className="animate-pulse flex flex-col gap-1.5">
            <div className="h-3.5 bg-muted/50 rounded w-28"></div>
            <div className="h-10 bg-muted/30 rounded-xl w-full"></div>
          </div>
        ) : (
          <>
            {hasCredentialAccount && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Current Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); }} placeholder="Enter current password" className="w-full h-10 bg-background border border-border/60 focus:border-primary rounded-xl px-4 pr-10 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50" />
                  <button type="button" onClick={() => { setShowPassword(!showPassword); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
        
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">New Password</label>
                <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); }} placeholder="Enter new password" className="w-full h-10 bg-background border border-border/60 focus:border-primary rounded-xl px-4 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); }} placeholder="Confirm password" className="w-full h-10 bg-background border border-border/60 focus:border-primary rounded-xl px-4 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={onUpdatePassword}
                disabled={isUpdatingPassword}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl text-[12px] font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isUpdatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {hasCredentialAccount ? "Update Password" : "Set Password"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
