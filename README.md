# Loan Application Platform - POC

A comprehensive loan application platform built with React, TypeScript, and modern web technologies. This is a proof-of-concept (POC) demo application designed for business development presentations.

## 🎯 Overview

This application demonstrates a complete end-to-end loan application journey including:

- User registration with OTP verification
- eKYC (Know Your Customer) integration
- Multi-step loan application form
- Document upload and management
- Real-time application status tracking
- Electronic signature for loan agreements
- In-app notifications
- Demo controls for simulating different scenarios

## ✨ Features

### Module Breakdown

1. **Entry Point** - Landing page with registration and sign-in options
2. **User Registration** - Complete registration flow (OTP, Consent, PIN setup)
3. **User Authentication** - Secure login with PIN
4. **User Profile & eKYC Integration** - Identity verification workflow
5. **Loan Application Form** - Multi-step wizard with draft/resume capability
6. **Supporting Documents Management** - Upload and track required documents
7. **Loan Application Result** - Status tracking with timeline
8. **Loan Application E-Signature** - Electronic agreement signing
9. **Notification** - In-app notification system
10. **Demo Controls** - Simulate different application outcomes

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Start the development server:**

```bash
npm run dev
```

The application will open automatically in your browser at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📱 Usage Guide

### Demo Flow

1. **Landing Page** - Start at the home screen
   - Click "Register" to create a new account
   - Or click "Sign In" if you already have an account

2. **Registration**
   - Enter phone number or email
   - Use OTP code: `123456` (demo mode)
   - Accept terms and conditions
   - Set up a 4-6 digit PIN

3. **Home Dashboard**
   - Check your eKYC status
   - Start a new loan application
   - View application history

4. **eKYC Verification**
   - Go to Profile page
   - Fill in personal details
   - Upload ID selfie
   - Submit for review
   - Use Demo Controls to approve/reject

5. **Loan Application**
   - Fill out the multi-step form:
     - Step 1: Personal Information
     - Step 2: Financial Information
     - Step 3: Loan Details
   - Application is auto-saved as draft
   - Review all information
   - Upload required documents:
     - ID Document
     - Income Proof
     - Address Proof
   - Submit application

6. **Demo Controls** (Bottom Navigation)
   - Approve/Reject eKYC
   - Change loan application status
   - Simulate different outcomes
   - Reset all demo data

7. **E-Signature** (When Approved)
   - Review loan terms
   - Read the agreement
   - Accept and sign electronically

8. **Track Status**
   - View application timeline
   - Check notifications
   - Monitor progress

## 🎮 Demo Controls

The Demo Controls page (`/demo`) allows you to:

- **Change eKYC Status**: Not Started → Submitted → Under Review → Approved/Rejected
- **Change Loan Status**: Draft → Submitted → Review → Approved/Rejected/Cancelled → Signed
- **Quick Scenarios**: One-click approval or rejection
- **Reset Demo Data**: Clear all localStorage and start fresh

### Example Demo Scenarios

#### Scenario 1: Happy Path (Full Approval)
1. Register a new user
2. Complete eKYC
3. Use Demo Controls → Approve KYC
4. Create loan application
5. Upload documents and submit
6. Use Demo Controls → Approve Loan
7. Sign the agreement via e-signature

#### Scenario 2: Rejection Path
1. Register and complete eKYC
2. Create loan application
3. Use Demo Controls → Reject Loan with reason
4. User sees rejection notice and can start new application

#### Scenario 3: Draft Resume
1. Start loan application
2. Fill only Step 1
3. Leave the app (data auto-saves)
4. Return later and "Resume Draft"

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Build Tool**: Vite
- **Styling**: CSS with CSS Variables (Mobile-first design)
- **Data Persistence**: localStorage (mock backend)

### Project Structure

