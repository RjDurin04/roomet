import { useQuery, useMutation } from 'convex/react';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';

import { api } from '../../../../convex/_generated/api';

import { useInquiryManagement } from './sub-hooks/useInquiryManagement';
import { useReviewManagement } from './sub-hooks/useReviewManagement';

import { AUTO_SCROLL_DELAY } from '@/lib/constants';

export function useBoardingHouseDetails() {
  const [params] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const propertyId = id as any;
  const targetReviewId = params.get('reviewId');

  const bhData = useQuery(api.properties.getById, propertyId ? { id: propertyId } : "skip");
  const currentUser = useQuery(api.users.getMyProfile);
  const bookmark = useQuery(api.bookmarks.check, propertyId ? { propertyId } : "skip");
  const toggleBookmarkMutation = useMutation(api.bookmarks.toggle);

  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>(targetReviewId ? 'reviews' : 'info');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const reviewsMgt = useReviewManagement(propertyId);
  const inquiryMgt = useInquiryManagement(propertyId);

  const bh = useMemo(() => {
    if (!bhData) return null;
    const rooms = bhData.rooms ?? [];
    const minPrice = rooms.length > 0 ? Math.min(...rooms.map((r: any) => r.price)) : 0;
    
    // A property is available if at least one room has vacancy
    const isAvailable = rooms.some((r: any) => (r.occupied ?? 0) < r.capacity);
    
    return { 
      ...bhData, 
      reviews: bhData.reviews ?? [], 
      rating: bhData.rating ?? 0,
      reviewsCount: bhData.reviewsCount ?? 0,
      available: isAvailable,
      priceRange: { min: minPrice } 
    };
  }, [bhData]);

  useEffect(() => {
    if (!targetReviewId) return;
    const scrollTimer = setTimeout(() => {
      const el = document.getElementById(`review-${targetReviewId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, AUTO_SCROLL_DELAY);
    return () => clearTimeout(scrollTimer);
  }, [targetReviewId]);

  const toggleBookmark = () => {
    if (propertyId) void toggleBookmarkMutation({ propertyId });
  };

  return {
    propertyId, bhData, bh, currentUser, isBookmarked: !!bookmark,
    toggleBookmark, activeTab, setActiveTab, activeImageIndex, setActiveImageIndex,
    ...reviewsMgt, ...inquiryMgt,
    navigate, targetReviewId,
  };
}
