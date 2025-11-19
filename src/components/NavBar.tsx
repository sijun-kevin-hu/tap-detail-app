import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';

export default function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <nav className="glass sticky top-0 z-50 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Logo />
                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                            Log in
                        </Link>
                        <Link href="/signup" className="btn-primary text-sm">
                            Get Started
                        </Link>
                    </div>
                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center">
                        <button
                            aria-label="Open menu"
                            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="md:hidden bg-white border-b border-gray-200 shadow-lg absolute w-full left-0 top-16 z-40 animate-fade-in">
                    <div className="flex flex-col p-4 gap-3">
                        <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                            Log in
                        </Link>
                        <Link href="/signup" className="btn-primary w-full justify-center text-base py-2" onClick={() => setMenuOpen(false)}>
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
} 