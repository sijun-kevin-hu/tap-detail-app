import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  writeBatch,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { db } from './client-app';
import { ServiceMenu, ProfileSettings, NewService } from '@/lib/models/settings';
import { getDetailer, updateDetailerProfile } from './firestore-detailers';

// Types for Firestore data
export interface FirestoreService {
  id: string;
  documentId: string;
  sortIndex: number;
  name: string;
  description: string;
  duration: number;
  durationUnit: string;
  price: string;
  category: string;
  image: string;
  active: boolean;
  buffer: number;
  maxBookings: number;
  requireConfirmation: boolean;
  tags: string[];
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
}

export interface FirestoreProfile extends ProfileSettings {
  updatedAt: Timestamp;
}

// Firestore Structure:
// /detailers/{detailerId} → profile info
// /detailers/{detailerId}/services/{serviceId} → list of available services
// /detailers/{detailerId}/appointments/{appointmentId} → client booking data

// Service Functions
/**
 * Get all services for a detailer
 * @param detailerId - The detailer's unique identifier
 * @returns Promise<ServiceMenu[]> - Array of services ordered by sortIndex
 */
export const getServices = async (detailerId: string): Promise<ServiceMenu[]> => {
  try {
    const servicesRef = collection(db, 'detailers', detailerId, 'services');
    const q = query(servicesRef, orderBy('sortIndex', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const services: ServiceMenu[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      services.push({
        id: parseInt(doc.id) || Date.now(), // Convert string ID to number for compatibility
        documentId: doc.id, // Store the actual Firestore document ID
        name: data.name || '',
        description: data.description || '',
        duration: data.duration || 60,
        durationUnit: data.durationUnit || 'min',
        price: data.price?.toString() || '',
        category: data.category || 'Exterior',

        image: data.image || '',
        active: data.active !== undefined ? data.active : true,
        buffer: data.buffer || 0,
        maxBookings: data.maxBookings || 1,
        requireConfirmation: data.requireConfirmation || false,
        tags: data.tags || [],
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : new Date(),
      });
    });
    
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error('Failed to fetch services');
  }
};

/**
 * Add a new service for a detailer
 * @param detailerId - The detailer's unique identifier
 * @param serviceData - The service data to add
 * @returns Promise<string> - The new service document ID
 */
export const addService = async (detailerId: string, serviceData: NewService): Promise<string> => {
  try {
    const servicesRef = collection(db, 'detailers', detailerId, 'services');
    
    // Get current services to determine sort index
    const existingServices = await getServices(detailerId);
    const sortIndex = existingServices.length;
    
    const newService: FirestoreService = {
      ...serviceData,
      id: '', // Will be set by Firestore
      documentId: '', // Will be set by Firestore
      sortIndex,
      createdAt: serverTimestamp(), // FieldValue
      updatedAt: serverTimestamp(), // FieldValue
    };
    
    const docRef = doc(servicesRef);
    await setDoc(docRef, newService);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding service:', error);
    throw new Error('Failed to add service');
  }
};

/**
 * Update an existing service for a detailer
 * @param detailerId - The detailer's unique identifier
 * @param serviceId - The service document ID to update
 * @param updatedData - The updated service data
 * @returns Promise<void>
 */
export const updateService = async (
  detailerId: string, 
  serviceId: string, 
  updatedData: Partial<ServiceMenu>
): Promise<void> => {
  try {
    const serviceRef = doc(db, 'detailers', detailerId, 'services', serviceId);
    const updateData = {
      ...updatedData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(serviceRef, updateData);
  } catch (error) {
    console.error('Error updating service:', error);
    throw new Error('Failed to update service');
  }
};

/**
 * Delete a service for a detailer
 * @param detailerId - The detailer's unique identifier
 * @param serviceId - The service document ID to delete
 * @returns Promise<void>
 */
export const deleteService = async (detailerId: string, serviceId: string): Promise<void> => {
  try {
    const serviceRef = doc(db, 'detailers', detailerId, 'services', serviceId);
    await deleteDoc(serviceRef);
    
    // Reorder remaining services
    await reorderServices(detailerId, []);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw new Error('Failed to delete service');
  }
};

/**
 * Reorder services for a detailer (optional: with a sortIndex field)
 * @param detailerId - The detailer's unique identifier
 * @param orderedList - The ordered list of services
 * @returns Promise<void>
 */
export const reorderServices = async (
  detailerId: string, 
  orderedList: ServiceMenu[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const servicesRef = collection(db, 'detailers', detailerId, 'services');
    
    // If no ordered list provided, get current services and maintain order
    if (orderedList.length === 0) {
      const currentServices = await getServices(detailerId);
      orderedList = currentServices;
    }
    
    orderedList.forEach((service, index) => {
      const serviceRef = doc(servicesRef, service.documentId);
      batch.update(serviceRef, {
        sortIndex: index,
        updatedAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error reordering services:', error);
    throw new Error('Failed to reorder services');
  }
};

// Profile Functions
/**
 * Get profile settings for a detailer
 * @param detailerId - The detailer's unique identifier
 * @returns Promise<ProfileSettings> - The detailer's profile settings
 */
export const getProfile = async (detailerId: string): Promise<ProfileSettings> => {
  try {
    const detailer = await getDetailer(detailerId);
    
    if (detailer) {
      return {
        businessName: detailer.businessName || '',
        bio: detailer.bio || '',
        profileImage: detailer.profileImage || null,
        galleryImages: detailer.galleryImages || [],
      };
    } else {
      // Return default profile if none exists
      return {
        businessName: '',
        bio: '',
        profileImage: null,
        galleryImages: [],
      };
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch profile');
  }
};

/**
 * Update profile settings for a detailer
 * @param detailerId - The detailer's unique identifier
 * @param profileData - The updated profile data
 * @returns Promise<void>
 */
export const updateProfile = async (
  detailerId: string, 
  profileData: ProfileSettings
): Promise<void> => {
  try {
    await updateDetailerProfile(detailerId, profileData);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }
};

// Utility function to convert ServiceMenu to Firestore format
export const convertServiceToFirestore = (service: ServiceMenu): FirestoreService => {
  return {
    ...service,
    id: service.id.toString(),
    sortIndex: 0, // Will be set by reorderServices
    createdAt: new Date(), // Always use Date for ServiceMenu
    updatedAt: new Date(), // Always use Date for ServiceMenu
  };
};

// Utility function to convert Firestore data to ServiceMenu
export const convertFirestoreToService = (doc: QueryDocumentSnapshot<DocumentData>): ServiceMenu => {
  const data = doc.data();
  return {
    id: parseInt(doc.id) || Date.now(),
    documentId: doc.id, // Store the actual Firestore document ID
    name: data.name || '',
    description: data.description || '',
    duration: data.duration || 60,
    durationUnit: data.durationUnit || 'min',
    price: data.price?.toString() || '',
    category: data.category || 'Exterior',

    image: data.image || '',
    active: data.active !== undefined ? data.active : true,
    buffer: data.buffer || 0,
    maxBookings: data.maxBookings || 1,
    requireConfirmation: data.requireConfirmation || false,
    tags: data.tags || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}; 