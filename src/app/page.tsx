"use client";

import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-blue-50 flex flex-col">
            <nav className="border-b bg-white">
                <div className="max-w-3xl mx-auto px-4 flex justify-between items-center h-20">
                    <div className="font-extrabold text-2xl text-indigo-700 tracking-tight">Tap Detail</div>
                    <div className="flex gap-6">
                        <Link href="/book" className="text-indigo-700 font-medium hover:text-indigo-900 transition">Find Detailers</Link>
                        <Link href="/signup" className="text-indigo-700 font-medium hover:text-indigo-900 transition">Join as Detailer</Link>
                        <Link href="/login" className="text-indigo-700 font-medium hover:text-indigo-900 transition">Login</Link>
                    </div>
                </div>
            </nav>
            <main className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 w-full max-w-lg mt-20 mb-12 flex flex-col items-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center tracking-tight">Connect with Local Auto Detailers</h1>
                    <p className="text-gray-600 mb-10 text-center text-lg">Quickly find and book trusted mobile detailers in your area, or join as a detailer to get new clients.</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <Link href="/book" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-full font-semibold text-center text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">Find Detailers</Link>
                        <Link href="/signup" className="w-full border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 py-3 rounded-full font-semibold text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">Join as Detailer</Link>
                    </div>
                </div>
            </main>
            <footer className="border-t text-center text-xs text-gray-400 py-6 bg-white tracking-wide">
                &copy; 2024 Tap Detail
            </footer>
        </div>
    );
}
