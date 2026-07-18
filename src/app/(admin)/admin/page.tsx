"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    CalendarDaysIcon,
    CurrencyDollarIcon,
    GlobeAltIcon,
    Cog6ToothIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    UserGroupIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/firebase/auth';
import ProtectedRoute from './_components/ProtectedRoute';
import DashboardHeader from './_components/DashboardHeader';
import StatCard from '@/components/ui/StatCard';
import AppointmentCard from './_components/AppointmentCard';
import QuickActionRow from './_components/QuickActionRow';
import FeedbackModal from './_components/FeedbackModal';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { formatTime } from '@/lib/utils';

// Quick actions are plain navigation, named after where they take you.
const QUICK_ACTIONS = [
    {
        href: "/admin/appointments",
        icon: <CalendarDaysIcon />,
        title: "Appointments",
        bgColor: "bg-indigo-100",
        iconColor: "text-indigo-600"
    },
    {
        href: "/admin/clients",
        icon: <UserGroupIcon />,
        title: "Clients",
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600"
    },
    {
        href: "/admin/earnings",
        icon: <CurrencyDollarIcon />,
        title: "View Earnings",
        bgColor: "bg-green-100",
        iconColor: "text-green-600"
    },
    {
        href: "/admin/settings",
        icon: <Cog6ToothIcon />,
        title: "Settings",
        bgColor: "bg-orange-100",
        iconColor: "text-orange-600"
    }
];

function StatCardSkeleton() {
    return (
        <div className="card p-4 sm:p-6 animate-pulse">
            <div className="flex flex-col items-center">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-xl mb-3" />
                <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { detailer } = useAuth();
    const detailerId = detailer?.uid;
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const { statsData, todaysAppointmentsList, loading, error } = useDashboardStats(detailerId);

    if (!detailerId) {
        return (
            <ProtectedRoute requiredRole="detailer">
                <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>
            </ProtectedRoute>
        );
    }

    const stats = [
        {
            icon: <CurrencyDollarIcon />,
            label: "Revenue (This Week)",
            value: `$${statsData.weeksEarnings.toFixed(2)}`,
            bgColor: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            icon: <CheckCircleIcon />,
            label: "Jobs Completed (This Week)",
            value: statsData.jobsCompleted,
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            icon: <UserGroupIcon />,
            label: "Total Clients",
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

                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {loading
                            ? [0, 1, 2].map((i) => <StatCardSkeleton key={i} />)
                            : stats.map((stat) => (
                                <StatCard
                                    key={stat.label}
                                    icon={stat.icon}
                                    label={stat.label}
                                    value={stat.value}
                                    bgColor={stat.bgColor}
                                    iconColor={stat.iconColor}
                                />
                            ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content Area - Today's Schedule */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Today&apos;s Schedule</h3>
                                <Link href="/admin/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    View All
                                </Link>
                            </div>

                            {loading ? (
                                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm animate-pulse">
                                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-3" />
                                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                                </div>
                            ) : todaysAppointmentsList.length === 0 ? (
                                <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                                    <p className="text-gray-500">No appointments scheduled for today.</p>
                                    <Link
                                        href="/admin/appointments"
                                        className="mt-4 inline-block text-indigo-600 font-medium hover:text-indigo-800"
                                    >
                                        + Add Appointment
                                    </Link>
                                </div>
                            ) : (
                                todaysAppointmentsList.map((appt) => (
                                    <AppointmentCard
                                        key={appt.id}
                                        time={formatTime(appt.time)}
                                        vehicle={[appt.carYear, appt.carMake, appt.carModel].filter(Boolean).join(' ') || appt.carType}
                                        clientName={appt.clientName || 'Unknown Client'}
                                        price={appt.price || 0}
                                        status={appt.status}
                                        serviceType={appt.service}
                                    />
                                ))
                            )}
                        </div>

                        {/* Sidebar - Quick Actions */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {QUICK_ACTIONS.map((action) => (
                                    <QuickActionRow
                                        key={action.title}
                                        href={action.href}
                                        icon={action.icon}
                                        title={action.title}
                                        bgColor={action.bgColor}
                                        iconColor={action.iconColor}
                                    />
                                ))}
                                {detailer?.businessId && (
                                    <QuickActionRow
                                        href={`/booking/${detailer.businessId}`}
                                        icon={<GlobeAltIcon />}
                                        title="View Booking Page"
                                        bgColor="bg-teal-100"
                                        iconColor="text-teal-600"
                                        target="_blank"
                                    />
                                )}
                                {/* Feedback button */}
                                <button
                                    onClick={() => setFeedbackOpen(true)}
                                    className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow duration-200 w-full text-left"
                                >
                                    <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                                        <div className="w-5 h-5">
                                            <ChatBubbleLeftRightIcon />
                                        </div>
                                    </div>
                                    <span className="font-medium text-gray-700">Report Issue / Request Feature</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Add Button for Mobile */}
                    <Link
                        href="/admin/appointments"
                        className="fixed bottom-6 right-6 sm:hidden bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-400 transition z-50"
                        aria-label="Go to appointments"
                        style={{ boxShadow: '0 4px 16px rgba(80, 80, 180, 0.15)' }}
                    >
                        <PlusIcon className="h-8 w-8" />
                    </Link>
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
