// Appointment status values
export type AppointmentStatus =
  | 'pending'        // Appointment is pending confirmation by detailer
  | 'confirmed'      // Appointment is confirmed and ready for service
  | 'in-progress'    // Appointment is currently being serviced
  | 'completed'      // Appointment has been completed
  | 'archived';      // Appointment was deleted/archived by detailer

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'in-progress',
  'completed',
  'archived',
];

export interface Service {
    name: string;
    price: number;
    description?: string;
    duration?: number; // in minutes
}

export interface Appointment {
    id: string;
    detailerId: string; // The detailer who owns/created this appointment
    assignedDetailerId?: string; // The detailer assigned to perform the service (for future multi-detailer support)
    
    // Client information
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    
    // Vehicle information
    carType: string;
    carMake?: string;
    carModel?: string;
    carYear?: string;
    
    // Service details
    service: string;
    price: number;
    
    // Scheduling
    date: string;
    time: string;
    address: string;
    
    // Status and metadata
    status: AppointmentStatus;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string; // Timestamp when appointment was archived/deleted
    
    // Reminder system
    reminderSent?: boolean;
    reminderSentAt?: string;
    
    // Optional fields
    estimatedDuration?: number;
    actualDuration?: number;
    paymentStatus?: 'pending' | 'paid' | 'refunded';
    paymentMethod?: string;
}

export interface AppointmentFormData {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    carType: string;
    carMake?: string;
    carModel?: string;
    carYear?: string;
    service: string;
    date: string;
    time: string;
    address: string;
    notes: string;
    price: number;
    assignedDetailerId?: string;
    reminderSent?: boolean;
}

export interface AppointmentFilters {
    searchTerm: string;
    statusFilter: 'all' | 'pending' | 'confirmed' | 'in-progress' | 'completed';
    dateFilter?: string;
    detailerFilter?: string;
}

// Predefined services
export const APPOINTMENT_SERVICES: Service[] = [
    { name: 'Basic Wash', price: 25, description: 'Exterior wash and interior vacuum', duration: 60 },
    { name: 'Standard Detail', price: 75, description: 'Full interior and exterior cleaning', duration: 120 },
    { name: 'Premium Detail', price: 125, description: 'Deep cleaning with wax and interior treatment', duration: 180 },
    { name: 'Ultimate Detail', price: 200, description: 'Complete restoration with paint correction', duration: 240 },
    { name: 'Interior Only', price: 50, description: 'Complete interior cleaning and sanitization', duration: 90 },
    { name: 'Exterior Only', price: 40, description: 'Exterior wash, wax, and tire dressing', duration: 75 },
    { name: 'Paint Correction', price: 300, description: 'Professional paint correction and protection', duration: 300 },
    { name: 'Ceramic Coating', price: 500, description: 'Long-term paint protection coating', duration: 360 }
];

// Common car types for better organization
export const CAR_TYPES = [
    'Sedan',
    'SUV',
    'Truck',
    'Van',
    'Coupe',
    'Convertible',
    'Wagon',
    'Hatchback',
    'Sports Car',
    'Luxury Car',
    'Electric Vehicle',
    'Hybrid',
    'Motorcycle',
    'RV',
    'Boat',
    'Other'
] as const;

export type CarType = typeof CAR_TYPES[number]; 