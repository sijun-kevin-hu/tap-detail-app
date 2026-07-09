import React, { useRef, useState } from 'react';
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ProfileSettings } from '@/lib/models/settings';
import Image from 'next/image';

interface ProfileSectionProps {
  profile: ProfileSettings;
  profileModified: boolean;
  saving: boolean;
  onProfileUpdate: (field: keyof ProfileSettings, value: string | string[] | null) => void;
  onSaveProfile: () => void;
  onCancelProfileChanges: () => void;
  onProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGalleryImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGalleryImage: (idx: number) => void;
  pendingProfileImage?: File | null;
  pendingGalleryImages?: File[];
}

export default function ProfileSection({
  profile,
  profileModified,
  saving,
  onProfileUpdate,
  onSaveProfile,
  onCancelProfileChanges,
  onProfileImageChange,
  onGalleryImagesChange,
  onRemoveGalleryImage,
  pendingProfileImage,
  pendingGalleryImages
}: ProfileSectionProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Location state for City and State
  const [city, setCity] = useState(() => {
    if (profile.location) {
      const [c] = profile.location.split(',');
      return c.trim();
    }
    return '';
  });
  const [state, setState] = useState(() => {
    if (profile.location) {
      const parts = profile.location.split(',');
      return parts[1] ? parts[1].trim() : '';
    }
    return '';
  });

  // Update combined location on change
  const handleLocationChange = (field: 'city' | 'state', value: string) => {
    if (field === 'city') setCity(value);
    if (field === 'state') setState(value);
    const newLocation = `${field === 'city' ? value : city}${(field === 'city' ? value : city) && (field === 'state' ? value : state) ? ', ' : ''}${field === 'state' ? value : state}`;
    onProfileUpdate('location' as keyof ProfileSettings, newLocation);
  };

  // Cap gallery images to 10
  const galleryCount = profile.galleryImages.length + (pendingGalleryImages ? pendingGalleryImages.length : 0);
  const canAddMoreGallery = galleryCount < 10;

  return (
    <div className="card p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
        <input
          className="input-modern w-full"
          value={profile.businessName}
          onChange={(e) => onProfileUpdate('businessName', e.target.value)}
          placeholder="Your business name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description / Bio</label>
        <textarea
          className="input-modern w-full"
          value={profile.bio}
          onChange={(e) => onProfileUpdate('bio', e.target.value)}
          rows={3}
          placeholder="Tell your customers about your business..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
            {pendingProfileImage ? (
              <Image src={URL.createObjectURL(pendingProfileImage)} alt="Profile Preview" className="object-cover w-full h-full" width={80} height={80} />
            ) : profile.profileImage ? (
              <Image src={profile.profileImage} alt="Profile" className="object-cover w-full h-full" width={80} height={80} />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={profileInputRef}
            onChange={onProfileImageChange}
          />
          <button
            type="button"
            className="btn-secondary px-3 py-2"
            onClick={() => profileInputRef.current?.click()}
          >
            Upload
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <div className="flex gap-2">
          <input
            className="input-modern flex-1/4 min-w-0"
            value={city}
            onChange={(e) => handleLocationChange('city', e.target.value)}
            placeholder="City"
            maxLength={40}
          />
          <input
            className="input-modern flex-1 w-20"
            value={state}
            onChange={(e) => handleLocationChange('state', e.target.value)}
            placeholder="State"
            maxLength={20}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Format: City, State (e.g., Los Angeles, CA)</p>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Service Gallery Images</label>
          <span className="text-xs text-gray-400">{galleryCount}/10</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {profile.galleryImages.map((img: string, idx: number) => (
            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
              <Image src={img} alt="Gallery" className="object-cover w-full h-full" width={80} height={80} />
              <button
                type="button"
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                onClick={() => onRemoveGalleryImage(idx)}
                aria-label="Delete image"
              >
                <TrashIcon className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ))}
          {pendingGalleryImages && pendingGalleryImages.map((file, idx) => (
            <div key={`pending-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
              <Image src={URL.createObjectURL(file)} alt="Pending Gallery Preview" className="object-cover w-full h-full" width={80} height={80} />
              <button
                type="button"
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                onClick={() => onRemoveGalleryImage(profile.galleryImages.length + idx)}
                aria-label="Delete image"
              >
                <TrashIcon className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ))}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={galleryInputRef}
            onChange={onGalleryImagesChange}
            disabled={!canAddMoreGallery}
          />
          <button
            type="button"
            className={`w-20 h-20 rounded-xl flex items-center justify-center border flex-shrink-0 ${canAddMoreGallery ? 'bg-gray-100 border-dashed border-gray-300 text-gray-400 text-3xl' : 'bg-gray-200 border-gray-300 text-gray-300 cursor-not-allowed'}`}
            onClick={() => canAddMoreGallery && galleryInputRef.current?.click()}
            disabled={!canAddMoreGallery}
            title={canAddMoreGallery ? 'Add Image' : 'Maximum 10 images allowed'}
          >
            <PlusIcon className="h-8 w-8" />
          </button>
        </div>
        {!canAddMoreGallery && <p className="text-xs text-red-500 mt-1">Maximum 10 images allowed in the gallery.</p>}
      </div>
      
      {/* Save Profile Changes Button - Only show when there are modifications */}
      {profileModified && (
        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
          <button
            className="flex-1 flex items-center justify-center gap-2 btn-primary py-3 rounded-xl"
            onClick={onSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Profile
              </>
            )}
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 btn-secondary py-3 rounded-xl"
            onClick={onCancelProfileChanges}
            disabled={saving}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
} 