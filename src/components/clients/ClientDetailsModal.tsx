import React, { useState } from 'react';
import { Client, ClientFormData, validateClientForm } from '@/lib/models/client';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface ClientDetailsModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (clientId: string, data: Partial<Client>) => void;
  onDelete: (clientId: string) => void;
  submitting: boolean;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getStatusIcon: (status: string) => React.ReactElement;
  getStatusColor: (status: string) => string;
}

export default function ClientDetailsModal({ 
  client, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete, 
  submitting,
  formatDate,
  formatTime,
  getStatusIcon,
  getStatusColor
}: ClientDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: client.fullName,
    phone: client.phone,
    email: client.email || '',
    notes: client.notes || ''
  });
  const [editErrors, setEditErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate form before saving
    const validation = validateClientForm(editData);
    if (!validation.isValid) {
      setEditErrors(validation.errors);
      return;
    }
    
    onUpdate(client.id, editData);
    setIsEditing(false);
    setEditErrors([]);
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setEditData({ ...editData, [field]: value });
    // Clear errors when user starts typing
    if (editErrors.length > 0) {
      setEditErrors([]);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Auto-format phone number
    const cleaned = value.replace(/\D/g, '');
    let formatted = value;
    
    if (cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    
    handleInputChange('phone', formatted);
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Client' : 'Client Details'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isEditing ? (
            // Edit Form
            <div className="space-y-4">
              {/* Error Messages */}
              {editErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {editErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add any notes about this client..."
                />
              </div>
            </div>
          ) : (
            // View Details
            <div className="space-y-6">
              {/* Client Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{client.fullName}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-4 ${
                  client.source === 'auto' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {client.source === 'auto' ? 'Auto-created' : 'Manually added'}
                </span>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{formatPhone(client.phone)}</span>
                  </div>

                  {client.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{client.email}</span>
                    </div>
                  )}

                  {client.notes && (
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                      <p className="text-gray-600 text-sm">{client.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{client.totalAppointments || 0}</div>
                  <div className="text-sm text-gray-600">Total Appointments</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">${client.totalSpent?.toFixed(0) || 0}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>

              {/* Current Appointments */}
              {client.currentAppointments && client.currentAppointments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Upcoming Appointments</h4>
                  <div className="space-y-3">
                    {client.currentAppointments.map((apt) => (
                      <div key={apt.id} className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">{apt.service}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(apt.date)} at {formatTime(apt.time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{apt.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span>${apt.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Appointments */}
              {client.pastAppointments && client.pastAppointments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Past Appointments</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {client.pastAppointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{apt.service}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(apt.date)} at {formatTime(apt.time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span>${apt.price}</span>
                        </div>
                      </div>
                    ))}
                    {client.pastAppointments.length > 5 && (
                      <div className="text-center text-sm text-gray-500">
                        +{client.pastAppointments.length - 5} more appointments
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200 gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditErrors([]);
                  }}
                  className="btn-secondary flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="btn-secondary flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  disabled={submitting}
                >
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 