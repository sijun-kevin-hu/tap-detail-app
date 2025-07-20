import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './client-app';
import { Client, NewClient, FirestoreClient, AppointmentSummary } from '@/lib/models/client';
import { getAppointments } from './firestore-appointments';

/**
 * Get all clients for a detailer with appointment data
 * @param detailerId - The detailer's unique identifier
 * @returns Promise<Client[]> - Array of all clients with appointment data
 */
export const getClients = async (detailerId: string): Promise<Client[]> => {
  try {
    const clientsRef = collection(db, 'detailers', detailerId, 'clients');
    const q = query(clientsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const clients: Client[] = [];
    
    // Get all appointments for this detailer
    const appointments = await getAppointments(detailerId);
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as FirestoreClient;
      const clientId = doc.id;
      
      // Filter appointments for this client
      const clientAppointments = appointments.filter(apt => 
        apt.clientPhone === data.phone || 
        (data.email && apt.clientEmail === data.email)
      );
      
      // Separate current and past appointments
      const now = new Date();
      const currentAppointments = clientAppointments
        .filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= now && apt.status !== 'archived';
        })
        .map(apt => ({
          id: apt.id,
          service: apt.service,
          date: apt.date,
          time: apt.time,
          price: apt.price,
          status: apt.status,
          address: apt.address
        } as AppointmentSummary));
      
      const pastAppointments = clientAppointments
        .filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate < now || apt.status === 'archived';
        })
        .map(apt => ({
          id: apt.id,
          service: apt.service,
          date: apt.date,
          time: apt.time,
          price: apt.price,
          status: apt.status,
          address: apt.address
        } as AppointmentSummary));
      
      // Calculate financial data
      const completedAppointments = pastAppointments.filter(apt => apt.status === 'completed');
      const totalSpent = completedAppointments.reduce((sum, apt) => sum + apt.price, 0);
      const averageAppointmentValue = completedAppointments.length > 0 
        ? totalSpent / completedAppointments.length 
        : 0;
      
      // Get last service date
      const lastServiceDate = pastAppointments.length > 0 
        ? pastAppointments[0].date 
        : '';
      
      clients.push({
        id: clientId,
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        notes: data.notes || '',
        source: data.source || 'manual',
        totalAppointments: clientAppointments.length,
        lastServiceDate,
        currentAppointments,
        pastAppointments,
        totalSpent,
        averageAppointmentValue,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      });
    });
    
    return clients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw new Error('Failed to fetch clients');
  }
};

/**
 * Get a specific client by ID with appointment data
 * @param detailerId - The detailer's unique identifier
 * @param clientId - The client's unique identifier
 * @returns Promise<Client | null> - The client data or null if not found
 */
export const getClient = async (detailerId: string, clientId: string): Promise<Client | null> => {
  try {
    const clientRef = doc(db, 'detailers', detailerId, 'clients', clientId);
    const docSnap = await getDoc(clientRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreClient;
      
      // Get appointments for this client
      const appointments = await getAppointments(detailerId);
      const clientAppointments = appointments.filter(apt => 
        apt.clientPhone === data.phone || 
        (data.email && apt.clientEmail === data.email)
      );
      
      // Separate current and past appointments
      const now = new Date();
      const currentAppointments = clientAppointments
        .filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= now && apt.status !== 'archived';
        })
        .map(apt => ({
          id: apt.id,
          service: apt.service,
          date: apt.date,
          time: apt.time,
          price: apt.price,
          status: apt.status,
          address: apt.address
        } as AppointmentSummary));
      
      const pastAppointments = clientAppointments
        .filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate < now || apt.status === 'archived';
        })
        .map(apt => ({
          id: apt.id,
          service: apt.service,
          date: apt.date,
          time: apt.time,
          price: apt.price,
          status: apt.status,
          address: apt.address
        } as AppointmentSummary));
      
      // Calculate financial data
      const completedAppointments = pastAppointments.filter(apt => apt.status === 'completed');
      const totalSpent = completedAppointments.reduce((sum, apt) => sum + apt.price, 0);
      const averageAppointmentValue = completedAppointments.length > 0 
        ? totalSpent / completedAppointments.length 
        : 0;
      
      // Get last service date
      const lastServiceDate = pastAppointments.length > 0 
        ? pastAppointments[0].date 
        : '';
      
      return {
        id: docSnap.id,
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        notes: data.notes || '',
        source: data.source || 'manual',
        totalAppointments: clientAppointments.length,
        lastServiceDate,
        currentAppointments,
        pastAppointments,
        totalSpent,
        averageAppointmentValue,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching client:', error);
    throw new Error('Failed to fetch client');
  }
};

