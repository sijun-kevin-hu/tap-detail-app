# Tap Detail - Mobile Car Detailing Application

A comprehensive web application for mobile car detailing businesses, featuring both client-facing booking interface and detailer admin dashboard.

## Features

### Client-Facing Features
- **Landing Page**: Professional website showcasing services and company information
- **Service Catalog**: Display of different detailing packages with pricing
- **Contact Information**: Easy access to business contact details
- **Mobile Responsive**: Optimized for all device sizes

### Detailer Admin Features
- **Authentication**: Secure login and signup system using Firebase Auth
- **Admin Dashboard**: Overview of business metrics and quick actions
- **User Management**: Profile management for detailers
- **Protected Routes**: Role-based access control

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tap-detail-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase environment variables:
Create a `.env.local` file in the root directory with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page for detailers
│   │   └── signup/
│   │       └── page.tsx          # Signup page for detailers
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard
│   ├── layout.tsx                # Root layout with AuthProvider
│   └── page.tsx                  # Client-facing landing page
├── components/
│   └── ProtectedRoute.tsx        # Route protection component
└── lib/
    ├── auth-context.tsx          # Authentication context
    └── firebase/
        └── client-app.ts         # Firebase configuration
```

## Usage

### For Detailers
1. Navigate to `/signup` to create a new account
2. Fill in business information and personal details
3. After registration, you'll be redirected to the admin dashboard
4. Use the dashboard to manage your business

### For Clients
1. Visit the homepage to view services
2. Contact the business through the provided contact information
3. Book appointments (booking functionality to be implemented)

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Set up security rules for Firestore
5. Get your Firebase configuration and add it to `.env.local`

### Firestore Security Rules (Basic)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Platform
- Azure Static Web Apps

## Future Enhancements

- [ ] Client booking system
- [ ] Payment integration
- [ ] Appointment scheduling
- [ ] Customer management
- [ ] Service history tracking
- [ ] Photo upload for before/after
- [ ] Push notifications
- [ ] Mobile app companion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@tapdetail.com or create an issue in the repository.
