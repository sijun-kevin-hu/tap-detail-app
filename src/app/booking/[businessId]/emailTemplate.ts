export function appointmentConfirmationEmail({
  clientName,
  detailerName,
  detailerPhone,
  date,
  time,
  bookingUrl,
}: {
  clientName: string;
  detailerName: string;
  detailerPhone: string;
  date: string;
  time: string;
  bookingUrl: string;
}) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 32px; color: #222;">
    <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(80,80,180,0.07); padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #4f46e5; border-radius: 50%; padding: 16px; margin-bottom: 8px;">
          <svg width="32" height="32" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #4f46e5; margin: 0;">Tap Detail</h2>
      </div>
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 16px;">Hi ${clientName},</h3>
      <p style="font-size: 1rem; margin-bottom: 16px;">Thank you for booking with <strong>${detailerName}</strong> on Tap Detail! Your appointment is confirmed.</p>
      <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 0 0 8px 0;"><strong>Detailer:</strong> ${detailerName}</p>
        <p style="margin: 0;"><strong>Phone:</strong> <a href="tel:${detailerPhone}" style="color:#4f46e5; text-decoration:underline;">${detailerPhone}</a></p>
      </div>
      <a href="${bookingUrl}" style="display:inline-block; background:#4f46e5; color:#fff; font-weight:600; padding:12px 28px; border-radius:8px; text-decoration:none; margin-bottom: 16px;">View or Manage Your Booking</a>
      <p style="font-size: 0.95rem; color: #64748b; margin-top: 24px;">We look forward to serving you!<br/>— The Tap Detail Team</p>
    </div>
    <div style="text-align:center; color:#94a3b8; font-size:0.85rem; margin-top:24px;">&copy; ${new Date().getFullYear()} Tap Detail</div>
  </div>
  `;
} 