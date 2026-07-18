"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ServiceMenu } from '@/lib/models/settings';
import QRCodeModal from './_components/QRCodeModal';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/lib/firebase/auth';
import { useBookingData } from '@/hooks/useBookingData';
import UnifiedDateTimePicker from '@/components/features/booking/UnifiedDateTimePicker';
import DetailerProfile from './_components/DetailerProfile';
import ServiceSelector from './_components/ServiceSelector';
import BookingForm, { BookingFormValues } from './_components/BookingForm';
import BookingSuccess from './_components/BookingSuccess';

interface SelectedDateTime {
  date: string;
  time: string;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const businessId = params.businessId as string;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { detailer, services, loading, error, setError } = useBookingData(businessId);
  const [selectedService, setSelectedService] = useState<ServiceMenu | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<SelectedDateTime>({
    date: '',
    time: ''
  });
  const [formData, setFormData] = useState<BookingFormValues>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    carType: '',
    carMake: '',
    carModel: '',
    carYear: '',
    notes: '',
    address: '', // Add address field
    smsConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleServiceSelect = (service: ServiceMenu) => {
    setSelectedService(service);
  };

  const handleFormChange = (field: keyof BookingFormValues, value: string) => {
    let formattedValue = value;

    // Format phone number as user types
    if (field === 'clientPhone') {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');

      // Format as (XXX) XXX-XXXX
      if (digits.length <= 3) {
        formattedValue = digits;
      } else if (digits.length <= 6) {
        formattedValue = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        formattedValue = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }

      // Validate phone number length
      if (digits.length > 0 && digits.length < 10) {
        setToastMessage('Please enter a complete phone number');
        setShowToast(true);
      }
    }

    // Validate email format if provided
    if (field === 'clientEmail' && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        setToastMessage('Please enter a valid email address');
        setShowToast(true);
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleConsentChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      smsConsent: checked
    }));
  };

  const validateForm = () => {
    if (!selectedService) {
      setToastMessage('Please select a service');
      setShowToast(true);
      return false;
    }
    if (!selectedDateTime.date || !selectedDateTime.time) {
      setToastMessage('Please select a date and time');
      setShowToast(true);
      return false;
    }
    if (!formData.clientName.trim()) {
      setToastMessage('Please enter your name');
      setShowToast(true);
      return false;
    }
    if (!formData.clientPhone.trim()) {
      setToastMessage('Please enter your phone number');
      setShowToast(true);
      return false;
    }
    if (!formData.clientEmail.trim()) {
      setToastMessage('Please enter your email address');
      setShowToast(true);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.clientEmail.trim())) {
      setToastMessage('Please enter a valid email address');
      setShowToast(true);
      return false;
    }
    if (!formData.carType) {
      setToastMessage('Please select your car type');
      setShowToast(true);
      return false;
    }
    if (!formData.address.trim()) {
      setToastMessage('Please enter the service location');
      setShowToast(true);
      return false;
    }

    // Validate date format and is in the future
    const selectedDate = new Date(`${selectedDateTime.date}T${selectedDateTime.time}`);
    const now = new Date();

    // Check if date is valid
    if (isNaN(selectedDate.getTime())) {
      setToastMessage('Please select a valid date and time');
      setShowToast(true);
      return false;
    }

    if (selectedDate <= now) {
      setToastMessage('Please select a future date and time');
      setShowToast(true);
      return false;
    }

    // Check if date is within 6 months
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    if (selectedDate > sixMonthsFromNow) {
      setToastMessage('Please select a date within the next 6 months');
      setShowToast(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const appointmentData = {
        service: selectedService!.name,
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim(),
        clientPhone: formData.clientPhone.trim(),
        carType: formData.carType,
        carMake: formData.carMake || '',
        carModel: formData.carModel || '',
        carYear: formData.carYear || '',
        date: selectedDateTime.date,
        time: selectedDateTime.time,
        address: formData.address.trim(), // Store as address
        price: parseFloat(selectedService!.price),
        notes: formData.notes.trim(),
        estimatedDuration: selectedService!.duration, // Include service duration
        smsConsent: formData.smsConsent,
        smsConsentAt: formData.smsConsent ? new Date().toISOString() : undefined,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detailerId: detailer!.uid, appointmentData }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.error || 'Failed to submit booking. Please try again.');
        if (result.error?.includes('Failed to send appointment confirmation email')) {
          setToastMessage('Appointment booked, but failed to send confirmation email.');
          setShowToast(true);
        }
        return;
      }
      setBookingSuccess(true);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyBookingLink = async () => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        // Fallback for iOS Safari
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          setToastMessage('Failed to copy link');
          setShowToast(true);
          return;
        }

        document.body.removeChild(textArea);
      }
      setToastMessage('Link copied to clipboard!');
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setToastMessage('Failed to copy link');
      setShowToast(true);
    }
  };

  const shareBookingLink = async () => {
    // Check if native share is available (iOS and Android)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Book with ${detailer?.businessName}`,
          text: `Book your auto detailing service with ${detailer?.businessName}`,
          url: window.location.href
        });
        setToastMessage('Shared successfully!');
        setShowToast(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') { // Ignore if user cancels share
          console.error('Failed to share:', err);
          setToastMessage('Failed to share');
          setShowToast(true);
        }
      }
    } else {
      // Fallback to copy link on desktop
      copyBookingLink();
    }
  };

  const handleBackButton = () => {
    // Use replace so this back navigation doesn't stack a history entry —
    // the browser back button would otherwise return to this screen.
    // Check if current user is the detailer with matching businessId
    if (firebaseUser && detailer && firebaseUser.uid === detailer.uid && detailer.businessId === businessId) {
      // User is the detailer, go to admin/settings
      router.replace('/admin/settings');
    } else {
      // User is not the detailer or not logged in, go to landing page
      router.replace('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (error && !detailer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackButton}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return <BookingSuccess businessName={detailer?.businessName} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            <h1 className="text-lg font-semibold text-gray-900">Book Service</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowQRModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="QR Code"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
              </button>
              <button
                onClick={copyBookingLink}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Copy Link"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={shareBookingLink}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Share"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Detailer Profile */}
        {detailer && <DetailerProfile detailer={detailer} />}

        {/* Service Selection */}
        <ServiceSelector
          services={services}
          selectedService={selectedService}
          onSelect={handleServiceSelect}
        />

        {/* Date & Time Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h3>
          <UnifiedDateTimePicker
            detailerId={detailer?.uid || ''}
            serviceName={selectedService?.name || ''}
            services={services}
            value={selectedDateTime}
            onChange={setSelectedDateTime}
          />
        </div>

        {/* Client Information */}
        <BookingForm
          formData={formData}
          onChange={handleFormChange}
          onConsentChange={handleConsentChange}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        detailerName={detailer?.businessName || 'Detailer'}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
