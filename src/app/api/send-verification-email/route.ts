import { NextRequest, NextResponse } from 'next/server';
import { sendCustomEmailVerification } from '@/lib/services/authEmailService';

export async function POST(req: NextRequest) {
  try {
    const { email, uid } = await req.json();
    console.log('Sending verification email to:', email, 'uid:', uid);
    await sendCustomEmailVerification(email, uid);
    console.log('Verification email sent (no error thrown)');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verification email error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
} 