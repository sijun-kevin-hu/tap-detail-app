"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { auth } from './client';
import { Detailer, AuthDetailer, DetailerFormData } from '../models';
import { getDetailer, createDetailer, createBaseServices } from './firestore-detailers';

/**
 * Create a new detailer account: Firebase Auth user, Firestore detailer document,
 * base services, and the custom verification email.
 * Throws on failure (e.g. auth/email-already-in-use) — callers handle errors.
 */
export const signUpDetailer = async (formData: DetailerFormData): Promise<void> => {
    // Create detailer with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
    );

    // Create detailer document in Firestore using new function
    await createDetailer({
        uid: userCredential.user.uid,
        businessId: formData.businessId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        role: 'detailer',
        isActive: true,
        notificationConsent: {
            email: formData.notificationConsent,
            sms: formData.notificationConsent,
            consentedAt: new Date().toISOString(),
        },
        bio: '',
        profileImage: null,
        galleryImages: [],
        location: '',
        services: []
    });

    // Create base services for the new detailer
    await createBaseServices(userCredential.user.uid);

    // Send custom verification email via API route.
    // createUserWithEmailAndPassword signs the user in, so we can mint an ID
    // token proving to the server that this caller owns the account.
    const idToken = await userCredential.user.getIdToken();
    await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
        },
    });
};

const AuthContext = createContext<AuthDetailer>({
    detailer: null,
    firebaseUser: null,
    loading: true,
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [detailer, setDetailer] = useState<Detailer | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);
            
            if (firebaseUser && firebaseUser.emailVerified) {
                try {
                    const detailer = await getDetailer(firebaseUser.uid);
                    setDetailer(detailer);
                } catch (error) {
                    console.error('Error fetching detailer data:', error);
                    setDetailer(null);
                }
            } else {
                setDetailer(null);
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        detailer,
        firebaseUser,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 