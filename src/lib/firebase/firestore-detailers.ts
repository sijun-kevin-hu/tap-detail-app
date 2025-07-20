import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './client-app';
import { Detailer } from '@/lib/models/detailer';
import { ProfileSettings } from '@/lib/models/settings';
import { addService } from './firestore-settings';
import { AvailabilitySettings } from '@/lib/models/detailer';

// Firestore Structure:
// /detailers/{detailerId} → profile info
// /detailers/{detailerId}/services/{serviceId} → list of available services
// /detailer/{detailerId}/appointments/{appointmentId} → client booking data

// Types for Firestore data
export interface FirestoreDetailer extends Omit<Detailer, 'createdAt' | 'updatedAt'> {
  businessId: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * Get a detailer by ID
 * @param detailerId - The detailer's unique identifier
 * @returns Promise<Detailer | null> - The detailer data or null if not found
 */
export const getDetailer = async (detailerId: string): Promise<Detailer | null> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerId);
    const detailerDoc = await getDoc(detailerRef);
    
    if (detailerDoc.exists()) {
      const data = detailerDoc.data() as FirestoreDetailer;
      return {
        uid: data.uid,
        businessId: data.businessId || '',
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        businessName: data.businessName || '',
        phone: data.phone || '',
        role: data.role || 'detailer',
        isActive: data.isActive !== undefined ? data.isActive : true,
        bio: data.bio || '',
        profileImage: data.profileImage || null,
        galleryImages: data.galleryImages || [],
        location: data.location || '',
        services: data.services || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching detailer:', error);
    throw new Error('Failed to fetch detailer');
  }
};

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_HOURS = { start: '09:00', end: '17:00' };
const DEFAULT_BUFFER = 15;
const DEFAULT_TIMEZONE = 'America/New_York';
function getDefaultBusinessHours() {
  return Object.fromEntries(WEEKDAYS.map(d => [d, { ...DEFAULT_HOURS }])) as { [day: string]: { start: string; end: string } };
}
function getDefaultAvailability(): AvailabilitySettings {
  return {
    businessHours: getDefaultBusinessHours(),
    workingDays: [...WEEKDAYS],
    breaks: [],
    bufferMinutes: DEFAULT_BUFFER,
    blockedDates: [],
    timezone: DEFAULT_TIMEZONE,
  };
}

/**
 * Create a new detailer
 * @param detailerData - The detailer data to create
 * @returns Promise<void>
 */
export const createDetailer = async (detailerData: Omit<Detailer, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerData.uid);
    const firestoreData: FirestoreDetailer = {
      ...detailerData,
      availability: getDefaultAvailability(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(detailerRef, firestoreData);
  } catch (error) {
    console.error('Error creating detailer:', error);
    throw new Error('Failed to create detailer');
  }
};

/**
 * Update a detailer's profile settings
 * @param detailerId - The detailer's unique identifier
 * @param profileData - The profile data to update
 * @returns Promise<void>
 */
export const updateDetailerProfile = async (
  detailerId: string, 
  profileData: Partial<ProfileSettings>
): Promise<void> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerId);
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(detailerRef, updateData);
  } catch (error) {
    console.error('Error updating detailer profile:', error);
    throw new Error('Failed to update detailer profile');
  }
};

/**
 * Update a detailer's basic information
 * @param detailerId - The detailer's unique identifier
 * @param detailerData - The detailer data to update
 * @returns Promise<void>
 */
export const updateDetailer = async (
  detailerId: string, 
  detailerData: Partial<Detailer>
): Promise<void> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerId);
    const updateData = {
      ...detailerData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(detailerRef, updateData);
  } catch (error) {
    console.error('Error updating detailer:', error);
    throw new Error('Failed to update detailer');
  }
};

/**
 * Get a detailer by business ID
 * @param businessId - The detailer's business identifier
 * @returns Promise<Detailer | null> - The detailer data or null if not found
 */
