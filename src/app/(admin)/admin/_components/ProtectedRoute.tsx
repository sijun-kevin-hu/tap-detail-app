"use client";

import { useAuth } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { detailer, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Use replace (not push) so the guarded page doesn't remain in
            // history — with push, pressing back after the redirect returns to
            // the protected page, which redirects again, trapping the user.
            if (!detailer) {
                router.replace('/login');
            } else if (requiredRole && detailer.role !== requiredRole) {
                router.replace('/login');
            }
        }
    }, [detailer, loading, requiredRole, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg text-gray-600">Loading...</span>
                </div>
            </div>
        );
    }

    if (!detailer || (requiredRole && detailer.role !== requiredRole)) {
        return null;
    }

    return <>{children}</>;
} 