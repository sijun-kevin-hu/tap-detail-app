import { NextRequest, NextResponse } from 'next/server';
import { saveAppointmentToDB } from '@/lib/firebase/firestore-appointments';
import { sendAppointmentRequestReceivedEmail } from '@/lib/services/emailService';
import { sendDetailerNewAppointmentNotification } from '@/lib/services/emailService';
import { getDoc, doc as firestoreDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client-app';

export async function POST(req: NextRequest) {
  try {
    const { detailerId, appointmentData, isManual } = await req.json();
    // Save appointment to Firestore
    const id = await saveAppointmentToDB(detailerId, appointmentData);

    // Fetch detailer info for email
    let detailerName = 'Your Detailer';
    let detailerPhone = '';
    let detailerEmail = '';
    try {
      const detailerDoc = await getDoc(firestoreDoc(db, 'detailers', detailerId));
      const detailerData = detailerDoc.exists() ? detailerDoc.data() : {};
      detailerName = detailerData.businessName || detailerName;
      detailerPhone = detailerData.phone || '';
      detailerEmail = detailerData.email || '';
    } catch {}
    const bookingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/booking/${detailerId}`;

    // Only send emails if not manual
    if (!isManual) {
      // Send request received email if clientEmail is present
      if (appointmentData.clientEmail) {
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