"use client";

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client-app';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { DetailerFormData } from '@/lib/models';
import { createDetailer, createBaseServices } from '@/lib/firebase/firestore-detailers';

export default function Signup() {
    const [formData, setFormData] = useState<DetailerFormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        businessName: '',
        businessId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { detailer, loading: authLoading } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && detailer) {
            router.push('/admin');
        }
    }, [detailer, authLoading, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.businessName || !formData.businessId) {
            setError('Please fill in all fields');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
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
                bio: '',
                profileImage: null,
                galleryImages: [],
                location: '',
                services: []
            });

            // Create base services for the new detailer
            await createBaseServices(userCredential.user.uid);

            // Send custom verification email via API route
            await fetch('/api/send-verification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, uid: userCredential.user.uid }),
            });

            alert('Email verification sent. Please check your email to verify your account.');
            await signOut(auth);
            
            // Redirect to login page after successful signup
            router.push('/login');
        } catch (error: unknown) {
            console.error('Signup error:', error);
            if (typeof error === 'object' && error && 'code' in error && 'message' in error) {
                const err = error as { code?: string; message?: string };
                if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists. Please try logging in instead.');
                } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak. Please choose a stronger password.');
                } else {
                    setError(err.message || 'Failed to create account. Please try again.');
                }
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Show loading if auth is still loading
    if (authLoading) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Home Link */}
                <div className="text-center mb-6">
                    <Link 
                        href="/" 
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-500 transition duration-200"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-heading text-gray-900 mb-2">
                        Join Tap Detail
                    </h1>
                    <p className="text-caption text-balance">
                        Create your detailer account to start managing appointments
                    </p>
                </div>

                {/* Signup Form */}
                <div className="card p-6 sm:p-8">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        required
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="input-modern"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        required
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="input-modern"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Name *
                                </label>
                                <input
                                    id="businessName"
                                    name="businessName"
                                    type="text"
                                    autoComplete="organization"
                                    required
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="Enter business name"
                                />
                            </div>

                            <div>
                                <label htmlFor="businessId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Business ID *
                                </label>
                                <input
                                    id="businessId"
                                    name="businessId"
                                    type="text"
                                    required
                                    value={formData.businessId}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="Enter unique business ID (e.g., mybusiness)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This will be used in your booking URL: yourapp.com/booking/{formData.businessId}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="Create a password"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                                <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full touch-target"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        {/* Login Link */}
                        <div className="text-center pt-4">
                            <p className="text-caption">
                                Already have an account?{' '}
                                <Link 
                                    href="/login" 
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200 underline-offset-2 hover:underline"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-500">
                        © 2024 Tap Detail. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}