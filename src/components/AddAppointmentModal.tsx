"use client";

import { useState } from 'react';
import { doc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/client-app';
import { AppointmentFormData, APPOINTMENT_SERVICES } from '@/lib/models';

interface AddAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    detailerId: string;
}

export default function AddAppointmentModal({ isOpen, onClose, onSuccess, detailerId }: AddAppointmentModalProps) {
    const [formData, setFormData] = useState<AppointmentFormData>({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        service: '',
        date: '',
        time: '',
        address: '',
        notes: '',
        price: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

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

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                if (!formData.clientName || !formData.clientEmail) {
                    setError('Please fill in client name and email');
                    return false;
                }
                if (!formData.clientEmail.includes('@')) {
                    setError('Please enter a valid email address');
                    return false;
                }
                break;
            case 2:
                if (!formData.service || !formData.date || !formData.time) {
                    setError('Please select service, date, and time');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, 'detailers', detailerId, 'appointments'), {
                clientName: formData.clientName,
                clientEmail: formData.clientEmail,
                clientPhone: formData.clientPhone,
                service: formData.service,
                date: formData.date,
                time: formData.time,
                address: formData.address,
                notes: formData.notes,
                price: formData.price,
                status: 'scheduled',
                createdAt: new Date().toISOString()
            });

            onSuccess();
        } catch (error: any) {
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
            service: '',
            date: '',
            time: '',
            address: '',
            notes: '',
            price: 0
        });
        setCurrentStep(1);
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
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
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="clientEmail"
                                            name="clientEmail"
                                            value={formData.clientEmail}
                                            onChange={handleInputChange}
                                            className="input-modern"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
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