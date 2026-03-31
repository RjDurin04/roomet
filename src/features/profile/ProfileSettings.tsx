"use client";

import { Moon, Sun, LogOut } from 'lucide-react';

import { PersonalSection } from './components/PersonalSection';
import { ProfileCard } from './components/ProfileCard';
import { SecuritySection } from './components/SecuritySection';
import { SettingsToggle } from './components/SettingsToggle';
import { useProfileSettings } from './hooks/useProfileSettings';

import { useTheme } from '@/contexts/ThemeContext';

export function ProfileSettings() {
  const { theme, toggleTheme } = useTheme();
  const ps = useProfileSettings();

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="max-w-[720px] mx-auto px-6 lg:px-10 py-8 space-y-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Account</p>
          <h1 className="text-2xl font-bold tracking-tight">Profile & Settings</h1>
        </div>

        <ProfileCard 
          user={ps.user} 
          isUploading={ps.isUploading} 
          onImageClick={() => ps.fileInputRef.current?.click()} 
          fileInputRef={ps.fileInputRef} 
          onFileChange={(e) => { void ps.handleFileChange(e); }} 
        />

        <PersonalSection 
          firstName={ps.firstName} 
          setFirstName={ps.setFirstName} 
          lastName={ps.lastName} 
          setLastName={ps.setLastName} 
          email={ps.user?.email} 
          profileSuccess={ps.profileSuccess} 
          isSavingProfile={ps.isSavingProfile} 
          onSaveProfile={() => { void ps.handleSaveProfile(); }} 
        />

        <SecuritySection 
          passError={ps.passError} 
          passSuccess={ps.passSuccess} 
          hasCredentialAccount={ps.hasCredentialAccount} 
          showPassword={ps.showPassword} 
          setShowPassword={ps.setShowPassword} 
          currentPassword={ps.currentPassword} 
          setCurrentPassword={ps.setCurrentPassword} 
          newPassword={ps.newPassword} 
          setNewPassword={ps.setNewPassword} 
          confirmPassword={ps.confirmPassword} 
          setConfirmPassword={ps.setConfirmPassword} 
          isUpdatingPassword={ps.isUpdatingPassword} 
          onUpdatePassword={() => { void ps.handleUpdatePassword(); }} 
        />

        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-[14px] font-bold flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />} 
              Preferences
            </h3>
          </div>
          <div className="px-6 divide-y divide-border/50">
            <SettingsToggle
              label="Dark Mode"
              description="Switch between light and dark interface themes"
              enabled={theme === 'dark'}
              onToggle={toggleTheme}
            />
          </div>
        </section>

        <section className="bg-card border border-destructive/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-destructive/20">
            <h3 className="text-[14px] font-bold text-destructive flex items-center gap-2"><LogOut className="w-4 h-4" /> Account Actions</h3>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Sign Out</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Log out of your current session</p>
            </div>
            <button 
              onClick={() => { void ps.handleSignOut(); }} 
              className="px-5 py-2 border border-destructive/30 text-destructive rounded-xl text-[12px] font-bold hover:bg-destructive/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}
