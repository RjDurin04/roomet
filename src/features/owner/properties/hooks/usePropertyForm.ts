"use client";

/* eslint-disable no-magic-numbers, @typescript-eslint/no-floating-promises */
import { useMutation } from 'convex/react';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../../../../convex/_generated/api';
import { type PropertyFormData, type ImageItem } from '../types';

import { UI_CONSTANTS } from '@/lib/constants';
import { fetchWithTimeout, parseUploadResponse } from '@/lib/fetch-utils';

// eslint-disable-next-line max-lines-per-function -- Complex stateful form hook with validation, persistence, and submission
export function usePropertyForm(initialData: PropertyFormData, initialImages: ImageItem[] = [], persistenceId?: string, initialStep?: number) {
  const navigate = useNavigate();

  // 1. Initial State from LocalStorage or override
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialStep !== undefined) return initialStep;
    if (persistenceId && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`bhouse_step_${persistenceId}`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [formData, setFormData] = useState<PropertyFormData>(() => {
    if (persistenceId && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`bhouse_data_${persistenceId}`);
      if (saved) {
        try {
          const data = JSON.parse(saved) as PropertyFormData;
          // Robust sanitization for critical location data
          if (typeof data.mapPin?.lat !== 'number' || isNaN(data.mapPin.lat)) {
            data.mapPin = { ...data.mapPin, lat: UI_CONSTANTS.MAP_DEFAULT_LAT };
          }
          if (typeof data.mapPin.lng !== 'number' || isNaN(data.mapPin.lng)) {
            data.mapPin = { ...data.mapPin, lng: UI_CONSTANTS.MAP_DEFAULT_LNG };
          }
          return data;
        } catch (e) {
          console.error("[usePropertyForm] Error restoring draft:", e);
        }
      }
    }
    return initialData;
  });

  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 2. Persistence Syncing
  useEffect(() => {
    if (persistenceId && typeof window !== 'undefined') {
      localStorage.setItem(`bhouse_step_${persistenceId}`, currentStep.toString());
    }
  }, [currentStep, persistenceId]);

  useEffect(() => {
    if (persistenceId && typeof window !== 'undefined') {
      localStorage.setItem(`bhouse_data_${persistenceId}`, JSON.stringify(formData));
    }
  }, [formData, persistenceId]);

  const clearDraft = useCallback(() => {
    if (persistenceId && typeof window !== 'undefined') {
      localStorage.removeItem(`bhouse_step_${persistenceId}`);
      localStorage.removeItem(`bhouse_data_${persistenceId}`);
    }
  }, [persistenceId]);

  const generateUploadUrl = useMutation(api.properties.generateUploadUrl);
  const createProperty = useMutation(api.properties.create);
  const updateProperty = useMutation(api.properties.update);

  const updateFormData = useCallback((updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.name.trim()) newErrors['name'] = 'Property name is required';
      if (!formData.description.trim()) newErrors['description'] = 'Description is required';
      if (!formData.phone.trim()) newErrors['phone'] = 'Phone number is required';
      else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone.trim())) newErrors['phone'] = 'Enter valid phone number';
      if (!formData.email.trim()) newErrors['email'] = 'Email is required';
    } else if (step === 1) {
      if (!formData.address.trim() || formData.address === 'Locating...') newErrors['address'] = 'Address is required';
    } else if (step === 2) {
      if (formData.rooms.length === 0) {
        newErrors['rooms'] = 'At least one unit is required';
      } else {
        formData.rooms.forEach((room: any, idx: any) => {
          if (!room.name.trim()) newErrors[`rooms.${idx}.name`] = 'Required';
          if (!room.type) newErrors[`rooms.${idx}.type`] = 'Required';
          if (room.price <= 0) newErrors[`rooms.${idx}.price`] = 'Required';
        });
      }
    } else if (step === 4) {
      if (images.length === 0) newErrors['images'] = 'At least one photo is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImages = async () => {
    const storageIds: string[] = [];
    for (const img of images) {
      if (img.storageId) {
        storageIds.push(img.storageId);
      } else if (img.file) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetchWithTimeout(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": img.file.type },
          body: img.file,
        }, UI_CONSTANTS.UPLOAD_TIMEOUT_MS);
        const storageId = await parseUploadResponse(result, img.file.name);
        storageIds.push(storageId);
      }
    }
    return storageIds;
  };

  const handleSubmit = async (propertyId?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const storageIds = await uploadImages();
      const payload = {
        name: formData.name,
        description: formData.description,
        contact: { phone: formData.phone, email: formData.email },
        location: { address: formData.address, lat: formData.mapPin.lat, lng: formData.mapPin.lng },
        amenities: formData.amenities,
        rules: formData.rules,
        images: storageIds,
        rooms: formData.rooms,
      };

      if (propertyId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex Id type cast
        await updateProperty({ id: propertyId as any, ...payload });
      } else {
        await createProperty(payload);
      }
      clearDraft();
      navigate('/owner/properties');
    } catch (error) {
      console.error("[PropertyForm] Submission failed:", error);
      alert("Failed to save property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep, setCurrentStep,
    formData, setFormData, updateFormData,
    images, setImages,
    isSubmitting,
    errors, setErrors,
    validateStep,
    handleSubmit,
    clearDraft,
  };
}
