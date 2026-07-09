"use client";

import { useEffect, useState } from 'react';
import {
    getRawAppointmentsForDate,
    countAppointmentsInDateRange,
    DashboardAppointmentDoc,
} from '@/lib/firebase/firestore-appointments';
import { countClients } from '@/lib/firebase/firestore-clients';
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

export interface DashboardStatsData {
    todaysAppointments: number;
    weeksAppointments: number;
    weeksEarnings: number;
    clients: number;
}

export function useDashboardStats(detailerId: string | undefined) {
    const [statsData, setStatsData] = useState<DashboardStatsData>({
        todaysAppointments: 0,
        weeksAppointments: 0,
        weeksEarnings: 0,
        clients: 0,
    });
    const [todaysAppointmentsList, setTodaysAppointmentsList] = useState<DashboardAppointmentDoc[]>([]);

    useEffect(() => {
        async function fetchStats() {
            if (!detailerId) return;
            // Appointments
            const [todayDocs, weeksAppointments] = await Promise.all([
                getRawAppointmentsForDate(detailerId, getTodayDateStr()),
                countAppointmentsInDateRange(detailerId, getWeekStartDateStr(), getWeekEndDateStr()),
            ]);
            setTodaysAppointmentsList(todayDocs);

            // Earnings
            const earnings = await getEarnings(detailerId, getWeekStartDateStr(), getWeekEndDateStr());
            // Clients
            const clients = await countClients(detailerId);
            setStatsData({
                todaysAppointments: todayDocs.length,
                weeksAppointments,
                weeksEarnings: earnings.reduce((sum, e) => sum + (e.price || 0), 0),
                clients,
            });
        }
        fetchStats();
    }, [detailerId]);

    return { statsData, todaysAppointmentsList };
}
