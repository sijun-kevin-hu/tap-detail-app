import React, { useRef } from 'react';
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
  onRemoveGalleryImage
}: ProfileSectionProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
            {profile.profileImage ? (
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Service Gallery Images</label>
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
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={galleryInputRef}
            onChange={onGalleryImagesChange}
          />
          <button
            type="button"
            className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 text-gray-400 text-3xl flex-shrink-0"
            onClick={() => galleryInputRef.current?.click()}
          >
            <PlusIcon className="h-8 w-8" />
          </button>
        </div>
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