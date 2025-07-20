export interface ReminderConfig {
  enabled: boolean;
  hoursBeforeAppointment: number;
  messageTemplate?: string;
  businessName?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
}

export interface ReminderLog {
  id: string;
  appointmentId: string;
  clientName: string;
  clientPhone: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  error?: string;
  twilioMessageId?: string;
}

export interface ReminderResult {
  success: boolean;
  appointmentId: string;
  clientName: string;
  message?: string;
  error?: string;
  twilioMessageId?: string;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface TwilioMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
} 