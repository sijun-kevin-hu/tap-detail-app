import React, { useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { ReminderConfig } from '@/lib/models/reminder';

interface ReminderSettingsProps {
  config: ReminderConfig;
  onConfigChange: (config: Partial<ReminderConfig>) => void;
  loading?: boolean;
}

export default function ReminderSettings({ config }: ReminderSettingsProps) {
  // Update local config when prop changes
  useEffect(() => {
    // setLocalConfig(config); // This line is removed as per the edit hint
  }, [config]);

  // Remove unused variables and handlers

  // TODO: Re-enable reminder settings UI when Twilio integration is ready
  // This feature has been temporarily disabled but the code is preserved for future implementation
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <BellIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Auto Reminders</h3>
          <p className="text-sm text-gray-600">SMS reminder feature temporarily disabled</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Feature Coming Soon
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                The SMS reminder feature is currently disabled. This will be re-enabled once Twilio integration is fully implemented.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: Uncomment this section when Twilio integration is ready
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <BellIcon className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Auto Reminders</h3>
          <p className="text-sm text-gray-600">Automatically send SMS reminders to clients</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Enable Auto Reminders</h4>
            <p className="text-sm text-gray-600">Send automatic SMS reminders to clients</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localConfig.enabled ? 'bg-indigo-600' : 'bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localConfig.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {localConfig.enabled && (
        <>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium text-gray-900">Business Information</h4>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                type="text"
                value={localConfig.businessName || ''}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
                placeholder="Your Business Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

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
                value={localConfig.hoursBeforeAppointment}
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
                value={localConfig.messageTemplate || ''}
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

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <KeyIcon className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium text-gray-900">Twilio Configuration</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twilio Account SID
                </label>
                <input
                  type="text"
                  value={localConfig.twilioAccountSid || ''}
                  onChange={(e) => handleTwilioConfigChange('twilioAccountSid', e.target.value)}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twilio Auth Token
                </label>
                <input
                  type="password"
                  value={localConfig.twilioAuthToken || ''}
                  onChange={(e) => handleTwilioConfigChange('twilioAuthToken', e.target.value)}
                  placeholder="Your Twilio Auth Token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twilio Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={localConfig.twilioPhoneNumber || ''}
                    onChange={(e) => handleTwilioConfigChange('twilioPhoneNumber', e.target.value)}
                    placeholder="+1XXXXXXXXXX"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be in E.164 format (e.g., +1XXXXXXXXXX)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Message Preview</h4>
            <div className="text-sm text-gray-600 bg-white rounded p-3 border">
              {localConfig.messageTemplate || 'Hey {clientName}, just a reminder from {businessName} — your auto detail is scheduled for {date} at {time}.'}
            </div>
          </div>
        </>
      )}
      */}
    </div>
  );
} 