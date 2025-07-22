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

export interface FirestoreClient extends Omit<Client, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
} 