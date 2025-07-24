import { Resend } from 'resend';
import AppointmentConfirmationEmail from '@/lib/templates/AppointmentConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface AppointmentData {
  clientName: string;
  detailerName: string;
  detailerPhone: string;
  date: string;
  time: string;
  service?: string;
  location?: string;
  bookingUrl?: string;
}

/**
 * Sends an appointment confirmation email using Resend and a React template.
 * @param to Recipient email address
 * @param appointmentData Appointment details
 */
export async function sendAppointmentConfirmationEmail(
  to: string,
  appointmentData: AppointmentData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { clientName, detailerName, detailerPhone, date, time, service, location, bookingUrl } = appointmentData;
    const subject = 'Your Car Detailing Appointment is Confirmed!';
    const reactHtml = AppointmentConfirmationEmail({
      clientName,
      detailerName,
      detailerPhone,
      date,
      time,
      service,
      location,
      bookingUrl,
    });
    const { error } = await resend.emails.send({
      from: 'Tap Detail <noreply@tapdetail.com>',
      to,
      subject,
      react: reactHtml,
    });
    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }
    return { success: true };
  } catch (err) {
    console.error('Resend email error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
} 