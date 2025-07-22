"use client";

import Link from 'next/link';
import NavBar from '@/components/NavBar';

export default function Home() {
    return (
        <div className="min-h-screen gradient-bg">
            <NavBar />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Professional Mobile Car Detailing
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Connect with Local
                                <span className="text-indigo-600 block">Auto Detailers</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Find and book trusted mobile detailers in your area, or join as a detailer to start your own business and reach new clients.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link href="/book" className="btn-primary text-lg px-8 py-4 touch-target">
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Find Detailers
                            </Link>
                            <Link href="/signup" className="btn-secondary text-lg px-8 py-4 touch-target">
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Join as Detailer
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">Coming Soon</div>
                                <div className="text-sm text-gray-600">Professional Detailers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">24/7</div>
                                <div className="text-sm text-gray-600">Booking Available</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">100%</div>
                                <div className="text-sm text-gray-600">Mobile Service</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 sm:py-24 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Tap Detail?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Experience the convenience of professional mobile car detailing at your doorstep
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Feature 1 */}
                        <div className="card p-6 sm:p-8 text-center hover:shadow-lg transition duration-200">
                            <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Service</h3>
                            <p className="text-gray-600">
                                Professional detailing comes to you. No need to drive anywhere - we bring the service to your location.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card p-6 sm:p-8 text-center hover:shadow-lg transition duration-200">
                            <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Professionals</h3>
                            <p className="text-gray-600">
                                All detailers will be background-checked and verified professionals with proven track records.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card p-6 sm:p-8 text-center hover:shadow-lg transition duration-200">
                            <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Competitive Pricing</h3>
                            <p className="text-gray-600">
                                Get professional detailing services at competitive prices with transparent, upfront pricing.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card p-6 sm:p-8 text-center hover:shadow-lg transition duration-200">
                            <div className="h-16 w-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexible Scheduling</h3>
                            <p className="text-gray-600">
                                Book appointments that fit your schedule. Available 7 days a week with flexible time slots.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card p-6 sm:p-8 text-center hover:shadow-lg transition duration-200">
                            <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Satisfaction Guaranteed</h3>
                            <p className="text-gray-600">
                                We&apos;re committed to your satisfaction. If you&apos;re not happy, we&apos;ll make it right.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card p-6 sm:p-8 text-center hover:shadow-lg transition duration-200">
                            <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Eco-Friendly</h3>
                            <p className="text-gray-600">
                                Our detailers will use eco-friendly products that are safe for your vehicle and the environment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="card p-8 sm:p-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Be among the first to experience professional mobile car detailing, or start your own detailing business today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/book" className="btn-primary text-lg px-8 py-4 touch-target">
                                Find a Detailer
                            </Link>
                            <Link href="/signup" className="btn-secondary text-lg px-8 py-4 touch-target">
                                Become a Detailer
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="glass border-t border-white/20 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold text-gray-900">Tap Detail</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            © 2024 Tap Detail. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
