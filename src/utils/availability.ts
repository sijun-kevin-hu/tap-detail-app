import { AvailabilitySettings } from '@/lib/models/detailer';
import { Appointment } from '@/lib/models/appointment';

export interface TimeSlot {
  start: string; // ISO string
  end: string;   // ISO string
  available: boolean;
  reason?: string; // Why slot is unavailable
}

export function getAvailableTimeSlots({
  date,
  serviceDuration,
  availability,
  appointments,
}: {
  date: string; // 'YYYY-MM-DD'
  serviceDuration: number; // in minutes
  availability: AvailabilitySettings;
  appointments: Appointment[];
}): TimeSlot[] {
  // 1. Check if date is blocked
  if (availability.blockedDates.includes(date)) return [];

  // 2. Check if day is a working day
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  if (!availability.workingDays.includes(dayOfWeek)) return [];

  // 3. Get business hours for the day
  const hours = availability.businessHours[dayOfWeek];
  if (!hours) return [];

  // 4. Build all possible slots within business hours
  const slots: TimeSlot[] = [];
  const buffer = availability.bufferMinutes || 0;
  const breaks = availability.breaks.filter(b => b.day === dayOfWeek);

  // Helper to add minutes to a time string
  const addMinutes = (time: string, mins: number) => {
    const [h, m] = time.split(':').map(Number);
    const d = new Date(`${date}T${time}`);
    d.setMinutes(d.getMinutes() + mins);
    return d.toISOString().slice(11, 16); // 'HH:MM'
  };

  // Convert to minutes since midnight
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Generate 15-minute interval slots
  const startTime = toMinutes(hours.start);
  const endTime = toMinutes(hours.end);
  const totalDuration = serviceDuration + buffer;

  for (let minutes = startTime; minutes <= endTime - totalDuration; minutes += 15) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const slotStart = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const slotEnd = addMinutes(slotStart, totalDuration);
    
    // Check for overlap with breaks
    const overlapsBreak = breaks.some(b =>
      (slotStart < b.end && slotEnd > b.start)
    );
    
    // Check for overlap with existing appointments
    const slotStartDate = new Date(`${date}T${slotStart}`);
    const slotEndDate = new Date(`${date}T${slotEnd}`);
    const overlapsAppt = appointments.some(appt => {
      const apptStart = new Date(`${appt.date}T${appt.time}`);
      const apptDuration = appt.estimatedDuration || appt.actualDuration || 60;
      const apptEnd = new Date(apptStart.getTime() + apptDuration * 60000 + buffer * 60000);
      return slotStartDate < apptEnd && slotEndDate > apptStart;
    });
    
    let available = true;
    let reason = '';
    
    if (overlapsBreak) {
      available = false;
      reason = 'Break time';
    } else if (overlapsAppt) {
      available = false;
      reason = 'Booked';
    }
    
    slots.push({
      start: `${date}T${slotStart}`,
      end: `${date}T${slotEnd}`,
      available,
      reason: available ? undefined : reason,
    });
  }
  
  return slots;
} 