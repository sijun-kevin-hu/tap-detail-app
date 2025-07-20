import React, { useState } from 'react';
import { Appointment } from '@/lib/models';
import { formatDate, formatTime } from '@/utils/formatters';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import StatusDropdown from './StatusDropdown';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: () => void;
  onStatusChange: (appointmentId: string, newStatus: Appointment['status']) => void;
  onDelete: (id: string, action: 'archive' | 'delete') => void;
}

export default function AppointmentCard({
  appointment,
  onEdit,
  onStatusChange,
  onDelete
}: AppointmentCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState<'archive' | 'delete'>('archive');

  const handleDeleteClick = () => {
    setDeleteAction('archive');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(appointment.id, deleteAction);
    setShowDeleteModal(false);
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
            disabled={false}
            className="w-full sm:w-auto min-w-[140px]"
          />
          <div className="flex gap-1 justify-center sm:justify-start">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Appointment</h3>
            <p className="text-sm text-gray-600 mb-6">
              What would you like to do with this appointment?
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="deleteAction"
                  value="archive"
                  checked={deleteAction === 'archive'}
                  onChange={(e) => setDeleteAction(e.target.value as 'archive' | 'delete')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Archive</div>
                  <div className="text-sm text-gray-500">Move to archived appointments</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="deleteAction"
                  value="delete"
                  checked={deleteAction === 'delete'}
                  onChange={(e) => setDeleteAction(e.target.value as 'archive' | 'delete')}
                  className="text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Permanently Delete</div>
                  <div className="text-sm text-gray-500">Remove from database (cannot be undone)</div>
                </div>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  deleteAction === 'delete' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {deleteAction === 'archive' ? 'Archive' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 