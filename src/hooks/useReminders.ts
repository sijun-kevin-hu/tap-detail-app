import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  processReminders, 
  sendManualReminder, 
  getReminderHistory,
  updateReminderSettings 
} from '@/lib/services/reminderService';
import { getReminderConfig } from '@/lib/firebase/firestore-reminders';
import { ReminderConfig, ReminderLog } from '@/lib/models/reminder';
import { Appointment } from '@/lib/models';

export function useReminders() {
  const { detailer } = useAuth();
  const [config, setConfig] = useState<ReminderConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<ReminderLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load reminder configuration
  useEffect(() => {
    if (detailer?.uid) {
      loadConfig();
      loadHistory();
    }
  }, [detailer?.uid]);

  const loadConfig = async () => {
    if (!detailer?.uid) return;
    
    try {
      setLoading(true);
      const reminderConfig = await getReminderConfig(detailer.uid);
      setConfig(reminderConfig);
    } catch (err) {
      console.error('Error loading reminder config:', err);
      setError('Failed to load reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!detailer?.uid) return;
    
    try {
      const logs = await getReminderHistory(detailer.uid);
      setHistory(logs);
    } catch (err) {
      console.error('Error loading reminder history:', err);
    }
  };

  const updateConfig = async (updates: Partial<ReminderConfig>) => {
    if (!detailer?.uid || !config) return;
    
    try {
      setLoading(true);
      const success = await updateReminderSettings(detailer.uid, updates);
      
      if (success) {
        setConfig({ ...config, ...updates });
        setError(null);
      } else {
        setError('Failed to update reminder settings');
      }
    } catch (err) {
      console.error('Error updating reminder config:', err);
      setError('Failed to update reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const processAutomaticReminders = async (appointments: Appointment[]) => {
    if (!detailer?.uid || !config?.enabled) return [];
    
    try {
      setProcessing(true);
      const results = await processReminders(detailer.uid, appointments);
      
      // Reload history after processing
      await loadHistory();
      
      return results;
    } catch (err) {
      console.error('Error processing reminders:', err);
      setError('Failed to process reminders');
      return [];
    } finally {
      setProcessing(false);
    }
  };

  const sendManualReminderForAppointment = async (appointment: Appointment) => {
    if (!detailer?.uid) return null;
    
    try {
      setProcessing(true);
      const result = await sendManualReminder(detailer.uid, appointment);
      
      // Reload history after sending
      await loadHistory();
      
      return result;
    } catch (err) {
      console.error('Error sending manual reminder:', err);
      setError('Failed to send reminder');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // State
    config,
    loading,
    processing,
    history,
    error,
    
    // Actions
    updateConfig,
    processAutomaticReminders,
    sendManualReminderForAppointment,
    loadConfig,
    loadHistory,
    clearError
  };
} 