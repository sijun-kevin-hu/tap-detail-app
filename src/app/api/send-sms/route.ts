// TODO: Re-enable Twilio SMS API route when ready for production
// This API route is temporarily disabled but preserved for future implementation
// To re-enable:
// 1. Set up Twilio account and get credentials
// 2. Add environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
// 3. Test the SMS functionality with real Twilio API calls

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accountSid, authToken, from, to, message } = await request.json();
    
    // Validate required fields
    if (!accountSid || !authToken || !from || !to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would use the Twilio SDK
    // For now, we'll simulate the Twilio API call
    
    // Simulate Twilio API call
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: message,
        }),
      }
    );
    
    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.text();
      console.error('Twilio API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send SMS via Twilio' },
        { status: twilioResponse.status }
      );
    }
    
    const result = await twilioResponse.json();
    
    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status
    });
    
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 