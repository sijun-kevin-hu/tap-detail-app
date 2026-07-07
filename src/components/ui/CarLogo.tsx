import React from 'react';

export default function CarLogo({ className = '' }: { className?: string }) {
    return (
        <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className={className} aria-hidden>
            {/* Car body */}
            <rect x="30" y="65" width="100" height="25" rx="12" fill="#2563EB" fillOpacity="0.18" />
            <ellipse cx="80" cy="77" rx="45" ry="18" fill="#2563EB" fillOpacity="0.10" />
            {/* Wheels */}
            <circle cx="50" cy="95" r="8" fill="#1E293B" fillOpacity="0.7" />
            <circle cx="110" cy="95" r="8" fill="#1E293B" fillOpacity="0.7" />
            {/* Bubbles */}
            <circle cx="45" cy="65" r="7" fill="#E0F2FE" fillOpacity="0.85" />
            <circle cx="120" cy="62" r="6" fill="#E0F2FE" fillOpacity="0.7" />
            <circle cx="70" cy="55" r="4" fill="#BAE6FD" fillOpacity="0.8" />
            <circle cx="90" cy="53" r="5" fill="#BAE6FD" fillOpacity="0.7" />
            {/* Sparkle */}
            <polygon points="80,40 82,45 87,45 83,48 85,53 80,50 75,53 77,48 73,45 78,45" fill="#FACC15" fillOpacity="0.7" />
        </svg>
    );
} 