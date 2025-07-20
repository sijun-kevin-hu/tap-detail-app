// TODO: Re-enable Twilio SMS reminder functionality when ready for production
// This service is temporarily disabled but preserved for future implementation
// To re-enable: 
// 1. Set up Twilio account and get credentials
// 2. Add environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
// 3. Uncomment the reminder UI components
// 4. Test the SMS functionality

import { addDays, isWithinInterval, parseISO } from 'date-fns';
import { Appointment } from '@/lib/models';
import { ReminderConfig, ReminderResult, ReminderLog, TwilioConfig } from '@/lib/models/reminder';
import { sendTwilioSMS, validateTwilioConfig } from './twilioService';
import { 
  getReminderConfig, 
  updateReminderConfig, 
  saveReminderLog, 
  getReminderLogs 
} from '@/lib/firebase/firestore-reminders';
import { updateAppointment } from '@/lib/firebase/firestore-appointments';

/**
 * Check if appointment is within reminder window
 */
export const isAppointmentInReminderWindow = (
  appointment: Appointment,
  hoursBefore: number = 24
): boolean => {
  const now = new Date();
  const appointmentDateTime = parseISO(`${appointment.date}T${appointment.time}`);
  const reminderStart = addDays(appointmentDateTime, -hoursBefore / 24);
  
  return isWithinInterval(now, {
    start: reminderStart,
    end: appointmentDateTime
  });
};

/**
 * Generate reminder message with template variables
 */
export const generateReminderMessage = (
  appointment: Appointment,
  businessName: string,
  template?: string
): string => {
  const defaultTemplate = `Hey {clientName}, just a reminder from {businessName} — your auto detail is scheduled for {date} at {time}.`;
  
  const messageTemplate = template || defaultTemplate;
  
  return messageTemplate
    .replace('{clientName}', appointment.clientName)
    .replace('{businessName}', businessName)
    .replace('{date}', appointment.date)
    .replace('{time}', appointment.time)
    .replace('{service}', appointment.service)
    .replace('{carType}', appointment.carType || 'vehicle');
};

/**
 * Send SMS reminder using Twilio
 */
export const sendSMSReminder = async (
  detailerId: string,
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Get reminder config to access Twilio credentials
    const config = await getReminderConfig(detailerId);
    if (!config) {
      throw new Error('Reminder configuration not found');
    }
    
    // Validate Twilio configuration
    const twilioConfig: TwilioConfig = {
      accountSid: config.twilioAccountSid || '',
      authToken: config.twilioAuthToken || '',
      phoneNumber: config.twilioPhoneNumber || ''
    };
    
    const validation = validateTwilioConfig(twilioConfig);
    if (!validation.valid) {
      throw new Error(`Twilio configuration invalid: ${validation.errors.join(', ')}`);
    }
    
    // Send SMS via Twilio
    const result = await sendTwilioSMS(twilioConfig, phoneNumber, message);
    
    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error
    };
    
  } catch (error) {
    console.error('Failed to send SMS reminder:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Process reminders for appointments
 */
export const processReminders = async (
  detailerId: string,
  appointments: Appointment[]
): Promise<ReminderResult[]> => {
  try {
    // Get reminder configuration
    const config = await getReminderConfig(detailerId);
    if (!config || !config.enabled) {
      return [];
    }
    
    const results: ReminderResult[] = [];
    
    for (const appointment of appointments) {
      // Skip if reminder already sent
      if (appointment.reminderSent) {
        continue;
      }
      
      // Skip if appointment is not confirmed
      if (appointment.status !== 'confirmed') {
        continue;
      }
      
      // Check if appointment is within reminder window
      if (!isAppointmentInReminderWindow(appointment, config.hoursBeforeAppointment)) {
        continue;
      }
      
      // Generate reminder message
      const message = generateReminderMessage(
        appointment, 
        config.businessName || 'Auto Detail Service',
        config.messageTemplate
      );
      
      // Send SMS reminder
      const smsResult = await sendSMSReminder(detailerId, appointment.clientPhone, message);
      
      // Create reminder log
      const logEntry: Omit<ReminderLog, 'id'> = {
        appointmentId: appointment.id,
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        message: message,
        status: smsResult.success ? 'sent' : 'failed',
        sentAt: new Date().toISOString(),
        error: smsResult.error,
        twilioMessageId: smsResult.messageId
      };
      
      await saveReminderLog(detailerId, logEntry);
      
      // Update appointment if reminder was sent successfully
      if (smsResult.success) {
        await updateAppointment(detailerId, appointment.id, {
          reminderSent: true,
          reminderSentAt: new Date().toISOString()
        });
      }
      
      results.push({
        success: smsResult.success,
        appointmentId: appointment.id,
        clientName: appointment.clientName,
        message: smsResult.success ? message : undefined,
        error: smsResult.error,
        twilioMessageId: smsResult.messageId
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('Error processing reminders:', error);
    return [];
  }
};

/**
 * Send manual reminder for a specific appointment
 */
export const sendManualReminder = async (
  detailerId: string,
  appointment: Appointment
): Promise<ReminderResult> => {
  try {
    // Get reminder configuration
    const config = await getReminderConfig(detailerId);
    if (!config) {
      throw new Error('Reminder configuration not found');
    }
    
    // Generate reminder message
    const message = generateReminderMessage(
      appointment, 
      config.businessName || 'Auto Detail Service',
      config.messageTemplate
    );
    
    // Send SMS reminder
    const smsResult = await sendSMSReminder(detailerId, appointment.clientPhone, message);
    
    // Create reminder log
    const logEntry: Omit<ReminderLog, 'id'> = {
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      message: message,
      status: smsResult.success ? 'sent' : 'failed',
      sentAt: new Date().toISOString(),
      error: smsResult.error,
      twilioMessageId: smsResult.messageId
    };
    
    await saveReminderLog(detailerId, logEntry);
    
    // Update appointment if reminder was sent successfully
    if (smsResult.success) {
      await updateAppointment(detailerId, appointment.id, {
        reminderSent: true,
        reminderSentAt: new Date().toISOString()
      });
    }
    
    return {
      success: smsResult.success,
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      message: smsResult.success ? message : undefined,
      error: smsResult.error,
      twilioMessageId: smsResult.messageId
    };
    
  } catch (error) {
    console.error('Error sending manual reminder:', error);
    return {
      success: false,
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get reminder logs for a detailer
 */
export const getReminderHistory = async (detailerId: string): Promise<ReminderLog[]> => {
  return await getReminderLogs(detailerId);
};

/**
 * Update reminder configuration
 */
export const updateReminderSettings = async (
  detailerId: string,
  config: Partial<ReminderConfig>
): Promise<boolean> => {
  return await updateReminderConfig(detailerId, config);
}; 