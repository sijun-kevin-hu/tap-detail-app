import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAppointments, updateAppointment, deleteAppointment } from '@/lib/firebase';
import { Appointment, AppointmentFilters, AppointmentFormData } from '@/lib/models';

export function useAppointments() {
  const { detailer, loading: authLoading } = useAuth();
  
  // State
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

  // Load appointments
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

  // Filter appointments
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

  // Utility functions
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

  return {
    // State
    appointments,
    filteredAppointments,
    loading,
    filters,
    showAddModal,
    editingAppointment,
    deletingId,
    confirmingId,
    actionLoading,
    editForm,
    editLoading,
    dateRangeType,
    customRange,
    
    // Actions
    setFilters,
    setShowAddModal,
    setEditingAppointment,
    setDeletingId,
    setConfirmingId,
    setActionLoading,
    setEditForm,
    setEditLoading,
    setDateRangeType,
    setCustomRange,
    fetchAppointments,
    handleArchive,
    handlePermanentDelete,
    openEditModal,
    handleEditSave,
    
    // Utilities
    getStatusColor,
    formatDate,
    formatTime
  };
} 