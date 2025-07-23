import Link from 'next/link';
import { useState } from 'react';

export default function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <nav className="glass border-b border-white/20 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium hover:bg-indigo-200 transition">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Tap Detail
                    </Link>
                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/book" className="text-gray-700 hover:text-gray-900 font-medium transition duration-200">
                            Find Detailers
                        </Link>
                        <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium transition duration-200">
                            Login
                        </Link>
                        <Link href="/signup" className="btn-primary text-sm">
                            Join Now
                        </Link>
                    </div>
                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center">
                        <button
                            aria-label="Open menu"
                            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <svg className="h-6 w-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 top-16 z-20 animate-fade-in">
                    <div className="flex flex-col py-2 px-4 gap-2">
                        <Link href="/book" className="py-2 px-2 rounded text-gray-700 hover:bg-indigo-50 transition" onClick={() => setMenuOpen(false)}>
                            Find Detailers
                        </Link>
                        <Link href="/login" className="py-2 px-2 rounded text-gray-700 hover:bg-indigo-50 transition" onClick={() => setMenuOpen(false)}>
                            Login
                        </Link>
                        <Link href="/signup" className="btn-primary text-base py-2" onClick={() => setMenuOpen(false)}>
                            Join Now
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
} 