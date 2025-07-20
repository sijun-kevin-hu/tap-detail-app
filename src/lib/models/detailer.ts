import { User as FirebaseUser } from 'firebase/auth';

export interface AvailabilitySettings {
    businessHours: {
        [day: string]: { start: string; end: string } | null; // e.g., { Monday: { start: '09:00', end: '17:00' }, ... }
    };
    workingDays: string[]; // e.g., ['Monday', 'Tuesday', ...]
    breaks: { day: string; start: string; end: string }[]; // e.g., [{ day: 'Monday', start: '12:00', end: '13:00' }]
    bufferMinutes: number; // e.g., 15
    blockedDates: string[]; // ISO date strings
    timezone?: string; // e.g., 'America/New_York'
}

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

    // Availability
    availability?: AvailabilitySettings;
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