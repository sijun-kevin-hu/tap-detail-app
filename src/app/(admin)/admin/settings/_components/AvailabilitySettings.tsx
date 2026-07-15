import type { AvailabilitySettings } from '@/lib/models/detailer';
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getDetailerAvailability, updateDetailerAvailability } from '@/lib/firebase/firestore-detailers';
import Toast from '@/components/ui/Toast';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_HOURS = { start: '09:00', end: '17:00' };
const DEFAULT_BUFFER = 15;
const DEFAULT_TIMEZONE = 'America/New_York';

interface AvailabilitySettingsProps {
  detailerId: string;
}

function getDefaultBusinessHours(): { [day: string]: { start: string; end: string } } {
  return Object.fromEntries(WEEKDAYS.map(d => [d, { ...DEFAULT_HOURS }])) as { [day: string]: { start: string; end: string } };
}

// Format a Date as local YYYY-MM-DD (toISOString would shift the day across timezones)
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatBlockedDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AvailabilitySettings({ detailerId }: AvailabilitySettingsProps) {
  const [availability, setAvailability] = useState<AvailabilitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleToastClose = () => {
    setShowToast(false);
    setToastMessage('');
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getDetailerAvailability(detailerId);
        setAvailability(
          data || {
            businessHours: getDefaultBusinessHours(),
            workingDays: [...WEEKDAYS],
            breaks: [],
            bufferMinutes: DEFAULT_BUFFER,
            blockedDates: [],
            timezone: DEFAULT_TIMEZONE,
          }
        );
      } catch {
        setToastMessage('Failed to load availability settings');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [detailerId]);

  const handleDayToggle = (day: string) => {
    if (!availability) return;
    setAvailability({
      ...availability,
      workingDays: availability.workingDays.includes(day)
        ? availability.workingDays.filter(d => d !== day)
        : [...availability.workingDays, day],
      // Remove breaks for this day if unchecked
      breaks: availability.workingDays.includes(day)
        ? availability.breaks.filter(b => b.day !== day)
        : availability.breaks,
    });
  };

  const handleHourChange = (day: string, field: 'start' | 'end', value: string) => {
    if (!availability) return;
    setAvailability({
      ...availability,
      businessHours: {
        ...availability.businessHours,
        [day]: {
          start: field === 'start' ? value : availability.businessHours[day]?.start || DEFAULT_HOURS.start,
          end: field === 'end' ? value : availability.businessHours[day]?.end || DEFAULT_HOURS.end,
        },
      },
    });
  };

  const handleBreakChange = (idx: number, field: 'start' | 'end', value: string) => {
    if (!availability) return;
    const newBreaks = [...availability.breaks];
    newBreaks[idx] = { ...newBreaks[idx], [field]: value };
    setAvailability({ ...availability, breaks: newBreaks });
  };

  const handleAddBreak = (day: string) => {
    if (!availability) return;
    setAvailability({
      ...availability,
      breaks: [...availability.breaks, { day, start: '12:00', end: '13:00' }],
    });
  };

  const handleRemoveBreak = (idx: number) => {
    if (!availability) return;
    setAvailability({
      ...availability,
      breaks: availability.breaks.filter((_, i) => i !== idx),
    });
  };

  const handleBufferChange = (value: number) => {
    if (!availability) return;
    setAvailability({ ...availability, bufferMinutes: value });
  };

  const handleBlockedDateToggle = (date: Date) => {
    if (!availability) return;
    const dateStr = toDateString(date);
    const blockedDates = availability.blockedDates.includes(dateStr)
      ? availability.blockedDates.filter(d => d !== dateStr)
      : [...availability.blockedDates, dateStr].sort();
    setAvailability({ ...availability, blockedDates });
  };

  const handleRemoveBlockedDate = (dateStr: string) => {
    if (!availability) return;
    setAvailability({
      ...availability,
      blockedDates: availability.blockedDates.filter(d => d !== dateStr),
    });
  };

  const handleTimezoneChange = (value: string) => {
    if (!availability) return;
    setAvailability({ ...availability, timezone: value });
  };

  const handleSave = async () => {
    if (!availability) return;
    setSaving(true);
    
    try {
      await updateDetailerAvailability(detailerId, availability);
      setToastMessage('Settings saved successfully!');
      setShowToast(true);
    } catch {
      setToastMessage('Failed to save settings');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !availability) return <div>Loading availability...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Availability</h3>
      <Toast message={toastMessage} show={showToast} onClose={handleToastClose} />

      {/* Working Days */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map(day => (
            <label key={day} className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base font-medium cursor-pointer select-none transition-all ${availability.workingDays.includes(day) ? 'ring-2 ring-indigo-500' : ''}`}
              style={{ minWidth: 120 }}
            >
              <input
                type="checkbox"
                checked={availability.workingDays.includes(day)}
                onChange={() => handleDayToggle(day)}
                className="accent-indigo-600 h-6 w-6"
                style={{ minWidth: 24, minHeight: 24 }}
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Business Hours */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
        <div className="flex flex-col gap-3">
          {WEEKDAYS.filter(day => availability.workingDays.includes(day)).map(day => (
            <div key={day} className="flex flex-col sm:flex-row items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span className="w-24 text-xs text-gray-600 font-semibold mb-1 sm:mb-0">{day}</span>
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <input
                  type="time"
                  value={availability.businessHours[day]?.start || DEFAULT_HOURS.start}
                  onChange={e => handleHourChange(day, 'start', e.target.value)}
                  className="input-modern w-full sm:w-32 text-base px-3 py-3"
                  disabled={!availability.workingDays.includes(day)}
                  style={{ minHeight: 48 }}
                />
                <span className="text-xs flex items-center">to</span>
                <input
                  type="time"
                  value={availability.businessHours[day]?.end || DEFAULT_HOURS.end}
                  onChange={e => handleHourChange(day, 'end', e.target.value)}
                  className="input-modern w-full sm:w-32 text-base px-3 py-3"
                  disabled={!availability.workingDays.includes(day)}
                  style={{ minHeight: 48 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breaks */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Breaks / Lunch</label>
        <div className="space-y-2">
          {availability.breaks.filter(brk => availability.workingDays.includes(brk.day)).map((brk, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <select
                value={brk.day}
                onChange={e => {
                  const newBreaks = [...availability.breaks];
                  newBreaks[idx] = { ...newBreaks[idx], day: e.target.value };
                  setAvailability({ ...availability, breaks: newBreaks });
                }}
                className="input-modern w-full sm:w-32 text-base px-3 py-3"
                style={{ minHeight: 48 }}
              >
                {WEEKDAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input
                type="time"
                value={brk.start}
                onChange={e => handleBreakChange(idx, 'start', e.target.value)}
                className="input-modern w-full sm:w-28 text-base px-3 py-3"
                style={{ minHeight: 48 }}
              />
              <span className="text-xs flex items-center">to</span>
              <input
                type="time"
                value={brk.end}
                onChange={e => handleBreakChange(idx, 'end', e.target.value)}
                className="input-modern w-full sm:w-28 text-base px-3 py-3"
                style={{ minHeight: 48 }}
              />
              <button
                type="button"
                className="text-red-500 text-base ml-2 mt-2 sm:mt-0 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-all"
                style={{ minHeight: 48, minWidth: 48 }}
                onClick={() => handleRemoveBreak(idx)}
              >Remove</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {WEEKDAYS.filter(day => availability.workingDays.includes(day)).map(day => (
            <button
              key={day}
              type="button"
              className="btn-secondary text-base py-3 px-5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-all"
              style={{ minHeight: 48, minWidth: 120 }}
              onClick={() => handleAddBreak(day)}
            >
              Add Break for {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Buffer Time */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time (minutes)</label>
        <input
          type="number"
          min={0}
          max={60}
          value={availability.bufferMinutes}
          onChange={e => handleBufferChange(Number(e.target.value))}
          className="input-modern w-32 text-base px-3 py-3"
          style={{ minHeight: 48 }}
        />
        <span className="text-xs text-gray-500 ml-2">Time between appointments</span>
      </div>

      {/* Blocked Dates */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Blocked Dates (vacation/holidays)</label>
        <div className="blocked-dates-calendar rounded-xl border border-gray-200 shadow-sm bg-white overflow-x-visible w-full max-w-md">
          <Calendar
            onClickDay={handleBlockedDateToggle}
            value={null}
            minDate={new Date()}
            tileClassName={({ date, view }) =>
              view === 'month' && availability.blockedDates.includes(toDateString(date))
                ? 'blocked-date-tile'
                : null
            }
            className="w-full"
            navigationLabel={({ date }) => `${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
            nextLabel=">"
            prevLabel="<"
            next2Label=">>"
            prev2Label="<<"
          />
        </div>
        <span className="text-xs text-gray-500">Tap a date to block it; tap again to unblock.</span>
        {availability.blockedDates.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {availability.blockedDates.map(dateStr => (
              <span
                key={dateStr}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
              >
                {formatBlockedDate(dateStr)}
                <button
                  type="button"
                  aria-label={`Unblock ${dateStr}`}
                  className="text-red-400 hover:text-red-600 font-bold"
                  onClick={() => handleRemoveBlockedDate(dateStr)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Timezone */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          value={availability.timezone || DEFAULT_TIMEZONE}
          onChange={e => handleTimezoneChange(e.target.value)}
          className="input-modern w-full sm:w-64 text-base px-3 py-3"
          style={{ minHeight: 48 }}
        >
          {/* For demo, just a few timezones. In production, use a full list. */}
          <option value="America/New_York">America/New_York (Eastern)</option>
          <option value="America/Chicago">America/Chicago (Central)</option>
          <option value="America/Denver">America/Denver (Mountain)</option>
          <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      <button
        type="button"
        className="btn-primary w-full mt-2 text-lg py-4 rounded-xl"
        style={{ minHeight: 56 }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  );
} 