"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDetailerByBusinessId } from '@/lib/firebase';
import { getServices } from '@/lib/firebase';
import { createAppointment } from '@/lib/firebase';
import { Detailer } from '@/lib/models/detailer';
import { ServiceMenu } from '@/lib/models/settings';
import { NewAppointment } from '@/lib/firebase/firestore-appointments';
import QRCodeModal from '@/components/QRCodeModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/lib/auth-context';

interface BookingForm {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  carType: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  notes: string;
}

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
  
  const [detailer, setDetailer] = useState<Detailer | null>(null);
  const [services, setServices] = useState<ServiceMenu[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceMenu | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<SelectedDateTime>({
    date: '',
    time: ''
  });
  const [formData, setFormData] = useState<BookingForm>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    carType: '',
    carMake: '',
    carModel: '',
    carYear: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchDetailerData();
    }
  }, [businessId]);

  const fetchDetailerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch detailer profile by business ID
      const detailerData = await getDetailerByBusinessId(businessId);
      if (!detailerData) {
        setError('Detailer not found');
        return;
      }
      setDetailer(detailerData);
      
      // Fetch services using detailer's UID
      const servicesData = await getServices(detailerData.uid);
      setServices(servicesData.filter(service => service.active));
      
    } catch (err) {
      console.error('Error fetching detailer data:', err);
      setError('Failed to load detailer information');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: ServiceMenu) => {
    setSelectedService(service);
  };

  const handleDateTimeChange = (field: 'date' | 'time', value: string) => {
    // Always update the state first for better UX
    setSelectedDateTime(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Then validate and show toast if needed
    if (field === 'date' && value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        setToastMessage('Please enter a valid date');
        setShowToast(true);
        return;
      }
      
      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        setToastMessage('Please select a future date');
        setShowToast(true);
        return;
      }
      
      // Check if date is within 6 months
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      if (date > sixMonthsFromNow) {
        setToastMessage('Please select a date within 6 months');
        setShowToast(true);
        return;
      }
    }
    
    // Validate time input
    if (field === 'time' && value) {
      const [hours, minutes] = value.split(':').map(Number);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        setToastMessage('Please enter a valid time');
        setShowToast(true);
        return;
      }
      
      // If date is today, check if time is in the future
      if (selectedDateTime.date === new Date().toISOString().split('T')[0]) {
        const now = new Date();
        const selectedTime = new Date(`${selectedDateTime.date}T${value}`);
        if (selectedTime <= now) {
          setToastMessage('Please select a future time for today');
          setShowToast(true);
          return;
        }
      }
    }
  };

  const handleFormChange = (field: keyof BookingForm, value: string) => {
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
    if (!formData.carType) {
      setToastMessage('Please select your car type');
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
    
    // Validate phone number (basic US format)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = formData.clientPhone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
      setToastMessage('Please enter a valid phone number');
      setShowToast(true);
      return false;
    }
    
    // Validate email if provided
    if (formData.clientEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.clientEmail.trim())) {
        setToastMessage('Please enter a valid email address');
        setShowToast(true);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const appointmentData: NewAppointment = {
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
        address: '', // Will be filled by detailer
        price: selectedService!.price,
        notes: formData.notes.trim()
      };
      
      await createAppointment(detailer!.uid, appointmentData);
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
    // Check if current user is the detailer with matching businessId
    if (firebaseUser && detailer && firebaseUser.uid === detailer.uid && detailer.businessId === businessId) {
      // User is the detailer, go to admin/settings
      router.push('/admin/settings');
    } else {
      // User is not the detailer or not logged in, go to landing page
      router.push('/');
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thanks! Your request has been sent to {detailer?.businessName}. They'll confirm shortly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Book Another Service
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackButton}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
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
        {detailer && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-4">
              {detailer.profileImage ? (
                <img
                  src={detailer.profileImage}
                  alt={detailer.businessName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{detailer.businessName}</h2>
                {detailer.location && (
                  <p className="text-sm text-gray-600">{detailer.location}</p>
                )}
              </div>
            </div>
            {detailer.bio && (
              <p className="text-gray-600 text-sm leading-relaxed">{detailer.bio}</p>
            )}
          </div>
        )}



        {/* Service Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Service</h3>
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.documentId}
                onClick={() => handleServiceSelect(service)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedService?.documentId === service.documentId
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{service.name}</h4>
                  <span className="text-lg font-bold text-indigo-600">${service.price}</span>
                </div>
                {service.description && (
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.duration} {service.durationUnit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDateTime.date}
                onChange={(e) => handleDateTimeChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="MM/DD/YYYY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={selectedDateTime.time}
                onChange={(e) => handleDateTimeChange('time', e.target.value)}
                min={new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleFormChange('clientName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleFormChange('clientEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email address (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => handleFormChange('clientPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="(555) 123-4567"
                required
                maxLength={14}
              />
            </div>
            
            {/* Vehicle Information */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Vehicle Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Type *
                  </label>
                  <select
                    value={formData.carType}
                    onChange={(e) => handleFormChange('carType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select car type</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Wagon">Wagon</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sports Car">Sports Car</option>
                    <option value="Luxury Car">Luxury Car</option>
                    <option value="Electric Vehicle">Electric Vehicle</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="RV">RV</option>
                    <option value="Boat">Boat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Make
                    </label>
                    <input
                      type="text"
                      value={formData.carMake || ''}
                      onChange={(e) => handleFormChange('carMake', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Toyota"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.carModel || ''}
                      onChange={(e) => handleFormChange('carModel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Camry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      value={formData.carYear || ''}
                      onChange={(e) => handleFormChange('carYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 2020"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Any special requests or notes..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              {submitting ? 'Submitting...' : 'Book Appointment'}
            </button>
          </form>
                 </div>
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