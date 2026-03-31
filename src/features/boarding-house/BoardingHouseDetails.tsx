import { motion } from 'framer-motion';

import { ActionFooter } from './components/ActionFooter';
import { BoardingHouseError } from './components/BoardingHouseError';
import { BoardingHouseLoading } from './components/BoardingHouseLoading';
import { ImageLightbox } from './components/ImageLightbox';
import { InfoTab } from './components/InfoTab';
import { PropertyHeader } from './components/PropertyHeader';
import { ReviewSection } from './components/ReviewSection';
import { useBoardingHouseDetails } from './hooks/useBoardingHouseDetails';

export function BoardingHouseDetails() {
  const {
    propertyId, bhData, bh, currentUser, isBookmarked, toggleBookmark,
    activeTab, setActiveTab, activeImageIndex, setActiveImageIndex,
    showReviewForm, setShowReviewForm, newRating,
    setNewRating, newComment, setNewComment, isSubmitting, isInquiring,
    handleSubmitReview, handleInquire, navigate, targetReviewId,
    editingReviewId, setEditingReviewId, handleUpdateReview, handleDeleteReview,
  } = useBoardingHouseDetails();

  if (bhData === undefined) return <BoardingHouseLoading />;
  
  if (bhData === null || bhData.status === "Deleted" || bhData.isVisible === false) {
    return <BoardingHouseError isUnavailable={!!bhData} onBack={() => { void navigate('/tenant/map'); }} />;
  }

  if (!bh) return null;

  return (
    <>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute top-0 right-0 bottom-0 w-full sm:w-[500px] bg-[#0a0a0a] text-white border-l border-white/10 shadow-2xl flex flex-col z-40 rounded-l-[2rem] overflow-hidden"
      >
        <PropertyHeader
          id={propertyId} name={bh.name} images={bh.imageUrls}
          available={bh.available} rating={bh.rating} isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark} onClose={() => { void navigate('/tenant/map'); }}
          onImageClick={setActiveImageIndex}
        />

        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} reviewsCount={bh.reviewsCount} />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          <TabContent 
            activeTab={activeTab} bh={bh} currentUser={currentUser} 
            reviews={{ 
              sortedReviews: bh.reviews, showReviewForm, setShowReviewForm, newRating, setNewRating, 
              newComment, setNewComment, isSubmitting, onSubmitReview: handleSubmitReview, 
              targetReviewId, editingReviewId, setEditingReviewId, 
              onUpdateReview: handleUpdateReview, onDeleteReview: handleDeleteReview 
            }} 
          />
        </div>

        <ActionFooter price={bh.priceRange.min} onInquire={() => { void handleInquire(); }} isSubmitting={isInquiring} />
      </motion.div>

      <ImageLightbox
        images={bh.imageUrls} activeIndex={activeImageIndex}
        onClose={() => setActiveImageIndex(null)}
        onPrev={() => setActiveImageIndex(p => p === 0 ? bh.imageUrls.length - 1 : (p ?? 0) - 1)}
        onNext={() => setActiveImageIndex(p => (p ?? 0) === bh.imageUrls.length - 1 ? 0 : (p ?? 0) + 1)}
      />
    </>
  );
}

function TabNavigation({ activeTab, setActiveTab, reviewsCount }: { activeTab: string, setActiveTab: (t: 'info' | 'reviews') => void, reviewsCount: number }) {
  return (
    <div className="flex border-b border-white/5 bg-[#0a0a0a]/40 backdrop-blur-sm">
      <TabButton active={activeTab === 'info'} label="Information" onClick={() => setActiveTab('info')} />
      <TabButton active={activeTab === 'reviews'} label={`Reviews (${reviewsCount})`} onClick={() => setActiveTab('reviews')} />
    </div>
  );
}

function TabButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest relative transition-all ${active ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
      {label}
      {active && <motion.div layoutId="tabMarkerDetail" className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary" />}
    </button>
  );
}

function TabContent({ activeTab, bh, currentUser, reviews }: any) {
  if (activeTab === 'info') {
    return (
      <InfoTab
        location={bh.location} contact={bh.contact}
        amenities={bh.amenities ?? []} description={bh.description ?? ''}
        rooms={bh.rooms} rules={bh.rules}
      />
    );
  }
  return (
    <ReviewSection
      rating={bh.rating} reviewsCount={bh.reviewsCount} reviews={reviews.sortedReviews}
      currentUser={currentUser} showReviewForm={reviews.showReviewForm} setShowReviewForm={reviews.setShowReviewForm}
      newRating={reviews.newRating} setNewRating={reviews.setNewRating} newComment={reviews.newComment}
      setNewComment={reviews.setNewComment} isSubmitting={reviews.isSubmitting} onSubmitReview={reviews.onSubmitReview}
      onUpdateReview={reviews.onUpdateReview} onDeleteReview={reviews.onDeleteReview}
      editingReviewId={reviews.editingReviewId} setEditingReviewId={reviews.setEditingReviewId}
      targetReviewId={reviews.targetReviewId}
    />
  );
}
