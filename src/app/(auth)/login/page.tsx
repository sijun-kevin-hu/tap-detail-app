"use client";

import { useState, useEffect } from 'react';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client-app';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import CarLogo from '@/components/CarLogo';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { detailer, loading: authLoading } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && detailer) {
            router.push('/admin');
        }
    }, [detailer, authLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                setError('Your email isn\'t verified. Check your inbox (or junk folder if it\'s hiding) or resend verification below.');
                setShowResendVerification(true);
                return;
            }
            // Don't redirect here - let the useEffect handle it
        } catch (error: unknown) {
            console.error('Login error:', error);
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                    case 'auth/invalid-login-credentials':
                    case 'auth/invalid-email':
                        setError('Incorrect email or password. Double-check your credentials and try again.');
                        break;
                    case 'auth/too-many-requests':
                        setError('Too many login attempts. Please wait a moment before trying again.');
                        break;
                    default:
                        setError('Failed to login. Please try again.');
                }
            } else {
                setError('Failed to login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Resend verification email
    const handleResendVerification = async () => {
        const user = auth.currentUser;
        if (user && !user.emailVerified) {
          try {
            await fetch('/api/send-verification-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email, uid: user.uid }),
            });
            alert('Verification email resent. If it stays missing, a quick junk-folder peek usually finds it.');
          } catch (err) {
            console.error('Error resending email:', err);
            alert('Could not resend email. Try again later.');
          }
        } else {
          alert("You're either not logged in or already verified.");
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
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-50 rounded-full flex items-center justify-center shadow-xl mb-6 p-3">
                        <CarLogo className="w-20 h-16" />
                    </div>
                    <h1 className="text-heading text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-caption text-balance">
                        Sign in to your Tap Detail account
                    </p>
                </div>

                {/* Login Form */}
                <div className="card p-6 sm:p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-modern"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-modern"
                                    placeholder="Enter your password"
                                />
                                <div className="text-right mt-1">
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs text-indigo-500 hover:text-indigo-600 underline-offset-2 hover:underline transition duration-200"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
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
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Resend Verification Button */}
                        {showResendVerification && (
                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200 underline-offset-2 hover:underline px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 touch-target"
                                >
                                    Resend Verification Email
                                </button>
                            </div>
                        )}

                        {/* Sign Up Link */}
                        <div className="text-center pt-4">
                            <p className="text-caption">
                                Don&apos;t have an account?{' '}
                                <Link 
                                    href="/signup" 
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200 underline-offset-2 hover:underline"
                                >
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-gray-500">
                        © 2025 Tap Detail. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
