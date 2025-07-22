import { Appointment } from '@/lib/firebase/firestore-appointments';
import { AvailabilitySettings } from '@/lib/models/detailer';
import { ServiceMenu } from '@/lib/models/settings';

export interface TimeSlot {
  start: string; // ISO string
  end: string;   // ISO string
  available: boolean;
  reason?: string; // Why slot is unavailable
}

/**
 * Calculate available time slots for a given date, considering:
 * - Detailer's business hours and working days
 * - Detailer's buffer time (bufferMinutes)
 * - Service-specific buffer time (service.buffer)
 * - Existing appointments with their duration + buffer time
 * - Break times
 * 
 * @param date - The date to check (YYYY-MM-DD format)
 * @param serviceDuration - Duration of the service in minutes
 * @param availability - Detailer's availability settings
 * @param appointments - Existing appointments for the date
 * @param services - Array of services to get service-specific buffer times
 * @returns Array of time slots with availability status
 */
export function getAvailableTimeSlots({
  date,
  serviceDuration,
  availability,
  appointments,
  services = [],
}: {
  date: string; // 'YYYY-MM-DD'
  serviceDuration: number; // in minutes
  availability: AvailabilitySettings;
  appointments: Appointment[];
  services?: ServiceMenu[]; // Optional services array to get service-specific buffer
}): TimeSlot[] {
  // 1. Check if date is blocked
  if (availability.blockedDates.includes(date)) return [];

  // 2. Check if day is a working day
  // Parse date string manually to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day); // month is 0-indexed
  const dayOfWeek = localDate.toLocaleDateString('en-US', { weekday: 'long' });
  
  if (!availability.workingDays.includes(dayOfWeek)) return [];

  // 3. Get business hours for the day
  const hours = availability.businessHours[dayOfWeek];
  
  // Auto-fix corrupted business hours
  if (!hours || !hours.start || !hours.end) {
    // Use default hours for this day
    const defaultHours = { start: '09:00', end: '17:00' };
    return getAvailableTimeSlots({
      date,
      serviceDuration,
      availability: {
        ...availability,
        businessHours: {
          ...availability.businessHours,
          [dayOfWeek]: defaultHours,
        },
      },
      appointments,
      services,
    });
  }

  // 4. Build all possible slots within business hours
  const slots: TimeSlot[] = [];
  const detailerBuffer = availability.bufferMinutes || 0;
  const breaks = availability.breaks.filter(b => b.day === dayOfWeek);

  // Helper to add minutes to a time string
  const addMinutes = (time: string, mins: number) => {
    if (!time || typeof time !== 'string') {
      console.warn('Invalid time value in addMinutes:', time);
      return '00:00';
    }
    try {
      const d = new Date(`${date}T${time}`);
      d.setMinutes(d.getMinutes() + mins);
      return d.toISOString().slice(11, 16); // 'HH:MM'
    } catch (error) {
      console.warn('Error in addMinutes:', error);
      return '00:00';
    }
  };

  // Convert to minutes since midnight
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Convert minutes to time string (HH:MM)
  const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Generate 15-minute interval slots
  const startTimeMinutes = toMinutes(hours.start);
  const endTimeMinutes = toMinutes(hours.end);
  
  // For each 15-minute slot, check if it can accommodate the service
  for (let slotStartMinutes = startTimeMinutes; slotStartMinutes <= endTimeMinutes - serviceDuration; slotStartMinutes += 15) {
    const slotStart = minutesToTime(slotStartMinutes);
    const slotEnd = addMinutes(slotStart, serviceDuration);
    
    // Check for overlap with breaks
    const overlapsBreak = breaks.some(b => {
      const breakStart = toMinutes(b.start);
      const breakEnd = toMinutes(b.end);
      return slotStartMinutes < breakEnd && (slotStartMinutes + serviceDuration) > breakStart;
    });
    
    // Check for overlap with existing appointments
    const overlapsAppt = appointments.some(appt => {
      // Validate appointment time
      if (!appt.time || typeof appt.time !== 'string') {
        console.warn('Invalid appointment time:', appt.time);
        return false;
      }
      
      // Convert appointment time to minutes for easier comparison
      const apptStartMinutes = toMinutes(appt.time);
      const apptDuration = appt.actualDuration || appt.estimatedDuration || 60;
      
      // Get service-specific buffer for this appointment
      const apptService = services.find(s => s.name === appt.service);
      const serviceBuffer = apptService?.buffer || 0;
      const totalApptBuffer = detailerBuffer + serviceBuffer;
      
      // Calculate appointment end time in minutes (including buffer)
      const apptEndMinutes = apptStartMinutes + apptDuration + totalApptBuffer;
      
      // Check if the new slot overlaps with this appointment
      // Only block slots that start during the appointment time
      const slotEndMinutes = slotStartMinutes + serviceDuration;
      
      // Slot overlaps if it starts during the appointment window
      // This means the slot start time is >= appointment start AND < appointment end
      const overlaps = slotStartMinutes >= apptStartMinutes && slotStartMinutes < apptEndMinutes;
      
      return overlaps;
    });
    
    let available = true;
    let reason = '';
    
    if (overlapsBreak) {
      available = false;
      reason = 'Break time';
    } else if (overlapsAppt) {
      available = false;
      reason = 'Appointment conflict';
    }
    
    slots.push({
      start: `${date}T${slotStart}:00`,
      end: `${date}T${slotEnd}:00`,
      available,
      reason: available ? undefined : reason,
    });
  }
  
  return slots;
} 