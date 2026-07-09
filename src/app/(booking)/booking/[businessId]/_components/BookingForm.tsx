"use client";

export interface BookingFormValues {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  carType: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  notes: string;
  address: string; // Add address field
  smsConsent: boolean;
}

interface BookingFormProps {
  formData: BookingFormValues;
  onChange: (field: keyof BookingFormValues, value: string) => void;
  onConsentChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export default function BookingForm({ formData, onChange, onConsentChange, onSubmit, submitting }: BookingFormProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your full name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => onChange('clientEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your email address"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => onChange('clientPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="(555) 123-4567"
            required
            maxLength={14}
          />
        </div>

        {/* Vehicle Information */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Vehicle Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Type *
              </label>
              <select
                value={formData.carType}
                onChange={(e) => onChange('carType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select car type</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="RV">RV</option>
                <option value="Boat">Boat</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make
                </label>
                <input
                  type="text"
                  value={formData.carMake || ''}
                  onChange={(e) => onChange('carMake', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Toyota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={formData.carModel || ''}
                  onChange={(e) => onChange('carModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Camry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="text"
                  value={formData.carYear || ''}
                  onChange={(e) => onChange('carYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 2020"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Location *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter the service address or location"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Any special requests or notes..."
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            id="smsConsent"
            type="checkbox"
            checked={formData.smsConsent}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="smsConsent" className="text-sm text-gray-600">
            I agree to receive SMS appointment reminders and confirmations. Message & data rates may apply. Reply STOP to opt out.
          </label>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
        >
          {submitting ? 'Submitting...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
}
