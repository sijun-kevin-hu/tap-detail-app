"use client";

interface BookingSuccessProps {
  businessName?: string;
}

export default function BookingSuccess({ businessName }: BookingSuccessProps) {
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
          Thanks! Your request has been sent to {businessName}. They&apos;ll confirm shortly.
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
