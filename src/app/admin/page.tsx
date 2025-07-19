"use client";

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client-app';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function AdminDashboard() {
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
        <ProtectedRoute requiredRole="detailer">
            <div className="min-h-screen gradient-bg">
                {/* Header */}
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

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Welcome Section */}
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            Welcome back, {detailer?.firstName}! 👋
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Manage your appointments and grow your detailing business
                        </p>
                    </div>

                    {/* Quick Actions - Mobile Optimized */}
                    <div className="mb-6 sm:mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                            <Link href="/admin/appointments" className="card p-4 sm:p-6 hover:shadow-lg transition duration-200 group touch-target">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition duration-200">
                                        <svg className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Appointments</h4>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">View & manage</p>
                                </div>
                            </Link>

                            <div className="card p-4 sm:p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                                        <svg className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Earnings</h4>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Track revenue</p>
                                </div>
                            </div>

                            <div className="card p-4 sm:p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                                        <svg className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Clients</h4>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage relationships</p>
                                </div>
                            </div>

                            <Link href="/admin/settings" className="card p-4 sm:p-6 hover:shadow-lg transition duration-200 group touch-target">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition duration-200">
                                        <svg className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Settings</h4>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Configure account</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid - Mobile Optimized */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                            <div className="card p-4 sm:p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Apps</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">0</p>
                                </div>
                            </div>

                            <div className="card p-4 sm:p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">This Week</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">0</p>
                                </div>
                            </div>

                            <div className="card p-4 sm:p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">$0</p>
                                </div>
                            </div>

                            <div className="card p-4 sm:p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Active Clients</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Add Button for Mobile */}
                    <button
                        onClick={() => window.location.href = '/admin/appointments'}
                        className="fixed bottom-6 right-6 sm:hidden bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-4xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition z-50"
                        aria-label="Add Appointment"
                        style={{ boxShadow: '0 4px 16px rgba(80, 80, 180, 0.15)' }}
                    >
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </main>
            </div>
        </ProtectedRoute>
    );
} 