"use client";

import { type PropertyFormData } from '../types';

import { BasicsContactDetails } from './BasicsContactDetails';
import { BasicsGeneralDetails } from './BasicsGeneralDetails';

interface StepBasicsProps {
  formData: PropertyFormData;
  setFormData: (data: PropertyFormData) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

export function StepBasics({ formData, setFormData, errors, setErrors }: StepBasicsProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BasicsGeneralDetails 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
          setErrors={setErrors} 
        />
        <BasicsContactDetails 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
          setErrors={setErrors} 
        />
      </div>
    </div>
  );
}
