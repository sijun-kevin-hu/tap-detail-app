"use client";

import React, { useState, useEffect } from 'react';
import { CAR_TYPES } from '@/lib/models';
import { formatPhone, validateAppointmentDate, validateAppointmentTime } from '@/utils/formatters';
import UnifiedDateTimePicker from '../booking/UnifiedDateTimePicker';
import { getServices } from '@/lib/firebase/firestore-settings';
import { createAppointment } from '@/lib/firebase/firestore-appointments';
import { ServiceMenu } from '@/lib/models/settings';

interface AddAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    detailerId: string;
}

export default function AddAppointmentModal({ isOpen, onClose, onSuccess, detailerId }: AddAppointmentModalProps) {
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        carType: '',
        carMake: '',
        carModel: '',
        carYear: '',
        service: '',
        date: '',
        time: '',
        address: '',
        notes: '',
        price: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
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
                price: selectedService?.price?.toString() || ''
            }));
        }
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                if (!formData.clientName) {
                    setError('Please fill in client name');
                    return false;
                }
                if (!formData.clientPhone) {
                    setError('Please fill in client phone number');
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
                if (!formData.carType) {
                    setError('Please select the car type');
                    return false;
                }
                break;
            case 2:
                if (!formData.service || !formData.date || !formData.time) {
                    setError('Please select service, date, and time');
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
                break;
            case 3:
                if (!formData.address) {
                    setError('Please enter the service address');
                    return false;
                }
                break;
        }
        setError('');
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError('');
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
        if (parseFloat(formData.price) <= 0) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            // Get the selected service to include duration
            const selectedService = services.find(s => s.name === formData.service);
            
            await createAppointment(detailerId, {
                clientName: formData.clientName,
                clientEmail: formData.clientEmail,
                clientPhone: formData.clientPhone,
                carType: formData.carType,
                carMake: formData.carMake || '',
                carModel: formData.carModel || '',
                carYear: formData.carYear || '',
                service: formData.service,
                date: formData.date,
                time: formData.time,
                address: formData.address,
                notes: formData.notes,
                price: parseFloat(formData.price), // Parse price to float
                estimatedDuration: selectedService?.duration || 60
            });

            handleSuccess();
        } catch (error: unknown) {
            console.error('Error creating appointment:', error);
            setError('Failed to create appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            carType: '',
            carMake: '',
            carModel: '',
            carYear: '',
            service: '',
            date: '',
            time: '',
            address: '',
            notes: '',
            price: ''
        });
        setCurrentStep(1);
        setError('');
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSuccess = () => {
        resetForm();
        onSuccess();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">New Appointment</h2>
                            <p className="text-sm text-gray-500">Step {currentStep} of 3</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex space-x-2">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                                        step <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Step 1: Client Information */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                                            Client Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="clientName"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                            className="input-modern"
                                            placeholder="Enter client name"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="clientEmail"
                                            name="clientEmail"
                                            value={formData.clientEmail}
                                            onChange={handleInputChange}
                                            className="input-modern"
                                            placeholder="Enter email address (optional)"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="clientPhone"
                                            name="clientPhone"
                                            value={formData.clientPhone}
                                            onChange={handleInputChange}
                                            className="input-modern"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    
                                    {/* Vehicle Information */}
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Vehicle Information</h4>
                                        <div className="space-y-4">
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
                                                >
                                                    <option value="">Select car type</option>
                                                    {CAR_TYPES.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label htmlFor="carMake" className="block text-sm font-medium text-gray-700 mb-2">
                                                        Make
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="carMake"
                                                        name="carMake"
                                                        value={formData.carMake}
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
                                                        type="text"
                                                        id="carModel"
                                                        name="carModel"
                                                        value={formData.carModel}
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
                                                        type="text"
                                                        id="carYear"
                                                        name="carYear"
                                                        value={formData.carYear}
                                                        onChange={handleInputChange}
                                                        className="input-modern"
                                                        placeholder="e.g., 2020"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Service & Scheduling */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Service & Scheduling</h3>
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
                                        >
                                            <option value="">Select a service</option>
                                            {services.map((service) => (
                                                <option key={service.name} value={service.name}>
                                                    {service.name} - ${service.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date & Time *
                                        </label>
                                        {servicesLoading ? (
                                            <div className="text-gray-500 text-sm">Loading services...</div>
                                        ) : (
                                            <UnifiedDateTimePicker
                                                detailerId={detailerId}
                                                serviceName={formData.service}
                                                services={services}
                                                value={{ date: formData.date, time: formData.time }}
                                                onChange={({ date, time }) => setFormData(f => ({ ...f, date, time }))}
                                            />
                                        )}
                                    </div>
                                    
                                    {/* Price Display */}
                                    {parseFloat(formData.price) > 0 && (
                                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-indigo-900">Service Price:</span>
                                                <span className="text-lg font-bold text-indigo-600">${formData.price}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Location & Notes */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Address *
                                        </label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="input-modern"
                                            placeholder="Enter service address"
                                        />
                                    </div>
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
                                    
                                    {/* Summary */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Appointment Summary</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div><span className="font-medium">Client:</span> {formData.clientName}</div>
                                            <div><span className="font-medium">Vehicle:</span> {formData.carType} {formData.carMake && formData.carModel ? `(${formData.carMake} ${formData.carModel}${formData.carYear ? ` ${formData.carYear}` : ''})` : ''}</div>
                                            <div><span className="font-medium">Service:</span> {formData.service}</div>
                                            <div><span className="font-medium">Date:</span> {formData.date} at {formData.time}</div>
                                            <div><span className="font-medium">Price:</span> ${formData.price}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                            <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="btn-secondary"
                            >
                                Back
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleClose}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        )}
                        
                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="btn-primary"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary touch-target"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </div>
                                ) : (
                                    'Create Appointment'
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
} 