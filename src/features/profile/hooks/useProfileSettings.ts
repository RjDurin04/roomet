"use client";

import { useState, useEffect } from 'react';

import { usePasswordManagement } from './usePasswordManagement';
import { useProfileImage } from './useProfileImage';

import { authClient } from '@/lib/auth-client';

const SUCCESS_TIMEOUT_MS = 3000;

export function useProfileSettings() {

  const { data: session } = authClient.useSession();
  const user = session?.user;
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const pm = usePasswordManagement(user);
  const pi = useProfileImage();

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(' ');
      setFirstName(parts[0] ?? '');
      setLastName(parts.length > 1 ? parts.slice(1).join(' ') : '');
    }
  }, [user?.name]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileSuccess('');
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await authClient.updateUser({ name: fullName });
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => { setProfileSuccess(''); }, SUCCESS_TIMEOUT_MS);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save profile';
      alert(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return {
    user,
    firstName, setFirstName,
    lastName, setLastName,
    isSavingProfile,
    profileSuccess,
    ...pm,
    ...pi,
    handleSaveProfile,
    handleSignOut,
  };
}
