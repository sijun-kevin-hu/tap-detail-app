import { addDays, isWithinInterval, parseISO } from 'date-fns';
import { Appointment } from '@/lib/models';

// Twilio configuration (placeholder for now)
// const TWILIO_ACCOUNT_SID = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || '';
// const TWILIO_AUTH_TOKEN = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || '';
// const TWILIO_PHONE_NUMBER = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || '';

export interface ReminderConfig {
  enabled: boolean;
  hoursBeforeAppointment: number;
  messageTemplate?: string;
}

export interface ReminderResult {
  success: boolean;
  appointmentId: string;
  clientName: string;
  message?: string;
  error?: string;
}

/**
 * Format phone number to E.164 format (+1XXXXXXXXXX)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it's already in E.164 format, return as is
  if (digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`;
  }
  
  // If it's a 10-digit US number, add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it's an 11-digit number starting with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Return as is if it doesn't match US format
  return phone;
};

/**
 * Check if appointment is within reminder window
 */
export const isAppointmentInReminderWindow = (
  appointment: Appointment,
  hoursBefore: number = 24
): boolean => {                                                                                                                                                                                                                             
  const now = new Date();
  const appointmentDateTime = parseISO(`${appointment.date}T${appointment.time}`);
  const reminderStart = addDays(appointmentDateTime, -hoursBefore / 24); // Convert hours to days
  
  return isWithinInterval(now, {
    start: reminderStart,
    end: appointmentDateTime
  });
};

/**
 * Generate reminder message
 */
export const generateReminderMessage = (
  appointment: Appointment,
  businessName: string,
  template?: string
): string => {
  const defaultTemplate = `Hey ${appointment.clientName}, just a reminder from ${businessName} — your auto detail is scheduled for ${appointment.date} at ${appointment.time}.`;
  
  if (template) {
    return template
      .replace('{clientName}', appointment.clientName)
      .replace('{businessName}', businessName)
      .replace('{date}', appointment.date)
      .replace('{time}', appointment.time)
      .replace('{service}', appointment.service)
      .replace('{carType}', appointment.carType);
  }
  
  return defaultTemplate;
};

/**
 * Send SMS reminder using Twilio (placeholder implementation)
 */
export const sendSMSReminder = async (
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // For now, just log the SMS (placeholder)
    console.log('SMS Reminder:', {
      to: formattedPhone,
      message,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement actual Twilio SMS sending
    // const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   from: TWILIO_PHONE_NUMBER,
    //   to: formattedPhone
    // });
    
    return { success: true };
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
  appointments: Appointment[],
  businessName: string,
  config: ReminderConfig
): Promise<ReminderResult[]> => {
  if (!config.enabled) {
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
    
    // Generate and send reminder
    const message = generateReminderMessage(appointment, businessName, config.messageTemplate);
    const smsResult = await sendSMSReminder(appointment.clientPhone, message);
    
    results.push({
      success: smsResult.success,
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      message: smsResult.success ? message : undefined,
      error: smsResult.error
    });
  }
  
  return results;
}; 