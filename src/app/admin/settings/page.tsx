"use client";

import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, EyeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";
import ProfileSection from "@/components/settings/ProfileSection";
import AddServiceForm from "@/components/settings/AddServiceForm";
import ServiceCard from "@/components/settings/ServiceCard";
import ReminderSettings from "@/components/settings/ReminderSettings";
import AvailabilitySettings from '@/components/settings/AvailabilitySettings';

// Helper function to format price
const formatPrice = (price: number): string => {
  if (price === 0) return '$0.00';
  return `$${price.toFixed(2)}`;
};

export default function SettingsPage() {
  const router = useRouter();
  const {
    loading,
    saving,
    profile,
    originalProfile,
    profileModified,
    detailer,
    profileOpen,
    servicesOpen,
    services,
    originalServices,
    modifiedServices,
    draggedIndex,
    addOpen,
    newService,
    setProfileOpen,
    setServicesOpen,
    setAddOpen,
    setNewService,
    handleProfileImage,
    handleGalleryImages,
    removeGalleryImage,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleServiceChange,
    handleServiceDelete,
    handleSaveServices,
    handleSaveProfile,
    handleCancelProfileChanges,
    handleCancelChanges,
    handleAddService,
    handleProfileUpdate
  } = useSettings();

  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-2 py-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
            aria-label="Go back to dashboard"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Profile Settings */}
        <div className="mb-6">
          <button
            className="w-full flex justify-between items-center px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-2"
            onClick={() => setProfileOpen((o) => !o)}
          >
            <span className="font-semibold text-gray-900">Profile Settings</span>
            {profileOpen ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {profileOpen && (
            <ProfileSection
              profile={profile}
              originalProfile={originalProfile}
              profileModified={profileModified}
              saving={saving}
              onProfileUpdate={handleProfileUpdate}
              onSaveProfile={handleSaveProfile}
              onCancelProfileChanges={handleCancelProfileChanges}
              onProfileImageChange={handleProfileImage}
              onGalleryImagesChange={handleGalleryImages}
              onRemoveGalleryImage={removeGalleryImage}
            />
          )}
        </div>

        {/* Availability Settings */}
        {detailer?.uid && (
          <div className="mb-6">
            <button
              className="w-full flex justify-between items-center px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-2"
              onClick={() => setAvailabilityOpen((o) => !o)}
            >
              <span className="font-semibold text-gray-900">Availability Settings</span>
              {availabilityOpen ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {availabilityOpen && (
              <AvailabilitySettings detailerId={detailer.uid} />
            )}
          </div>
        )}

        {/* TODO: Re-enable reminder settings when Twilio integration is ready
        <div className="mb-6">
          <ReminderSettings
            config={{
              enabled: true,
              hoursBeforeAppointment: 24,
              messageTemplate: undefined
            }}
            onConfigChange={(config) => {
              // TODO: Save reminder config to Firestore
            }}
          />
        </div>
        */}

        {/* Feature Coming Soon - Auto Reminders */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM20 4v6h-2V4h2zM4 4h6v2H4V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Auto Reminders</h3>
                <p className="text-sm text-gray-600">SMS reminder feature temporarily disabled</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Feature Coming Soon
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      The SMS reminder feature is currently disabled. This will be re-enabled once Twilio integration is fully implemented.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Menu */}
        <div className="mb-6">
          <button
            className="w-full flex justify-between items-center px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-2"
            onClick={() => setServicesOpen((o) => !o)}
          >
            <span className="font-semibold text-gray-900">Service Menu</span>
            {servicesOpen ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {servicesOpen && (
            <div className="space-y-4">
              {/* Save Changes Button - Only show when there are modifications */}
              {modifiedServices.size > 0 && (
                <div className="flex gap-2 mb-4">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 btn-primary py-3 rounded-xl"
                    onClick={handleSaveServices}
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
                        Save Changes ({modifiedServices.size})
                      </>
                    )}
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 btn-secondary py-3 rounded-xl"
                    onClick={handleCancelChanges}
                    disabled={saving}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </div>
              )}

              {/* Add New Service Button */}
              <button
                className="w-full flex items-center justify-center gap-2 btn-primary py-3 rounded-xl mb-2"
                onClick={() => setAddOpen((o) => !o)}
              >
                <PlusIcon className="h-5 w-5" />
                Add New Service
              </button>
              
              {/* Add New Service Form */}
              <AddServiceForm
                isOpen={addOpen}
                newService={newService}
                setNewService={setNewService}
                onSubmit={handleAddService}
                onClose={() => setAddOpen(false)}
                saving={saving}
              />
              
              {/* Service Cards */}
              {services.map((service, idx) => (
                <ServiceCard
                  key={service.documentId}
                  service={service}
                  index={idx}
                  draggedIndex={draggedIndex}
                  onServiceChange={handleServiceChange}
                  onServiceDelete={handleServiceDelete}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preview Booking Page Button */}
        {detailer?.businessId && (
          <a href={`/booking/${detailer.businessId}`} className="btn-primary w-full flex items-center justify-center gap-2 mt-8 py-3 rounded-xl">
            <EyeIcon className="h-5 w-5" />
            Preview My Booking Page
          </a>
        )}
      </div>
    </div>
  );
} 





