// ============================================
// Data Models for Loan Application POC
// ============================================

export type KycStatus = 'not_started' | 'submitted' | 'under_review' | 'approved' | 'rejected';
export type LoanStatus = 'draft' | 'submitted' | 'review' | 'approved' | 'rejected' | 'cancelled' | 'signed';
export type EventSource = 'user' | 'system' | 'loanEngineMock';

// User Interface
export interface User {
  id: string;
  phoneOrEmail: string;
  pin: string; // Demo only - in production this would be hashed
  name?: string;
  createdAt: string;
  lastLogin?: string;
}

// Consent Record
export interface ConsentRecord {
  consentAccepted: boolean;
  consentVersion: string;
  acceptedAt: string;
}

// Location Data
export interface LocationData {
  locationEnabled: boolean;
  latitude?: number;
  longitude?: number;
  capturedAt?: string;
}

// KYC Profile
export interface KycProfile {
  userId: string;
  status: KycStatus;
  fullName?: string;
  nationalIdNumber?: string;
  selfieFilename?: string;
  selfieData?: string; // base64 for POC
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// Loan Application
export interface LoanApplication {
  id: string;
  userId: string;
  status: LoanStatus;
  
  // Step 1 - Personal Info
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    nationalId: string;
    phoneNumber: string;
    email: string;
    maritalStatus: 'single' | 'married' | 'other';
    hasGuarantor: boolean;
    guarantorName?: string;
    guarantorPhone?: string;
    guarantorRelationship?: string;
  };
  
  // Step 2 - Financial Info
  financialInfo: {
    employmentStatus: 'employed' | 'self_employed' | 'unemployed';
    employerName?: string;
    monthlyIncome: number;
    yearsOfWork: number;
  };
  
  // Step 3 - Loan Request Details
  loanDetails: {
    downPayment: number;
    loanPeriodMonths: 48 | 60 | 72;
    requestedAmount?: number;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  
  // Post-approval
  signatureRequired: boolean;
  signedAt?: string;
  approvedTerms?: {
    approvedAmount: number;
    interestRate: number;
    monthlyPayment: number;
  };
  rejectionReason?: string;
}

// Document Item
export interface DocumentItem {
  id: string;
  applicationId: string;
  category: 'id_document' | 'income_proof' | 'address_proof' | 'home_registration' | 'marriage_certificate' | 'guarantor_document';
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  version: number;
  fileData?: string; // base64 for POC
}

// Timeline Event
export interface TimelineEvent {
  id: string;
  applicationId: string;
  eventName: string;
  timestamp: string;
  source: EventSource;
  details?: string;
}

// Notification Item
export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  relatedApplicationId?: string;
}

// Session Data
export interface SessionData {
  user: User;
  consent: ConsentRecord;
  location: LocationData;
  loginAt: string;
}
