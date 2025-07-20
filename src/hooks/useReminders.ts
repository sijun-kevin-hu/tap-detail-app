import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { processReminders, ReminderConfig, ReminderResult } from '@/lib/services/reminderService';
import { Appointment } from '@/lib/models';
import { updateAppointment } from '@/lib/firebase';

export function useReminders(appointments: Appointment[]) {
  const { detailer } = useAuth();
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>({
    enabled: true,
    hoursBeforeAppointment: 24,
    messageTemplate: undefined
  });
  const [processingReminders, setProcessingReminders] = useState(false);
  const [lastReminderResults, setLastReminderResults] = useState<ReminderResult[]>([]);

  // Process reminders when appointments change
  useEffect(() => {
    if (!detailer || !reminderConfig.enabled || appointments.length === 0) {
      return;
    }

    const processAppointmentReminders = async () => {
      setProcessingReminders(true);
      try {
        const results = await processReminders(
          appointments,
          detailer.businessName,
          reminderConfig
        );

        // Update appointment documents for successful reminders
        for (const result of results) {
          if (result.success) {
            await updateAppointment(detailer.uid, result.appointmentId, {
              reminderSent: true,
              reminderSentAt: new Date().toISOString(),
            });
          }
        }

        setLastReminderResults(results);
        
        // Log results
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        if (successful > 0 || failed > 0) {
          console.log(`Reminder processing complete: ${successful} sent, ${failed} failed`);
        }
      } catch (error) {
        console.error('Error processing reminders:', error);
      } finally {
        setProcessingReminders(false);
      }
    };

    processAppointmentReminders();
  }, [appointments, detailer, reminderConfig]);

  // Update reminder configuration
  const updateReminderConfig = (config: Partial<ReminderConfig>) => {
    setReminderConfig(prev => ({ ...prev, ...config }));
  };

  // Manually send reminder for specific appointment
  const sendManualReminder = async (appointment: Appointment): Promise<boolean> => {
    if (!detailer) return false;

    try {
      const results = await processReminders(
        [appointment],
        detailer.businessName,
        reminderConfig
      );

      if (results.length > 0 && results[0].success) {
        await updateAppointment(detailer.uid, appointment.id, {
          reminderSent: true,
          reminderSentAt: new Date().toISOString(),
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending manual reminder:', error);
      return false;
    }
  };

  return {
    reminderConfig,
    processingReminders,
    lastReminderResults,
    updateReminderConfig,
    sendManualReminder
  };
} 