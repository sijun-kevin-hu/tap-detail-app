import { User as FirebaseUser } from 'firebase/auth';

export interface Detailer {
    // Firebase Auth properties
    uid: string;
    email: string;
    
    // Custom Firestore properties
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
}

// Legacy interface for backward compatibility during transition
export interface User extends Detailer {}
export interface AuthUser extends AuthDetailer {}
export interface UserFormData extends DetailerFormData {} 