export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  source: 'manual' | 'auto';
  totalAppointments?: number;
  lastServiceDate?: string;
  // New fields for appointment tracking
  currentAppointments?: AppointmentSummary[];
  pastAppointments?: AppointmentSummary[];
  totalSpent?: number;
  averageAppointmentValue?: number;
}

export interface AppointmentSummary {
  id: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'archived';
  address: string;
}

export interface NewClient {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  source: 'manual' | 'auto';
}

export interface ClientFormData {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
}

// Firestore data structure
export interface FirestoreClient extends Omit<Client, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: any;
  updatedAt?: any;
}

// Validation functions
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // US phone number validation (10 or 11 digits)
  return cleaned.length === 10 || cleaned.length === 11;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateClientForm = (formData: ClientFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate full name
  if (!formData.fullName.trim()) {
    errors.push('Full name is required');
  } else if (formData.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  // Validate phone number
  if (!formData.phone.trim()) {
    errors.push('Phone number is required');
  } else if (!validatePhoneNumber(formData.phone)) {
    errors.push('Please enter a valid phone number');
  }

  // Validate email (optional but if provided, must be valid)
  if (formData.email.trim() && !validateEmail(formData.email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 