import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client-app';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardHeader() {
  const { detailer } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="glass border-b border-white/20 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Tap Detail</h1>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="hidden sm:block text-sm text-gray-600">
              {detailer?.firstName} {detailer?.lastName}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 