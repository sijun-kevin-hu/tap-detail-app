'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  detailerName?: string;
  detailerEmail?: string;
  businessName?: string;
}

type FeedbackType = 'bug' | 'feature';
type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export default function FeedbackModal({
  isOpen,
  onClose,
  detailerName,
  detailerEmail,
  businessName,
}: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('bug');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setType('bug');
    setSubject('');
    setDescription('');
    setSubmitState('idle');
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitState('loading');
    try {
      const res = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, subject, description, detailerName, detailerEmail, businessName }),
      });
      const data = await res.json();
      setSubmitState(data.success ? 'success' : 'error');
    } catch {
      setSubmitState('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Send Feedback</h2>
            <p className="text-xs text-gray-500 mt-0.5">Report an issue or suggest a feature</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitState === 'success' ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback sent!</h3>
            <p className="text-sm text-gray-500 mb-6">Thanks for helping improve Tap Detail. We&apos;ll look into it.</p>
            <button onClick={handleClose} className="btn-primary text-sm px-6 py-2.5">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setType('bug')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  type === 'bug'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bug Report
              </button>
              <button
                type="button"
                onClick={() => setType('feature')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  type === 'feature'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Feature Request
              </button>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {type === 'bug' ? 'What went wrong?' : 'What would you like to see?'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={type === 'bug' ? 'e.g. Calendar not loading' : 'e.g. Export appointments to CSV'}
                className="input-modern"
                required
                maxLength={120}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {type === 'bug' ? 'Steps to reproduce / details' : 'Describe your idea'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? 'Walk us through what happened...'
                    : 'Tell us more about how this would help you...'
                }
                rows={4}
                className="input-modern resize-none"
                required
                maxLength={2000}
              />
              <div className="text-right text-xs text-gray-400 mt-1">{description.length}/2000</div>
            </div>

            {submitState === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Something went wrong. Please try again.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1 pb-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 btn-secondary text-sm py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitState === 'loading' || !subject.trim() || !description.trim()}
                className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitState === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Feedback'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
