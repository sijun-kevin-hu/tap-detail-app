"use client";

import { useState, useEffect } from 'react';
import { getActiveDetailers } from '@/lib/firebase';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

interface Detailer {
    uid: string;
    businessId: string;
    businessName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location?: string;
    profileImage?: string | null;
}

export default function BookPage() {
    const [detailers, setDetailers] = useState<Detailer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState('');

    useEffect(() => {
        fetchDetailers();
    }, []);

    const fetchDetailers = async () => {
        try {
            const detailerList = await getActiveDetailers();
            setDetailers(detailerList);
        } catch (error) {
            console.error('Error fetching detailers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDetailers = detailers.filter(detailer =>
        detailer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detailer.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Track if user has searched
    const hasSearched = searchTerm.trim().length > 0;

    const services = [
        'Basic Wash',
        'Standard Detail',
        'Premium Detail',
        'Ultimate Detail',
        'Interior Only',
        'Exterior Only',
        'Paint Correction',
        'Ceramic Coating'
    ];

    return (
        <div className="min-h-screen bg-blue-50 flex flex-col">
            <NavBar />
            <main className="flex-1 max-w-3xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Local Detailers</h1>
                    <p className="text-gray-600">Connect with trusted mobile detailers in your area</p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 mb-8">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search Detailers</label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Search by business name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        {/* Service filter dropdown removed */}
                    </div>
                </div>

                {/* Detailers List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading detailers...</p>
                    </div>
                ) : !hasSearched ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM20 4v6h-2V4h2zM4 4h6v2H4V4z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Search for a detailer or location</h3>
                        <p className="mt-1 text-gray-500">Enter a business name or location to find local detailers.</p>
                    </div>
                ) : filteredDetailers.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No detailers found</h3>
                        <p className="mt-1 text-gray-500">No detailers match your search criteria.</p>
                    </div>
                ) : (
                    <ul className="space-y-6">
                        {filteredDetailers.map((detailer) => (
                            <li key={detailer.uid} className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-2 items-center">
                                {detailer.profileImage ? (
                                    <img
                                        src={detailer.profileImage}
                                        alt={`${detailer.firstName} ${detailer.lastName} profile`}
                                        className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-gray-400">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="font-bold text-lg text-gray-900 mb-1 text-center">{detailer.businessName}</div>
                                <div className="text-sm text-gray-600 mb-1 text-center">{detailer.firstName} {detailer.lastName}</div>
                                {detailer.location && <div className="text-xs text-gray-500 mb-1 text-center">{detailer.location}</div>}
                                <Link href={`/booking/${detailer.businessId}`} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-full text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-center">
                                    Book
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
} 