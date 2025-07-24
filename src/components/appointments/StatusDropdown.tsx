import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { AppointmentStatus, APPOINTMENT_STATUSES } from '@/lib/models';
import { getStatusColor } from '@/utils/formatters';

interface StatusDropdownProps {
  currentStatus: AppointmentStatus;
  onStatusChange: (status: AppointmentStatus) => void;
  disabled?: boolean;
  className?: string;
  allowedTransitions?: AppointmentStatus[];
}

export default function StatusDropdown({
  currentStatus,
  onStatusChange,
  disabled = false,
  className = '',
  allowedTransitions
}: StatusDropdownProps) {
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

  const options = allowedTransitions || APPOINTMENT_STATUSES;

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
        {options.map((status) => (
          <option key={status} value={status}>
            {getStatusLabel(status)}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
} 