"use client";

import Link from 'next/link';
import NavBar from '@/components/NavBar';

// Simple SVG illustration for hero
function HeroIllustration() {
    return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-6" aria-hidden>
            <rect x="10" y="30" width="100" height="60" rx="12" fill="#6366F1" fillOpacity="0.12" />
            <rect x="25" y="45" width="70" height="30" rx="6" fill="#6366F1" fillOpacity="0.25" />
            <rect x="40" y="55" width="40" height="10" rx="3" fill="#6366F1" fillOpacity="0.5" />
            <circle cx="60" cy="90" r="8" fill="#6366F1" fillOpacity="0.7" />
        </svg>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
            <NavBar />
            {/* Hero Section */}
            <section className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
                    <svg width="100%" height="100%" className="absolute left-0 top-0 opacity-10" style={{zIndex:0}}><circle cx="80" cy="80" r="80" fill="#6366F1" /></svg>
                            </div>
                <HeroIllustration />
                <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight relative z-10">
                    Ditch the Notebook.<br className="hidden sm:inline" /> Run Your Detailing Business Simply.
                            </h1>
                <p className="text-base sm:text-lg text-indigo-700 font-semibold mb-2 relative z-10">Perfect for solo detailers & small teams (1-3 people)</p>
                <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto relative z-10">
                    Tap Detail is the easiest way for owner-operators and small teams to track jobs, clients, and appointments—no complicated software, no learning curve. Just what you need, right on your phone.
                </p>
                <Link href="/signup" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full px-8 py-3 text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition relative z-10">
                    Try It Free
                </Link>
            </section>

            {/* Features Section */}
            <section className="bg-white py-12 sm:py-16 w-full">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Perfect for Solo Detailers & Small Teams</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
                            <svg className="h-8 w-8 text-indigo-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1h-6a1 1 0 00-1 1v9m0 0l4 4 4-4" /></svg>
                            <h3 className="font-semibold text-lg mb-1">No More Pen & Paper</h3>
                            <p className="text-gray-600 text-sm">Replace your notebook with a simple, digital job and client tracker—always in your pocket.</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-blue-50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
                            <svg className="h-8 w-8 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM20 4v6h-2V4h2zM4 4h6v2H4V4z" /></svg>
                            <h3 className="font-semibold text-lg mb-1">Stay on Top of Your Schedule</h3>
                            <p className="text-gray-600 text-sm">See all your upcoming jobs and appointments at a glance. (Automatic reminders coming soon!)</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-100 to-blue-50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
                            <svg className="h-8 w-8 text-purple-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4a4 4 0 00-8 0v2a4 4 0 008 0v-2z" /></svg>
                            <h3 className="font-semibold text-lg mb-1">Simple Client List</h3>
                            <p className="text-gray-600 text-sm">See all your clients and their job history at a glance. No spreadsheets needed.</p>
                            </div>
                        <div className="bg-gradient-to-br from-yellow-100 to-blue-50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
                            <svg className="h-8 w-8 text-yellow-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17a4 4 0 004-4V5a4 4 0 00-8 0v8a4 4 0 004 4z" /></svg>
                            <h3 className="font-semibold text-lg mb-1">All-in-One Dashboard</h3>
                            <p className="text-gray-600 text-sm">Track jobs, earnings, and appointments—no clutter, just what matters.</p>
                            </div>
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg sm:col-span-2">
                            <svg className="h-8 w-8 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7a1 1 0 00-1-1h-3m-10 0H4a1 1 0 00-1 1z" /></svg>
                            <h3 className="font-semibold text-lg mb-1">Mobile & Effortless</h3>
                            <p className="text-gray-600 text-sm">Works on any phone. Get started in minutes—no setup headaches.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Getting Started Steps */}
            <section className="py-10 w-full bg-indigo-50/60">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Getting Started is Easy</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center">
                            <svg className="h-8 w-8 text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            <div className="font-semibold text-gray-800 mb-1">1. Sign Up</div>
                            <div className="text-gray-500 text-sm">Create your free account in seconds.</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center">
                            <svg className="h-8 w-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <div className="font-semibold text-gray-800 mb-1">2. Add Your First Job</div>
                            <div className="text-gray-500 text-sm">Start tracking jobs and clients right away.</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center">
                            <svg className="h-8 w-8 text-yellow-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" /></svg>
                            <div className="font-semibold text-gray-800 mb-1">3. Stay Organized</div>
                            <div className="text-gray-500 text-sm">See your schedule and clients at a glance—anywhere, anytime.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Before & After Section */}
            <section className="py-10 w-full bg-blue-100/60">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Why Switch from Pen & Paper?</h2>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <div className="flex-1 bg-white rounded-xl p-4 shadow-md mb-4 sm:mb-0">
                            <div className="font-semibold text-gray-700 mb-2">Before</div>
                            <ul className="text-gray-500 text-sm list-disc list-inside text-left mx-auto max-w-xs">
                                <li>Lost notes & missed jobs</li>
                                <li>Forgotten appointments</li>
                                <li>Messy client info</li>
                                <li>No reminders</li>
                            </ul>
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-4 shadow-md">
                            <div className="font-semibold text-indigo-700 mb-2">After</div>
                            <ul className="text-gray-700 text-sm list-disc list-inside text-left mx-auto max-w-xs">
                                <li>Everything organized in one app</li>
                                <li>See your schedule at a glance</li>
                                <li>Easy client/job lookup</li>
                                <li>Never miss a job again</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-12 sm:py-16 w-full">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        Ready to leave pen & paper behind?
                    </h2>
                    <p className="text-gray-600 mb-6">Join other solo detailers and small teams using Tap Detail to keep their business organized and stress-free.</p>
                    <Link href="/signup" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full px-8 py-3 text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                        Try It Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
                <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 sm:mb-0">
                            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold text-gray-900">Tap Detail</span>
                        </div>
                    <div className="text-sm text-gray-600">© 2025 Tap Detail. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
}
