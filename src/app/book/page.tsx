"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client-app';

interface Detailer {
    uid: string;
    businessName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    services?: string[];
    location?: string;
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
            const q = query(collection(db, 'users'), where('role', '==', 'detailer'));
            const querySnapshot = await getDocs(q);
            const detailerList: Detailer[] = [];
            querySnapshot.forEach((doc) => {
                detailerList.push({ uid: doc.id, ...doc.data() } as Detailer);
            });
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
            <nav className="border-b bg-white">
                <div className="max-w-3xl mx-auto px-4 flex justify-between items-center h-20">
                    <div className="font-extrabold text-2xl text-indigo-700 tracking-tight">Tap Detail</div>
                    <a href="/" className="text-indigo-700 font-medium hover:text-indigo-900 text-base transition">Home</a>
                </div>
            </nav>
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Book a Detailer</h1>
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <input
                        type="text"
                        placeholder="Search by business or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                    />
                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                    >
                        <option value="">All Services</option>
                        {services.map((service) => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedService('');
                        }}
                        className="px-4 py-3 border border-indigo-200 rounded-full bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    >
                        Clear
                    </button>
                </div>
                {loading ? (
                    <div className="text-indigo-500 text-center py-12 text-lg">Loading...</div>
                ) : filteredDetailers.length === 0 ? (
                    <div className="text-gray-500 text-center py-12 text-lg">No detailers found.</div>
                ) : (
                    <ul className="space-y-6">
                        {filteredDetailers.map((detailer) => (
                            <li key={detailer.uid} className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-2">
                                <div className="font-bold text-lg text-gray-900 mb-1">{detailer.businessName}</div>
                                <div className="text-sm text-gray-600 mb-1">{detailer.firstName} {detailer.lastName}</div>
                                {detailer.location && <div className="text-xs text-gray-500 mb-1">{detailer.location}</div>}
                                {detailer.services && detailer.services.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {detailer.services.slice(0, 3).map((service, idx) => (
                                            <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium">{service}</span>
                                        ))}
                                    </div>
                                )}
                                <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-full text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">Book</button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
} 