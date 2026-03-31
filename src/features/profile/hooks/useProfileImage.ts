"use client";

import { useMutation } from 'convex/react';
import { useState, useRef } from 'react';

import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';

import { authClient } from '@/lib/auth-client';
import { UI_CONSTANTS } from '@/lib/constants';
import { fetchWithTimeout, parseUploadResponse } from '@/lib/fetch-utils';
import { validateImageFile, UPLOAD_LIMITS } from '@/lib/upload-validation';

export function useProfileImage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfileImageDb = useMutation(api.users.updateProfileImage);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file, UPLOAD_LIMITS.MAX_PROFILE_IMAGE_SIZE);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsUploading(true);
    try {
      const url = await generateUploadUrl();
      const result = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      }, UI_CONSTANTS.UPLOAD_TIMEOUT_MS);
      
      const storageIdResult = await parseUploadResponse(result, file.name);
      const storageId = storageIdResult as Id<"_storage">;
      
      const newImageUrl = await updateProfileImageDb({ storageId });
      await authClient.updateUser({ image: newImageUrl });
    } catch (error) {
      console.error('[useProfileImage] Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return { fileInputRef, isUploading, handleFileChange };
}
