import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getDetailerAvailability } from '@/lib/firebase/firestore-detailers';
import { getAppointmentsForDate } from '@/lib/firebase/firestore-appointments';
import { getAvailableTimeSlots, TimeSlot } from '@/utils/availability';
import { ServiceMenu } from '@/lib/models/settings';

interface UnifiedDateTimePickerProps {
  detailerId: string;
  serviceName: string;
  services?: ServiceMenu[];
  value?: { date: string; time: string };
  onChange: (val: { date: string; time: string }) => void;
}

export default function UnifiedDateTimePicker({ detailerId, serviceName, services = [], value, onChange }: UnifiedDateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value?.date ? new Date(value.date) : null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const service = services.find(s => s.name === serviceName);
  const serviceDuration = service?.duration || 60;

  // Calculate max date (3 months from today)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  // Load slots for selected date
  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setError('');
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    (async () => {
      try {
        const [availability, appointments] = await Promise.all([
          getDetailerAvailability(detailerId),
          getAppointmentsForDate(detailerId, dateStr),
        ]);
        
        if (!availability) {
          setSlots([]);
          setLoading(false);
          return;
        }
        
        const slots = getAvailableTimeSlots({
          date: dateStr,
          serviceDuration,
          availability,
          appointments,
          services,
        });
        
        setSlots(slots);
      } catch (err) {
        console.error('Error loading time slots:', err);
        setSlots([]);
        setError('Failed to load slots');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate, detailerId, serviceDuration, services]);

  // Disable dates in the past
  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="w-full max-w-md mx-auto px-0 sm:px-2 flex flex-col">
      {!serviceName ? (
        <div className="text-gray-500 text-center py-8">Please select a service to choose a date and time.</div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 shadow-sm mb-4 bg-white overflow-x-visible w-full">
            <Calendar
              onChange={date => setSelectedDate(date as Date)}
              value={selectedDate}
              tileDisabled={tileDisabled}
              minDate={new Date()}
              maxDate={maxDate}
              className="w-full"
              navigationLabel={({ date }) => `${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
              nextLabel=">"
              prevLabel="<"
              next2Label=">>"
              prev2Label="<<"
            />
          </div>
          {selectedDate && (
            <div className="mt-2">
              <div className="font-medium text-sm mb-2 text-gray-700">Available Time Slots</div>
              {loading ? (
                <div>Loading slots...</div>
              ) : error ? (
                <div className="text-red-600 text-sm">{error}</div>
              ) : !slots.length ? (
                <div className="text-gray-500 text-sm">No available slots for this day.</div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
                  {slots.map(slot => {
                    const startDate = new Date(slot.start);
                    const start = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                    const isSelected = value && value.date === selectedDate.toISOString().split('T')[0] && value.time === slot.start.slice(11, 16);

                    if (slot.available) {
                      return (
                        <button
                          key={slot.start}
                          className={`rounded-lg px-4 py-3 text-base font-medium border transition-colors w-full
                            ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-900 border-gray-200 hover:bg-indigo-50'}
                          `}
                          onClick={() => onChange({ date: selectedDate.toISOString().split('T')[0], time: slot.start.slice(11, 16) })}
                          type="button"
                          style={{ minHeight: 48 }}
                        >
                          {start}
                        </button>
                      );
                    } else {
                      return (
                        <div
                          key={slot.start}
                          className="rounded-lg px-4 py-3 text-base font-medium border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed w-full flex flex-col items-center justify-center"
                          style={{ minHeight: 48 }}
                        >
                          <div className="text-sm">{start}</div>
                          <div className="text-xs text-gray-400">{slot.reason}</div>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 