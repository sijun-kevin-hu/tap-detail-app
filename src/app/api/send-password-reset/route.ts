import { NextRequest, NextResponse } from 'next/server';
import { sendCustomPasswordReset } from '@/lib/services/authEmailService';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    await sendCustomPasswordReset(email);
    return NextResponse.json({ success: true });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
} 