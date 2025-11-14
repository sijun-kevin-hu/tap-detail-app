import { adminAuth } from '@/lib/firebase/admin-app';
import { Resend } from 'resend';
import VerificationEmail from '@/lib/templates/VerificationEmail';
import PasswordResetEmail from '@/lib/templates/PasswordResetEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Tap Detail <noreply@tapdetail.com>';
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tapdetail.com';
const VERIFY_EMAIL_PATH = process.env.VERIFY_EMAIL_PATH || '/verify-email';

const buildBrandedActionLink = (firebaseLink: string, pathname: string) => {
  try {
    const firebaseUrl = new URL(firebaseLink);
    const brandedUrl = new URL(pathname, APP_BASE_URL);
    firebaseUrl.searchParams.forEach((value, key) => {
      brandedUrl.searchParams.set(key, value);
    });
    return brandedUrl.toString();
  } catch (error) {
    console.error('Failed to brand action link, falling back to Firebase link', error);
    return firebaseLink;
  }
};

export async function sendCustomEmailVerification(userEmail: string) {
  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/login`,
    handleCodeInApp: false,
  };
  const firebaseLink = await adminAuth.generateEmailVerificationLink(userEmail, actionCodeSettings);
  const link = buildBrandedActionLink(firebaseLink, VERIFY_EMAIL_PATH);
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
