import { db } from './client-app';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { Earning, NewEarning } from '@/lib/models/earning';

const getEarningsCollection = (detailerId: string) =>
  collection(db, 'detailers', detailerId, 'earnings');

export async function addEarning(detailerId: string, data: NewEarning): Promise<string> {
  const col = getEarningsCollection(detailerId);
  const docRef = doc(col);
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEarning(detailerId: string, earningId: string, data: Partial<NewEarning>): Promise<void> {
  const docRef = doc(db, 'detailers', detailerId, 'earnings', earningId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEarning(detailerId: string, earningId: string): Promise<void> {
  const docRef = doc(db, 'detailers', detailerId, 'earnings', earningId);
  await deleteDoc(docRef);
}

export async function getEarnings(detailerId: string, from: string, to: string): Promise<Earning[]> {
  const col = getEarningsCollection(detailerId);
  const q = query(
    col,
    where('date', '>=', from),
    where('date', '<=', to),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.().toISOString?.() || '',
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() || '',
    } as Earning;
  });
}

export async function findEarningByAppointmentId(detailerId: string, appointmentId: string): Promise<Earning | null> {
  const col = getEarningsCollection(detailerId);
  const q = query(col, where('appointmentId', '==', appointmentId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toISOString?.() || '',
    updatedAt: data.updatedAt?.toDate?.().toISOString?.() || '',
  } as Earning;
}

export async function syncEarningForAppointment(detailerId: string, appointment: {
  id: string;
  date: string;
  clientName: string;
  service: string;
  price: number;
  status: string;
}) {
  const earning = await findEarningByAppointmentId(detailerId, appointment.id);
  const shouldHaveEarning = ["completed", "archived"].includes(appointment.status) && appointment.price != null;
  if (shouldHaveEarning && !earning) {
    await addEarning(detailerId, {
      appointmentId: appointment.id,
      date: appointment.date,
      clientName: appointment.clientName,
      service: appointment.service,
      price: appointment.price,
    });
  } else if (!shouldHaveEarning && earning) {
    await deleteEarning(detailerId, earning.id);
  }
} 