import React from 'react';
import { ClientFormData } from '@/lib/models/client';
import { validateEmail, formatPhone } from '@/utils/formatters';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ClientFormData;
  setFormData: (data: ClientFormData) => void;
  formErrors: string[];
  setFormErrors: (errors: string[]) => void;
  submitting: boolean;
}

export default function AddClientModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  formErrors, 
  setFormErrors, 
  submitting 
}: AddClientModalProps) {
  if (!isOpen) return null;

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    let formattedValue = value;
    if (field === 'phone') {
      formattedValue = formatPhone(value);
    }
    setFormData({ ...formData, [field]: formattedValue });
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const handleBlur = (field: keyof ClientFormData) => {
    const errors: string[] = [];
    if (field === 'phone' && formData.phone && formatPhone(formData.phone).replace(/\D/g, '').length !== 10) {
      errors.push('Phone number must be 10 digits');
    }
    if (field === 'email' && formData.email && !validateEmail(formData.email)) {
      errors.push('Invalid email address');
    }
    setFormErrors(errors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!formData.fullName.trim()) errors.push('Full name is required');
    if (formatPhone(formData.phone).replace(/\D/g, '').length !== 10) errors.push('Valid phone number is required');
    if (formData.email && !validateEmail(formData.email)) errors.push('Valid email is required');
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors([]);
    onSubmit(e);
    onClose(); // Exit popup after add
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Add New Client</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Messages */}
          {formErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <ul className="list-disc list-inside space-y-1">
                {formErrors.map((error, index) => (
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
              value={formData.fullName}
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
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter phone number"
              required
              maxLength={14}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any notes about this client..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 