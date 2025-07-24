import { NextRequest, NextResponse } from 'next/server';
import { sendAppointmentConfirmedEmail } from '@/lib/services/emailService';
import { getDoc, doc as firestoreDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client-app';

export async function POST(req: NextRequest) {
  try {
    const { detailerId, appointment } = await req.json();
    if (!appointment?.clientEmail) {
      return NextResponse.json({ success: false, error: 'No client email provided.' }, { status: 400 });
    }
    // Fetch detailer info for contact
    let detailerEmail = '';
    let detailerName = appointment.detailerId;
    let detailerPhone = '';
    try {
      const detailerDoc = await getDoc(firestoreDoc(db, 'detailers', detailerId));
      const detailerData = detailerDoc.exists() ? detailerDoc.data() : {};
      detailerEmail = detailerData.email || '';
      detailerName = detailerData.businessName || detailerName;
      detailerPhone = detailerData.phone || '';
    } catch {}
    const bookingUrl = `https://tapdetail.com/booking/${detailerId}`;
    await sendAppointmentConfirmedEmail(appointment.clientEmail, {
      ...appointment,
      detailerName,
      detailerPhone,
      detailerEmail,
      bookingUrl,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
} 