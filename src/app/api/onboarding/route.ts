import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { adminApp, adminAuth } from '@/lib/firebase/admin';
import { isValidBookingLink } from '@/lib/booking-link';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  let uid: string;
  try {
    const user = await adminAuth.verifyIdToken(token);
    if (!user.email_verified) return NextResponse.json({ error: 'Verify your email before continuing.' }, { status: 403 });
    uid = user.uid;
  } catch {
    return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  }

  try {
    const input = await req.json();
    const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
    const firstName = text(input.firstName);
    const lastName = text(input.lastName);
    if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100) {
      return NextResponse.json({ error: 'Enter your first and last name (up to 100 characters each).' }, { status: 400 });
    }
    const finishing = input.step === 'business';
    if (!finishing && input.step !== 'name') return NextResponse.json({ error: 'Invalid setup step.' }, { status: 400 });
    const businessName = text(input.businessName);
    const businessId = text(input.businessId);
    if (finishing && (!businessName || businessName.length > 120 || !isValidBookingLink(businessId))) {
      return NextResponse.json({ error: 'Enter a business name and a booking link using letters, numbers, and hyphens (up to 60 characters).' }, { status: 400 });
    }
    const db = getFirestore(adminApp);
    await db.runTransaction(async transaction => {
      const profileRef = db.collection('detailers').doc(uid);
      const profile = await transaction.get(profileRef);
      if (!profile.exists) throw new Error('PROFILE_MISSING');
      // Completed profiles (including legacy accounts) cannot be renamed by this endpoint.
      if (profile.data()?.onboardingCompleted !== false) {
        if (finishing && profile.data()?.businessId === businessId) return;
        throw new Error('ALREADY_COMPLETE');
      }
      if (finishing) {
        const linkRef = db.collection('bookingLinks').doc(businessId);
        const reservation = await transaction.get(linkRef);
        // Check pre-existing businesses, which do not have a reservation document.
        const legacy = await transaction.get(db.collection('detailers').where('businessId', '==', businessId));
        if ((reservation.exists && reservation.data()?.uid !== uid) || legacy.docs.some(doc => doc.id !== uid)) {
          throw new Error('LINK_TAKEN');
        }
        transaction.set(linkRef, { uid });
      }
      transaction.update(profileRef, {
        firstName, lastName, updatedAt: FieldValue.serverTimestamp(),
        ...(finishing ? { businessName, businessId, onboardingCompleted: true, isActive: true } : {}),
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'LINK_TAKEN') return NextResponse.json({ error: 'That booking link is already taken. Try adding your city or a number.' }, { status: 409 });
    if (code === 'ALREADY_COMPLETE') return NextResponse.json({ error: 'Your setup is already complete. Open your dashboard.' }, { status: 409 });
    if (code === 'PROFILE_MISSING') return NextResponse.json({ error: 'Your account profile could not be found.' }, { status: 404 });
    return NextResponse.json({ error: 'Could not save your setup. Please try again.' }, { status: 500 });
  }
}
