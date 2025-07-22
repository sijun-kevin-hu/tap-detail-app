export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (timeString: string | undefined | null) => {
  if (!timeString) return 'N/A';
  const [hour, minute] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatPhone = (phone: string) => {
  // Remove all non-digits and limit to 10 digits
  const cleaned = phone.replace(/\D/g, '').slice(0, 10);
  
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'; // yellow
    case 'confirmed':
      return 'bg-green-600 text-white'; // more visible green
    case 'in-progress':
      return 'bg-blue-500 text-white'; // blue for in progress
    case 'completed':
      return 'bg-green-100 text-green-800'; // green
    case 'archived':
      return 'bg-gray-200 text-gray-600'; // grey
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return 'check-circle';
    case 'cancelled':
    case 'archived':
      return 'x-circle';
    case 'in-progress':
      return 'exclamation-triangle';
    default:
      return 'clock';
  }
};

// Validation functions for appointments
export const validateAppointmentDate = (date: string): boolean => {
  const selectedDate = new Date(date);
  const today = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(today.getMonth() + 6);
  
  // Set time to start of day for comparison
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  sixMonthsFromNow.setHours(0, 0, 0, 0);
  
  return selectedDate >= today && selectedDate <= sixMonthsFromNow;
};

export const validateAppointmentTime = (time: string): boolean => {
  const [hour, minute] = time.split(':').map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
};

export const getMinDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const getMaxDate = (): string => {
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  return sixMonthsFromNow.toISOString().split('T')[0];
}; 

export const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); 