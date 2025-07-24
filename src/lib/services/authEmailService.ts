import { adminAuth } from '@/lib/firebase/admin-app';
import { Resend } from 'resend';
import VerificationEmail from '@/lib/templates/VerificationEmail';
import PasswordResetEmail from '@/lib/templates/PasswordResetEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Tap Detail <noreply@tapdetail.com>';

export async function sendCustomEmailVerification(userEmail: string) {
  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/login`,
    handleCodeInApp: false,
  };
  const link = await adminAuth.generateEmailVerificationLink(userEmail, actionCodeSettings);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: 'Verify your email address',
    react: VerificationEmail({ link }),
  });
}

export async function sendCustomPasswordReset(userEmail: string) {
  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/login`,
    handleCodeInApp: false,
  };
  const link = await adminAuth.generatePasswordResetLink(userEmail, actionCodeSettings);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: 'Reset your password',
    react: PasswordResetEmail({ link }),
  });
} 