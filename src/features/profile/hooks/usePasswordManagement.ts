"use client";

import { useState, useEffect } from 'react';

import { authClient } from '@/lib/auth-client';
import { UI_CONSTANTS } from '@/lib/constants';

type Client = {
  listAccounts: () => Promise<{ data: Array<{ providerId: string }> | null, error: { message: string } | null }>;
  setPassword: (args: { newPassword: string }) => Promise<{ error: { message: string } | null }>;
};

export function usePasswordManagement(user: { id: string } | null | undefined) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [hasCredentialAccount, setHasCredentialAccount] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    const checkAccount = async () => {
      try {
        const client = authClient as unknown as Client;
        if (typeof client.listAccounts === 'function') {
          const { data, error } = await client.listAccounts();
          setHasCredentialAccount(!error && !!data?.some((acc: any) => acc.providerId === 'credential'));
        } else {
          setHasCredentialAccount(false);
        }
      } catch (e) {
        console.error("[usePasswordManagement] Failed to check account type:", e);
        setHasCredentialAccount(null);
      }
    };
    void checkAccount();
  }, [user]);

  const updatePassword = async () => {
    const client = authClient as unknown as Client;
    if (!hasCredentialAccount) {
      const { error } = await client.setPassword({ newPassword });
      if (error) return setPassError(error.message ?? 'Failed to set password');
      setPassSuccess('Password set successfully');
      setNewPassword(''); setConfirmPassword(''); setHasCredentialAccount(true);
    } else {
      if (!currentPassword) return setPassError('Current password is required');
      const { error } = await authClient.changePassword({ newPassword, currentPassword, revokeOtherSessions: true });
      if (error) return setPassError(error.code === 'INVALID_PASSWORD' ? 'Invalid current password.' : (error.message ?? 'Failed to update password'));
      setPassSuccess('Password updated successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    }
  };

  const handleUpdatePassword = async () => {
    setPassError(''); setPassSuccess('');
    if (newPassword !== confirmPassword) return setPassError('Passwords do not match');
    if (newPassword.length < UI_CONSTANTS.MIN_PASSWORD_LENGTH) return setPassError(`Password must be at least ${UI_CONSTANTS.MIN_PASSWORD_LENGTH} characters`);

    setIsUpdatingPassword(true);
    try {
      await updatePassword();
    } catch {
      setPassError('An error occurred. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return { showPassword, setShowPassword, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, passError, passSuccess, isUpdatingPassword, hasCredentialAccount, handleUpdatePassword };
}
