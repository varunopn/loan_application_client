// ============================================
// Mock API Services with localStorage persistence
// ============================================

import {
  User,
  SessionData,
  ConsentRecord,
  LocationData,
  KycProfile,
  LoanApplication,
  DocumentItem,
  TimelineEvent,
  NotificationItem,
  KycStatus,
  LoanStatus
} from '../types';

// Utility: mock delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// localStorage Keys
// ============================================
const KEYS = {
  SESSION: 'loan_app_session',
  USERS: 'loan_app_users',
  KYC_PROFILES: 'loan_app_kyc',
  LOAN_APPLICATIONS: 'loan_app_loans',
  DOCUMENTS: 'loan_app_documents',
  TIMELINE: 'loan_app_timeline',
  NOTIFICATIONS: 'loan_app_notifications',
};

// ============================================
// Helper Functions
// ============================================

function getFromStorage<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Session Management
// ============================================

export const sessionApi = {
  getSession(): SessionData | null {
    return getFromStorage<SessionData>(KEYS.SESSION);
  },

  setSession(session: SessionData): void {
    saveToStorage(KEYS.SESSION, session);
  },

  clearSession(): void {
    localStorage.removeItem(KEYS.SESSION);
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
};

// ============================================
// User Registration & Authentication
// ============================================

export const authApi = {
  // Request OTP (mock)
  async requestOtp(phoneOrEmail: string): Promise<{ success: boolean; message: string }> {
    await delay(800);
    // Always succeed for POC
    return { success: true, message: 'OTP sent successfully (use 123456)' };
  },

  // Verify OTP (mock)
  async verifyOtp(phoneOrEmail: string, otp: string): Promise<{ success: boolean; message: string }> {
    await delay(600);
    if (otp === '123456') {
      return { success: true, message: 'OTP verified' };
    }
    return { success: false, message: 'Invalid OTP' };
  },

  // Save consent
  saveConsent(userId: string, consent: ConsentRecord): void {
    const users = getFromStorage<User[]>(KEYS.USERS) || [];
    const user = users.find(u => u.id === userId);
    if (user) {
      saveToStorage(`${KEYS.SESSION}_consent_${userId}`, consent);
    }
  },

  // Complete registration
  async completeRegistration(phoneOrEmail: string, pin: string, consent: ConsentRecord, location: LocationData): Promise<{ user: User; session: SessionData }> {
    await delay(500);
    
    const users = getFromStorage<User[]>(KEYS.USERS) || [];
    
    // Check if user exists
    let user = users.find(u => u.phoneOrEmail === phoneOrEmail);
    
    if (!user) {
      user = {
        id: generateId(),
        phoneOrEmail,
        pin, // Demo only - would be hashed in production
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveToStorage(KEYS.USERS, users);
    } else {
      // Update PIN if re-registering
      user.pin = pin;
      saveToStorage(KEYS.USERS, users);
    }

    const session: SessionData = {
      user,
      consent,
      location,
      loginAt: new Date().toISOString()
    };

    sessionApi.setSession(session);
    
    // Initialize KYC profile
    const kycProfiles = getFromStorage<KycProfile[]>(KEYS.KYC_PROFILES) || [];
    if (!kycProfiles.find(k => k.userId === user!.id)) {
      kycProfiles.push({
        userId: user.id,
        status: 'not_started'
      });
      saveToStorage(KEYS.KYC_PROFILES, kycProfiles);
    }

    return { user, session };
  },

  // Login
  async login(phoneOrEmail: string, pin: string): Promise<{ success: boolean; session?: SessionData; message?: string }> {
    await delay(600);
    
    const users = getFromStorage<User[]>(KEYS.USERS) || [];
    const user = users.find(u => u.phoneOrEmail === phoneOrEmail && u.pin === pin);

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Get consent
    const consent = getFromStorage<ConsentRecord>(`${KEYS.SESSION}_consent_${user.id}`) || {
      consentAccepted: true,
      consentVersion: 'v1',
      acceptedAt: new Date().toISOString()
    };

    // Get location (or use stored)
    const location: LocationData = { locationEnabled: false };

    const session: SessionData = {
      user: { ...user, lastLogin: new Date().toISOString() },
      consent,
      location,
      loginAt: new Date().toISOString()
    };

    sessionApi.setSession(session);

    return { success: true, session };
  }
};

// ============================================
// Location Services
// ============================================

export const locationApi = {
  async captureLocation(): Promise<LocationData> {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              locationEnabled: true,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              capturedAt: new Date().toISOString()
            });
          },
          () => {
            resolve({ locationEnabled: false });
          }
        );
      } else {
        resolve({ locationEnabled: false });
      }
    });
  }
};

