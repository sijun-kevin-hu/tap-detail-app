import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { sendCustomEmailVerification } from '@/lib/services/authEmailService';

export async function POST(req: NextRequest) {
  try {
    // Require a Firebase ID token: only a signed-in user may trigger this email.
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // verifyIdToken checks the token's signature + expiry against Firebase.
    // The decoded token is the source of truth for identity — we ignore any
    // email in the request body so a caller can only email their own address.
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.email) {
      return NextResponse.json({ success: false, error: 'Account has no email' }, { status: 400 });
    }

    await sendCustomEmailVerification(decoded.email);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // A bad/expired token surfaces here as a verify failure -> treat as unauthorized.
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
