"use client";

import { Plus } from 'lucide-react';

import { type PropertyFormData, type RoomFormData } from '../types';

import { RoomUnitCard } from './RoomUnitCard';

interface StepUnitsProps {
  formData: PropertyFormData;
  setFormData: (data: PropertyFormData) => void;
  errors: Record<string, string>;
}

export function StepUnits({ formData, setFormData, errors }: StepUnitsProps) {
  const updateRoom = (idx: number, updates: Partial<RoomFormData>) => {
    const newRooms = [...formData.rooms];
    // eslint-disable-next-line security/detect-object-injection -- State updates require index-based array access
    const updatedRoom = { ...newRooms[idx], ...updates } as RoomFormData;

    // 1. If type is changing, set sensible default capacity
    if (updates.type) {
      if (updates.type === 'Single') {
        updatedRoom.capacity = 1;
      } else if (updates.type === 'Shared') {
        // Only set to 2 if current capacity is less than 2
        updatedRoom.capacity = Math.max(2, updatedRoom.capacity || 0);
      }
    }

    updatedRoom.occupied = Math.max(0, Math.min(updatedRoom.occupied || 0, updatedRoom.capacity || 0));

    // eslint-disable-next-line security/detect-object-injection -- State updates require index-based array access
    newRooms[idx] = updatedRoom;
    setFormData({ ...formData, rooms: newRooms });
  };

  const addUnit = () => {
    setFormData({
      ...formData,
      rooms: [
        ...formData.rooms,
        {
          id: crypto.randomUUID(),
          name: '',
          type: '',
          gender: 'mixed',
          capacity: 1,
          occupied: 0,
          price: 0,
          priceType: 'person',
          amenities: []
        }
      ]
    });
  };

  const removeUnit = (id: string) => {
    setFormData({
      ...formData,
      rooms: formData.rooms.filter(r => r.id !== id)
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold mb-1">Room Inventory</h3>
        </div>
        <button
          onClick={addUnit}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Unit
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {formData.rooms.map((room, idx) => (
          <RoomUnitCard
            key={room.id}
            room={room}
            idx={idx}
            errors={errors}
            onUpdate={updateRoom}
            onRemove={removeUnit}
          />
        ))}
      </div>
      {Boolean(errors['rooms']) && <p className="text-red-500 font-medium">{errors['rooms']}</p>}
    </div>
  );
}
