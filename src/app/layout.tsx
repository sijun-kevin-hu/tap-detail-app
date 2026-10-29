import type { Metadata, Viewport } from 'next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'
import { AuthProvider } from '@/lib/firebase/auth'
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Tap Detail | Business Software for Mobile Detailers',
  description: 'Manage bookings, client and vehicle details, job schedules, and earnings with Tap Detail. Business software built for independent mobile detailers.',
  keywords: 'mobile detailing software, detailing business management, detailer booking software, detailing CRM',
  authors: [{ name: 'Tap Detail' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="font-sans bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Vercel Analytics: Tracks page views and performance in production */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
