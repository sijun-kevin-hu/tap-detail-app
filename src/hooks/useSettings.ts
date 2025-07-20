import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  ServiceMenu, 
  NewService, 
  ProfileSettings, 
  defaultNewService, 
  defaultProfileSettings, 
  ServiceCategory
} from '@/lib/models/settings';
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
  removeDetailerGalleryImage,
  updateDetailerBio
} from '@/lib/firebase/firestore-detailers';

export function useSettings() {
  const { firebaseUser } = useAuth();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<ProfileSettings>(defaultProfileSettings);
  const [originalProfile, setOriginalProfile] = useState<ProfileSettings>(defaultProfileSettings);
  const [profileModified, setProfileModified] = useState(false);
  const [detailer, setDetailer] = useState<any>(null);

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
    handleProfileUpdate
  };
} 