/**
 * Add a new client
 * @param detailerId - The detailer's unique identifier
 * @param clientData - The client data to add
 * @returns Promise<string> - The new client document ID
 */
export const addClient = async (detailerId: string, clientData: NewClient): Promise<string> => {
  try {
    const clientsRef = collection(db, 'detailers', detailerId, 'clients');
    
    const newClient: FirestoreClient = {
      ...clientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(clientsRef, newClient);
    return docRef.id;
  } catch (error) {
    console.error('Error adding client:', error);
    throw new Error('Failed to add client');
  }
};

/**
 * Update an existing client
 * @param detailerId - The detailer's unique identifier
 * @param clientId - The client's unique identifier
 * @param updatedData - The updated client data
 * @returns Promise<void>
 */
export const updateClient = async (
  detailerId: string,
  clientId: string,
  updatedData: Partial<Client>
): Promise<void> => {
  try {
    const clientRef = doc(db, 'detailers', detailerId, 'clients', clientId);
    const updateData = {
      ...updatedData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(clientRef, updateData);
  } catch (error) {
    console.error('Error updating client:', error);
    throw new Error('Failed to update client');
  }
};

/**
 * Delete a client
 * @param detailerId - The detailer's unique identifier
 * @param clientId - The client's unique identifier
 * @returns Promise<void>
 */
export const deleteClient = async (detailerId: string, clientId: string): Promise<void> => {
  try {
    const clientRef = doc(db, 'detailers', detailerId, 'clients', clientId);
    await deleteDoc(clientRef);
  } catch (error) {
    console.error('Error deleting client:', error);
    throw new Error('Failed to delete client');
  }
};

/**
 * Find client by phone number
 * @param detailerId - The detailer's unique identifier
 * @param phone - The phone number to search for
 * @returns Promise<Client | null> - The client data or null if not found
 */
export const findClientByPhone = async (detailerId: string, phone: string): Promise<Client | null> => {
  try {
    const clientsRef = collection(db, 'detailers', detailerId, 'clients');
    const q = query(clientsRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data() as FirestoreClient;
      return {
        id: doc.id,
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        notes: data.notes || '',
        source: data.source || 'manual',
        totalAppointments: data.totalAppointments || 0,
        lastServiceDate: data.lastServiceDate || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding client by phone:', error);
    throw new Error('Failed to find client');
  }
};

/**
 * Auto-create client from appointment data
 * @param detailerId - The detailer's unique identifier
 * @param appointmentData - The appointment data containing client info
 * @returns Promise<string | null> - The client ID if created, null if already exists
 */
export const autoCreateClientFromAppointment = async (
  detailerId: string,
  appointmentData: { clientName: string; clientPhone: string; clientEmail?: string }
): Promise<string | null> => {
  try {
    // Check if client already exists
    const existingClient = await findClientByPhone(detailerId, appointmentData.clientPhone);
    if (existingClient) {
      return existingClient.id;
    }
    
    // Create new client
    const newClient: NewClient = {
      fullName: appointmentData.clientName,
      phone: appointmentData.clientPhone,
      email: appointmentData.clientEmail || '',
      notes: '',
      source: 'auto',
    };
    
    const clientId = await addClient(detailerId, newClient);
    return clientId;
  } catch (error) {
    console.error('Error auto-creating client:', error);
    return null;
  }
}; 