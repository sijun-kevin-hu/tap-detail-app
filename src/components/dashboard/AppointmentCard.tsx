import React from 'react';
import { UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface AppointmentCardProps {
    time: string;
    vehicle: string;
    clientName: string;
    price: number;
    status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
    serviceType?: string;
}

export default function AppointmentCard({
    time,
    vehicle,
    clientName,
    price,
    status,
    serviceType
}: AppointmentCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Format time to ensure it looks good (assuming ISO string or similar, but for now taking string)
    // If time is full ISO, we might want to parse it. 
    // For this component, let's assume the parent passes a formatted time string like "10:00" and "AM/PM" separate or together.
    // Actually, let's parse a Date object or string if needed, but to match AppPreview, let's stick to a simple split if possible
    // or just take the string.
    // Let's assume `time` is "10:00 AM" for simplicity, or we can parse it.

    const timeParts = time.split(' ');
    const timeValue = timeParts[0];
    const timePeriod = timeParts[1] || '';

    return (
        <div className={`bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center ${status === 'pending' ? 'opacity-75' : ''}`}>
            <div className="bg-indigo-50 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-indigo-600 font-bold text-lg">{timeValue}</div>
                <div className="text-indigo-400 text-xs uppercase font-bold">{timePeriod}</div>
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{vehicle} {serviceType ? `- ${serviceType}` : ''}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        {clientName}
                    </span>
                    <span className="flex items-center gap-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        ${price}
                    </span>
                </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(status)}`}>
                {status}
            </div>
        </div>
    );
}
