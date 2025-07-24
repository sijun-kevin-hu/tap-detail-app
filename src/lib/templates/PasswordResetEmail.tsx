import * as React from 'react';
import { Html, Head, Body, Container, Text, Button } from '@react-email/components';

export default function PasswordResetEmail({ link }: { link: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ background: '#f8fafc', padding: 32, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(80,80,180,0.07)', padding: '32px 24px' }}>
          <Text style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>Reset Your Password</Text>
          <Text style={{ marginBottom: 16 }}>We received a request to reset your Tap Detail password. Click the button below to set a new password.</Text>
          <Button href={link} style={{ background: '#4f46e5', color: '#fff', fontWeight: 600, padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontSize: '1rem', marginBottom: 16 }}>Reset Password</Button>
          <Text style={{ color: '#64748b', marginTop: 24, fontSize: '0.95rem' }}>If you did not request a password reset, you can safely ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
} 