export const getDetailerByBusinessId = async (businessId: string): Promise<Detailer | null> => {
  try {
    const detailersRef = collection(db, 'detailers');
    const q = query(detailersRef, where('businessId', '==', businessId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data() as FirestoreDetailer;
      return {
        uid: data.uid,
        businessId: data.businessId,
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        businessName: data.businessName || '',
        phone: data.phone || '',
        role: data.role || 'detailer',
        isActive: data.isActive !== undefined ? data.isActive : true,
        bio: data.bio || '',
        profileImage: data.profileImage || null,
        galleryImages: data.galleryImages || [],
        location: data.location || '',
        services: data.services || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching detailer by business ID:', error);
    throw new Error('Failed to fetch detailer');
  }
};

/**
 * Get all detailers
 * @returns Promise<Detailer[]> - Array of all detailers
 */
export const getAllDetailers = async (): Promise<Detailer[]> => {
  try {
    const detailersRef = collection(db, 'detailers');
    const q = query(detailersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const detailers: Detailer[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as FirestoreDetailer;
      detailers.push({
        uid: data.uid,
        businessId: data.businessId || '',
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        businessName: data.businessName || '',
        phone: data.phone || '',
        role: data.role || 'detailer',
        isActive: data.isActive !== undefined ? data.isActive : true,
        bio: data.bio || '',
        profileImage: data.profileImage || null,
        galleryImages: data.galleryImages || [],
        location: data.location || '',
        services: data.services || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      });
    });
    
    return detailers;
  } catch (error) {
    console.error('Error fetching detailers:', error);
    throw new Error('Failed to fetch detailers');
  }
};

/**
 * Get active detailers only
 * @returns Promise<Detailer[]> - Array of active detailers
 */
export const getActiveDetailers = async (): Promise<Detailer[]> => {
  try {
    const detailersRef = collection(db, 'detailers');
    const q = query(detailersRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const detailers: Detailer[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as FirestoreDetailer;
      detailers.push({
        uid: data.uid,
        businessId: data.businessId || '',
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        businessName: data.businessName || '',
        phone: data.phone || '',
        role: data.role || 'detailer',
        isActive: data.isActive !== undefined ? data.isActive : true,
        bio: data.bio || '',
        profileImage: data.profileImage || null,
        galleryImages: data.galleryImages || [],
        location: data.location || '',
        services: data.services || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      });
    });
    
    return detailers;
  } catch (error) {
    console.error('Error fetching active detailers:', error);
    throw new Error('Failed to fetch active detailers');
  }
};

/**
 * Update detailer's profile image
 * @param detailerId - The detailer's unique identifier
 * @param imageUrl - The new profile image URL
 * @returns Promise<void>
 */
export const updateDetailerProfileImage = async (
  detailerId: string, 
  imageUrl: string
): Promise<void> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerId);
    await updateDoc(detailerRef, {
      profileImage: imageUrl,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    throw new Error('Failed to update profile image');
  }
};

/**
 * Add image to detailer's gallery
 * @param detailerId - The detailer's unique identifier
 * @param imageUrl - The image URL to add
 * @returns Promise<void>
 */
export const addDetailerGalleryImage = async (
  detailerId: string, 
  imageUrl: string
): Promise<void> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerId);
    const detailerDoc = await getDoc(detailerRef);
    
    if (detailerDoc.exists()) {
      const currentGallery = detailerDoc.data().galleryImages || [];
      await updateDoc(detailerRef, {
        galleryImages: [...currentGallery, imageUrl],
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error adding gallery image:', error);
    throw new Error('Failed to add gallery image');
  }
};

/**
 * Remove image from detailer's gallery
 * @param detailerId - The detailer's unique identifier
 * @param imageUrl - The image URL to remove
 * @returns Promise<void>
 */
export const removeDetailerGalleryImage = async (
  detailerId: string, 
  imageUrl: string
): Promise<void> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerId);
    const detailerDoc = await getDoc(detailerRef);
    
    if (detailerDoc.exists()) {
      const currentGallery = detailerDoc.data().galleryImages || [];
      const updatedGallery = currentGallery.filter((url: string) => url !== imageUrl);
      
      await updateDoc(detailerRef, {
        galleryImages: updatedGallery,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error removing gallery image:', error);
    throw new Error('Failed to remove gallery image');
  }
};

/**
 * Update detailer's bio/description
 * @param detailerId - The detailer's unique identifier
 * @param bio - The new bio text
 * @returns Promise<void>
 */
export const updateDetailerBio = async (
  detailerId: string, 
  bio: string
): Promise<void> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerId);
    await updateDoc(detailerRef, {
      bio,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating bio:', error);
    throw new Error('Failed to update bio');
  }
};

/**
 * Create base services for a new detailer
 * @param detailerId - The detailer's unique identifier
 * @returns Promise<void>
 */
export const createBaseServices = async (detailerId: string): Promise<void> => {
  try {
    // Base service 1: Basic Wash
    await addService(detailerId, {
      name: "Basic Wash",
      description: "Exterior wash and interior vacuum. Perfect for regular maintenance.",
      duration: 60,
      durationUnit: "min",
      price: 45,
      category: "Exterior",
      image: "",
      active: true,
      buffer: 15,
      maxBookings: 5,
      requireConfirmation: false,
      tags: ["Exterior", "Basic"],
    });

    // Base service 2: Interior Detail
    await addService(detailerId, {
      name: "Interior Detail",
      description: "Deep cleaning of interior surfaces, seats, and dashboard.",
      duration: 90,
      durationUnit: "min",
      price: 75,
      category: "Interior",
      image: "",
      active: true,
      buffer: 15,
      maxBookings: 3,
      requireConfirmation: false,
      tags: ["Interior", "Detail"],
    });

    // Base service 3: Full Detail
    await addService(detailerId, {
      name: "Full Detail",
      description: "Complete interior and exterior detailing service.",
      duration: 120,
      durationUnit: "min",
      price: 120,
      category: "Interior/Exterior",
      image: "",
      active: true,
      buffer: 15,
      maxBookings: 2,
      requireConfirmation: false,
      tags: ["Interior", "Exterior", "Full"],
    });
  } catch (error) {
    console.error('Error creating base services:', error);
    throw new Error('Failed to create base services');
  }
}; 

export const getDetailerAvailability = async (detailerId: string): Promise<AvailabilitySettings | null> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerId);
    const detailerDoc = await getDoc(detailerRef);
    if (detailerDoc.exists()) {
      const data = detailerDoc.data();
      const availability = data.availability || getDefaultAvailability();
      
      // Auto-fix corrupted business hours
      const fixedAvailability = fixCorruptedBusinessHours(availability);
      
      // If data was corrupted, save the fixed version
      if (JSON.stringify(availability) !== JSON.stringify(fixedAvailability)) {
        await updateDoc(detailerRef, { 
          availability: fixedAvailability, 
          updatedAt: serverTimestamp() 
        });
      }
      
      return fixedAvailability;
    }
    return null;
  } catch (error) {
    console.error('Error fetching detailer availability:', error);
    throw new Error('Failed to fetch detailer availability');
  }
};

/**
 * Fix corrupted business hours data
 * @param availability - The availability settings to fix
 * @returns Fixed availability settings
 */
function fixCorruptedBusinessHours(availability: AvailabilitySettings): AvailabilitySettings {
  const defaultHours = { start: '09:00', end: '17:00' };
  const fixedBusinessHours = { ...availability.businessHours };
  
  // Check each day and fix corrupted hours
  WEEKDAYS.forEach(day => {
    const hours = fixedBusinessHours[day];
    if (!hours || !hours.start || !hours.end) {
      fixedBusinessHours[day] = { ...defaultHours };
    }
  });
  
  return {
    ...availability,
    businessHours: fixedBusinessHours,
  };
}

export const updateDetailerAvailability = async (detailerId: string, availability: AvailabilitySettings): Promise<void> => {
  try {
    const detailerRef = doc(db, 'detailers', detailerId);
    await updateDoc(detailerRef, { availability, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating detailer availability:', error);
    throw new Error('Failed to update detailer availability');
  }
}; 