import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './client-app';
import { ReminderConfig, ReminderLog } from '@/lib/models/reminder';

/**
 * Get reminder configuration for a detailer
 */
export const getReminderConfig = async (detailerId: string): Promise<ReminderConfig | null> => {
  try {
    const configDoc = await getDoc(doc(db, 'detailers', detailerId, 'reminders', 'config'));
    
    if (configDoc.exists()) {
      return configDoc.data() as ReminderConfig;
    }
    
    // Return default config if none exists
    return {
      enabled: false,
      hoursBeforeAppointment: 24,
      messageTemplate: 'Hey {clientName}, just a reminder from {businessName} — your auto detail is scheduled for {date} at {time}.',
      businessName: '',
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioPhoneNumber: ''
    };
  } catch (error) {
    console.error('Error getting reminder config:', error);
    return null;
  }
};

/**
 * Update reminder configuration for a detailer
 */
export const updateReminderConfig = async (
  detailerId: string, 
  config: Partial<ReminderConfig>
): Promise<boolean> => {
  try {
    await setDoc(doc(db, 'detailers', detailerId, 'reminders', 'config'), {
      ...config,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating reminder config:', error);
    return false;
  }
};

/**
 * Save reminder log entry
 */
export const saveReminderLog = async (
  detailerId: string,
  log: Omit<ReminderLog, 'id'>
): Promise<string | null> => {
  try {
    // Fix: Use the correct collection path - reminders should be a subcollection
    const logsCollection = collection(db, 'detailers', detailerId, 'reminders');
    const docRef = await addDoc(logsCollection, {
      ...log,
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving reminder log:', error);
    return null;
  }
};

/**
 * Get reminder logs for a detailer
 */
export const getReminderLogs = async (detailerId: string): Promise<ReminderLog[]> => {
  try {
    // Fix: Use the correct collection path
    const logsQuery = query(
      collection(db, 'detailers', detailerId, 'reminders'),
      orderBy('sentAt', 'desc')
    );
    
    const snapshot = await getDocs(logsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ReminderLog[];
  } catch (error) {
    console.error('Error getting reminder logs:', error);
    return [];
  }
};

/**
 * Update reminder log status
 */
export const updateReminderLog = async (
  detailerId: string,
  logId: string,
  updates: Partial<ReminderLog>
): Promise<boolean> => {
  try {
    // Fix: Use the correct document path
    await updateDoc(doc(db, 'detailers', detailerId, 'reminders', logId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating reminder log:', error);
    return false;
  }
}; 