import { User as FirebaseUser } from 'firebase/auth';

export interface Detailer {
    // Firebase Auth properties
    uid: string;
    email: string;
    
    // Custom Firestore properties
    businessId: string; // Unique business identifier for public URLs
    firstName: string;
    lastName: string;
    businessName: string;
    phone: string;
    role: 'detailer' | 'admin';
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    
    // Profile settings
    bio?: string;
    profileImage?: string | null;
    galleryImages?: string[];
    
    // Optional properties
    location?: string;
    services?: string[];
}

export interface AuthDetailer {
    detailer: Detailer | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
}

export interface DetailerFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    businessName: string;
    businessId: string;
}

// Legacy interfaces for backward compatibility during transition
// These are kept for any remaining imports that might still reference the old names
export type User = Detailer;
export type AuthUser = AuthDetailer;
export type UserFormData = DetailerFormData; 