// ============================================
// User Profile & eKYC
// ============================================

export const kycApi = {
  getKycProfile(userId: string): KycProfile | null {
    const profiles = getFromStorage<KycProfile[]>(KEYS.KYC_PROFILES) || [];
    return profiles.find(p => p.userId === userId) || null;
  },

  async submitKyc(userId: string, fullName: string, nationalIdNumber: string, selfieData: string): Promise<KycProfile> {
    await delay(1000);

    const profiles = getFromStorage<KycProfile[]>(KEYS.KYC_PROFILES) || [];
    const existingIndex = profiles.findIndex(p => p.userId === userId);

    const updatedProfile: KycProfile = {
      userId,
      status: 'under_review',
      fullName,
      nationalIdNumber,
      selfieFilename: 'selfie.jpg',
      selfieData,
      submittedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      profiles[existingIndex] = updatedProfile;
    } else {
      profiles.push(updatedProfile);
    }

    saveToStorage(KEYS.KYC_PROFILES, profiles);

    // Create notification
    notificationApi.createNotification(userId, {
      title: 'eKYC Submitted',
      message: 'Your eKYC information has been submitted for review.',
      type: 'info'
    });

    return updatedProfile;
  },

  async updateKycStatus(userId: string, status: KycStatus, rejectionReason?: string): Promise<KycProfile> {
    await delay(500);

    const profiles = getFromStorage<KycProfile[]>(KEYS.KYC_PROFILES) || [];
    const profile = profiles.find(p => p.userId === userId);

    if (!profile) {
      throw new Error('KYC profile not found');
    }

    profile.status = status;
    profile.reviewedAt = new Date().toISOString();
    if (rejectionReason) {
      profile.rejectionReason = rejectionReason;
    }

    saveToStorage(KEYS.KYC_PROFILES, profiles);

    // Create notification
    notificationApi.createNotification(userId, {
      title: status === 'approved' ? 'eKYC Approved' : 'eKYC Rejected',
      message: status === 'approved' 
        ? 'Your eKYC has been approved. You can now proceed with loan application.'
        : `Your eKYC was rejected. Reason: ${rejectionReason || 'Please resubmit with correct information.'}`,
      type: status === 'approved' ? 'success' : 'error'
    });

    return profile;
  }
};

// ============================================
// Loan Application
// ============================================

