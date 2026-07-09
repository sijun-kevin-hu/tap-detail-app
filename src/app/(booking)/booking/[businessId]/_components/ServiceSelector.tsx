"use client";

import { ServiceMenu } from '@/lib/models/settings';

interface ServiceSelectorProps {
  services: ServiceMenu[];
  selectedService: ServiceMenu | null;
  onSelect: (service: ServiceMenu) => void;
}

export default function ServiceSelector({ services, selectedService, onSelect }: ServiceSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Service</h3>
      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.documentId}
            onClick={() => onSelect(service)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedService?.documentId === service.documentId
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900">{service.name}</h4>
              <span className="text-lg font-bold text-indigo-600">${service.price}</span>
            </div>
            {service.description && (
              <p className="text-sm text-gray-600 mb-2">{service.description}</p>
            )}
            <div className="flex items-center text-xs text-gray-500">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {service.duration} {service.durationUnit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
