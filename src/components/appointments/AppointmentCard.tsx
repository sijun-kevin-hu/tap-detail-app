import React from 'react';
import { Appointment } from '@/lib/models';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  actionLoading: 'archive' | 'delete' | null;
  confirmingId: string | null;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
  getStatusColor: (status: string) => string;
}

export default function AppointmentCard({
  appointment,
  onEdit,
  onArchive,
  onDelete,
  actionLoading,
  confirmingId,
  formatDate,
  formatTime,
  getStatusColor
}: AppointmentCardProps) {
  const isConfirming = confirmingId === appointment.id;
  const isLoading = actionLoading && isConfirming;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header with status and actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{appointment.clientName}</h3>
          <p className="text-sm text-gray-600">{appointment.clientEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(appointment)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading || false}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onArchive(appointment.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              disabled={isLoading || false}
            >
              <ArchiveBoxIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(appointment.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              disabled={isLoading || false}
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
                  onDelete(appointment.id);
                }
              }}
                             disabled={isLoading || false}
               className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Yes'}
            </button>
            <button
              onClick={() => {
                // Reset confirmation state
              }}
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