export const loanApi = {
  getDraftApplication(userId: string): LoanApplication | null {
    const applications = getFromStorage<LoanApplication[]>(KEYS.LOAN_APPLICATIONS) || [];
    return applications.find(app => app.userId === userId && app.status === 'draft') || null;
  },

  getAllApplications(userId: string): LoanApplication[] {
    const applications = getFromStorage<LoanApplication[]>(KEYS.LOAN_APPLICATIONS) || [];
    return applications.filter(app => app.userId === userId);
  },

  getApplication(applicationId: string): LoanApplication | null {
    const applications = getFromStorage<LoanApplication[]>(KEYS.LOAN_APPLICATIONS) || [];
    return applications.find(app => app.id === applicationId) || null;
  },

  saveDraft(userId: string, data: Partial<LoanApplication>): LoanApplication {
    const applications = getFromStorage<LoanApplication[]>(KEYS.LOAN_APPLICATIONS) || [];
    let draft = applications.find(app => app.userId === userId && app.status === 'draft');

    if (!draft) {
      draft = {
        id: generateId(),
        userId,
        status: 'draft',
        personalInfo: {
          fullName: '',
          dateOfBirth: '',
          nationalId: '',
          phoneNumber: '',
          email: '',
          maritalStatus: 'single',
          hasGuarantor: false
        },
        financialInfo: {
          employmentStatus: 'employed',
          monthlyIncome: 0,
          yearsOfWork: 0
        },
        loanDetails: {
          downPayment: 0,
          loanPeriodMonths: 48
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        signatureRequired: false
      };
      applications.push(draft);
    }

    // Merge data
    Object.assign(draft, data);
    draft.updatedAt = new Date().toISOString();

    saveToStorage(KEYS.LOAN_APPLICATIONS, applications);
    return draft;
  },

  async submitApplication(applicationId: string): Promise<LoanApplication> {
    await delay(1200);

    const applications = getFromStorage<LoanApplication[]>(KEYS.LOAN_APPLICATIONS) || [];
    const app = applications.find(a => a.id === applicationId);

    if (!app) {
      throw new Error('Application not found');
    }

    app.status = 'submitted';
    app.submittedAt = new Date().toISOString();
    saveToStorage(KEYS.LOAN_APPLICATIONS, applications);

    // Create timeline event
    timelineApi.addEvent(applicationId, 'Application Submitted', 'user');

    // Create notification
    notificationApi.createNotification(app.userId, {
      title: 'Application Submitted',
      message: 'Your loan application has been submitted successfully.',
      type: 'success',
      relatedApplicationId: applicationId
    });

    // Auto-transition to review after short delay
    setTimeout(() => {
      loanApi.updateStatus(applicationId, 'review');
    }, 2000);

    return app;
  },

  async updateStatus(applicationId: string, status: LoanStatus, data?: any): Promise<LoanApplication> {
    await delay(500);

    const applications = getFromStorage<LoanApplication[]>(KEYS.LOAN_APPLICATIONS) || [];
    const app = applications.find(a => a.id === applicationId);

    if (!app) {
      throw new Error('Application not found');
    }

    app.status = status;

    // Handle status-specific updates
    if (status === 'approved' && data?.approvedTerms) {
      app.approvedTerms = data.approvedTerms;
      app.signatureRequired = true;
    }

    if (status === 'rejected' && data?.rejectionReason) {
      app.rejectionReason = data.rejectionReason;
    }

    if (status === 'signed') {
      app.signedAt = new Date().toISOString();
    }

    saveToStorage(KEYS.LOAN_APPLICATIONS, applications);

    // Create timeline event
    const eventNames: Record<LoanStatus, string> = {
      draft: 'Draft Saved',
      submitted: 'Application Submitted',
      review: 'Under Review',
      approved: 'Application Approved',
      rejected: 'Application Rejected',
      cancelled: 'Application Cancelled',
      signed: 'Agreement Signed'
    };

    timelineApi.addEvent(applicationId, eventNames[status], status === 'review' ? 'loanEngineMock' : 'system');

    // Create notification
    const notifMessages: Record<LoanStatus, { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }> = {
      draft: { title: 'Draft Saved', message: 'Your application draft has been saved.', type: 'info' },
      submitted: { title: 'Submitted', message: 'Application submitted successfully.', type: 'success' },
      review: { title: 'Under Review', message: 'Your application is now under review.', type: 'info' },
      approved: { title: 'Approved!', message: 'Congratulations! Your loan has been approved. Please proceed to e-signature.', type: 'success' },
      rejected: { title: 'Rejected', message: `Your application was rejected. ${data?.rejectionReason || ''}`, type: 'error' },
      cancelled: { title: 'Cancelled', message: 'Your application has been cancelled.', type: 'warning' },
      signed: { title: 'Agreement Signed', message: 'Your loan agreement has been signed successfully.', type: 'success' }
    };

    const notif = notifMessages[status];
    notificationApi.createNotification(app.userId, {
      ...notif,
      relatedApplicationId: applicationId
    });

    return app;
  }
};

// ============================================
// Documents Management
// ============================================

export const documentApi = {
  getDocuments(applicationId: string): DocumentItem[] {
    const documents = getFromStorage<DocumentItem[]>(KEYS.DOCUMENTS) || [];
    return documents.filter(doc => doc.applicationId === applicationId);
  },

  async uploadDocument(
    applicationId: string,
    category: DocumentItem['category'],
    file: File
  ): Promise<DocumentItem> {
    await delay(800);

    // Validate file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit.');
    }

    // Read file as base64 (for POC)
    const fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const documents = getFromStorage<DocumentItem[]>(KEYS.DOCUMENTS) || [];
    
    // Check for existing document in same category
    const existingDoc = documents.find(
      doc => doc.applicationId === applicationId && doc.category === category
    );

    const newDoc: DocumentItem = {
      id: generateId(),
      applicationId,
      category,
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      version: existingDoc ? existingDoc.version + 1 : 1,
      fileData
    };

    if (existingDoc) {
      // Replace existing
      const index = documents.findIndex(d => d.id === existingDoc.id);
      documents[index] = newDoc;
    } else {
      documents.push(newDoc);
    }

    saveToStorage(KEYS.DOCUMENTS, documents);

    return newDoc;
  },

  deleteDocument(documentId: string): void {
    const documents = getFromStorage<DocumentItem[]>(KEYS.DOCUMENTS) || [];
    const filtered = documents.filter(doc => doc.id !== documentId);
    saveToStorage(KEYS.DOCUMENTS, filtered);
  }
};

