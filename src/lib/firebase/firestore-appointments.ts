import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  FieldValue,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from './client-app';
import { autoCreateClientFromAppointment } from './firestore-clients';
import { Appointment } from '@/lib/models/appointment';

// Types for appointment data
export interface FirestoreAppointment extends Omit<Appointment, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp | FieldValue | Date;
  updatedAt: Timestamp | FieldValue | Date;
}

// Firestore Structure:
// /detailers/{detailerId}/appointments/{appointmentId} → client booking data

// Utility: Map Firestore doc to Appointment
function mapAppointmentDoc(doc: QueryDocumentSnapshot<DocumentData>) {
  const data = doc.data();
  return {
    id: doc.id,
    detailerId: data.detailerId || '',
    assignedDetailerId: data.assignedDetailerId,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    carType: data.carType || '',
    carMake: data.carMake || '',
    carModel: data.carModel || '',
    carYear: data.carYear || '',
    service: data.service,
    price: data.price,
    date: data.date,
    time: data.time,
    address: data.address,
    status: data.status,
    notes: data.notes,
    createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    deletedAt: data.deletedAt,
    reminderSent: data.reminderSent || false,
    reminderSentAt: data.reminderSentAt,
    estimatedDuration: data.estimatedDuration,
    actualDuration: data.actualDuration,
    paymentStatus: data.paymentStatus,
    paymentMethod: data.paymentMethod,
  };
}

/**
 * Get appointments for a detailer with optional filters and pagination
 * @param detailerId - The detailer's unique identifier
 * @param options - { clientEmail, clientPhone, status, limit, startAfter }
 * @returns Promise<{ appointments: Appointment[], lastDoc: QueryDocumentSnapshot | null }>
 */
export const getAppointments = async (
  detailerId: string,
  options: {
    clientEmail?: string,
    clientPhone?: string,
    status?: string,
    limitNum?: number,
    startAfterDoc?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  } = {}
): Promise<{ appointments: Appointment[], lastDoc: any | null }> => { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const appointmentsRef = collection(db, 'detailers', detailerId, 'appointments');
    let q = query(appointmentsRef, orderBy('date', 'desc'));
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    if (options.clientEmail) {
      q = query(q, where('clientEmail', '==', options.clientEmail));
    }
    if (options.clientPhone) {
      q = query(q, where('clientPhone', '==', options.clientPhone));
    }
    if (options.limitNum) {
      q = query(q, limit(options.limitNum));
    }
    if (options.startAfterDoc) {
      q = query(q, startAfter(options.startAfterDoc));
    }
    const querySnapshot = await getDocs(q);
    const appointments = querySnapshot.docs.map(mapAppointmentDoc);
    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
    return { appointments, lastDoc };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw new Error('Failed to fetch appointments');
  }
};

/**
 * Get all appointments for a detailer (legacy, with hard cap)
 * @param detailerId - The detailer's unique identifier
 * @param max - Maximum number of appointments to fetch (default 1000)
 * @returns Promise<Appointment[]>
 */
export const getAllAppointments = async (detailerId: string, max = 1000): Promise<Appointment[]> => {
  const { appointments } = await getAppointments(detailerId, { limitNum: max });
  if (appointments.length === max) {
    console.warn('getAllAppointments: hit max cap, results may be incomplete.');
  }
  return appointments;
};

/**
 * Get appointments by status for a detailer
 * @param detailerId - The detailer's unique identifier
 * @param status - The appointment status to filter by
 * @returns Promise<Appointment[]> - Array of appointments with the specified status
 */
export const getAppointmentsByStatus = async (
  detailerId: string, 
  status: Appointment['status']
): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'detailers', detailerId, 'appointments');
    const q = query(
      appointmentsRef, 
      where('status', '==', status),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as FirestoreAppointment;
      appointments.push({
        id: doc.id,
        detailerId: detailerId,
        assignedDetailerId: data.assignedDetailerId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        carType: data.carType || '',
        carMake: data.carMake || '',
        carModel: data.carModel || '',
        carYear: data.carYear || '',
        service: data.service,
        price: data.price,
        date: data.date,
        time: data.time,
        address: data.address,
        status: data.status,
        notes: data.notes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: data.createdAt && typeof (data.createdAt as any).toDate === 'function' ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedAt: data.updatedAt && typeof (data.updatedAt as any).toDate === 'function' ? (data.updatedAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        deletedAt: data.deletedAt,
        reminderSent: data.reminderSent || false,
        reminderSentAt: data.reminderSentAt,
        estimatedDuration: data.estimatedDuration,
        actualDuration: data.actualDuration,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
      });
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments by status:', error);
    throw new Error('Failed to fetch appointments by status');
  }
};

