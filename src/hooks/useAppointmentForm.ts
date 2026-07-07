"use client";

import { useEffect, useState } from 'react';
import { formatPhone } from '@/lib/utils';
import { getServices } from '@/lib/firebase/firestore-settings';
import { ServiceMenu } from '@/lib/models/settings';

// Shared state and handlers for the Add/Edit appointment modals: loads the
// detailer's active services while the modal is open, and handles form input
// (phone formatting, price auto-fill on service change). Validation stays in
// each modal because the add and edit flows validate differently.
export function useAppointmentForm<T extends { clientPhone: string; service: string; price: string }>(
    detailerId: string,
    isOpen: boolean,
    initialData: T
) {
    const [formData, setFormData] = useState<T>(initialData);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Format phone number as user types
        if (name === 'clientPhone') {
            const formattedValue = formatPhone(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            } as T));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            } as T));
        }

        // Auto-update price when service changes
        if (name === 'service') {
            const selectedService = services.find(s => s.name === value);
            setFormData(prev => ({
                ...prev,
                service: value,
                price: selectedService?.price?.toString() || ''
            } as T));
        }
    };

    return {
        formData,
        setFormData,
        error,
        setError,
        services,
        servicesLoading,
        handleInputChange,
    };
}
