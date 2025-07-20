import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { AppointmentStatus, APPOINTMENT_STATUSES } from '@/lib/models';

interface StatusDropdownProps {
  currentStatus: AppointmentStatus;
  onStatusChange: (status: AppointmentStatus) => void;
  disabled?: boolean;
  className?: string;
}

export default function StatusDropdown({
  currentStatus,
  onStatusChange,
  disabled = false,
  className = ''
}: StatusDropdownProps) {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value as AppointmentStatus)}
        disabled={disabled}
        className={`
          appearance-none w-full px-3 py-2 pr-8 rounded-lg border-2
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed
          text-sm font-medium
          ${getStatusColor(currentStatus)}
        `}
      >
        {APPOINTMENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {getStatusLabel(status)}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
} 