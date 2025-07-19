"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import AddAppointmentModal from '../../../components/AddAppointmentModal';
import { getAppointments, updateAppointment, deleteAppointment } from '@/lib/firebase';
import EditAppointmentModal from '../../../components/EditAppointmentModal';
import { Appointment, AppointmentFilters, APPOINTMENT_STATUSES, AppointmentFormData } from '@/lib/models';
import Link from 'next/link';

export default function AppointmentsPage() {
    const { detailer, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<AppointmentFilters>({
        searchTerm: '',
        statusFilter: 'all'
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<'archive' | 'delete' | null>(null);
    const [editForm, setEditForm] = useState<AppointmentFormData | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [dateRangeType, setDateRangeType] = useState<'all' | '7' | '30' | 'custom' | 'next7' | 'next30'>('all');
    const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    useEffect(() => {
        if (authLoading) {
            // Still loading auth, don't do anything yet
            return;
        }
        
        if (detailer?.uid) {
            fetchAppointments();
        } else if (detailer === null) {
            // User is not authenticated, set loading to false
            setLoading(false);
        }
    }, [detailer?.uid, authLoading]);

    const fetchAppointments = async () => {
        if (!detailer?.uid) return;
        
        try {
            setLoading(true);
            const appointmentsList = await getAppointments(detailer.uid);
            setAppointments(appointmentsList);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = appointment.clientName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                            appointment.clientEmail.toLowerCase().includes(filters.searchTerm.toLowerCase());
        const matchesStatus = filters.statusFilter === 'all' || appointment.status === filters.statusFilter;
        let matchesDate = true;
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        if (dateRangeType === '7') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            endDate = now;
        } else if (dateRangeType === '30') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            endDate = now;
        } else if (dateRangeType === 'next7') {
            startDate = now;
            endDate = new Date(now);
            endDate.setDate(now.getDate() + 7);
        } else if (dateRangeType === 'next30') {
            startDate = now;
            endDate = new Date(now);
            endDate.setDate(now.getDate() + 30);
        } else if (dateRangeType === 'custom' && customRange.start && customRange.end) {
            startDate = new Date(customRange.start + 'T00:00:00');
            endDate = new Date(customRange.end + 'T23:59:59');
        }
        if (startDate) {
            // Parse as local date
            const [year, month, day] = appointment.date.split('-').map(Number);
            const apptDate = new Date(year, month - 1, day);
            if (apptDate < startDate) matchesDate = false;
        }
        if (endDate) {
            // Parse as local date
            const [year, month, day] = appointment.date.split('-').map(Number);
            const apptDate = new Date(year, month - 1, day);
            if (apptDate > endDate) matchesDate = false;
        }
        return matchesSearch && matchesStatus && matchesDate;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'in-progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        // Parse as local date
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        // timeString is 'HH:MM' (24h), convert to local time with AM/PM
        const [hour, minute] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Archive (soft-delete) appointment
    const handleArchive = async (id: string) => {
        if (!detailer?.uid) return;
        setActionLoading('archive');
        try {
            await updateAppointment(detailer.uid, id, {
                status: 'cancelled',
                deletedAt: new Date().toISOString(),
            });
            fetchAppointments();
        } catch (err) {
            alert('Failed to archive appointment.');
        } finally {
            setActionLoading(null);
            setConfirmingId(null);
        }
    };

    // Permanently delete appointment
    const handlePermanentDelete = async (id: string) => {
        if (!detailer?.uid) return;
        setActionLoading('delete');
        try {
            await deleteAppointment(detailer.uid, id);
            fetchAppointments();
        } catch (err) {
            alert('Failed to delete appointment.');
        } finally {
            setActionLoading(null);
            setConfirmingId(null);
        }
    };

    // Open edit modal
    const openEditModal = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setEditForm({
            clientName: appointment.clientName,
            clientEmail: appointment.clientEmail,
            clientPhone: appointment.clientPhone,
            service: appointment.service,
            date: appointment.date,
            time: appointment.time,
            address: appointment.address,
            notes: appointment.notes || '',
            price: appointment.price,
        });
    };

    // Save edited appointment
    const handleEditSave = async () => {
        if (!editingAppointment || !editForm || !detailer?.uid) return;
        setEditLoading(true);
        try {
            await updateAppointment(detailer.uid, editingAppointment.id, {
                ...editForm,
                updatedAt: new Date().toISOString(),
            });
            setEditingAppointment(null);
            setEditForm(null);
            fetchAppointments();
        } catch (err) {
            alert('Failed to update appointment.');
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredRole="detailer">
            <div className="min-h-screen gradient-bg">
                {/* Header */}
                <header className="glass border-b border-white/20 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <Link href="/admin" className="mr-4">
                                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                </Link>
                                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h1 className="text-xl font-semibold text-gray-900">Appointments</h1>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="hidden sm:inline-flex btn-primary items-center gap-2 px-4 py-2 text-base font-semibold rounded-lg"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Appointment
                            </button>
                        </div>
                    </div>
                </header>
                {/* Floating Add Button for mobile */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="sm:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    aria-label="Add Appointment"
                >
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Filters */}
                    <div className="card p-6 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search appointments..."
                                    value={filters.searchTerm}
                                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                    className="input-modern"
                                />
                            </div>
                            <div className="sm:w-48">
                                <select
                                    value={filters.statusFilter}
                                    onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value as any }))}
                                    className="input-modern"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div className="sm:w-48">
                                <select
                                    value={dateRangeType}
                                    onChange={e => setDateRangeType(e.target.value as any)}
                                    className="input-modern"
                                >
                                    <option value="all">All Dates</option>
                                    <option value="7">Last 7 Days</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="next7">Next 7 Days</option>
                                    <option value="next30">Next 30 Days</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                            {dateRangeType === 'custom' && (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <input
                                        type="date"
                                        className="input-modern"
                                        value={customRange.start}
                                        onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))}
                                        max={customRange.end || undefined}
                                    />
                                    <input
                                        type="date"
                                        className="input-modern"
                                        value={customRange.end}
                                        onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                                        min={customRange.start || undefined}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Appointments List */}
                    {authLoading || loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-lg text-gray-600">
                                    {authLoading ? 'Loading user data...' : 'Loading appointments...'}
                                </span>
                            </div>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                            <p className="text-gray-600 mb-6">Get started by creating your first appointment</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-primary"
                            >
                                Add Your First Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAppointments.map((appointment) => (
                                <div key={appointment.id} className="card p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {appointment.clientName}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">
                                                <span className="font-medium">Date:</span> {formatDate(appointment.date)}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-2">
                                                <span className="font-medium">Time:</span> {formatTime(appointment.time)}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-2">
                                                <span className="font-medium">Service:</span> {appointment.service}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-2">
                                                <span className="font-medium">Price:</span> ${appointment.price}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-2">
                                                <span className="font-medium">Address:</span> {appointment.address}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-2">
                                                <span className="font-medium">Notes:</span> {appointment.notes || 'No notes'}
                                            </p>
                                            <div className={`flex ${window.innerWidth < 640 ? 'flex-col gap-2 mt-4' : 'flex-row gap-4 mt-4 sm:mt-0 sm:ml-4'}`}>
                                                {appointment.status !== 'archived' ? (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(appointment)}
                                                            className="flex items-center justify-center gap-2 btn-secondary w-full sm:w-auto px-4 py-3 text-base font-semibold rounded-lg touch-target"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingId(appointment.id)}
                                                            className="flex items-center justify-center gap-2 btn-secondary w-full sm:w-auto px-4 py-3 text-base font-semibold rounded-lg touch-target bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmingId(appointment.id)}
                                                        className="flex items-center justify-center gap-2 btn-secondary w-full sm:w-auto px-4 py-3 text-base font-semibold rounded-lg touch-target bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Delete Permanently
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Cancel Confirmation Modal (outside map) */}
                            {confirmingId && (() => {
                                const appointment = filteredAppointments.find(a => a.id === confirmingId) || appointments.find(a => a.id === confirmingId);
                                if (!appointment) return null;
                                return (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs mx-auto">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Appointment</h3>
                                            <p className="text-sm text-gray-700 mb-4">Do you want to archive this appointment or permanently delete it?</p>
                                            <div className="flex flex-col gap-2">
                                                {appointment.status !== 'archived' && (
                                                    <button
                                                        className="btn-secondary w-full"
                                                        disabled={actionLoading === 'archive'}
                                                        onClick={() => handleArchive(appointment.id)}
                                                    >
                                                        {actionLoading === 'archive' ? 'Archiving...' : 'Archive (keep record)'}
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-secondary w-full bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                    disabled={actionLoading === 'delete'}
                                                    onClick={() => handlePermanentDelete(appointment.id)}
                                                >
                                                    {actionLoading === 'delete' ? 'Deleting...' : 'Delete Permanently'}
                                                </button>
                                                <button
                                                    className="btn-secondary w-full mt-2"
                                                    onClick={() => setConfirmingId(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                    {/* Add Appointment Modal */}
                    <AddAppointmentModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => {
                            setShowAddModal(false);
                            fetchAppointments();
                        }}
                        detailerId={detailer?.uid || ''}
                    />
                    {/* Edit Appointment Modal */}
                    {editingAppointment && editForm && (
                        <EditAppointmentModal
                            isOpen={!!editingAppointment}
                            onClose={() => { setEditingAppointment(null); setEditForm(null); }}
                            initialData={editForm}
                            loading={editLoading}
                            onSave={async (data) => {
                                if (!detailer?.uid) return;
                                setEditLoading(true);
                                try {
                                    await updateAppointment(detailer.uid, editingAppointment.id, {
                                        ...data,
                                        updatedAt: new Date().toISOString(),
                                    });
                                    setEditingAppointment(null);
                                    setEditForm(null);
                                    fetchAppointments();
                                } catch (err) {
                                    alert('Failed to update appointment.');
                                } finally {
                                    setEditLoading(false);
                                }
                            }}
                        />
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}