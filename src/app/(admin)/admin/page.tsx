"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth';
import ProtectedRoute from './_components/ProtectedRoute';
import DashboardHeader from './_components/DashboardHeader';
import StatCard from '@/components/ui/StatCard';
import AppointmentCard from './_components/AppointmentCard';
import QuickActionRow from './_components/QuickActionRow';
import FeedbackModal from './_components/FeedbackModal';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function AdminDashboard() {
    const { detailer } = useAuth();
    const detailerId = detailer?.uid;
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const { statsData, todaysAppointmentsList } = useDashboardStats(detailerId);

    if (!detailerId) {
        return (
            <ProtectedRoute requiredRole="detailer">
                <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>
            </ProtectedRoute>
        );
    }

    const quickActions = [
        {
            href: "/admin/appointments",
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            title: "New Appointment",
            bgColor: "bg-indigo-100",
            iconColor: "text-indigo-600"
        },
        {
            href: "/admin/clients",
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            title: "Add Client",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            href: "/admin/earnings",
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            title: "View Earnings",
            bgColor: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            href: detailer?.businessId ? `/booking/${detailer.businessId}` : "#",
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ),
            title: "View Booking Page",
            bgColor: "bg-teal-100",
            iconColor: "text-teal-600",
            target: "_blank"
        },
        {
            href: "/admin/settings",
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: "Settings",
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600"
        }
    ];

    const stats = [
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            label: "Revenue (This Week)",
            value: `$${statsData.weeksEarnings.toFixed(2)}`,
            bgColor: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            label: "Jobs Completed",
            value: statsData.weeksAppointments, // Using weeks appointments as a proxy for completed jobs for now
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            label: "Active Clients",
            value: statsData.clients,
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600"
        }
    ];

    return (
        <>
        <ProtectedRoute requiredRole="detailer">
            <div className="min-h-screen bg-gray-50">
                <DashboardHeader />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                icon={stat.icon}
                                label={stat.label}
                                value={stat.value}
                                bgColor={stat.bgColor}
                                iconColor={stat.iconColor}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content Area - Recent Appointments */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Today&apos;s Schedule</h3>
                                <Link href="/admin/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    View All
                                </Link>
                            </div>

                            {todaysAppointmentsList.length === 0 ? (
                                <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                                    <p className="text-gray-500">No appointments scheduled for today.</p>
                                    <button
                                        onClick={() => window.location.href = '/admin/appointments'}
                                        className="mt-4 text-indigo-600 font-medium hover:text-indigo-800"
                                    >
                                        + Add Appointment
                                    </button>
                                </div>
                            ) : (
                                todaysAppointmentsList.map((appt) => (
                                    <AppointmentCard
                                        key={appt.id}
                                        time={appt.startTime || '00:00 AM'} // Assuming startTime exists or default
                                        vehicle={`${appt.vehicleYear || ''} ${appt.vehicleMake || ''} ${appt.vehicleModel || ''}`}
                                        clientName={appt.clientName || 'Unknown Client'}
                                        price={appt.price || 0}
                                        status={appt.status || 'pending'}
                                        serviceType={appt.serviceType}
                                    />
                                ))
                            )}
                        </div>

                        {/* Sidebar - Quick Actions */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {quickActions.map((action, index) => (
                                    <QuickActionRow
                                        key={index}
                                        href={action.href}
                                        icon={action.icon}
                                        title={action.title}
                                        bgColor={action.bgColor}
                                        iconColor={action.iconColor}
                                        target={action.target}
                                    />
                                ))}
                                {/* Feedback button */}
                                <button
                                    onClick={() => setFeedbackOpen(true)}
                                    className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow duration-200 w-full text-left"
                                >
                                    <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                                        <div className="w-5 h-5">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="font-medium text-gray-700">Report Issue / Request Feature</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Add Button for Mobile */}
                    <button
                        onClick={() => window.location.href = '/admin/appointments'}
                        className="fixed bottom-6 right-6 sm:hidden bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-4xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition z-50"
                        aria-label="Add Appointment"
                        style={{ boxShadow: '0 4px 16px rgba(80, 80, 180, 0.15)' }}
                    >
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </main>
            </div>
        </ProtectedRoute>

        <FeedbackModal
            isOpen={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            detailerName={detailer ? `${detailer.firstName || ''} ${detailer.lastName || ''}`.trim() : undefined}
            detailerEmail={detailer?.email}
            businessName={detailer?.businessName}
        />
        </>
    );
}