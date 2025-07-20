"use client";

import React, { useState, useEffect } from 'react';
import { AppointmentFormData, CAR_TYPES } from '@/lib/models';
import { formatPhone, validateAppointmentDate, validateAppointmentTime } from '@/utils/formatters';
import { getServices } from '@/lib/firebase/firestore-settings';
import { ServiceMenu } from '@/lib/models/settings';

interface EditAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AppointmentFormData) => void;
    initialData: AppointmentFormData;
    loading?: boolean;
    detailerId: string;
}

export default function EditAppointmentModal({ isOpen, onClose, onSave, initialData, loading, detailerId }: EditAppointmentModalProps) {
    const [formData, setFormData] = useState<AppointmentFormData>(initialData);
    const [error, setError] = useState('');
    const [services, setServices] = useState<ServiceMenu[]>([]);
    const [servicesLoading, setServicesLoading] = useState(true);

    // Load detailer's services
    useEffect(() => {
        if (detailerId && isOpen) {
            setServicesLoading(true);
            getServices(detailerId)
                .then(servicesList => {
                    setServices(servicesList.filter(s => s.active));
                })
                .catch(err => {
                    console.error('Error loading services:', err);
                    setError('Failed to load services');
                })
                .finally(() => {
                    setServicesLoading(false);
                });
        }
    }, [detailerId, isOpen]);

    useEffect(() => {
        setFormData(initialData);
        setError('');
    }, [initialData]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Format phone number as user types
        if (name === 'clientPhone') {
            const formattedValue = formatPhone(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Auto-update price when service changes
        if (name === 'service') {
            const selectedService = services.find(s => s.name === value);
            setFormData(prev => ({
                ...prev,
                service: value,
                price: selectedService?.price || 0
            }));
        }
    };

    const validateForm = () => {
        if (!formData.clientName || !formData.clientPhone || !formData.service || !formData.date || !formData.time || !formData.address) {
            setError('Please fill in all required fields');
            return false;
        }
        // Validate phone number has at least 10 digits
        const phoneDigits = formData.clientPhone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setError('Please enter a complete phone number');
            return false;
        }
        if (formData.clientEmail && !formData.clientEmail.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        if (formData.price <= 0) {
            setError('Please select a valid service');
            return false;
        }
        // Validate appointment date (within 6 months)
        if (!validateAppointmentDate(formData.date)) {
            setError('Appointment date must be within the next 6 months');
            return false;
        }
        // Validate appointment time
        if (!validateAppointmentTime(formData.time)) {
            setError('Please enter a valid time');
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
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
                        <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
                        <div className="grid grid-cols-2 gap-4">
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
                                    Email
                                </label>
                                <input
                                    id="clientEmail"
                                    name="clientEmail"
                                    type="email"
                                    value={formData.clientEmail}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
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
                    
                    {/* Vehicle Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
                        <div>
                            <label htmlFor="carType" className="block text-sm font-medium text-gray-700 mb-2">
                                Car Type *
                            </label>
                            <select
                                id="carType"
                                name="carType"
                                value={formData.carType}
                                onChange={handleInputChange}
                                className="input-modern"
                                required
                            >
                                <option value="">Select car type</option>
                                {CAR_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="carMake" className="block text-sm font-medium text-gray-700 mb-2">
                                    Make
                                </label>
                                <input
                                    id="carMake"
                                    name="carMake"
                                    type="text"
                                    value={formData.carMake || ''}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="e.g., Toyota"
                                />
                            </div>
                            <div>
                                <label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-2">
                                    Model
                                </label>
                                <input
                                    id="carModel"
                                    name="carModel"
                                    type="text"
                                    value={formData.carModel || ''}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="e.g., Camry"
                                />
                            </div>
                            <div>
                                <label htmlFor="carYear" className="block text-sm font-medium text-gray-700 mb-2">
                                    Year
                                </label>
                                <input
                                    id="carYear"
                                    name="carYear"
                                    type="text"
                                    value={formData.carYear || ''}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    placeholder="e.g., 2020"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Service & Scheduling */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                                Service *
                            </label>
                            {servicesLoading ? (
                                <div className="text-gray-500 text-sm">Loading services...</div>
                            ) : (
                                <select
                                    id="service"
                                    name="service"
                                    value={formData.service}
                                    onChange={handleInputChange}
                                    className="input-modern"
                                    required
                                >
                                    <option value="">Select a service</option>
                                    {services.map((service) => (
                                        <option key={service.name} value={service.name}>
                                            {service.name} - ${service.price}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date & Time (Cannot be modified)
                                </label>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700">
                                    {formData.date} at {formData.time}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Date and time cannot be changed after scheduling. Contact the client to reschedule.
                                </p>
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