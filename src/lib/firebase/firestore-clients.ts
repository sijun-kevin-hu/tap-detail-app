import { db } from './client-app';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { Client, NewClient, FirestoreClient } from '@/lib/models/client';

const getClientsCollection = (detailerId: string) =>
  collection(db, 'detailers', detailerId, 'clients');

export async function addClient(detailerId: string, client: NewClient): Promise<string> {
  const clientsCol = getClientsCollection(detailerId);
  const docRef = doc(clientsCol);
  const firestoreClient: FirestoreClient = {
    ...client,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, firestoreClient);
  return docRef.id;
  }

export async function getClients(detailerId: string): Promise<Client[]> {
  const clientsCol = getClientsCollection(detailerId);
  const snapshot = await getDocs(clientsCol);
  return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
    ...docSnap.data(),
    createdAt:
      docSnap.data().createdAt && typeof (docSnap.data().createdAt as any).toDate === 'function' // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (docSnap.data().createdAt as Timestamp).toDate().toISOString()
        : docSnap.data().createdAt instanceof Date
          ? docSnap.data().createdAt.toISOString()
          : new Date().toISOString(),
    updatedAt:
      docSnap.data().updatedAt && typeof (docSnap.data().updatedAt as any).toDate === 'function' // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (docSnap.data().updatedAt as Timestamp).toDate().toISOString()
        : docSnap.data().updatedAt instanceof Date
          ? docSnap.data().updatedAt.toISOString()
          : undefined,
  }) as Client);
}

export async function getClientById(detailerId: string, clientId: string): Promise<Client | null> {
  const clientDoc = doc(db, 'detailers', detailerId, 'clients', clientId);
  const snap = await getDoc(clientDoc);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt:
      data.createdAt && typeof (data.createdAt as any).toDate === 'function' // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (data.createdAt as Timestamp).toDate().toISOString()
        : data.createdAt instanceof Date
          ? data.createdAt.toISOString()
          : new Date().toISOString(),
    updatedAt:
      data.updatedAt && typeof (data.updatedAt as any).toDate === 'function' // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (data.updatedAt as Timestamp).toDate().toISOString()
        : data.updatedAt instanceof Date
          ? data.updatedAt.toISOString()
          : undefined,
  } as Client;
  }

export async function updateClient(detailerId: string, clientId: string, client: Partial<NewClient>): Promise<void> {
  const clientDoc = doc(db, 'detailers', detailerId, 'clients', clientId);
  await updateDoc(clientDoc, {
    ...client,
      updatedAt: serverTimestamp(),
  });
}

export async function deleteClient(detailerId: string, clientId: string): Promise<void> {
  const clientDoc = doc(db, 'detailers', detailerId, 'clients', clientId);
  await deleteDoc(clientDoc);
  }

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
        createdAt:
          data.createdAt && typeof (data.createdAt as any).toDate === 'function' // eslint-disable-line @typescript-eslint/no-explicit-any
            ? (data.createdAt as Timestamp).toDate().toISOString()
            : data.createdAt instanceof Date
              ? data.createdAt.toISOString()
              : new Date().toISOString(),
        updatedAt:
          data.updatedAt && typeof (data.updatedAt as any).toDate === 'function' // eslint-disable-line @typescript-eslint/no-explicit-any
            ? (data.updatedAt as Timestamp).toDate().toISOString()
            : data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : undefined,
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