// TODO: Re-enable Twilio SMS service when ready for production
// This service is temporarily disabled but preserved for future implementation
// To re-enable:
// 1. Set up Twilio account and get credentials
// 2. Add environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
// 3. Test the SMS functionality with real Twilio API calls

import { TwilioConfig, TwilioMessageResponse } from '@/lib/models/reminder';
import { formatPhone } from '@/utils/formatters';

/**
 * Send SMS using Twilio API
 */
export const sendTwilioSMS = async (
  config: TwilioConfig,
  to: string,
  message: string
): Promise<TwilioMessageResponse> => {
  try {
    // In a real implementation, you would make an API call to Twilio
    // For now, we'll simulate the Twilio API call
    
    // Validate phone number format
    const formattedPhone = formatPhone(to);
    
    // Simulate API call to Twilio
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountSid: config.accountSid,
        authToken: config.authToken,
        from: config.phoneNumber,
        to: formattedPhone,
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      messageId: result.messageId || `msg_${Date.now()}`
    };
    
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Validate Twilio configuration
 */
export const validateTwilioConfig = (config: TwilioConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.accountSid) {
    errors.push('Twilio Account SID is required');
  }
  
  if (!config.authToken) {
    errors.push('Twilio Auth Token is required');
  }
  
  if (!config.phoneNumber) {
    errors.push('Twilio Phone Number is required');
  } else if (!config.phoneNumber.startsWith('+')) {
    errors.push('Twilio Phone Number must be in E.164 format (+1XXXXXXXXXX)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}; 