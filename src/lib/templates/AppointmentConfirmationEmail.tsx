import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button } from '@react-email/components';

function formatTime12Hour(time: string) {
  if (!time) return '';
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute.padStart(2, '0')} ${ampm}`;
}

interface AppointmentConfirmationEmailProps {
  clientName: string;
  detailerName: string;
  detailerPhone: string;
  date: string;
  time: string;
  service?: string;
  location?: string;
  bookingUrl?: string;
}

const primaryColor = '#4f46e5';
const bgColor = '#f8fafc';
const cardBg = '#fff';
const cardShadow = '0 2px 12px rgba(80,80,180,0.07)';
const cardRadius = 16;
const cardPadding = '32px 24px';
const infoBg = '#f1f5f9';
const infoRadius = 8;

export default function AppointmentConfirmationEmail({
  clientName,
  detailerName,
  detailerPhone,
  date,
  time,
  service,
  location,
  bookingUrl,
}: AppointmentConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Car Detailing Appointment Request Received</Preview>
      <Body style={{ background: bgColor, padding: 32, color: '#222', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: '0 auto', background: cardBg, borderRadius: cardRadius, boxShadow: cardShadow, padding: cardPadding }}>
          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-block', background: primaryColor, borderRadius: '50%', padding: 16, marginBottom: 8 }}>
              <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <Text style={{ fontSize: '1.5rem', fontWeight: 700, color: primaryColor, margin: 0 }}>Tap Detail</Text>
          </Section>
          <Text style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>Appointment Request Received</Text>
          <Text style={{ fontSize: '1rem', marginBottom: 16 }}>
            Hello {clientName},<br /><br />
            Thank you for requesting a car detailing appointment with <strong>{detailerName}</strong>.<br />
            Your request has been received and is pending confirmation by the detailer. You will receive another email once your appointment is confirmed.<br /><br />
            Here are the details of your requested appointment:
          </Text>
          <Section style={{ background: infoBg, borderRadius: infoRadius, padding: 16, marginBottom: 20 }}>
            <Text style={{ margin: '0 0 8px 0' }}><strong>Date:</strong> {date}</Text>
            <Text style={{ margin: '0 0 8px 0' }}><strong>Time:</strong> {formatTime12Hour(time)}</Text>
            {service && <Text style={{ margin: '0 0 8px 0' }}><strong>Service:</strong> {service}</Text>}
            {location && <Text style={{ margin: '0 0 8px 0' }}><strong>Location:</strong> {location}</Text>}
            <Text style={{ margin: '0 0 8px 0' }}><strong>Detailer:</strong> {detailerName}</Text>
            <Text style={{ margin: 0 }}><strong>Contact:</strong> <a href={`tel:${detailerPhone}`} style={{ color: primaryColor, textDecoration: 'underline' }}>{detailerPhone}</a></Text>
          </Section>
          {bookingUrl && (
            <Button href={bookingUrl} style={{ display: 'inline-block', background: primaryColor, color: '#fff', fontWeight: 600, padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontSize: '1rem', marginBottom: 16 }}>
              View Booking Details
            </Button>
          )}
          <Text style={{ fontSize: '1rem', color: '#64748b', marginTop: 24 }}>
            If you have any questions or need to make changes, please contact your detailer directly.<br /><br />
            <strong>Note:</strong> This is a request for an appointment. You will receive a confirmation email once the detailer approves your request.<br /><br />
            We look forward to serving you!<br />
            <span style={{ color: primaryColor, fontWeight: 600 }}>— The Tap Detail Team</span>
          </Text>
        </Container>
        <Section style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: 24 }}>
          &copy; {new Date().getFullYear()} Tap Detail
        </Section>
      </Body>
    </Html>
  );
} 