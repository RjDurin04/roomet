"use client";

import { Camera, Loader2, Mail } from 'lucide-react';
import React from 'react';

interface ProfileCardProps {
  user: { name?: string | null; email?: string | null; image?: string | null | undefined } | undefined;
  isUploading: boolean;
  onImageClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileCard({ user, isUploading, onImageClick, fileInputRef, onFileChange }: ProfileCardProps) {
  const avatarUrl = user?.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'User')}&background=1a1a1a&color=fff&size=80&font-size=0.35`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-5">
        <div className="relative group">
          {isUploading ? (
            <div className="w-20 h-20 rounded-2xl ring-2 ring-border bg-muted flex flex-col items-center justify-center animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-20 h-20 rounded-2xl ring-2 ring-border object-cover"
            />
          )}
          <button onClick={onImageClick} className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
            <Camera className="w-5 h-5" />
          </button>
          <input type="file" ref={fileInputRef} onChange={onFileChange} hidden accept="image/*" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{user?.name ?? 'Your Name'}</h2>
          <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" /> {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
