import React from 'react';
import { Switch } from "@headlessui/react";
import { NewService, serviceCategories, ServiceCategory } from '@/lib/models/settings';
import Image from 'next/image';
import CurrencyInput from 'react-currency-input-field';

interface AddServiceFormProps {
  isOpen: boolean;
  newService: NewService;
  setNewService: (service: NewService) => void;
  onSubmit: () => void;
  saving: boolean;
  handleServiceImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AddServiceForm({
  isOpen,
  newService,
  setNewService,
  onSubmit,
  saving,
  handleServiceImage
}: AddServiceFormProps) {
  if (!isOpen) return null;

  return (
    <div className="card p-4 mb-2 space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 text-sm">Basic Information</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
          <input
            className="input-modern w-full"
            value={newService.name}
            onChange={e => setNewService({ ...newService, name: e.target.value })}
            placeholder="e.g., Premium Wash, Interior Detail"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="input-modern w-full"
            value={newService.description}
            onChange={e => setNewService({ ...newService, description: e.target.value })}
            rows={3}
            placeholder="Describe what's included in this service..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {newService.image ? (
                <Image src={newService.image} alt="Service" className="object-cover w-full h-full" width={80} height={80} />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="service-image-input"
              onChange={handleServiceImage}
            />
            <label htmlFor="service-image-input" className="btn-secondary px-3 py-2 cursor-pointer">
              Upload
            </label>
          </div>
        </div>
      </div>

      {/* Pricing & Duration */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 text-sm">Pricing & Duration</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
            <CurrencyInput
              className="input-modern w-full h-12 text-base"
              placeholder="0.00"
              decimalsLimit={2}
              prefix={"$"}
              value={newService.price}
              onValueChange={value => setNewService({ ...newService, price: value || '' })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="input-modern w-full h-12 text-base font-medium text-gray-900"
              value={newService.category}
              onChange={e => setNewService({ ...newService, category: e.target.value as ServiceCategory })}
            >
              {serviceCategories.map(cat => (
                <option key={cat} value={cat} className="text-base font-medium">{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
            <div className="flex gap-3">
              <input
                className="input-modern flex-1 h-12 text-base"
                type="number"
                min={1}
                value={newService.duration}
                onChange={e => setNewService({ ...newService, duration: Number(e.target.value) })}
                placeholder="60"
                required
              />
              <select
                className="input-modern flex-1/3 h-12 text-base font-medium text-gray-900"
                value={newService.durationUnit}
                onChange={e => setNewService({ ...newService, durationUnit: e.target.value as 'min' | 'hr' })}
              >
                <option value="min" className="text-base font-medium">Minutes</option>
                <option value="hr" className="text-base font-medium">Hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Service Options */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 text-sm">Service Options</h4>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 pr-4">
            <label className="block text-sm font-medium text-gray-700">Require Confirmation</label>
            <p className="text-xs text-gray-500">Manual approval needed for bookings</p>
          </div>
          <Switch
            checked={newService.requireConfirmation}
            onChange={v => setNewService({ ...newService, requireConfirmation: v })}
            className={`${newService.requireConfirmation ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0`}
          >
            <span className="sr-only">Require Confirmation</span>
            <span
              className={`${newService.requireConfirmation ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>

      {/* Scheduling Settings */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 text-sm">Scheduling Settings</h4>
        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time (min)</label>
            <input
              className="input-modern w-full h-12 text-base"
              type="number"
              min={0}
              value={newService.buffer}
              onChange={e => setNewService({ ...newService, buffer: Number(e.target.value) })}
              placeholder="15"
            />
            <p className="text-xs text-gray-500 mt-2">Extra time between appointments</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Per Day</label>
            <input
              className="input-modern w-full h-12 text-base"
              type="number"
              min={1}
              value={newService.maxBookings}
              onChange={e => setNewService({ ...newService, maxBookings: Number(e.target.value) })}
              placeholder="3"
            />
            <p className="text-xs text-gray-500 mt-2">Maximum bookings per day</p>
          </div>
        </div>
      </div>

      <button
        className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2"
        onClick={onSubmit}
        disabled={saving}
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Saving...
          </>
        ) : (
          'Save Service'
        )}
      </button>
    </div>
  );
} 