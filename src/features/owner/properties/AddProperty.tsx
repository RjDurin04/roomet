"use client";
/* eslint-disable no-magic-numbers */

import { motion } from 'framer-motion';
import {
  MapPin, Info, Home, Image as ImageIcon, ChevronRight,
  ChevronLeft, BedDouble, Eye, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { StepAmenities } from './components/StepAmenities';
import { StepBasics } from './components/StepBasics';
import { StepGallery } from './components/StepGallery';
import { StepLocation } from './components/StepLocation';
import { StepPreview } from './components/StepPreview';
import { StepUnits } from './components/StepUnits';
import { usePropertyForm } from './hooks/usePropertyForm';

import { UI_CONSTANTS } from '@/lib/constants';

const steps = [
  { id: 'info', title: 'Basics', icon: Info, description: 'General property details' },
  { id: 'location', title: 'Location', icon: MapPin, description: 'Set address & map pin' },
  { id: 'rooms', title: 'Units', icon: BedDouble, description: 'Room types & pricing' },
  { id: 'amenities', title: 'Features', icon: Home, description: 'Perks & house rules' },
  { id: 'images', title: 'Gallery', icon: ImageIcon, description: 'Upload property photos' },
  { id: 'preview', title: 'Preview', icon: Eye, description: 'Review & Publish' },
];

// eslint-disable-next-line max-lines-per-function -- Wizard unifies complex state and UI rendering
export function AddProperty() {
  const navigate = useNavigate();
  const pf = usePropertyForm({
    name: '', description: '', phone: '', email: '',
    address: '', 
    mapPin: { lat: UI_CONSTANTS.MAP_DEFAULT_LAT, lng: UI_CONSTANTS.MAP_DEFAULT_LNG },
    rooms: [], amenities: [], rules: '',
  }, [], "new_property");

  // The Progress indicator (if needed elsewhere) can be derived here

  const handleNext = () => {
    if (pf.validateStep(pf.currentStep)) {
      if (pf.currentStep < steps.length - 1) pf.setCurrentStep(curr => curr + 1);
      else void pf.handleSubmit();
    }
  };

  const renderStepContent = () => {
    switch (pf.currentStep) {
      case 0: return <StepBasics formData={pf.formData} setFormData={pf.setFormData} errors={pf.errors} setErrors={pf.setErrors} />;
      case 1: return <StepLocation formData={pf.formData} updateFormData={pf.updateFormData} />;
      case 2: return <StepUnits formData={pf.formData} setFormData={pf.setFormData} errors={pf.errors} />;
      case 3: return <StepAmenities formData={pf.formData} setFormData={pf.setFormData} />;
      case 4: return <StepGallery images={pf.images} setImages={pf.setImages} errors={pf.errors} />;
      case 5: return <StepPreview formData={pf.formData} images={pf.images} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-full bg-background pb-36 md:pb-48">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-20 md:h-28 flex flex-col justify-center gap-4">
            {/* Horizontal Stepper */}
            <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-0 md:px-2">
              {steps.map((step, index) => {
                const isActive = pf.currentStep === index;
                const isCompleted = pf.currentStep > index;
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none group min-w-0">
                    {/* Step Circle */}
                    <div className="relative flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
                          isActive 
                            ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110' 
                            : isCompleted 
                              ? 'bg-primary/10 border-primary/20 text-primary' 
                              : 'bg-muted/30 border-border/50 text-muted-foreground'
                        }`}
                      >
                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'animate-pulse' : ''}`} />
                        
                        {/* Checkmark for completed */}
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                            <div className="w-1.5 h-2 md:w-1.5 md:h-2.5 border-r-2 border-b-2 border-white rotate-45 mb-0.5" />
                          </div>
                        )}
                      </div>
                      <span className={`absolute -bottom-5 md:-bottom-6 text-[8px] md:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                        {step.title}
                      </span>
                    </div>

                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-1 md:mx-4 h-0.5 min-w-[8px] md:min-w-[30px] bg-muted/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={false}
                          animate={{ width: isCompleted ? '100%' : '0%' }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className="h-full bg-primary"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 mt-10 md:mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
          key={pf.currentStep}
        >
          {renderStepContent()}
        </motion.div>
        {/* Spacer to ensure content clears fixed footer */}
        <div className="h-28 md:h-44" />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 md:h-28 flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-4">
            <button 
              onClick={() => pf.setCurrentStep(c => Math.max(0, c - 1))} 
              disabled={pf.currentStep === 0 || pf.isSubmitting} 
              className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-0 transition-all"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back
            </button>

            <button 
              onClick={() => {
                if (window.confirm("Abandon property listing? Your current progress will be lost.")) {
                  pf.clearDraft();
                  void navigate('/owner/properties');
                }
              }}
              disabled={pf.isSubmitting}
              className="px-3 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
            >
              Cancel
            </button>
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={pf.isSubmitting} 
            className="group flex items-center gap-2 px-5 md:px-8 py-3 md:py-4 rounded-xl bg-primary text-primary-foreground font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {pf.isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Publishing</>
            ) : (
              <>
                {pf.currentStep === steps.length - 1 ? 'Publish' : 'Continue'} 
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
