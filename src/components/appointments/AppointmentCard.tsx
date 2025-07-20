import React from 'react';
import { Appointment } from '@/lib/models';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon,
  TruckIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import StatusDropdown from './StatusDropdown';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: () => void;
  onStatusChange: (appointmentId: string, newStatus: Appointment['status']) => void;
  onSendReminder: (appointment: Appointment) => void;
  onArchive: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onConfirmCancel: (id: string) => void;
  actionLoading: 'archive' | 'delete' | null;
  setActionLoading: (loading: 'archive' | 'delete' | null) => void;
  confirmingId: string | null;
  setConfirmingId: (id: string | null) => void;
  processingReminders: boolean;
  sendManualReminder: (appointment: Appointment) => Promise<boolean>;
}

export default function AppointmentCard({
  appointment,
  onEdit,
  onStatusChange,
  onSendReminder,
  onArchive,
  onDeletePermanently,
  onConfirmCancel,
  actionLoading,
  setActionLoading,
  confirmingId,
  setConfirmingId,
  processingReminders,
  sendManualReminder
}: AppointmentCardProps) {
  const isConfirming = confirmingId === appointment.id;
  const isLoading = actionLoading && isConfirming;

  const formatDate = (dateString: string) => {
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
    const [hour, minute] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleSendReminder = async () => {
    await sendManualReminder(appointment);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header with status and actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{appointment.clientName}</h3>
          <p className="text-sm text-gray-600">{appointment.clientEmail}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <StatusDropdown
            currentStatus={appointment.status}
            onStatusChange={(status) => onStatusChange(appointment.id, status)}
            disabled={!!isLoading}
            className="w-full sm:w-auto min-w-[140px]"
          />
          <div className="flex gap-1 justify-center sm:justify-start">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={!!isLoading}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {appointment.status === 'confirmed' && !appointment.reminderSent && (
              <button
                onClick={handleSendReminder}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                disabled={!!isLoading || processingReminders}
                title="Send Reminder"
              >
                <BellIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onArchive(appointment.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              disabled={!!isLoading}
            >
              <ArchiveBoxIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeletePermanently(appointment.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              disabled={!!isLoading}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Service and price */}
      <div className="mb-3">
        <p className="font-medium text-gray-900">{appointment.service}</p>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <CurrencyDollarIcon className="h-4 w-4" />
          <span>${appointment.price}</span>
        </div>
      </div>

      {/* Vehicle information */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TruckIcon className="h-4 w-4" />
          <span className="font-medium">{appointment.carType}</span>
          {appointment.carMake && appointment.carModel && (
            <span className="text-gray-500">
              ({appointment.carMake} {appointment.carModel}
              {appointment.carYear && ` ${appointment.carYear}`})
            </span>
          )}
        </div>
      </div>

      {/* Reminder status */}
      {appointment.status === 'confirmed' && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm">
            <BellIcon className={`h-4 w-4 ${appointment.reminderSent ? 'text-green-500' : 'text-gray-400'}`} />
            <span className={appointment.reminderSent ? 'text-green-600' : 'text-gray-500'}>
              {appointment.reminderSent ? 'Reminder sent' : 'Reminder pending'}
            </span>
            {appointment.reminderSentAt && (
              <span className="text-xs text-gray-400">
                {new Date(appointment.reminderSentAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Date and time */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4" />
          <span>{formatDate(appointment.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon className="h-4 w-4" />
          <span>{formatTime(appointment.time)}</span>
        </div>
        {appointment.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4" />
            <span className="truncate">{appointment.address}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">{appointment.notes}</p>
        </div>
      )}

      {/* Confirmation dialog */}
      {isConfirming && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">Are you sure you want to {actionLoading === 'archive' ? 'archive' : 'delete'} this appointment?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (actionLoading === 'archive') {
                  onArchive(appointment.id);
                } else {
                  onDeletePermanently(appointment.id);
                }
              }}
              disabled={!!isLoading}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Yes'}
            </button>
            <button
              onClick={() => setConfirmingId(null)}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 