import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  ServiceMenu, 
  NewService, 
  ProfileSettings, 
  defaultNewService, 
  defaultProfileSettings
} from '@/lib/models/settings';
import { Detailer } from '@/lib/models/detailer';
import {
  getServices,
  addService,
  updateService,
  deleteService,
  reorderServices,
  getProfile,
  updateProfile
} from '@/lib/firebase/firestore-settings';
import { getDetailer } from '@/lib/firebase';
import {
  updateDetailerProfileImage,
  addDetailerGalleryImage,
  removeDetailerGalleryImage
} from '@/lib/firebase/firestore-detailers';
import { uploadImage, deleteImage } from '@/lib/firebase/storage';

export function useSettings() {
  const { firebaseUser } = useAuth();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<ProfileSettings>(defaultProfileSettings);
  const [originalProfile, setOriginalProfile] = useState<ProfileSettings>(defaultProfileSettings);
  const [profileModified, setProfileModified] = useState(false);
  const [detailer, setDetailer] = useState<Detailer | null>(null);

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

  // Add state for pending images
  const [pendingProfileImage, setPendingProfileImage] = useState<File | null>(null);
  const [pendingGalleryImages, setPendingGalleryImages] = useState<File[]>([]);

  // Load data from Firestore
  useEffect(() => {
    const loadData = async () => {
      if (!firebaseUser?.uid) return;
      
      try {
        setLoading(true);
        const [profileData, servicesData, detailerData] = await Promise.all([
          getProfile(firebaseUser.uid),
          getServices(firebaseUser.uid),
          getDetailer(firebaseUser.uid)
        ]);
        
        setProfile(profileData);
        setOriginalProfile(profileData);
        setServices(servicesData);
        setOriginalServices(servicesData);
        setDetailer(detailerData);
        setModifiedServices(new Set());
        setProfileModified(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to default data if loading fails
        setProfile(defaultProfileSettings);
        setOriginalProfile(defaultProfileSettings);
        setServices([]);
        setOriginalServices([]);
        setDetailer(null);
        setModifiedServices(new Set());
        setProfileModified(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [firebaseUser?.uid]);

  // Profile image selection (defer upload)
  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setPendingProfileImage(e.target.files[0]);
    setProfileModified(true);
  };
  
  // Gallery image selection (defer upload)
  const handleGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    // Cap at 10 images total (existing + pending)
    setPendingGalleryImages(prev => {
      const total = profile.galleryImages.length + prev.length;
      const allowed = Math.max(0, 10 - total);
      return [...prev, ...files.slice(0, allowed)];
    });
    setProfileModified(true);
  };
  
  // Remove pending gallery image
  const removeGalleryImage = (idx: number) => {
    // Remove from pending if present, else from saved
    if (idx < profile.galleryImages.length) {
      // Remove from saved gallery images
      const updatedGallery = profile.galleryImages.filter((_, i) => i !== idx);
      setProfile(prev => ({ ...prev, galleryImages: updatedGallery }));
    } else {
      // Remove from pending
      const pendingIdx = idx - profile.galleryImages.length;
      setPendingGalleryImages(prev => prev.filter((_, i) => i !== pendingIdx));
    }
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
  const handleServiceChange = (idx: number, field: string, value: string | number | boolean) => {
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
        const changes: Partial<ServiceMenu> = {};
        (Object.keys(service) as (keyof ServiceMenu)[]).forEach(typedKey => {
          const value = service[typedKey];
          if (
            value !== undefined &&
            value !== originalService[typedKey]
          ) {
            (changes as Record<keyof ServiceMenu, unknown>)[typedKey] = value;
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

  // Save profile changes (upload images if needed)
  const handleSaveProfile = async () => {
    if (!firebaseUser?.uid || !profileModified) return;
    try {
      setSaving(true);
      let profileImageUrl = profile.profileImage;
      // Upload pending profile image if present
      if (pendingProfileImage) {
        const storagePath = `detailers/${firebaseUser.uid}/profile.jpg`;
        profileImageUrl = await uploadImage(pendingProfileImage, storagePath);
      }
      // Upload pending gallery images
      let galleryImages = [...profile.galleryImages];
      if (pendingGalleryImages.length > 0) {
        const uploadPromises = pendingGalleryImages.map((file) => {
          const storagePath = `detailers/${firebaseUser.uid}/gallery/${Date.now()}_${file.name}`;
          return uploadImage(file, storagePath);
        });
        const newUrls = await Promise.all(uploadPromises);
        galleryImages = [...galleryImages, ...newUrls].slice(0, 10); // Cap at 10
      }
      // Handle removed images (from saved gallery)
      const removedImages = originalProfile.galleryImages.filter(img => !galleryImages.includes(img));
      for (const imageUrl of removedImages) {
        await removeDetailerGalleryImage(firebaseUser.uid, imageUrl);
        // Also delete from Firebase Storage
        try {
          // Extract storage path from download URL
          const matches = decodeURIComponent(imageUrl).match(/o\/(.+)\?/);
          const storagePath = matches ? matches[1] : null;
          if (storagePath) {
            await deleteImage(storagePath);
          }
        } catch (err) {
          console.error('Failed to delete image from storage:', err);
        }
      }
      // Save to Firestore
      const updatedProfile = {
        ...profile,
        profileImage: profileImageUrl,
        galleryImages: galleryImages.slice(0, 10), // Cap at 10
        location: profile.location ?? '',
      };
      await updateDetailerProfileImage(firebaseUser.uid, profileImageUrl || '');
      for (const imageUrl of galleryImages.filter(img => !originalProfile.galleryImages.includes(img))) {
        await addDetailerGalleryImage(firebaseUser.uid, imageUrl);
      }
      await updateProfile(firebaseUser.uid, updatedProfile);
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setPendingProfileImage(null);
      setPendingGalleryImages([]);
      setProfileModified(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfile(originalProfile);
    } finally {
      setSaving(false);
    }
  };

  // Cancel profile changes
  const handleCancelProfileChanges = () => {
    setProfile({ ...originalProfile });
    setPendingProfileImage(null);
    setPendingGalleryImages([]);
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
        price: "",
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

  // Service image upload for new service
  const handleServiceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !firebaseUser?.uid) return;
    const file = e.target.files[0];
    const storagePath = `detailers/${firebaseUser.uid}/services/${Date.now()}_${file.name}`;
    setSaving(true);
    try {
      const url = await uploadImage(file, storagePath);
      setNewService(prev => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Error uploading service image:', error);
    } finally {
      setSaving(false);
    }
  };

  // Profile update handler
  const handleProfileUpdate = (field: keyof ProfileSettings, value: string | number | boolean | string[] | null) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    
    // Track that profile has been modified
    setProfileModified(true);
  };

  return {
    // State
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
    pendingProfileImage,
    pendingGalleryImages,
    
    // Actions
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
    handleProfileUpdate,
    handleServiceImage
  };
} 