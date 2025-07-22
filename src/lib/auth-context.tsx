"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase/client-app';
import { Detailer, AuthDetailer } from './models';
import { getDetailer } from './firebase/firestore-detailers';

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