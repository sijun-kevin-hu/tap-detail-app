import React from 'react';
import { Switch } from "@headlessui/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ServiceMenu, serviceCategories } from '@/lib/models/settings';
import Image from 'next/image';
import CurrencyInput from 'react-currency-input-field';

interface ServiceCardProps {
  service: ServiceMenu;
  index: number;
  onServiceChange: (idx: number, field: string, value: string | number | boolean) => void;
  onServiceDelete: (idx: number) => void;
  onDragStart: (idx: number) => void;
  onDragOver: (idx: number) => void;
  onDragEnd: () => void;
}

export default function ServiceCard({
  service,
  index,
  onServiceChange,
  onServiceDelete,
  onDragStart,
  onDragOver,
  onDragEnd
}: ServiceCardProps) {
  return (
    <div
      className="card p-4 space-y-4 relative"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index); }}
      onDragEnd={onDragEnd}
    >
      {/* Header with Service Name and Active Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
            {service.image ? (
              <Image src={service.image} alt="Service" className="object-cover w-full h-full" width={48} height={48} />
            ) : (
              <span className="text-gray-400"><PencilIcon className="h-5 w-5" /></span>
            )}
          </div>
          <div className="flex-1">
            <input
              className="input-modern font-semibold text-gray-900 text-base w-full"
              value={service.name}
              onChange={e => onServiceChange(index, "name", e.target.value)}
              placeholder="Service name"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Active</span>
            <Switch
              checked={service.active}
              onChange={v => onServiceChange(index, "active", v)}
              className={`${service.active ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}
            >
              <span className="sr-only">Active</span>
              <span
                className={`${service.active ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
          <button
            type="button"
            className="p-3 bg-red-50 hover:bg-red-100 rounded-full"
            onClick={() => onServiceDelete(index)}
            aria-label="Delete service"
          >
            <TrashIcon className="h-5 w-5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea
          className="input-modern text-sm text-gray-600 w-full"
          value={service.description}
          onChange={e => onServiceChange(index, "description", e.target.value)}
          rows={2}
          placeholder="Describe what's included in this service..."
        />
      </div>

      {/* Pricing and Duration */}
      <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Price ($)</label>
          <CurrencyInput
            className="input-modern text-sm w-full h-10"
            placeholder="0.00"
            decimalsLimit={2}
            prefix={"$"}
            value={service.price}
            onValueChange={value => onServiceChange(index, "price", value || '')}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Duration</label>
          <div className="flex gap-2">
            <input
              className="input-modern text-sm flex-1 h-12"
              type="number"
              min={1}
              value={service.duration}
              onChange={e => onServiceChange(index, "duration", Number(e.target.value))}
              placeholder="60"
            />
            <select
              className="input-modern text-sm flex-1/3 h-12 font-medium text-gray-900"
              value={service.durationUnit}
              onChange={e => onServiceChange(index, "durationUnit", e.target.value)}
            >
              <option value="min" className="text-sm font-medium">min</option>
              <option value="hr" className="text-sm font-medium">hr</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Category</label>
        <select
          className="input-modern text-sm w-full h-12 font-medium text-gray-900"
          value={service.category}
          onChange={e => onServiceChange(index, "category", e.target.value)}
        >
          {serviceCategories.map(cat => (
            <option key={cat} value={cat} className="text-sm font-medium">{cat}</option>
          ))}
        </select>
      </div>

      {/* Scheduling Settings */}
      <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Buffer (min)</label>
          <input
            className="input-modern text-sm w-full h-10"
            type="number"
            min={0}
            value={service.buffer}
            onChange={e => onServiceChange(index, "buffer", Number(e.target.value))}
            placeholder="15"
          />
          <p className="text-xs text-gray-500 mt-2">Extra time between appointments</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Max Per Day</label>
          <input
            className="input-modern text-sm w-full h-10"
            type="number"
            min={1}
            value={service.maxBookings}
            onChange={e => onServiceChange(index, "maxBookings", Number(e.target.value))}
            placeholder="3"
          />
          <p className="text-xs text-gray-500 mt-2">Maximum bookings per day</p>
        </div>
      </div>

      {/* Confirmation Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex-1 pr-3">
          <label className="block text-xs font-medium text-gray-600">Require Confirmation</label>
          <p className="text-xs text-gray-500">Manual approval needed for bookings</p>
        </div>
        <Switch
          checked={service.requireConfirmation}
          onChange={v => onServiceChange(index, "requireConfirmation", v)}
          className={`${service.requireConfirmation ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-10 items-center rounded-full transition-colors flex-shrink-0`}
        >
          <span className="sr-only">Require Confirmation</span>
          <span
            className={`${service.requireConfirmation ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </div>
  );
} 