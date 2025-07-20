import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAppointments, updateAppointment, deleteAppointment } from '@/lib/firebase/firestore-appointments';
import { Appointment, AppointmentFilters } from '@/lib/models';
import { formatDate, formatTime, getStatusColor } from '@/utils/formatters';

export function useAppointments() {
  const { detailer } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AppointmentFilters>({
    searchTerm: '',
    statusFilter: 'all',
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'archive' | 'delete' | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment> | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [dateRangeType, setDateRangeType] = useState<'7' | '30' | 'next7' | 'next30' | 'custom'>('7');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const fetchAppointments = useCallback(async () => {
    if (!detailer?.uid) return;
    
    try {
      setLoading(true);
      const appointmentsList = await getAppointments(detailer.uid);
      setAppointments(appointmentsList || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [detailer?.uid]);

  useEffect(() => {
    if (detailer?.uid) {
      fetchAppointments();
    }
  }, [detailer?.uid, fetchAppointments]);

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
      const [year, month, day] = appointment.date.split('-').map(Number);
      const apptDate = new Date(year, month - 1, day);
      if (apptDate < startDate) matchesDate = false;
    }
    if (endDate) {
      const [year, month, day] = appointment.date.split('-').map(Number);
      const apptDate = new Date(year, month - 1, day);
      if (apptDate > endDate) matchesDate = false;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Archive appointment
  const handleArchive = async (id: string) => {
    if (!detailer?.uid) return;
    setActionLoading('archive');
    try {
      await updateAppointment(detailer.uid, id, {
        status: 'archived',
        deletedAt: new Date().toISOString(),
      });
      await fetchAppointments();
    } catch (error) {
      console.error('Error archiving appointment:', error);
    } finally {
      setActionLoading(null);
      setConfirmingId(null);
    }
  };

  // Delete appointment
  const handlePermanentDelete = async (id: string) => {
    if (!detailer?.uid) return;
    setActionLoading('delete');
    try {
      await deleteAppointment(detailer.uid, id);
      await fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
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
      carType: appointment.carType || '',
      carMake: appointment.carMake || '',
      carModel: appointment.carModel || '',
      carYear: appointment.carYear || '',
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      address: appointment.address,
      notes: appointment.notes || '',
      price: appointment.price,
      reminderSent: appointment.reminderSent || false,
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
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setEditLoading(false);
    }
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