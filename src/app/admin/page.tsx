"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import StatCard from '@/components/dashboard/StatCard';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client-app';
import { getEarnings } from '@/lib/firebase/firestore-earnings';

function getTodayDateStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}
function getWeekStartDateStr() {
  const d = new Date();
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - day); // Go back to previous Sunday
  return weekStart.toISOString().split('T')[0];
}
function getWeekEndDateStr() {
  const d = new Date();
  const day = d.getDay();
  const weekEnd = new Date(d);
  weekEnd.setDate(d.getDate() + (6 - day)); // Go forward to next Saturday
  return weekEnd.toISOString().split('T')[0];
}

export default function AdminDashboard() {
    const { detailer } = useAuth();
    const detailerId = detailer?.uid;
    const [statsData, setStatsData] = useState({
      todaysAppointments: 0,
      weeksAppointments: 0,
      weeksEarnings: 0,
      clients: 0,
    });

    useEffect(() => {
      async function fetchStats() {
        if (!detailerId) return;
        // Appointments
        const apptCol = collection(db, 'detailers', detailerId, 'appointments');
        const todayQ = query(apptCol, where('date', '==', getTodayDateStr()));
        const weekQ = query(apptCol, where('date', '>=', getWeekStartDateStr()), where('date', '<=', getWeekEndDateStr()));
        const [todaySnap, weekSnap] = await Promise.all([getDocs(todayQ), getDocs(weekQ)]);
        // Earnings
        const earnings = await getEarnings(detailerId, getWeekStartDateStr(), getWeekEndDateStr());
        // Clients
        const clientsCol = collection(db, 'detailers', detailerId, 'clients');
        const clientsSnap = await getDocs(clientsCol);
        setStatsData({
          todaysAppointments: todaySnap.size,
          weeksAppointments: weekSnap.size,
          weeksEarnings: earnings.reduce((sum, e) => sum + (e.price || 0), 0),
          clients: clientsSnap.size,
        });
      }
      fetchStats();
    }, [detailerId]);

    if (!detailerId) {
      return (
        <ProtectedRoute requiredRole="detailer">
          <div className="min-h-screen gradient-bg flex items-center justify-center text-gray-500">Loading...</div>
        </ProtectedRoute>
      );
    }

    const quickActions = [
        {
            href: "/admin/appointments",
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            title: "Appointments",
            description: "View & manage",
            bgColor: "bg-indigo-100",
            iconColor: "text-indigo-600",
            hoverBgColor: "bg-indigo-200"
        },
        {
            href: "/admin/earnings",
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            title: "Earnings",
            description: "Track revenue",
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
            hoverBgColor: "bg-green-200"
        },
        {
            href: "/admin/clients",
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: "Clients",
            description: "Manage relationships",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600",
            hoverBgColor: "bg-purple-200"
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
            description: "Configure account",
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600",
            hoverBgColor: "bg-orange-200"
        }
    ];

    const stats = [
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            label: "Today's Appointments",
            value: statsData.todaysAppointments,
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            label: "This Week's Appointments",
            value: statsData.weeksAppointments,
            bgColor: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            label: "Earnings this week",
            value: `$${statsData.weeksEarnings.toFixed(2)}`,
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-600"
        },
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            label: "Clients",
            value: statsData.clients,
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600"
        }
    ];

    return (
        <ProtectedRoute requiredRole="detailer">
            <div className="min-h-screen gradient-bg">
                <DashboardHeader />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Welcome Section */}
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            Welcome back, {detailer?.firstName}! 👋
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Manage your appointments and grow your detailing business
                        </p>
                    </div>

                    {/* Quick Actions - Mobile Optimized */}
                    <div className="mb-6 sm:mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                            {quickActions.map((action, index) => (
                                <QuickActionCard
                                    key={index}
                                    href={action.href}
                                    icon={action.icon}
                                    title={action.title}
                                    description={action.description}
                                    bgColor={action.bgColor}
                                    iconColor={action.iconColor}
                                    hoverBgColor={action.hoverBgColor}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Stats Grid - Mobile Optimized */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
    );
} 