// ============================================
// Timeline
// ============================================

export const timelineApi = {
  getTimeline(applicationId: string): TimelineEvent[] {
    const timeline = getFromStorage<TimelineEvent[]>(KEYS.TIMELINE) || [];
    return timeline.filter(event => event.applicationId === applicationId).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  addEvent(applicationId: string, eventName: string, source: TimelineEvent['source'], details?: string): TimelineEvent {
    const timeline = getFromStorage<TimelineEvent[]>(KEYS.TIMELINE) || [];

    const event: TimelineEvent = {
      id: generateId(),
      applicationId,
      eventName,
      timestamp: new Date().toISOString(),
      source,
      details
    };

    timeline.push(event);
    saveToStorage(KEYS.TIMELINE, timeline);

    return event;
  }
};

// ============================================
// Notifications
// ============================================

export const notificationApi = {
  getNotifications(userId: string): NotificationItem[] {
    const notifications = getFromStorage<NotificationItem[]>(KEYS.NOTIFICATIONS) || [];
    return notifications.filter(n => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  createNotification(
    userId: string,
    data: Omit<NotificationItem, 'id' | 'userId' | 'read' | 'createdAt'>
  ): NotificationItem {
    const notifications = getFromStorage<NotificationItem[]>(KEYS.NOTIFICATIONS) || [];

    const notification: NotificationItem = {
      id: generateId(),
      userId,
      read: false,
      createdAt: new Date().toISOString(),
      ...data
    };

    notifications.push(notification);
    saveToStorage(KEYS.NOTIFICATIONS, notifications);

    return notification;
  },

  markAsRead(notificationId: string): void {
    const notifications = getFromStorage<NotificationItem[]>(KEYS.NOTIFICATIONS) || [];
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      saveToStorage(KEYS.NOTIFICATIONS, notifications);
    }
  },

  markAllAsRead(userId: string): void {
    const notifications = getFromStorage<NotificationItem[]>(KEYS.NOTIFICATIONS) || [];
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    saveToStorage(KEYS.NOTIFICATIONS, notifications);
  }
};

// ============================================
// Demo Controls
// ============================================

export const demoApi = {
  resetAllData(): void {
    Object.values(KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    // Also clear consent records
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('loan_app_')) {
        localStorage.removeItem(key);
      }
    });
  },

  async setKycStatus(userId: string, status: KycStatus, reason?: string): Promise<void> {
    await kycApi.updateKycStatus(userId, status, reason);
  },

  async setLoanStatus(applicationId: string, status: LoanStatus, data?: any): Promise<void> {
    await loanApi.updateStatus(applicationId, status, data);
  }
};
