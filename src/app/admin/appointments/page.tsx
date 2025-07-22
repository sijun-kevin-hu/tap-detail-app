"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import { useAppointments } from '@/hooks/useAppointments';
import { useReminders } from '@/hooks/useReminders';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import AddAppointmentModal from '@/components/appointments/AddAppointmentModal';
import EditAppointmentModal from '@/components/appointments/EditAppointmentModal';
import { Appointment } from '@/lib/models';
import { AppointmentFormData } from '@/lib/models/appointment';

export default function AppointmentsPage() {
  const router = useRouter();
  const { detailer } = useAuth();
  const {
    appointments,
    filteredAppointments,
    loading,
    filters,
    showAddModal,
    editingAppointment,
    editForm,
    editLoading,
    dateRangeType,
    customRange,
    setFilters,
    setShowAddModal,
    setEditingAppointment,
    setEditForm,
    setEditLoading,
    setDateRangeType,
    setCustomRange,
    fetchAppointments,
    openEditModal,
    handleEditSave
  } = useAppointments();

  const {
    config: reminderConfig,
    processing: processingReminders,
    updateConfig: updateReminderConfig,
    processAutomaticReminders,
    sendManualReminderForAppointment
  } = useReminders();

  // TODO: Re-enable automatic reminder processing when Twilio integration is ready
  // Process automatic reminders when appointments change
  /*
  useEffect(() => {
    if (detailer?.uid && appointments.length > 0 && reminderConfig?.enabled) {
      processAutomaticReminders(appointments);
    }
  }, [appointments, detailer?.uid, reminderConfig?.enabled]);
  */

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    if (!detailer?.uid) return;
    try {
      // Update appointment status using Firebase
      const { updateAppointment, getAppointment } = await import('@/lib/firebase/firestore-appointments');
      const { syncEarningForAppointment } = await import('@/lib/firebase/firestore-earnings');
      await updateAppointment(detailer.uid, appointmentId, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      // Fetch updated appointment and sync earnings
      const updated = await getAppointment(detailer.uid, appointmentId);
      if (updated) {
        await syncEarningForAppointment(detailer.uid, updated);
      }
      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleDelete = async (appointmentId: string, action: 'archive' | 'delete') => {
    if (!detailer?.uid) return;
    
    try {
      const { updateAppointment, deleteAppointment } = await import('@/lib/firebase/firestore-appointments');
      
      if (action === 'archive') {
        // Archive appointment
        await updateAppointment(detailer.uid, appointmentId, {
          status: 'archived',
          updatedAt: new Date().toISOString()
        });
      } else {
        // Permanently delete appointment
        await deleteAppointment(detailer.uid, appointmentId);
      }
      
      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  // TODO: Re-enable manual reminder sending when Twilio integration is ready
  /*
  const handleSendReminder = async (appointment: Appointment) => {
    const result = await sendManualReminderForAppointment(appointment);
    if (result?.success) {
      // Refresh appointments to update reminder status
      fetchAppointments();
    }
  };
  */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            {/* Back Button */}
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100 w-fit"
              aria-label="Go back to dashboard"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            {/* Title and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your auto detailing appointments
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary w-full sm:w-auto"
              >
                Add Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="Search by client name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.statusFilter}
                onChange={(e) => setFilters({ ...filters, statusFilter: e.target.value as 'all' | 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'archived' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRangeType}
                onChange={(e) => setDateRangeType(e.target.value as 'all' | '7' | '30' | 'next7' | 'next30' | 'custom')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Dates</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="next7">Next 7 Days</option>
                <option value="next30">Next 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateRangeType === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first appointment.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                  >
                    Add Appointment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onEdit={() => openEditModal(appointment)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

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
            onClose={() => {
              setEditingAppointment(null);
              setEditForm(null);
            }}
            onSave={handleEditSave}
            initialData={editForm as AppointmentFormData}
            loading={editLoading}
            detailerId={detailer?.uid || ''}
          />
        )}
      </div>
    </div>
  );
}