/* eslint-disable max-lines, max-lines-per-function, complexity, no-magic-numbers, @typescript-eslint/no-misused-promises */
import { useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Moon, Sun, LogOut, Camera, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import React, { useState, useRef } from 'react';


import { api } from '../../../../convex/_generated/api';

import { useTheme } from '@/contexts/ThemeContext';
import { authClient } from '@/lib/auth-client';
import { validateImageFile, UPLOAD_LIMITS } from '@/lib/upload-validation';






interface SettingToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function SettingToggle({ label, description, enabled, onToggle }: SettingToggleProps) {
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
          animate={{ x: enabled ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

 
export function OwnerSettings() {
  const { theme, toggleTheme } = useTheme();

  const { data: session } = authClient.useSession();
  const user = session?.user;

  // Profile Update
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Update
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [hasCredentialAccount, setHasCredentialAccount] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (!user) return;
    async function checkAccount() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- BetterAuth interface isn't fully typed for non-standard methods
        if (typeof (authClient as any).listAccounts === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (authClient as any).listAccounts();
          if (error) {
            console.error("Error from listAccounts:", error);
            setHasCredentialAccount(false);
            return;
          }
          if (data && Array.isArray(data)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setHasCredentialAccount(data.some((acc: any) => acc.providerId === 'credential'));
          } else {
            setHasCredentialAccount(false);
          }
        } else {
          // If the method doesn't exist, safely assume false for social login compatibility 
          setHasCredentialAccount(false);
        }
      } catch (e) {
        console.error("Failed to fetch user accounts", e);
        setHasCredentialAccount(false);
      }
    }
    checkAccount();
  }, [user]);

  React.useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' '));
    }
  }, [user?.name]);

  // Image Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfileImageDb = useMutation(api.users.updateProfileImage);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    // SEC-004: Validate file type and size
    const validationError = validateImageFile(file, UPLOAD_LIMITS.MAX_PROFILE_IMAGE_SIZE);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsUploading(true);
    try {
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const newImageUrl = await updateProfileImageDb({ storageId });
      await authClient.updateUser({ image: newImageUrl });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileSuccess('');
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await authClient.updateUser({ name: fullName });
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => { setProfileSuccess(''); }, 3000);
    } catch {
      //
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('Password must be at least 8 characters');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (!hasCredentialAccount) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Checking internal undocumented methods
        const { error } = await (authClient as any).setPassword({ newPassword });
        if (error) {
          setPassError(error.message || 'Failed to set password');
        } else {
          setPassSuccess('Password set successfully');
          setNewPassword('');
          setConfirmPassword('');
          setHasCredentialAccount(true);
        }
      } else {
        if (!currentPassword) {
          setPassError('Current password is required');
          setIsUpdatingPassword(false);
          return;
        }

        // SEC-011: Revoke other sessions on password change to invalidate compromised sessions
        const { error } = await authClient.changePassword({
          newPassword,
          currentPassword,
          revokeOtherSessions: true
        });

        if (error) {
          if (error.code === 'INVALID_PASSWORD' || error.message?.toLowerCase().includes('password')) {
            setPassError('Invalid current password.');
          } else {
            setPassError(error.message || 'Failed to update password');
          }
        } else {
          setPassSuccess('Password updated successfully');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }
    } catch {
      setPassError('An error occurred. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="max-w-[720px] mx-auto px-6 lg:px-10 py-8 space-y-8">

        {/* Header */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Management</p>
          <h1 className="text-2xl font-bold tracking-tight">Owner Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {isUploading ? (
                <div className="w-20 h-20 rounded-2xl ring-2 ring-border bg-muted flex flex-col items-center justify-center animate-pulse">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <img 
                  src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Owner')}&background=000&color=fff&size=80`} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-2xl ring-2 ring-border object-cover"
                />
              )}
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                <Camera className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{user?.name || 'Owner Name'}</h2>
              <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-[14px] font-bold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Business Information</h3>
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
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Business Email</label>
              <input type="email" value={user?.email || ''} readOnly className="w-full h-10 bg-muted border border-border/60 rounded-xl px-4 text-[13px] text-muted-foreground outline-none cursor-not-allowed" />
              <p className="text-[10px] text-muted-foreground mt-1.5 tracking-wide">
                Email addresses are tied to your authentication and cannot be changed here.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] font-medium text-green-500">{profileSuccess}</div>
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl text-[12px] font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 
                Save Changes
              </button>
            </div>
          </div>
        </section>

        {/* Security */}
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
                    onClick={handleUpdatePassword}
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

        {/* Preferences */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-[14px] font-bold flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />} Appearance
            </h3>
          </div>
          <div className="px-6 divide-y divide-border/50">
            <SettingToggle
              label="Dark Mode"
              description="Switch between light and dark interface themes"
              enabled={theme === 'dark'}
              onToggle={toggleTheme}
            />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-card border border-destructive/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-destructive/20">
            <h3 className="text-[14px] font-bold text-destructive flex items-center gap-2"><LogOut className="w-4 h-4" /> Account Actions</h3>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Log Out</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Safely exit your owner session</p>
            </div>
            <button onClick={async () => {
              await authClient.signOut();
            }} className="px-5 py-2 border border-destructive/30 text-destructive rounded-xl text-[12px] font-bold hover:bg-destructive/10 transition-colors">
              Sign Out
            </button>
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}
