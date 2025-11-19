"use client";

import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Logo from '@/components/Logo';
import AppPreview from '@/components/AppPreview';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <NavBar />

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-white to-white -z-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 bg-indigo-50 mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
                            Perfect for Mobile Detailers
                        </div>
                        <h1 className="text-display text-gray-900 mb-6 tracking-tight text-balance">
                            Run Your Detailing Business <br className="hidden sm:block" />
                            <span className="text-indigo-600">From Your Pocket</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
                            The simplest way to track jobs, manage clients, and get paid.
                            Built specifically for owner-operators who want to ditch the notebook.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/signup" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto shadow-xl shadow-indigo-200">
                                Start Free Trial
                            </Link>
                            <Link href="#features" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                                See How It Works
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-gray-500">
                            No credit card required · Free forever plan available
                        </p>
                    </div>

                    {/* Hero Image / Dashboard Preview */}
                    <div className="mt-16 relative mx-auto max-w-5xl">
                        <div className="rounded-2xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-3xl lg:p-4">
                            <AppPreview />
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-10 border-y border-gray-100 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                        Trusted by professional detailers
                    </p>
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for partner/client logos */}
                        <div className="flex justify-center items-center h-12 font-bold text-xl text-gray-400">MACK&apos;S DETAILING</div>
                        <div className="flex justify-center items-center h-12 font-bold text-xl text-gray-400">PRESTIGE AUTO</div>
                        <div className="flex justify-center items-center h-12 font-bold text-xl text-gray-400">SHINE MASTER</div>
                        <div className="flex justify-center items-center h-12 font-bold text-xl text-gray-400">ELITE MOBILE</div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-3">Features</h2>
                        <p className="text-heading text-gray-900 mb-4">
                            Everything you need to grow, nothing you don&apos;t.
                        </p>
                        <p className="text-lg text-gray-600">
                            We stripped away the complex features you&apos;ll never use. Tap Detail is designed for speed and simplicity.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card p-8 hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Job Tracking</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Log jobs in seconds. Track services, prices, and notes for every vehicle. Never forget what you did for a client.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card p-8 hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-green-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Schedule & Reminders</h3>
                            <p className="text-gray-600 leading-relaxed">
                                See your day at a glance. Automated text reminders reduce no-shows and keep your schedule full.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card p-8 hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 text-purple-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Client CRM</h3>
                            <p className="text-gray-600 leading-relaxed">
                                A digital rolodex of all your customers. Search by name, phone, or vehicle. Build long-term relationships.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-heading text-gray-900 mb-6">
                                Stop losing money to disorganization
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Pen and paper works until it doesn&apos;t. Coffee spills, lost notebooks, and forgotten appointments cost you money.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mt-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">The Old Way</h4>
                                        <p className="text-gray-500">Messy notebooks, missed calls, forgotten details.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mt-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">The Tap Detail Way</h4>
                                        <p className="text-gray-500">Organized, professional, and always in your pocket.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl transform rotate-3 opacity-10"></div>
                            <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                            <div>
                                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                <div className="h-3 w-20 bg-gray-100 rounded mt-1"></div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-20 bg-green-100 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                            <div>
                                                <div className="h-4 w-28 bg-gray-200 rounded"></div>
                                                <div className="h-3 w-24 bg-gray-100 rounded mt-1"></div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-20 bg-blue-100 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                            <div>
                                                <div className="h-4 w-36 bg-gray-200 rounded"></div>
                                                <div className="h-3 w-16 bg-gray-100 rounded mt-1"></div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-20 bg-yellow-100 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-display text-gray-900 mb-6">
                        Ready to level up your business?
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Join hundreds of mobile detailers who trust Tap Detail to run their business.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup" className="btn-primary text-lg px-10 py-4 shadow-xl shadow-indigo-200">
                            Get Started for Free
                        </Link>
                    </div>
                    <p className="mt-6 text-sm text-gray-500">
                        No credit card required · Cancel anytime
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <Logo />
                        <p className="mt-2 text-sm text-gray-500">
                            Simple CRM for Mobile Detailers
                        </p>
                    </div>
                    <div className="flex space-x-6 text-sm text-gray-500">
                        <Link href="#" className="hover:text-gray-900">Privacy</Link>
                        <Link href="#" className="hover:text-gray-900">Terms</Link>
                        <Link href="#" className="hover:text-gray-900">Contact</Link>
                    </div>
                    <div className="mt-4 md:mt-0 text-sm text-gray-400">
                        © 2025 Tap Detail. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