```
src/
├── components/          # Shared UI components
│   ├── Layout.tsx      # App shell with header and navigation
│   ├── PrivateRoute.tsx # Route guard for authentication
│   └── Stepper.tsx     # Multi-step wizard UI
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── RegisterPage.tsx
│   ├── LoginPage.tsx
│   ├── HomePage.tsx
│   ├── ProfilePage.tsx
│   ├── LoanApplicationPage.tsx
│   ├── LoanReviewPage.tsx
│   ├── LoanResultPage.tsx
│   ├── ESignaturePage.tsx
│   ├── NotificationsPage.tsx
│   └── DemoControlsPage.tsx
├── services/           # Business logic and APIs
│   └── mockApi.ts      # Mock backend with localStorage
├── store/              # State management
│   └── useAppStore.ts  # Zustand store
├── utils/              # Utility functions
│   ├── validators.ts   # Form validation rules
│   └── formatters.ts   # Data formatting helpers
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app with routing
├── App.css             # Global styles
└── main.tsx            # Entry point
```

### Data Models

All data is stored in localStorage with these key structures:

- **User**: Authentication and profile data
- **ConsentRecord**: T&C acceptance
- **KycProfile**: Identity verification data
- **LoanApplication**: Application form data
- **DocumentItem**: Uploaded document metadata
- **TimelineEvent**: Application history
- **NotificationItem**: In-app notifications

### Key Features Implementation

#### Auto-Save Draft
Applications are automatically saved to localStorage after each step. Users can close the browser and resume later.

#### Mock Delays
All API calls include realistic delays (500-1200ms) to simulate real backend interactions.

#### Location Tracking
The app requests browser geolocation permission during registration (can be denied).

#### Document Upload
Files are converted to base64 and stored in localStorage (demo only - production would use secure cloud storage).

#### Timeline Tracking
Every status change creates a timeline event with timestamp and source.

#### Responsive Design
Mobile-first CSS with max-width container (480px) to mimic a hybrid mobile app.

## 🔒 Security Notes

**This is a POC/Demo Application:**

- PINs are stored in plain text (production would use secure hashing)
- Files stored as base64 in localStorage (production would use encrypted cloud storage)
- No real authentication or backend security
- OTP is hardcoded to `123456`
- No rate limiting or XSS protection

**For Production, implement:**
- Proper password hashing (bcrypt/argon2)
- JWT or session-based authentication
- HTTPS/SSL encryption
- Backend API with proper security
- Real OTP service integration
- Real eKYC provider integration
- Real e-signature provider integration
- Secure file storage (AWS S3, Azure Blob, etc.)

## 📊 Data Persistence

All data is stored in browser localStorage with these keys:

- `loan_app_session` - Current user session
- `loan_app_users` - User accounts
- `loan_app_kyc` - KYC profiles
- `loan_app_loans` - Loan applications
- `loan_app_documents` - Document metadata
- `loan_app_timeline` - Event timeline
- `loan_app_notifications` - Notifications

### Clear Data

Use Demo Controls → "Reset All Demo Data" or open browser console:

```javascript
localStorage.clear();
```

## 🎨 UI/UX Features

- **Mobile-First Design**: Optimized for mobile devices
- **Bottom Navigation**: Easy thumb-reach navigation
- **Status Badges**: Color-coded status indicators
- **Progress Stepper**: Visual multi-step wizard
- **Real-time Updates**: Auto-refresh application status
- **Notifications**: In-app notification center with unread counts
- **Form Validation**: Client-side validation with error messages
- **Loading States**: Loading indicators for async operations

## 🐛 Troubleshooting

### App not loading?
- Clear browser cache and localStorage
- Make sure you're using Node 18+
- Try `npm install` again

### Can't login?
- Use the Demo Controls to reset data
- Make sure you registered first
- PIN must be 4-6 digits

### Application not updating?
- Check Demo Controls to manually change status
- Refresh the page to reload data from localStorage

### Documents not uploading?
- Check file size (max 10MB)
- Only PDF, JPG, PNG allowed
- Make sure localStorage has space

## 📝 License

This is a demonstration/POC project. Feel free to use for educational purposes.

## 🤝 Contributing

This is a POC project. For improvements or bug reports, please contact the development team.

## 📧 Support

For questions or issues with the demo, please contact your BD representative.

---

**Built with ❤️ for Business Development Demos**
