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

function formatTime12Hour(time: string) {
  if (!time) return '';
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute.padStart(2, '0')} ${ampm}`;
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

/**
 * Sends a notification email to the detailer when a new appointment is scheduled.
 * @param to Detailer's email address
 * @param appointmentData Appointment details
 */
export async function sendDetailerNewAppointmentNotification(
  to: string,
  appointmentData: AppointmentData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { clientName, date, time, service, location } = appointmentData;
    const subject = 'New Appointment Request - Action Required';
    const serviceLine = service ? `<div style='margin-bottom:6px;'><strong>Service:</strong> ${service}</div>` : '';
    const locationLine = location ? `<div style='margin-bottom:6px;'><strong>Location:</strong> ${location}</div>` : '';
    const userLine = clientName ? `<div style='margin-bottom:6px;'><strong>User:</strong> ${clientName}</div>` : '';
    const html = `
      <div style="background:#f8fafc;padding:40px 0;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(80,80,180,0.07);padding:32px 24px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#4f46e5;border-radius:50%;padding:16px;margin-bottom:8px;">
              <svg width="32" height="32" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div style="font-size:1.5rem;font-weight:700;color:#4f46e5;margin:0;">Tap Detail</div>
          </div>
          <div style="font-size:1.25rem;font-weight:600;margin-bottom:16px;">New Appointment Request</div>
          <div style="font-size:1rem;margin-bottom:16px;">You have received a new appointment request from <strong>${clientName}</strong>. Please review and take action below.</div>
          <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:20px;">
            <div style='margin-bottom:6px;'><strong>Date:</strong> ${date}</div>
            <div style='margin-bottom:6px;'><strong>Time:</strong> ${formatTime12Hour(time)}</div>
            ${userLine}
            ${serviceLine}
            ${locationLine}
          </div>
          <a href="https://tapdetail.com/admin/appointments" style="display:inline-block;background:#4f46e5;color:#fff;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:1rem;margin-bottom:16px;">Go to Appointments</a>
          <div style="font-size:1rem;color:#64748b;margin-top:24px;text-align:center;">Tap Detail</div>
        </div>
        <div style="text-align:center;color:#94a3b8;font-size:0.85rem;margin-top:24px;">&copy; ${new Date().getFullYear()} Tap Detail</div>
      </div>
    `;
    const { error } = await resend.emails.send({
      from: 'Tap Detail <noreply@tapdetail.com>',
      to,
      subject,
      html,
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

/**
 * Sends a confirmation email to the client when the appointment is confirmed by the detailer.
 * @param to Recipient email address
 * @param appointmentData Appointment details
 */
export async function sendAppointmentConfirmedEmail(
  to: string,
  appointmentData: AppointmentData & { detailerEmail?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { clientName, detailerName, detailerPhone, detailerEmail, date, time, service, location, bookingUrl } = appointmentData;
    const subject = 'Your Car Detailing Appointment is Confirmed!';
    const serviceLine = service ? `<div style='margin-bottom:6px;'><strong>Service:</strong> ${service}</div>` : '';
    const locationLine = location ? `<div style='margin-bottom:6px;'><strong>Location:</strong> ${location}</div>` : '';
    const contactLine = `<div style='margin-bottom:6px;'><strong>Contact:</strong> <a href='tel:${detailerPhone}' style='color:#4f46e5;text-decoration:underline;'>${detailerPhone}</a>${detailerEmail ? ` | <a href='mailto:${detailerEmail}' style='color:#4f46e5;text-decoration:underline;'>${detailerEmail}</a>` : ''}</div>`;
    const html = `
      <div style="background:#f8fafc;padding:40px 0;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(80,80,180,0.07);padding:32px 24px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#4f46e5;border-radius:50%;padding:16px;margin-bottom:8px;">
              <svg width="32" height="32" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div style="font-size:1.5rem;font-weight:700;color:#4f46e5;margin:0;">Tap Detail</div>
          </div>
          <div style="font-size:1.25rem;font-weight:600;margin-bottom:16px;">Appointment Confirmed</div>
          <div style="font-size:1rem;margin-bottom:16px;">Hello ${clientName},<br/><br/>Your car detailing appointment has been <strong>confirmed</strong> by <strong>${detailerName}</strong>. Here are your appointment details:</div>
          <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:20px;">
            <div style='margin-bottom:6px;'><strong>Date:</strong> ${date}</div>
            <div style='margin-bottom:6px;'><strong>Time:</strong> ${formatTime12Hour(time)}</div>
            ${serviceLine}
            ${locationLine}
            <div style='margin-bottom:6px;'><strong>Detailer:</strong> ${detailerName}</div>
            ${contactLine}
          </div>
          ${bookingUrl ? `<a href='${bookingUrl}' style='display:inline-block;background:#4f46e5;color:#fff;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:1rem;margin-bottom:16px;'>View Booking Details</a>` : ''}
          <div style="font-size:1rem;color:#64748b;margin-top:24px;text-align:center;">If you have any questions or need to make changes, please contact your detailer directly.<br/><br/>We look forward to serving you!<br/><span style='color:#4f46e5;font-weight:600;'>— The Tap Detail Team</span></div>
        </div>
        <div style="text-align:center;color:#94a3b8;font-size:0.85rem;margin-top:24px;">&copy; ${new Date().getFullYear()} Tap Detail</div>
      </div>
    `;
    const { error } = await resend.emails.send({
      from: 'Tap Detail <noreply@tapdetail.com>',
      to,
      subject,
      html,
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

/**
 * Sends an email to the client when their appointment request is received (not yet confirmed).
 * @param to Recipient email address
 * @param appointmentData Appointment details
 */
export async function sendAppointmentRequestReceivedEmail(
  to: string,
  appointmentData: AppointmentData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { clientName, detailerName, detailerPhone, date, time, service, location, bookingUrl } = appointmentData;
    const subject = 'Your Appointment Request Has Been Received';
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