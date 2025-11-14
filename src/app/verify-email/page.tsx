"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import Link from 'next/link';
import { auth } from '@/lib/firebase/client-app';
import CarLogo from '@/components/CarLogo';

type VerificationState = 'verifying' | 'success' | 'error';

const DEFAULT_REDIRECT = '/login';

const resolveRedirectTarget = (continueUrl: string | null) => {
  if (!continueUrl) return DEFAULT_REDIRECT;

  // Allow same-origin absolute URLs or relative paths only.
  try {
    if (continueUrl.startsWith('http')) {
      if (typeof window === 'undefined') {
        return DEFAULT_REDIRECT;
      }
      const parsed = new URL(continueUrl);
      return parsed.host === window.location.host ? parsed.pathname + parsed.search + parsed.hash : DEFAULT_REDIRECT;
    }
    return continueUrl.startsWith('/') ? continueUrl : DEFAULT_REDIRECT;
  } catch {
    return DEFAULT_REDIRECT;
  }
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationState>('verifying');
  const [error, setError] = useState('');
  const [redirectTarget, setRedirectTarget] = useState(DEFAULT_REDIRECT);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');
  const continueUrl = searchParams.get('continueUrl');

  useEffect(() => {
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    const runVerification = async () => {
      if (mode !== 'verifyEmail' || !oobCode) {
        setStatus('error');
        setError('Invalid or expired verification link.');
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        const target = resolveRedirectTarget(continueUrl);
        setRedirectTarget(target);
        setStatus('success');

        redirectTimer = setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = target;
          }
        }, 5000);
      } catch (err) {
        console.error('Verification failed:', err);
        setStatus('error');
        setError('We could not verify this link. Please request a new verification email.');
      }
    };

    runVerification();

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [continueUrl, mode, oobCode]);

  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    setRedirectCountdown(5);
    const countdown = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [status]);

  const statusMessage = useMemo(() => {
    switch (status) {
      case 'success':
        return 'Your email is verified! Redirecting you to the login page...';
      case 'error':
        return error;
      default:
        return 'Verifying your email link. Please wait...';
    }
  }, [error, status]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-50 rounded-full flex items-center justify-center shadow-lg">
            <CarLogo className="w-14 h-10" />
          </div>
          <h1 className="text-heading text-gray-900">
            {status === 'success' ? 'Email Verified' : status === 'error' ? 'Verification Issue' : 'Hang Tight'}
          </h1>
          <p className="text-caption text-gray-600">{statusMessage}</p>

          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirecting in {redirectCountdown}s…{' '}
              <button
                type="button"
                className="text-indigo-600 font-medium underline-offset-2 hover:underline"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = redirectTarget;
                  }
                }}
              >
                go now
              </button>
            </p>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <Link href="/login" className="btn-primary w-full inline-flex justify-center">
                Back to Login
              </Link>
              <Link href="/signup" className="btn-secondary w-full inline-flex justify-center">
                Create a new account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
