import React from 'react';
import { Client } from '@/lib/models/client';
import { formatPhoneNumber } from '@/lib/models/client';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

interface ClientCardProps {
  client: Client;
  onClick: (client: Client) => void;
  formatDate: (date: string) => string;
}

export default function ClientCard({ client, onClick, formatDate }: ClientCardProps) {
  return (
    <div
      onClick={() => onClick(client)}
      className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{client.fullName}</h3>
          <div className="flex items-center gap-2 mb-2">
            <PhoneIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{formatPhoneNumber(client.phone)}</span>
          </div>
          {client.email && (
            <div className="flex items-center gap-2 mb-2">
              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{client.email}</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            client.source === 'auto' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {client.source === 'auto' ? 'Auto' : 'Manual'}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-semibold text-gray-900">
            {client.totalAppointments || 0}
          </div>
          <div className="text-xs text-gray-500">Appointments</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-semibold text-gray-900">
            {client.currentAppointments?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Upcoming</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-semibold text-gray-900">
            ${client.totalSpent?.toFixed(0) || 0}
          </div>
          <div className="text-xs text-gray-500">Total Spent</div>
        </div>
      </div>

      {/* Last Service */}
      {client.lastServiceDate && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>Last service: {formatDate(client.lastServiceDate)}</span>
          </div>
        </div>
      )}
    </div>
  );
} 