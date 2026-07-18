"use client";

import { useEffect, useState } from 'react';
import { getAppointmentsForDate } from '@/lib/firebase/firestore-appointments';
import { countClients } from '@/lib/firebase/firestore-clients';
import { getEarnings } from '@/lib/firebase/firestore-earnings';
import { Appointment } from '@/lib/models/appointment';

// Format a Date as YYYY-MM-DD in the user's local timezone. Appointment dates
// are stored as local date strings, so using toISOString() here would shift
// "today" to tomorrow for anyone west of UTC in the evening.
function toLocalDateStr(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayDateStr() {
    return toLocalDateStr(new Date());
}
function getWeekStartDateStr() {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay()); // Back to previous Sunday
    return toLocalDateStr(d);
}
function getWeekEndDateStr() {
    const d = new Date();
    d.setDate(d.getDate() + (6 - d.getDay())); // Forward to next Saturday
    return toLocalDateStr(d);
}

export interface DashboardStatsData {
    weeksEarnings: number;
    jobsCompleted: number;
    clients: number;
}

export function useDashboardStats(detailerId: string | undefined) {
    const [statsData, setStatsData] = useState<DashboardStatsData>({
        weeksEarnings: 0,
        jobsCompleted: 0,
        clients: 0,
    });
    const [todaysAppointmentsList, setTodaysAppointmentsList] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!detailerId) return;
        let cancelled = false;

        async function fetchStats() {
            try {
                const [todaysAppointments, earnings, clients] = await Promise.all([
                    // Only active statuses (pending/confirmed/in-progress) are returned,
                    // so archived and completed jobs don't clutter today's schedule.
                    getAppointmentsForDate(detailerId!, getTodayDateStr()),
                    getEarnings(detailerId!, getWeekStartDateStr(), getWeekEndDateStr()),
                    countClients(detailerId!),
                ]);
                if (cancelled) return;

                setTodaysAppointmentsList(
                    [...todaysAppointments].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                );
                setStatsData({
                    weeksEarnings: earnings.reduce((sum, e) => sum + (e.price || 0), 0),
                    // An earning doc exists exactly when its appointment is completed,
                    // so the week's earnings double as the completed-jobs count.
                    jobsCompleted: earnings.length,
                    clients,
                });
                setError(null);
            } catch (err) {
                console.error('Error loading dashboard stats:', err);
                if (!cancelled) setError('Failed to load dashboard data.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchStats();
        return () => { cancelled = true; };
    }, [detailerId]);

    return { statsData, todaysAppointmentsList, loading, error };
}
