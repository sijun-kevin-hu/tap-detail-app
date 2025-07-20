"use client";

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  detailerName: string;
}

export default function QRCodeModal({ isOpen, onClose, url, detailerName }: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && url) {
      generateQRCode();
    }
  }, [isOpen, url]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Booking Link</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Share this link with clients to book with {detailerName}
          </p>
          
          {qrCodeDataUrl && (
            <div className="mb-4">
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="mx-auto border border-gray-200 rounded-lg"
              />
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={copyLink}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Copy Link
            </button>
            
            {navigator.share && (
              <button
                onClick={() => {
                  navigator.share({
                    title: `Book with ${detailerName}`,
                    text: `Book your auto detailing service with ${detailerName}`,
                    url: url
                  });
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 