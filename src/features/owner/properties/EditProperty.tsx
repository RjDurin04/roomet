import React, { useState, useEffect } from 'react';
import { validateImageFiles, UPLOAD_LIMITS } from '@/lib/upload-validation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Info, Home, Image as ImageIcon, Check, ChevronRight,
  ChevronLeft, BedDouble, Upload, X, Phone, Mail, FileText,
  ShieldCheck, Wifi, Car, Trash2, Plus, Minus, Users, Eye, Loader2, ChevronDown,
  BookOpen, Utensils, Wind, Dumbbell
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Map, MapControls, MapMarker, MarkerContent } from '../../../components/ui/map';
import type { Id } from '../../../../convex/_generated/dataModel';

function UnitTypeSelect({ value, onChange, isError }: { value: string, onChange: (val: string) => void, isError?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['Shared', 'Single', 'Studio', 'Suite'];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); }}
        className={`w-full flex items-center justify-between text-lg font-bold transition-colors pr-2 text-left ${isError ? 'text-rose-500 hover:text-rose-600' : 'text-foreground hover:text-primary'}`}
      >
        <span className={!value ? (isError ? 'text-rose-400/70' : 'text-muted-foreground/30') : ''}>{value || 'Select Type'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isError ? 'text-rose-500' : 'text-muted-foreground/50'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); }} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-[-16px] right-[-16px] mt-2 bg-card/90 border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 backdrop-blur-xl"
            >
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full px-5 py-2.5 text-left text-[13px] font-bold transition-colors hover:bg-primary/10 hover:text-primary ${value === option ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
                >
                  {option}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const steps = [
  { id: 'info', title: 'Basics', icon: Info, description: 'General property details' },
  { id: 'location', title: 'Location', icon: MapPin, description: 'Set address & map pin' },
  { id: 'rooms', title: 'Units', icon: BedDouble, description: 'Room types & pricing' },
  { id: 'amenities', title: 'Features', icon: Home, description: 'Perks & house rules' },
  { id: 'images', title: 'Gallery', icon: ImageIcon, description: 'Upload property photos' },
  { id: 'preview', title: 'Preview', icon: Eye, description: 'Review & Publish Changes' },
];

function RoomUnitCard({
  room,
  idx,
  onUpdate,
  onRemove,
  errors
}: {
  room: any,
  idx: number,
  onUpdate: (idx: number, updates: any) => void,
  onRemove: (id: string) => void,
  errors: Record<string, string>
}) {
  const [customInput, setCustomInput] = useState('');

  const addCustom = () => {
    if (customInput.trim() && !room.amenities.includes(customInput.trim())) {
      onUpdate(idx, { amenities: [...(room.amenities || []), customInput.trim()] });
      setCustomInput('');
    }
  };

  return (
    <motion.div
      layout
      key={room.id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-card border border-border/50 rounded-[24px] p-5 group hover:border-primary/40 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />

      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
              <BedDouble className="w-5 h-5" />
            </div>
            <div className="flex gap-4 flex-1 min-w-0">
              <div className="flex-1">
                <label className={`text-[9px] font-black uppercase tracking-widest mb-1 block transition-colors ${errors[`room-${idx}-name`] ? 'text-rose-500' : 'text-muted-foreground'}`}>Unit Name</label>
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => { onUpdate(idx, { name: e.target.value }); }}
                  placeholder="e.g. Room 1"
                  className={`w-full bg-transparent border-0 outline-none p-0 text-lg font-black transition-all placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 shadow-none appearance-none ${errors[`room-${idx}-name`] ? 'text-rose-500 placeholder:text-rose-300/40' : 'text-foreground'}`}
                />
              </div>
              <div className="flex-1 relative">
                <label className={`text-[9px] font-black uppercase tracking-widest mb-1 block transition-colors ${errors[`room-${idx}-type`] ? 'text-rose-500' : 'text-muted-foreground'}`}>Unit Type</label>
                <UnitTypeSelect
                  value={room.type}
                  isError={!!errors[`room-${idx}-type`]}
                  onChange={(val) => { onUpdate(idx, { type: val }); }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-border/30">
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Gender Policy</label>
              <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50 h-10">
                {[
                  { id: 'mixed', label: 'Mixed', icon: Users },
                  { id: 'male', label: 'Male', icon: ShieldCheck },
                  { id: 'female', label: 'Female', icon: Check }
                ].map((policy) => (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => { onUpdate(idx, { gender: policy.id }); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${room.gender === policy.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <policy.icon className="w-2.5 h-2.5" />
                    {policy.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 min-w-[100px]">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Max Capacity</label>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/30 border border-border/50 shadow-inner h-10 group/cap">
                  <button
                    type="button"
                    disabled={room.type === 'Single' || (room.type === 'Shared' && room.capacity <= 2)}
                    onClick={() => { onUpdate(idx, { capacity: room.capacity - 1 }); }}
                    className="w-6 h-6 rounded-lg bg-background border border-border/50 flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className={`text-sm font-black tabular-nums ${room.type === 'Single' ? 'text-muted-foreground/50' : ''}`}>{room.capacity}</span>
                  <button
                    type="button"
                    disabled={room.type === 'Single'}
                    onClick={() => { onUpdate(idx, { capacity: room.capacity + 1 }); }}
                    className="w-6 h-6 rounded-lg bg-background border border-border/50 flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 min-w-[100px]">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Occupied</label>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/30 border border-border/50 shadow-inner h-10 group/occ">
                  <button
                    type="button"
                    disabled={room.occupied <= 0}
                    onClick={() => { onUpdate(idx, { occupied: (room.occupied ?? 0) - 1 }); }}
                    className="w-6 h-6 rounded-lg bg-background border border-border/50 flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-black tabular-nums">{room.occupied ?? 0}</span>
                  <button
                    type="button"
                    disabled={room.occupied >= room.capacity}
                    onClick={() => { onUpdate(idx, { occupied: (room.occupied ?? 0) + 1 }); }}
                    className="w-6 h-6 rounded-lg bg-background border border-border/50 flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[240px] shrink-0 bg-muted/20 rounded-[20px] p-4 border border-border/30 space-y-4 flex flex-col justify-center">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2.5">Pricing Model</label>
            <div className="flex bg-background p-1 rounded-xl border border-border/20 shadow-inner">
              <button
                onClick={() => { onUpdate(idx, { priceType: 'person' }); }}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${room.priceType === 'person' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                Per Person
              </button>
              <button
                onClick={() => { onUpdate(idx, { priceType: 'room' }); }}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${room.priceType === 'room' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                Whole Unit
              </button>
            </div>
          </div>

          <div className="pt-1">
            <label className={`block text-[9px] font-black uppercase tracking-widest mb-1 transition-colors ${errors[`room-${idx}-price`] ? 'text-rose-500' : 'text-muted-foreground'}`}>Monthly Rent</label>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black transition-colors ${errors[`room-${idx}-price`] ? 'text-rose-500' : 'text-primary'}`}>₱</span>
              <input
                type="text"
                value={room.price || ''}
                placeholder="0"
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  onUpdate(idx, { price: val ? Number(val) : 0 });
                }}
                className={`w-full h-12 bg-transparent border-b-2 outline-none text-2xl font-black tabular-nums tracking-tighter transition-colors ${errors[`room-${idx}-price`]
                    ? 'border-rose-500 text-rose-500 placeholder:text-rose-200/50'
                    : 'border-border focus:border-primary placeholder:text-muted-foreground/10'
                  }`}
              />
              <span className={`text-[12px] font-black uppercase tracking-widest mb-1.5 shrink-0 whitespace-nowrap transition-colors ${errors[`room-${idx}-price`] ? 'text-rose-400/50' : 'text-primary/40'}`}>/ {room.priceType === 'person' ? 'Head' : 'Unit'}</span>
            </div>
            {errors[`room-${idx}-price`] && <p className="text-rose-500 text-[9px] font-black uppercase mt-1 tracking-tighter">Requires amount</p>}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex flex-col gap-1 mb-3">
          <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground">Unit-Specific Features</label>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customInput}
            onChange={e => { setCustomInput(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="e.g. Own CR, Balcony..."
            className="flex-1 bg-muted/50 border border-border/30 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:border-primary transition-all"
          />
          <button
            onClick={addCustom}
            className="px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary transition-colors hover:text-primary-foreground font-bold text-[10px]"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {room.amenities?.map((custom: string) => (
              <motion.div
                key={custom}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-tight"
              >
                {custom}
                <button onClick={() => { onUpdate(idx, { amenities: room.amenities.filter((a: string) => a !== custom) }); }} className="hover:text-rose-500">
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={() => { onRemove(room.id); }}
        className="absolute top-2 right-2 w-8 h-8 rounded-full text-muted-foreground/20 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 dark:hover:bg-rose-500/10"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ImageItem {
  url: string;
  storageId?: string; // If from DB
  file?: File; // If newly uploaded
}

export function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existingProperty = useQuery(api.properties.getById, { id: id as Id<"properties"> });

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '', description: '', phone: '', email: '',
    address: 'Locating...', mapPin: { lat: 10.3157, lng: 123.8854 },
    rooms: [] as any[],
    amenities: [] as string[],
    rules: '',
    genderRestriction: 'mixed' as 'mixed' | 'male' | 'female',
  });

  const [images, setImages] = useState<ImageItem[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex Mutations
  const generateUploadUrl = useMutation(api.properties.generateUploadUrl);
  const updateProperty = useMutation(api.properties.update);

  const updateRoom = (idx: number, updates: any) => {
    setFormData(prev => {
      const newRooms = [...prev.rooms];
      const updatedRoom = { ...newRooms[idx], ...updates };

      if (updates.type) {
        if (updates.type === 'Single') {
          updatedRoom.capacity = 1;
        } else if (updates.type === 'Shared' && updatedRoom.capacity < 2) {
          updatedRoom.capacity = 2;
        }
      }

      if (updates.capacity !== undefined) {
        if (updatedRoom.type === 'Single') updatedRoom.capacity = 1;
        if (updatedRoom.type === 'Shared' && updatedRoom.capacity < 2) updatedRoom.capacity = 2;
      }

      updatedRoom.occupied = Math.max(0, Math.min(updatedRoom.occupied || 0, updatedRoom.capacity));

      newRooms[idx] = updatedRoom;
      return { ...prev, rooms: newRooms };
    });
  };

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  useEffect(() => {
    if (existingProperty) {
      setFormData({
        name: existingProperty.name,
        description: existingProperty.description,
        phone: existingProperty.contact.phone,
        email: existingProperty.contact.email,
        address: existingProperty.location.address,
        mapPin: { lat: existingProperty.location.lat, lng: existingProperty.location.lng },
        rooms: existingProperty.rooms.map(r => ({
          ...r,
          name: r.name || '', // Ensure name field exists
          gender: r.gender || 'mixed', // Ensure gender field exists
          id: r.id || crypto.randomUUID(), // Ensure id field exists
          price: Number(r.price),
          occupied: r.occupied ?? 0
        })),
        amenities: existingProperty.amenities || [],
        rules: existingProperty.rules + (existingProperty.visitingSchedule ? `\n\nVisiting Schedule: ${existingProperty.visitingSchedule}` : ''),
        genderRestriction: existingProperty.genderRestriction || 'mixed',
      });

      const initialImages = (existingProperty.images || []).map((storageId: string, idx: number) => ({
        url: existingProperty.imageUrls[idx] || '',
        storageId,
      }));
      setImages(initialImages);
    }
  }, [existingProperty]);

  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.file) URL.revokeObjectURL(img.url);
      });
    };
  }, [images]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.name.trim()) newErrors.name = 'Property name is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid phone number (7-15 digits)';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) newErrors.email = 'Invalid email address';
    } else if (step === 1) {
      if (!formData.address.trim() || formData.address === 'Locating...') newErrors.address = 'A valid address is required. Please set the map pin.';
    } else if (step === 2) {
      if (formData.rooms.length === 0) newErrors.rooms = 'At least one unit type is required';
      formData.rooms.forEach((room, i) => {
        if (!room.name.trim()) newErrors[`room-${i}-name`] = 'Unit name is required';
        if (!room.type.trim()) newErrors[`room-${i}-type`] = 'Unit type is required';
        if (!room.price || Number(room.price) <= 0) newErrors[`room-${i}-price`] = 'Valid price is required';
      });
    } else if (step === 3) {
      if (!formData.rules.trim()) newErrors.rules = 'House rules are required';
    } else if (step === 4) {
      if (images.length === 0) newErrors.images = 'At least one photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) setCurrentStep(curr => curr + 1);
      else handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(curr => Math.max(0, curr - 1));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    // SEC-004: Validate count
    if (images.length + files.length > UPLOAD_LIMITS.MAX_PROPERTY_IMAGES) {
      alert(`Maximum ${UPLOAD_LIMITS.MAX_PROPERTY_IMAGES} images allowed.`);
      return;
    }

    // SEC-004: Validate type and size
    const errors = validateImageFiles(files);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const newImageItems = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setImages(prev => [...prev, ...newImageItems]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newStorageIds: string[] = [];
      for (const img of images) {
        if (img.storageId) {
          newStorageIds.push(img.storageId);
        } else if (img.file) {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": img.file.type },
            body: img.file,
          });
          const { storageId } = await result.json();
          newStorageIds.push(storageId);
        }
      }

      const formattedRooms = formData.rooms.map(room => ({
        ...room,
        price: Number(room.price),
        occupied: Number(room.occupied)
      }));

      await updateProperty({
        id: id as Id<"properties">,
        name: formData.name,
        description: formData.description,
        contact: {
          phone: formData.phone,
          email: formData.email,
        },
        location: { address: formData.address, lat: formData.mapPin.lat, lng: formData.mapPin.lng },
        amenities: formData.amenities,
        rules: formData.rules,
        genderRestriction: formData.genderRestriction as "mixed" | "male" | "female",
        images: newStorageIds,
        rooms: formattedRooms,
      });

      navigate('/owner/properties');
    } catch (error) {
      console.error("Failed to update property:", error);
      alert("Failed to update property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!existingProperty) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">General Details</h3>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Property Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errors.name) setErrors({ ...errors, name: '' })
                    }}
                    placeholder="e.g. The Zenith Residencia"
                    className={`w-full h-14 px-5 rounded-2xl border ${errors.name ? 'border-red-500 focus:ring-red-500/10' : 'border-border/50 focus:border-primary focus:ring-primary/5'} bg-background/50 focus:bg-background focus:ring-4 outline-none transition-all placeholder:text-muted-foreground/30 font-medium`}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => {
                      setFormData({ ...formData, description: e.target.value })
                      if (errors.description) setErrors({ ...errors, description: '' })
                    }}
                    placeholder="What makes your boarding house special?"
                    className={`w-full h-40 p-5 rounded-2xl border ${errors.description ? 'border-red-500 focus:ring-red-500/10' : 'border-border/50 focus:border-primary'} bg-background/50 focus:bg-background outline-none transition-all resize-none placeholder:text-muted-foreground/30 font-medium leading-relaxed`}
                  />
                  {errors.description && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.description}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Contact Person</h3>
                </div>
                <div className={`bg-muted/30 p-6 rounded-[28px] border ${(errors.phone || errors.email) ? 'border-red-500/30' : 'border-border/50'} space-y-5`}>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                        setFormData({ ...formData, phone: val });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="09123456789"
                      className="w-full h-12 bg-transparent border-b border-border/50 focus:border-primary outline-none transition-colors font-bold text-lg"
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => {
                        setFormData({ ...formData, email: e.target.value })
                        if (errors.email) setErrors({ ...errors, email: '' })
                      }}
                      placeholder="owner@example.com"
                      className="w-full h-12 bg-transparent border-b border-border/50 focus:border-primary outline-none transition-colors font-bold text-lg"
                    />
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Step 1 no longer has gender policy */}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Location</h3>
                </div>
                <div className="relative group">
                  <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.address ? 'text-red-500' : 'text-primary'}`} />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => { setFormData({ ...formData, address: e.target.value }); }}
                    placeholder="Street address"
                    className="w-full h-16 pl-12 pr-4 rounded-[20px] bg-card border border-border/50 focus:border-primary outline-none font-bold text-sm"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.address}</p>}

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-[16px] bg-muted/30 border border-border/50 flex flex-col gap-1 shadow-inner group hover:bg-muted/40 transition-colors">
                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em]">Latitude</span>
                    <span className="font-bold text-sm tracking-tight text-foreground/80">{formData.mapPin.lat.toFixed(6)}</span>
                  </div>
                  <div className="p-4 rounded-[16px] bg-muted/30 border border-border/50 flex flex-col gap-1 shadow-inner group hover:bg-muted/40 transition-colors">
                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em]">Longitude</span>
                    <span className="font-bold text-sm tracking-tight text-foreground/80">{formData.mapPin.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px] rounded-[32px] overflow-hidden border border-border/50 bg-background relative shadow-inner lg:sticky lg:top-8">
                <Map
                  center={[formData.mapPin.lng, formData.mapPin.lat]}
                  zoom={15}
                  className="w-full h-full"
                >
                  <MapControls position="top-right" showZoom={true} />
                  <MapMarker
                    longitude={formData.mapPin.lng}
                    latitude={formData.mapPin.lat}
                    draggable={true}
                    onDragStart={() => { setFormData({ ...formData, address: 'Locating...' }); }}
                    onDragEnd={async (coords) => {
                      // SEC-007: Clamp coordinates to valid bounds
                      const lat = Math.max(-90, Math.min(90, coords.lat));
                      const lng = Math.max(-180, Math.min(180, coords.lng));
                      let newAddress = `${Math.abs(lat).toFixed(4)}°${lat > 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng > 0 ? 'E' : 'W'}`;
                      const controller = new AbortController();
                      const timeout = setTimeout(() => controller.abort(), 5000);
                      try {
                        const res = await fetch(
                          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                          { signal: controller.signal }
                        );
                        if (res.ok) {
                          const data = await res.json();
                          if (data?.display_name) newAddress = data.display_name;
                        }
                      } catch {
                        // Silently ignore geocoding errors - address can be manually entered
                      } finally {
                        clearTimeout(timeout);
                      }

                      setFormData({
                        ...formData,
                        mapPin: { lat, lng },
                        address: newAddress
                      });
                    }}
                  >
                    <MarkerContent>
                      <div className="group relative flex flex-col items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-xl border-2 border-background transform -translate-y-1 transition-transform group-hover:-translate-y-2 duration-300">
                          <MapPin className="w-6 h-6 text-primary-foreground fill-primary-foreground/20" />
                        </div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full -mt-1 shadow-lg ring-4 ring-primary/20" />
                      </div>
                    </MarkerContent>
                  </MapMarker>
                </Map>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Room Inventory</h3>
              </div>
              <button
                onClick={() => { setFormData({ ...formData, rooms: [...formData.rooms, { id: crypto.randomUUID(), name: '', type: '', gender: 'mixed', capacity: 1, occupied: 0, price: 0, priceType: 'person', amenities: [] }] }); }}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20"
              >
                <Plus className="w-4 h-4" /> Add Unit
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {formData.rooms.map((room, idx) => (
                <RoomUnitCard
                  key={room.id || idx}
                  room={room}
                  idx={idx}
                  errors={errors}
                  onUpdate={updateRoom}
                  onRemove={(id) => {
                    setFormData({ ...formData, rooms: formData.rooms.filter(r => r.id !== id) });
                  }}
                />
              ))}
            </div>
            {errors.rooms && <p className="text-red-500 font-medium">{errors.rooms}</p>}
          </div>
        );

      case 3:
        const commonAmenities = [
          { id: 'Wi-Fi', icon: Wifi },
          { id: 'CCTV', icon: ShieldCheck },
          { id: 'Parking', icon: Car },
          { id: 'Study Area', icon: BookOpen },
          { id: 'Kitchen', icon: Utensils },
          { id: 'Laundry', icon: Wind },
          { id: 'Gym', icon: Dumbbell }
        ];

        return (
          <div className="space-y-10">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Property Amenities</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select what your boarding house offers</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {commonAmenities.map(am => (
                  <button
                    key={am.id}
                    type="button"
                    onClick={() => {
                      if (formData.amenities.includes(am.id)) {
                        setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== am.id) });
                      } else {
                        setFormData({ ...formData, amenities: [...formData.amenities, am.id] });
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-tight transition-all ${formData.amenities.includes(am.id)
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                        : 'bg-background/50 text-muted-foreground border-border/50 hover:border-primary/50'
                      }`}
                  >
                    <am.icon className="w-3.5 h-3.5" />
                    {am.id}
                  </button>
                ))}
              </div>

              <div className="relative pt-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-border/30"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-card text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Or add custom</span>
                </div>
              </div>

              <div className="flex gap-3 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={e => { setCustomAmenity(e.target.value); }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), customAmenity.trim() && !formData.amenities.includes(customAmenity.trim()) && (setFormData({ ...formData, amenities: [...formData.amenities, customAmenity.trim()] }), setCustomAmenity('')))}
                    placeholder="e.g. Free Shuttle, Roof Deck..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-border/50 bg-background focus:border-primary outline-none text-sm font-bold shadow-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => customAmenity.trim() && !formData.amenities.includes(customAmenity.trim()) && (setFormData({ ...formData, amenities: [...formData.amenities, customAmenity.trim()] }), setCustomAmenity(''))}
                  className="px-6 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.amenities.filter(a => !commonAmenities.some(c => c.id === a)).map(am => (
                  <div key={am} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-foreground text-[10px] font-bold">
                    {am}
                    <button onClick={() => { setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== am) }); }} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/50" />

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-1">House Rules & Policies</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Guidelines for your tenants</p>
              </div>

              <div>
                <textarea
                  value={formData.rules}
                  onChange={e => { setFormData({ ...formData, rules: e.target.value }); }}
                  placeholder="e.g. No curfews. No smoking. Visiting hours: 8am-8pm. Noise policy..."
                  className="w-full h-48 p-5 rounded-2xl border border-border/50 bg-background/50 focus:bg-background focus:border-primary outline-none transition-all resize-none text-[13px] font-medium leading-relaxed placeholder:text-muted-foreground/30 shadow-inner"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div
              className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-[32px] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-all relative"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Upload className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Upload More Photos</h3>
              <p className="text-sm text-muted-foreground">Original images are preserved.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="aspect-square rounded-[24px] overflow-hidden bg-muted relative group border border-border/50 shadow-sm">
                  <img src={img.url} alt="Property" className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                      className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {i === 0 && <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest shadow-lg">Main Cover</div>}
                  {img.file && <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">New</div>}
                </div>
              ))}
              {errors.images && <div className="text-red-500 text-sm mt-4 col-span-full font-medium">{errors.images}</div>}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="bg-primary/5 rounded-[32px] p-8 border border-primary/20 flex flex-col items-center justify-center text-center">
              <Check className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-2xl font-black mb-2">Review Your Updates</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Once submitted, changes will be immediately visible on the public map.
              </p>
            </div>

            <div className="bg-card rounded-[32px] border border-border/70 shadow-sm overflow-hidden">
              <div className="relative h-[240px] w-full bg-muted">
                {images.length > 0 ? (
                  <img src={images[0].url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                    <span>No Image Provided</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                  <h1 className="text-3xl font-black tracking-tighter drop-shadow-md">{formData.name}</h1>
                  <p className="flex items-center gap-1.5 text-sm font-medium mt-1 text-white/90">
                    <MapPin className="w-4 h-4" /> {formData.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="h-full bg-background flex flex-col lg:flex-row">
      {/* Left Panel: Progress bar/Steps */}
      <div className="w-full lg:w-[320px] bg-background border-r border-border/50 shrink-0 flex flex-col sticky top-0 h-screen z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
        <div className="relative z-10">
          <div className="p-6 pb-2">
            <Link to="/owner/properties" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all mb-6 group">
              <div className="w-8 h-8 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span>Back to Properties</span>
            </Link>
            <h1 className="text-2xl font-black tracking-tight mb-1 select-none bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Edit Listing</h1>
            <p className="text-muted-foreground/60 text-[12px] font-medium leading-relaxed select-none">Modify your property details</p>
          </div>

          <div className="px-6 mt-1 mb-4 select-none">
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden shrink-0 mt-2">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center mt-2.5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-[10px] font-black text-muted-foreground/40 tabular-nums">{progress}%</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-12 relative z-10 no-scrollbar">
          <div className="absolute left-[33px] top-6 bottom-12 w-[1px] bg-border/30 hidden lg:block" />
          <div className="space-y-2 relative">
            {steps.map((step, idx) => {
              return (
                <button
                  key={idx}
                  disabled={idx > currentStep}
                  onClick={() => { setCurrentStep(idx); }}
                  className={`group w-full text-left p-3 rounded-[20px] flex items-center gap-4 transition-all duration-500 relative ${idx === currentStep
                      ? 'bg-primary/[0.08] backdrop-blur-md border border-primary/20 shadow-[0_20px_40px_rgba(0,0,0,0.1)]'
                      : 'border border-transparent hover:bg-muted/30'
                    } ${idx > currentStep ? 'opacity-40 grayscale-[50%]' : ''}`}
                >
                  {/* Active Indicator Line */}
                  {idx === currentStep && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute -left-1 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-500 relative ${idx === currentStep
                      ? 'bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/30 scale-110 rotate-[5deg]'
                      : idx < currentStep
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted/50 text-muted-foreground/30'
                    }`}>
                    <step.icon className={`w-4.5 h-4.5 ${idx === currentStep ? 'animate-pulse' : ''}`} />
                    {idx < currentStep && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] text-primary-foreground border-2 border-background shadow-sm">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-black text-[12px] uppercase tracking-wider transition-colors duration-300 ${idx === currentStep ? 'text-primary' : 'text-foreground'}`}>
                        {step.title}
                      </p>
                    </div>
                    <p className={`text-[10px] font-bold tracking-tight truncate mt-0.5 transition-colors duration-300 ${idx === currentStep ? 'text-primary/60' : 'text-muted-foreground/40'}`}>
                      {step.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Panel: Content Area */}
      <div className="flex-1 flex flex-col bg-background/50 relative">
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 pb-32 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {renderStepContent()}
            </motion.div>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex gap-4">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="h-14 px-8 rounded-full border border-border/50 font-bold hover:bg-muted/50 hover:border-primary/50 transition-all text-sm flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className={`h-14 px-10 rounded-full bg-primary text-primary-foreground font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? (
                <>Saving Changes <Loader2 className="w-4 h-4 animate-spin" /></>
              ) : currentStep === steps.length - 1 ? (
                <>Update Property <Check className="w-4 h-4" /></>
              ) : (
                <>Next Step <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
