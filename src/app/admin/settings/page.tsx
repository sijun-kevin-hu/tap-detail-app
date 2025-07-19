"use client";

import { useState, useRef, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  ServiceMenu, 
  NewService, 
  ProfileSettings, 
  defaultNewService, 
  defaultProfileSettings, 
  serviceCategories,
  ServiceCategory,
  ServiceChangeHandler,
  ServiceDeleteHandler
} from "@/lib/models/settings";
import {
  getServices,
  addService,
  updateService,
  deleteService,
  reorderServices,
  getProfile,
  updateProfile
} from "@/lib/firebase/firestore-settings";
import {
  updateDetailerProfileImage,
  addDetailerGalleryImage,
  removeDetailerGalleryImage,
  updateDetailerBio
} from "@/lib/firebase/firestore-detailers";

// Helper function to format price
const formatPrice = (price: number): string => {
  if (price === 0) return '$0.00';
  return `$${price.toFixed(2)}`;
};

export default function SettingsPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<ProfileSettings>(defaultProfileSettings);
  const [originalProfile, setOriginalProfile] = useState<ProfileSettings>(defaultProfileSettings);
  const [profileModified, setProfileModified] = useState(false);

  // Collapsible state
  const [profileOpen, setProfileOpen] = useState(true);
  const [servicesOpen, setServicesOpen] = useState(false);

  // Service state
  const [services, setServices] = useState<ServiceMenu[]>([]);
  const [originalServices, setOriginalServices] = useState<ServiceMenu[]>([]);
  const [modifiedServices, setModifiedServices] = useState<Set<number>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newService, setNewService] = useState<NewService>(defaultNewService);
  
  // Refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Load data from Firestore
  useEffect(() => {
    const loadData = async () => {
      if (!firebaseUser?.uid) return;
      
      try {
        setLoading(true);
        const [profileData, servicesData] = await Promise.all([
          getProfile(firebaseUser.uid),
          getServices(firebaseUser.uid)
        ]);
        
        setProfile(profileData);
        setOriginalProfile(profileData);
        setServices(servicesData);
        setOriginalServices(servicesData);
        setModifiedServices(new Set());
        setProfileModified(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to default data if loading fails
        setProfile(defaultProfileSettings);
        setOriginalProfile(defaultProfileSettings);
        setServices([]);
        setOriginalServices([]);
        setModifiedServices(new Set());
        setProfileModified(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [firebaseUser?.uid]);

  // Profile image upload
  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    // Update local state immediately for UI responsiveness
    setProfile(prev => ({ ...prev, profileImage: url }));
    
    // Track that profile has been modified
    setProfileModified(true);
  };
  
  // Gallery image upload
  const handleGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    
    // Update local state immediately for UI responsiveness
    setProfile(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...urls] }));
    
    // Track that profile has been modified
    setProfileModified(true);
  };
  
  const removeGalleryImage = (idx: number) => {
    const updatedGallery = profile.galleryImages.filter((_, i) => i !== idx);
    
    // Update local state immediately for UI responsiveness
    setProfile(prev => ({ ...prev, galleryImages: updatedGallery }));
    
    // Track that profile has been modified
    setProfileModified(true);
  };

  // Drag and drop for services
  const handleDragStart = (idx: number) => setDraggedIndex(idx);
  const handleDragOver = (idx: number) => {
    if (draggedIndex === null || draggedIndex === idx) return;
    setServices((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(idx, 0, removed);
      return updated;
    });
    setDraggedIndex(idx);
  };
  const handleDragEnd = async () => {
    if (!firebaseUser?.uid) return;
    
    // Check if order has changed
    const hasOrderChanged = services.some((service, index) => 
      originalServices[index]?.id !== service.id
    );
    
    if (hasOrderChanged) {
      // Mark all services as modified for reordering
      const allServiceIndices = services.map((_, index) => index);
      setModifiedServices(prev => new Set([...prev, ...allServiceIndices]));
    }
    
    setDraggedIndex(null);
  };

  // Service edit/delete
  const handleServiceChange = (idx: number, field: string, value: any) => {
    const updatedServices = services.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    setServices(updatedServices);
    
    // Track that this service has been modified
    setModifiedServices(prev => new Set([...prev, idx]));
  };
  
  const handleServiceDelete = async (idx: number) => {
    if (!firebaseUser?.uid) return;
    
    const serviceToDelete = services[idx];
    const updatedServices = services.filter((_, i) => i !== idx);
    setServices(updatedServices);
    
    try {
      await deleteService(firebaseUser.uid, serviceToDelete.documentId);
      // Remove from modified services if it was tracked
      setModifiedServices(prev => {
        const newSet = new Set(prev);
        newSet.delete(idx);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      // Revert on error
      setServices(services);
    }
  };

  // Save modified services
  const handleSaveServices = async () => {
    if (!firebaseUser?.uid || modifiedServices.size === 0) return;
    
    try {
      setSaving(true);
      
      // Check if order has changed
      const hasOrderChanged = services.some((service, index) => 
        originalServices[index]?.id !== service.id
      );
      
      // Save all modified services
      for (const serviceIndex of modifiedServices) {
        const service = services[serviceIndex];
        const originalService = originalServices[serviceIndex];
        
        // Only update fields that have actually changed
        const changes: any = {};
        Object.keys(service).forEach(key => {
          if (service[key as keyof ServiceMenu] !== originalService[key as keyof ServiceMenu]) {
            changes[key] = service[key as keyof ServiceMenu];
          }
        });
        
        if (Object.keys(changes).length > 0) {
          await updateService(firebaseUser.uid, service.documentId, changes);
        }
      }
      
      // Handle reordering if needed
      if (hasOrderChanged) {
        await reorderServices(firebaseUser.uid, services);
      }
      
      // Update original services and clear modified set
      setOriginalServices([...services]);
      setModifiedServices(new Set());
      
    } catch (error) {
      console.error('Error saving services:', error);
      // Revert on error
      setServices(originalServices);
    } finally {
      setSaving(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!firebaseUser?.uid || !profileModified) return;
    
    try {
      setSaving(true);
      
      // Handle profile image changes
      if (profile.profileImage !== originalProfile.profileImage && profile.profileImage) {
        await updateDetailerProfileImage(firebaseUser.uid, profile.profileImage);
      }
      
      // Handle gallery image changes
      const addedImages = profile.galleryImages.filter(img => !originalProfile.galleryImages.includes(img));
      const removedImages = originalProfile.galleryImages.filter(img => !profile.galleryImages.includes(img));
      
      // Add new gallery images
      for (const imageUrl of addedImages) {
        await addDetailerGalleryImage(firebaseUser.uid, imageUrl);
      }
      
      // Remove deleted gallery images
      for (const imageUrl of removedImages) {
        await removeDetailerGalleryImage(firebaseUser.uid, imageUrl);
      }
      
      // Save other profile changes
      await updateProfile(firebaseUser.uid, profile);
      
      // Update original profile and clear modified flag
      setOriginalProfile({ ...profile });
      setProfileModified(false);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      // Revert on error
      setProfile(originalProfile);
    } finally {
      setSaving(false);
    }
  };

  // Cancel profile changes
  const handleCancelProfileChanges = () => {
    setProfile({ ...originalProfile });
    setProfileModified(false);
  };

  // Cancel service changes
  const handleCancelChanges = () => {
    setServices([...originalServices]);
    setModifiedServices(new Set());
  };

  // Add new service
  const handleAddService = async () => {
    if (!firebaseUser?.uid) return;
    
    try {
      setSaving(true);
      const serviceId = await addService(firebaseUser.uid, newService);
      
      // Add the new service to local state with the returned ID
      const newServiceWithId = { 
        ...newService, 
        id: parseInt(serviceId) || Date.now(),
        documentId: serviceId 
      };
      setServices((prev) => [...prev, newServiceWithId]);
      
      // Reset form
      setNewService({
        name: "",
        description: "",
        duration: 60,
        durationUnit: "min",
        price: 0,
        category: "Exterior",
        image: "",
        active: true,
        buffer: 0,
        maxBookings: 1,
        requireConfirmation: false,
        tags: ["Exterior"],
      });
      setAddOpen(false);
    } catch (error) {
      console.error('Error adding service:', error);
    } finally {
      setSaving(false);
    }
  };

  // Profile update handler
  const handleProfileUpdate = (field: keyof ProfileSettings, value: any) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    
    // Track that profile has been modified
    setProfileModified(true);
  };

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
            <div className="card p-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  className="input-modern w-full"
                  value={profile.businessName}
                  onChange={(e) => handleProfileUpdate('businessName', e.target.value)}
                  placeholder="Your business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description / Bio</label>
                <textarea
                  className="input-modern w-full"
                  value={profile.bio}
                  onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                  rows={3}
                  placeholder="Tell your customers about your business..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={profileInputRef}
                    onChange={handleProfileImage}
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
                      <img src={img} alt="Gallery" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1"
                        onClick={() => removeGalleryImage(idx)}
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
                    onChange={handleGalleryImages}
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
                    onClick={handleSaveProfile}
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
                    onClick={handleCancelProfileChanges}
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
          )}
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
              {addOpen && (
                <div className="card p-4 mb-2 space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm">Basic Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                      <input
                        className="input-modern w-full"
                        value={newService.name}
                        onChange={e => setNewService(s => ({ ...s, name: e.target.value }))}
                        placeholder="e.g., Premium Wash, Interior Detail"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="input-modern w-full"
                        value={newService.description}
                        onChange={e => setNewService(s => ({ ...s, description: e.target.value }))}
                        rows={3}
                        placeholder="Describe what's included in this service..."
                      />
                    </div>
                  </div>

                  {/* Pricing & Duration */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm">Pricing & Duration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                        <input
                          className="input-modern w-full h-12 text-base"
                          type="number"
                          min={0}
                          step={0.01}
                          value={newService.price || ''}
                          onChange={e => {
                            const value = parseFloat(e.target.value) || 0;
                            setNewService(s => ({ ...s, price: value }));
                          }}
                          placeholder="0.00"
                          required
                        />
                      </div>
                                            <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          className="input-modern w-full h-12 text-base font-medium text-gray-900"
                          value={newService.category}
                          onChange={e => setNewService(s => ({ ...s, category: e.target.value as ServiceCategory }))}
                        >
                          {serviceCategories.map(cat => (
                            <option key={cat} value={cat} className="text-base font-medium">{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                        <div className="flex gap-3">
                          <input
                            className="input-modern flex-1 h-12 text-base"
                            type="number"
                            min={1}
                            value={newService.duration}
                            onChange={e => setNewService(s => ({ ...s, duration: Number(e.target.value) }))}
                            placeholder="60"
                            required
                          />
                          <select
                            className="input-modern flex-1/3 h-12 text-base font-medium text-gray-900"
                            value={newService.durationUnit}
                            onChange={e => setNewService(s => ({ ...s, durationUnit: e.target.value as 'min' | 'hr' }))}
                          >
                            <option value="min" className="text-base font-medium">Minutes</option>
                            <option value="hr" className="text-base font-medium">Hours</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Options */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm">Service Options</h4>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 pr-4">
                        <label className="block text-sm font-medium text-gray-700">Require Confirmation</label>
                        <p className="text-xs text-gray-500">Manual approval needed for bookings</p>
                      </div>
                      <Switch
                        checked={newService.requireConfirmation}
                        onChange={v => setNewService(s => ({ ...s, requireConfirmation: v }))}
                        className={`${newService.requireConfirmation ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0`}
                      >
                        <span className="sr-only">Require Confirmation</span>
                        <span
                          className={`${newService.requireConfirmation ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    </div>
                  </div>

                  {/* Scheduling Settings */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm">Scheduling Settings</h4>
                    <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time (min)</label>
                        <input
                          className="input-modern w-full h-12 text-base"
                          type="number"
                          min={0}
                          value={newService.buffer}
                          onChange={e => setNewService(s => ({ ...s, buffer: Number(e.target.value) }))}
                          placeholder="15"
                        />
                        <p className="text-xs text-gray-500 mt-2">Extra time between appointments</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Per Day</label>
                        <input
                          className="input-modern w-full h-12 text-base"
                          type="number"
                          min={1}
                          value={newService.maxBookings}
                          onChange={e => setNewService(s => ({ ...s, maxBookings: Number(e.target.value) }))}
                          placeholder="3"
                        />
                        <p className="text-xs text-gray-500 mt-2">Maximum bookings per day</p>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2"
                    onClick={handleAddService}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Service'
                    )}
                  </button>
                </div>
              )}
              {/* Service Cards */}
              {services.map((service, idx) => (
                <div
                  key={service.id}
                  className="card p-4 space-y-4 relative"
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
                  onDragEnd={handleDragEnd}
                >
                  {/* Header with Service Name and Active Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                        {service.image ? (
                          <img src={service.image} alt="Service" className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-gray-400"><PencilIcon className="h-5 w-5" /></span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          className="input-modern font-semibold text-gray-900 text-base w-full"
                          value={service.name}
                          onChange={e => handleServiceChange(idx, "name", e.target.value)}
                          placeholder="Service name"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Active</span>
                        <Switch
                          checked={service.active}
                          onChange={v => handleServiceChange(idx, "active", v)}
                          className={`${service.active ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}
                        >
                          <span className="sr-only">Active</span>
                          <span
                            className={`${service.active ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </div>
                      <button
                        type="button"
                        className="p-3 bg-red-50 hover:bg-red-100 rounded-full"
                        onClick={() => handleServiceDelete(idx)}
                        aria-label="Delete service"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      className="input-modern text-sm text-gray-600 w-full"
                      value={service.description}
                      onChange={e => handleServiceChange(idx, "description", e.target.value)}
                      rows={2}
                      placeholder="Describe what's included in this service..."
                    />
                  </div>

                  {/* Pricing and Duration */}
                  <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Price ($)</label>
                      <input
                        className="input-modern text-sm w-full h-10"
                        type="number"
                        min={0}
                        step={0.01}
                        value={service.price || ''}
                        onChange={e => {
                          const value = parseFloat(e.target.value) || 0;
                          handleServiceChange(idx, "price", value);
                        }}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Duration</label>
                      <div className="flex gap-2">
                        <input
                          className="input-modern text-sm flex-1 h-12"
                          type="number"
                          min={1}
                          value={service.duration}
                          onChange={e => handleServiceChange(idx, "duration", Number(e.target.value))}
                          placeholder="60"
                        />
                        <select
                          className="input-modern text-sm flex-1/3 h-12 font-medium text-gray-900"
                          value={service.durationUnit}
                          onChange={e => handleServiceChange(idx, "durationUnit", e.target.value)}
                        >
                          <option value="min" className="text-sm font-medium">min</option>
                          <option value="hr" className="text-sm font-medium">hr</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Category</label>
                    <select
                      className="input-modern text-sm w-full h-12 font-medium text-gray-900"
                      value={service.category}
                      onChange={e => handleServiceChange(idx, "category", e.target.value)}
                    >
                      {serviceCategories.map(cat => (
                        <option key={cat} value={cat} className="text-sm font-medium">{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Scheduling Settings */}
                  <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Buffer (min)</label>
                      <input
                        className="input-modern text-sm w-full h-10"
                        type="number"
                        min={0}
                        value={service.buffer}
                        onChange={e => handleServiceChange(idx, "buffer", Number(e.target.value))}
                        placeholder="15"
                      />
                      <p className="text-xs text-gray-500 mt-2">Extra time between appointments</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Max Per Day</label>
                      <input
                        className="input-modern text-sm w-full h-10"
                        type="number"
                        min={1}
                        value={service.maxBookings}
                        onChange={e => handleServiceChange(idx, "maxBookings", Number(e.target.value))}
                        placeholder="3"
                      />
                      <p className="text-xs text-gray-500 mt-2">Maximum bookings per day</p>
                    </div>
                  </div>

                  {/* Confirmation Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 pr-3">
                      <label className="block text-xs font-medium text-gray-600">Require Confirmation</label>
                      <p className="text-xs text-gray-500">Manual approval needed for bookings</p>
                    </div>
                    <Switch
                      checked={service.requireConfirmation}
                      onChange={v => handleServiceChange(idx, "requireConfirmation", v)}
                      className={`${service.requireConfirmation ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-10 items-center rounded-full transition-colors flex-shrink-0`}
                    >
                      <span className="sr-only">Require Confirmation</span>
                      <span
                        className={`${service.requireConfirmation ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Booking Page Button */}
        <button className="btn-primary w-full flex items-center justify-center gap-2 mt-8 py-3 rounded-xl">
          <EyeIcon className="h-5 w-5" />
          Preview My Booking Page
        </button>
      </div>
    </div>
  );
} 





