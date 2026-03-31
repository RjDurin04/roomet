import { useMutation } from 'convex/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';

export function useInquiryManagement(propertyId: string) {
  const navigate = useNavigate();
  const createInquiryMutation = useMutation(api.inquiries.create);
  const [isInquiring, setIsInquiring] = useState(false);

  const handleInquire = async () => {
    if (!propertyId) return;
    setIsInquiring(true);
    try {
      const inquiryId = await createInquiryMutation({ 
        propertyId: propertyId as Id<'properties'>
      });
      void navigate(`/tenant/inquiries?id=${inquiryId}`);
    } catch (error) {
      console.error('Failed to create inquiry:', error);
    } finally {
      setIsInquiring(false);
    }
  };

  return { isInquiring, handleInquire };
}
