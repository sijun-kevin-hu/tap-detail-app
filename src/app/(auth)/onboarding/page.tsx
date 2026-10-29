'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/lib/firebase/auth';
import { suggestBookingLink } from '@/lib/booking-link';
import type { Detailer } from '@/lib/models/detailer';

export default function Onboarding() {
  const { detailer, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) {
      if (!detailer) router.replace('/login');
      else if (detailer.onboardingCompleted !== false) router.replace('/admin');
    }
  }, [detailer, loading, router]);
  if (loading || !detailer || detailer.onboardingCompleted !== false) {
    return <main className="min-h-screen gradient-bg flex items-center justify-center"><p role="status">Loading your setup…</p></main>;
  }
  return <Setup key={detailer.uid} detailer={detailer} />;
}

function Setup({ detailer }: { detailer: Detailer }) {
  const [step, setStep] = useState(detailer.firstName && detailer.lastName ? 2 : 1);
  const [firstName, setFirstName] = useState(detailer.firstName);
  const [lastName, setLastName] = useState(detailer.lastName);
  const [businessName, setBusinessName] = useState(detailer.businessName);
  const [businessId, setBusinessId] = useState(detailer.businessId || suggestBookingLink(detailer.businessName));
  const [editedLink, setEditedLink] = useState(Boolean(detailer.businessId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [step]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Please log in again to continue.');
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ step: step === 1 ? 'name' : 'business', firstName, lastName, businessName, businessId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save. Please try again.');
      if (step === 1) setStep(2);
      // Reload the auth profile before entering guarded dashboard pages.
      else window.location.assign('/admin');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save. Please try again.');
    } finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen gradient-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-indigo-700 mb-3">Set up your booking page · Step {step} of 2</p>
        <div className="flex gap-2 mb-8" aria-hidden="true">
          <span className="h-1 flex-1 rounded bg-indigo-600" />
          <span className={`h-1 flex-1 rounded ${step === 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        </div>
        <h1 ref={heading} tabIndex={-1} className="text-heading text-gray-900 mb-2 outline-none">{step === 1 ? 'What’s your name?' : 'Make it your business'}</h1>
        <p className="text-gray-600 mb-6">{step === 1 ? 'First, tell us who’s behind the business.' : 'Choose the name and booking link your customers will see.'}</p>
        <form onSubmit={save} className="card p-6 sm:p-8 space-y-5">
          <fieldset disabled={saving} className="space-y-5">
            {step === 1 ? <>
              <div><label htmlFor="firstName" className="block text-sm font-medium mb-2">First name</label><input id="firstName" autoComplete="given-name" required maxLength={100} value={firstName} onChange={event => setFirstName(event.target.value)} className="input-modern" /></div>
              <div><label htmlFor="lastName" className="block text-sm font-medium mb-2">Last name</label><input id="lastName" autoComplete="family-name" required maxLength={100} value={lastName} onChange={event => setLastName(event.target.value)} className="input-modern" /></div>
            </> : <>
              <div><label htmlFor="businessName" className="block text-sm font-medium mb-2">Business name</label><input id="businessName" autoComplete="organization" required maxLength={120} value={businessName} onChange={event => {
                setBusinessName(event.target.value);
                if (!editedLink) setBusinessId(suggestBookingLink(event.target.value));
              }} className="input-modern" placeholder="Kevin’s Detailing" /></div>
              <div><label htmlFor="businessId" className="block text-sm font-medium mb-2">Your booking link</label><input id="businessId" required maxLength={60} pattern="[a-z0-9]([a-z0-9-]{0,58}[a-z0-9])?" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={businessId} onChange={event => { setEditedLink(true); setBusinessId(event.target.value.toLowerCase()); }} aria-describedby="booking-preview booking-help" className="input-modern" placeholder="kevins-detailing" />
                <p id="booking-preview" className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800 break-all">tapdetail.com/booking/<strong>{businessId || 'your-business'}</strong></p>
                <p id="booking-help" className="mt-2 text-xs text-gray-600">We suggest a link from your name. You can edit it; use letters, numbers, and hyphens. We’ll check availability when you finish.</p>
              </div>
            </>}
          </fieldset>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full touch-target">{saving ? 'Saving…' : step === 1 ? 'Continue to your business' : 'Finish setup'}</button>
          {step === 2 && <button type="button" disabled={saving} onClick={() => { setStep(1); setError(''); }} className="min-h-11 w-full text-sm font-medium text-indigo-700">Back to your name</button>}
        </form>
        <p className="mt-5 text-center text-xs text-gray-600">Each completed step is saved. You can come back anytime.</p>
        <button type="button" disabled={saving} onClick={() => signOut(auth)} className="mt-2 min-h-11 w-full text-sm text-gray-600 underline">Sign out</button>
      </div>
    </main>
  );
}
