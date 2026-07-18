import React from 'react';
import { UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { AppointmentStatus } from '@/lib/models/appointment';

interface AppointmentCardProps {
    time: string; // Pre-formatted, e.g. "10:00 AM"
    vehicle: string;
    clientName: string;
    price: number;
    status: AppointmentStatus;
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
    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'in-progress': return 'bg-indigo-100 text-indigo-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'archived': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const [timeValue, timePeriod = ''] = time.split(' ');

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
