# Auto Text Reminder System

## Overview
The auto text reminder system automatically sends SMS reminders to clients before their scheduled appointments. The system runs locally when detailers open the admin dashboard or appointments page.

## Features

### 🔹 Automatic Reminders
- Triggers when detailer opens admin dashboard or appointments page
- Checks for appointments in the next 24 hours where `reminderSent === false`
- Only sends reminders for appointments with `status === 'scheduled'`
- Prevents duplicate reminders using Firestore updates

### 🔹 Manual Reminders
- Send reminders manually for any scheduled appointment
- Available in the appointments list with a "Send Reminder" button
- Only shows for appointments that haven't had reminders sent yet

### 🔹 Configuration
- Toggle auto reminders on/off in Settings page
- Configure reminder timing (1, 2, 4, 6, 12, or 24 hours before)
- Custom message templates with variable substitution
- Preview messages before sending

## Firestore Structure

```
/detailers/{detailerId}/appointments/{appointmentId}
├── clientName: string
├── clientPhone: string
├── scheduledTime: string (date + time)
├── reminderSent: boolean
├── reminderSentAt: string (timestamp)
└── status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
```

## Environment Variables

Create a `.env.local` file with your Twilio credentials:

```bash
# Twilio SMS Configuration
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=+1234567890
```

## Message Templates

Default template:
```
Hey {clientName}, just a reminder from {businessName} — your auto detail is scheduled for {date} at {time}.
```

Available variables:
- `{clientName}` - Client's name
- `{businessName}` - Detailer's business name
- `{date}` - Appointment date
- `{time}` - Appointment time
- `{service}` - Service type
- `{carType}` - Vehicle type

## Phone Number Formatting

The system automatically formats phone numbers to E.164 format:
- `(555) 123-4567` → `+15551234567`
- `555-123-4567` → `+15551234567`
- `5551234567` → `+15551234567`

## Implementation Details

### Core Files
- `src/lib/services/reminderService.ts` - Main reminder logic
- `src/hooks/useReminders.ts` - React hook for reminder management
- `src/components/settings/ReminderSettings.tsx` - Settings UI
- `src/components/appointments/AppointmentCard.tsx` - Reminder status display

### Key Functions
- `processReminders()` - Main reminder processing logic
- `sendSMSReminder()` - Twilio SMS sending (placeholder)
- `formatPhoneNumber()` - E.164 phone formatting
- `isAppointmentInReminderWindow()` - Time window checking

## Best Practices

### Error Handling
- Async/await with proper try/catch blocks
- Graceful fallbacks for failed SMS sends
- Console logging for debugging

### Performance
- Only process reminders when appointments change
- Batch Firestore updates for multiple reminders
- Efficient date/time calculations using date-fns

### Security
- Environment variables for API keys
- Phone number validation and formatting
- Firestore security rules for appointment access

## Testing

### Manual Testing
1. Create an appointment for tomorrow
2. Open the appointments page
3. Check console for reminder processing logs
4. Verify reminder status in appointment card

### SMS Testing
Currently logs to console. To enable actual SMS:
1. Uncomment Twilio code in `reminderService.ts`
2. Add your Twilio credentials to `.env.local`
3. Test with a real phone number

## Future Enhancements

- [ ] Save reminder config to Firestore
- [ ] Add reminder history tracking
- [ ] Support for multiple reminder times
- [ ] Email reminders in addition to SMS
- [ ] Reminder analytics and reporting
- [ ] Custom reminder templates per service type 