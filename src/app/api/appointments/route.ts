import { NextRequest, NextResponse } from 'next/server';
import { saveAppointmentToDB } from '@/lib/firebase/firestore-appointments';
import { sendAppointmentRequestReceivedEmail } from '@/lib/services/emailService';
import { sendDetailerNewAppointmentNotification } from '@/lib/services/emailService';
import { sendAppointmentConfirmedEmail } from '@/lib/services/emailService';
import { getDoc, doc as firestoreDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export async function POST(req: NextRequest) {
  try {
    const { detailerId, appointmentData, isManual } = await req.json();
    // Appointments the detailer creates manually are confirmed right away;
    // client-submitted booking requests start out pending.
    const status = isManual ? 'confirmed' : 'pending';
    // Save appointment to Firestore
    const id = await saveAppointmentToDB(detailerId, appointmentData, status);

    // Fetch detailer info for email
    let detailerName = 'Your Detailer';
    let detailerPhone = '';
    let detailerEmail = '';
    let businessId = '';
    try {
      const detailerDoc = await getDoc(firestoreDoc(db, 'detailers', detailerId));
      const detailerData = detailerDoc.exists() ? detailerDoc.data() : {};
      detailerName = detailerData.businessName || detailerName;
      detailerPhone = detailerData.phone || '';
      detailerEmail = detailerData.email || '';
      businessId = detailerData.businessId || '';
    } catch {}
    // The public booking page is keyed by businessId, not the detailer's uid;
    // skip the link (button is hidden) if we couldn't resolve one.
    const bookingUrl = businessId
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tapdetail.com'}/booking/${businessId}`
      : undefined;

    // Whether we're allowed to email the client (they provided an address and consented).
    const canEmailClient = Boolean(appointmentData.clientEmail && appointmentData.emailConsent);

    if (isManual) {
      // Detailer created and auto-confirmed the appointment: send the client the
      // confirmation email directly (if they gave an email and consented).
      if (canEmailClient) {
        try {
          await sendAppointmentConfirmedEmail(appointmentData.clientEmail, {
            ...appointmentData,
            detailerName,
            detailerPhone,
            detailerEmail,
            bookingUrl,
          });
        } catch (emailErr) {
          console.error('Failed to send appointment confirmed email:', emailErr);
          // Do not throw, just log
        }
      }
    } else {
      // Send request received email if the client provided an email and consented
      if (canEmailClient) {
        try {
          await sendAppointmentRequestReceivedEmail(appointmentData.clientEmail, {
            ...appointmentData,
            detailerName,
            detailerPhone,
            bookingUrl,
          });
        } catch (emailErr) {
          console.error('Failed to send appointment request received email:', emailErr);
          // Do not throw, just log
          return NextResponse.json({ success: false, error: 'Appointment booked, but failed to send request received email.' }, { status: 200 });
        }
      }
      // Send notification email to detailer if they have an email
      if (detailerEmail) {
        try {
          await sendDetailerNewAppointmentNotification(detailerEmail, {
            ...appointmentData,
            detailerName,
            detailerPhone,
            bookingUrl,
          });
        } catch (emailErr) {
          console.error('Failed to send detailer notification email:', emailErr);
          // Do not throw, just log
        }
      }
    }
    return NextResponse.json({ success: true, id });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
} 