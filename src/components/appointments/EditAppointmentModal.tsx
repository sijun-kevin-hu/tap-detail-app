"use client";

import { useState, useEffect } from 'react';
import { AppointmentFormData, APPOINTMENT_SERVICES } from '@/lib/models';

interface EditAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AppointmentFormData) => void;
    initialData: AppointmentFormData;
    loading?: boolean;
}

export default function EditAppointmentModal({ isOpen, onClose, onSave, initialData, loading }: EditAppointmentModalProps) {
    const [formData, setFormData] = useState<AppointmentFormData>(initialData);
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData(initialData);
        setError('');
    }, [initialData, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Auto-update price when service changes
        if (name === 'service') {
            const selectedService = APPOINTMENT_SERVICES.find(s => s.name === value);
            setFormData(prev => ({
                ...prev,
                service: value,
                price: selectedService?.price || 0
            }));
        }
    };

    const validateForm = () => {
        if (!formData.clientName || !formData.clientEmail || !formData.service || !formData.date || !formData.time || !formData.address) {
            setError('Please fill in all required fields');
            return false;
        }
        if (!formData.clientEmail.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        if (formData.price <= 0) {
            setError('Please select a valid service');
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Edit Appointment</h2>
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
                    {/* Client Information */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                                Client Name *
                            </label>
                            <input
                                id="clientName"
                                name="clientName"
                                type="text"
                                value={formData.clientName}
                                onChange={handleInputChange}
                                className="input-modern"
                                placeholder="Enter client name"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                id="clientEmail"
                                name="clientEmail"
                                type="email"
                                value={formData.clientEmail}
                                onChange={handleInputChange}
                                className="input-modern"
                                placeholder="Enter email address"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                id="clientPhone"
                                name="clientPhone"
                                type="tel"
                                value={formData.clientPhone}
                                onChange={handleInputChange}
                                className="input-modern"
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                Service Address *
                            </label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="input-modern"
                                placeholder="Enter service address"
                                required
                            />
                        </div>
                    </div>
                    {/* Service & Scheduling */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                                Service *
                            </label>
                            <select
                                id="service"
                                name="service"
                                value={formData.service}
                                onChange={handleInputChange}
                                className="input-modern"
                                required
                            >
                                <option value="">Select a service</option>
                                {APPOINTMENT_SERVICES.map((service) => (
                                    <option key={service.name} value={service.name}>
                                        {service.name} - ${service.price}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="input-modern"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                                    Time *
                                </label>
                                <input
                                    type="time"
                                    id="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    required
                                />
                            </div>
                        </div>
                        {/* Price Display */}
                        {formData.price > 0 && (
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-indigo-900">Service Price:</span>
                                    <span className="text-lg font-bold text-indigo-600">${formData.price}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="input-modern resize-none"
                            placeholder="Add any special instructions or notes..."
                        />
                    </div>
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    {/* Actions */}
                    <div className="flex justify-between pt-4 border-t border-gray-200 gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 