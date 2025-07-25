"use client";

import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Logo from '../components/Logo';
import CarLogo from '../components/CarLogo';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
            <NavBar />
            {/* Hero Section */}
            <section className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
                    {/* Modern auto detailing background, mobile-friendly */}
                    <svg width="100%" height="100%" className="absolute left-0 top-0 opacity-20" style={{zIndex:0}} preserveAspectRatio="none" viewBox="0 0 375 300">
                        <defs>
                            <radialGradient id="bubbleGradient" cx="50%" cy="40%" r="80%">
                                <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
                            </radialGradient>
                        </defs>
                        {/* Bubbles */}
                        <circle cx="60" cy="60" r="28" fill="#E0F2FE" fillOpacity="0.5" />
                        <circle cx="320" cy="80" r="18" fill="#BAE6FD" fillOpacity="0.4" />
                        <circle cx="100" cy="200" r="14" fill="#E0F2FE" fillOpacity="0.35" />
                        <circle cx="250" cy="220" r="22" fill="#BAE6FD" fillOpacity="0.3" />
                        <circle cx="300" cy="160" r="10" fill="#E0F2FE" fillOpacity="0.25" />
                        {/* Shine lines */}
                        <rect x="60" y="40" width="3" height="30" rx="1.5" fill="#FACC15" fillOpacity="0.15" />
                        <rect x="290" y="120" width="2" height="18" rx="1" fill="#FACC15" fillOpacity="0.10" />
                        {/* Tire marks subtle */}
                        <ellipse cx="180" cy="260" rx="90" ry="18" fill="#1E293B" fillOpacity="0.04" />
                    </svg>
                </div>
                <CarLogo className="w-40 h-28 mb-6 mx-auto" />
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
                            <svg className="h-8 w-8 text-indigo-600 mb-3" fill="none" viewBox="0 0 32 32"><rect x="6" y="16" width="20" height="7" rx="3" fill="#2563EB" /><circle cx="10" cy="25" r="2" fill="#1E293B" /><circle cx="22" cy="25" r="2" fill="#1E293B" /></svg>
                            <h3 className="font-semibold text-lg mb-1">No More Pen & Paper</h3>
                            <p className="text-gray-600 text-sm">Replace your notebook with a simple, digital job and client tracker—always in your pocket.</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-blue-50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
                            <svg className="h-8 w-8 text-green-600 mb-3" fill="none" viewBox="0 0 32 32"><rect x="12" y="10" width="8" height="12" rx="3" fill="#4ADE80" /><rect x="14" y="6" width="4" height="4" rx="1" fill="#A7F3D0" /><rect x="13" y="22" width="6" height="4" rx="2" fill="#6EE7B7" /></svg>
                            <h3 className="font-semibold text-lg mb-1">Stay on Top of Your Schedule</h3>
                            <p className="text-gray-600 text-sm">See all your upcoming jobs and appointments at a glance. (Automatic reminders coming soon!)</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-100 to-blue-50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
                            <svg className="h-8 w-8 text-purple-600 mb-3" fill="none" viewBox="0 0 32 32"><ellipse cx="16" cy="20" rx="8" ry="4" fill="#A78BFA" /><circle cx="12" cy="20" r="1" fill="#C4B5FD" /><circle cx="20" cy="20" r="1" fill="#C4B5FD" /></svg>
                            <h3 className="font-semibold text-lg mb-1">Simple Client List</h3>
                            <p className="text-gray-600 text-sm">See all your clients and their job history at a glance. No spreadsheets needed.</p>
                            </div>
                        <div className="bg-gradient-to-br from-yellow-100 to-blue-50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
                            <svg className="h-8 w-8 text-yellow-500 mb-3" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="#FDE68A" /><circle cx="24" cy="12" r="3" fill="#FEF9C3" /><circle cx="10" cy="22" r="2" fill="#FEF9C3" /></svg>
                            <h3 className="font-semibold text-lg mb-1">All-in-One Dashboard</h3>
                            <p className="text-gray-600 text-sm">Track jobs, earnings, and appointments—no clutter, just what matters.</p>
                            </div>
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-50 rounded-xl p-6 flex flex-col items-center text-center shadow-lg sm:col-span-2">
                            <svg className="h-8 w-8 text-blue-500 mb-3" fill="none" viewBox="0 0 32 32"><path d="M16 6C16 6 8 18 16 26C24 18 16 6 16 6Z" fill="#60A5FA" /><circle cx="16" cy="22" r="3" fill="#DBEAFE" /></svg>
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
                            <svg className="h-8 w-8 text-indigo-500 mb-2" fill="none" viewBox="0 0 32 32"><rect x="12" y="10" width="8" height="12" rx="3" fill="#6366F1" /><circle cx="16" cy="24" r="2" fill="#A5B4FC" /></svg>
                            <div className="font-semibold text-gray-800 mb-1">1. Sign Up</div>
                            <div className="text-gray-500 text-sm">Create your free account in seconds.</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center">
                            <svg className="h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="16" rx="4" fill="#4ADE80" /><path d="M12 16l4 4 4-8" stroke="#065F46" strokeWidth="2" fill="none" /></svg>
                            <div className="font-semibold text-gray-800 mb-1">2. Add Your First Job</div>
                            <div className="text-gray-500 text-sm">Start tracking jobs and clients right away.</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center">
                            <svg className="h-8 w-8 text-yellow-500 mb-2" fill="none" viewBox="0 0 32 32"><polygon points="16,8 18,14 24,14 19,18 21,24 16,20 11,24 13,18 8,14 14,14" fill="#FDE68A" /></svg>
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
                        <Logo />
                    <div className="text-sm text-gray-600">© 2025 Tap Detail. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
}