/**
 * Update an existing appointment
 * @param detailerId - The detailer's unique identifier
 * @param appointmentId - The appointment document ID to update
 * @param updatedData - The updated appointment data
 * @returns Promise<void>
 */
export const updateAppointment = async (
  detailerId: string, 
  appointmentId: string, 
  updatedData: Partial<Appointment>
): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'detailers', detailerId, 'appointments', appointmentId);
    const updateData = {
      ...updatedData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(appointmentRef, updateData);
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
};

/**
 * Delete an appointment
 * @param detailerId - The detailer's unique identifier
 * @param appointmentId - The appointment document ID to delete
 * @returns Promise<void>
 */
export const deleteAppointment = async (detailerId: string, appointmentId: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'detailers', detailerId, 'appointments', appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw new Error('Failed to delete appointment');
  }
};

/**
 * Get a single appointment by ID
 * @param detailerId - The detailer's unique identifier
 * @param appointmentId - The appointment document ID
 * @returns Promise<Appointment | null> - The appointment data or null if not found
 */
export const getAppointment = async (
  detailerId: string, 
  appointmentId: string
): Promise<Appointment | null> => {
  try {
    const appointmentRef = doc(db, 'detailers', detailerId, 'appointments', appointmentId);
    const appointmentDoc = await getDoc(appointmentRef);
    
    if (appointmentDoc.exists()) {
      const data = appointmentDoc.data() as FirestoreAppointment;
      return {
        id: appointmentDoc.id,
        detailerId: detailerId,
        assignedDetailerId: data.assignedDetailerId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        carType: data.carType || '',
        carMake: data.carMake || '',
        carModel: data.carModel || '',
        carYear: data.carYear || '',
        service: data.service,
        price: data.price,
        date: data.date,
        time: data.time,
        address: data.address,
        status: data.status,
        notes: data.notes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: data.createdAt && typeof (data.createdAt as any).toDate === 'function' ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedAt: data.updatedAt && typeof (data.updatedAt as any).toDate === 'function' ? (data.updatedAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        deletedAt: data.deletedAt,
        reminderSent: data.reminderSent || false,
        reminderSentAt: data.reminderSentAt,
        estimatedDuration: data.estimatedDuration,
        actualDuration: data.actualDuration,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw new Error('Failed to fetch appointment');
  }
};

/**
 * Update appointment status
 * @param detailerId - The detailer's unique identifier
 * @param appointmentId - The appointment document ID
 * @param status - The new status
 * @returns Promise<void>
 */
export const updateAppointmentStatus = async (
  detailerId: string, 
  appointmentId: string, 
  status: Appointment['status']
): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'detailers', detailerId, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw new Error('Failed to update appointment status');
  }
}; 

export const getAppointmentsForDate = async (detailerId: string, date: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'detailers', detailerId, 'appointments');
    const q = query(
      appointmentsRef,
      where('date', '==', date),
      where('status', 'in', ['pending', 'confirmed', 'in-progress'])
    );
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as FirestoreAppointment;
      appointments.push({
        id: doc.id,
        detailerId: detailerId,
        assignedDetailerId: data.assignedDetailerId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        carType: data.carType || '',
        carMake: data.carMake || '',
        carModel: data.carModel || '',
        carYear: data.carYear || '',
        service: data.service,
        price: data.price,
        date: data.date,
        time: data.time,
        address: data.address,
        status: data.status,
        notes: data.notes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: data.createdAt && typeof (data.createdAt as any).toDate === 'function' ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedAt: data.updatedAt && typeof (data.updatedAt as any).toDate === 'function' ? (data.updatedAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        deletedAt: data.deletedAt,
        reminderSent: data.reminderSent || false,
        reminderSentAt: data.reminderSentAt,
        estimatedDuration: data.estimatedDuration,
        actualDuration: data.actualDuration,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
      });
    });
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments for date:', error);
    throw new Error('Failed to fetch appointments for date');
  }
}; 

// Only include Firestore logic and client-safe code here
export const saveAppointmentToDB = async (detailerId: string, appointmentData: Omit<Appointment, 'id' | 'detailerId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const appointmentsRef = collection(db, 'detailers', detailerId, 'appointments');
    const newAppointment: Appointment = {
      ...appointmentData,
      id: '', // Will be set by Firestore
      detailerId: detailerId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = doc(appointmentsRef);
    await setDoc(docRef, newAppointment);
    // Auto-create client if they don't exist
    await autoCreateClientFromAppointment(detailerId, {
      clientName: appointmentData.clientName,
      clientPhone: appointmentData.clientPhone,
      clientEmail: appointmentData.clientEmail,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }
}; 