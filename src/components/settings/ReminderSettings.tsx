import React from 'react';
import { BellIcon, ClockIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ReminderConfig } from '@/lib/services/reminderService';

interface ReminderSettingsProps {
  config: ReminderConfig;
  onConfigChange: (config: Partial<ReminderConfig>) => void;
}

export default function ReminderSettings({ config, onConfigChange }: ReminderSettingsProps) {
  const handleToggle = () => {
    onConfigChange({ enabled: !config.enabled });
  };

  const handleHoursChange = (hours: number) => {
    onConfigChange({ hoursBeforeAppointment: hours });
  };

  const handleTemplateChange = (template: string) => {
    onConfigChange({ messageTemplate: template });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <BellIcon className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Auto Reminders</h3>
          <p className="text-sm text-gray-600">Automatically send SMS reminders to clients</p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Enable Auto Reminders</h4>
            <p className="text-sm text-gray-600">Send automatic SMS reminders to clients</p>
          </div>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.enabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {config.enabled && (
        <>
          {/* Timing Settings */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium text-gray-900">Reminder Timing</h4>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Send reminder
              </label>
              <select
                value={config.hoursBeforeAppointment}
                onChange={(e) => handleHoursChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={1}>1 hour before</option>
                <option value={2}>2 hours before</option>
                <option value={4}>4 hours before</option>
                <option value={6}>6 hours before</option>
                <option value={12}>12 hours before</option>
                <option value={24}>24 hours before</option>
              </select>
            </div>
          </div>

          {/* Message Template */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium text-gray-900">Message Template</h4>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Custom message (optional)
              </label>
              <textarea
                value={config.messageTemplate || ''}
                onChange={(e) => handleTemplateChange(e.target.value)}
                placeholder="Hey {clientName}, just a reminder from {businessName} — your auto detail is scheduled for {date} at {time}."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
              <p className="text-xs text-gray-500">
                Available variables: {'{clientName}'}, {'{businessName}'}, {'{date}'}, {'{time}'}, {'{service}'}, {'{carType}'}
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Message Preview</h4>
            <div className="text-sm text-gray-600 bg-white rounded p-3 border">
              {config.messageTemplate || 'Hey {clientName}, just a reminder from {businessName} — your auto detail is scheduled for {date} at {time}.'}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 