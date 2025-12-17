// ============================================
// App State Management using Zustand
// ============================================

import { create } from 'zustand';
import { SessionData, KycProfile, LoanApplication, NotificationItem } from '../types';
import { sessionApi, kycApi, loanApi, notificationApi } from '../services/mockApi';

interface AppState {
  // Session
  session: SessionData | null;
  isAuthenticated: boolean;
  
  // KYC
  kycProfile: KycProfile | null;
  
  // Loan Applications
  currentApplication: LoanApplication | null;
  applications: LoanApplication[];
  
  // Notifications
  notifications: NotificationItem[];
  unreadCount: number;
  
  // Actions
  loadSession: () => void;
  clearSession: () => void;
  setSession: (session: SessionData) => void;
  
  loadKycProfile: (userId: string) => void;
  setKycProfile: (profile: KycProfile) => void;
  
  loadApplications: (userId: string) => void;
  setCurrentApplication: (app: LoanApplication | null) => void;
  refreshApplication: (applicationId: string) => void;
  
  loadNotifications: (userId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  session: null,
  isAuthenticated: false,
  kycProfile: null,
  currentApplication: null,
  applications: [],
  notifications: [],
  unreadCount: 0,

  // Session actions
  loadSession: () => {
    const session = sessionApi.getSession();
    set({ session, isAuthenticated: !!session });
    
    if (session) {
      get().loadKycProfile(session.user.id);
      get().loadApplications(session.user.id);
      get().loadNotifications(session.user.id);
    }
  },

  clearSession: () => {
    sessionApi.clearSession();
    set({
      session: null,
      isAuthenticated: false,
      kycProfile: null,
      currentApplication: null,
      applications: [],
      notifications: [],
      unreadCount: 0
    });
  },

  setSession: (session: SessionData) => {
    sessionApi.setSession(session);
    set({ session, isAuthenticated: true });
    get().loadKycProfile(session.user.id);
    get().loadApplications(session.user.id);
    get().loadNotifications(session.user.id);
  },

  // KYC actions
  loadKycProfile: (userId: string) => {
    const profile = kycApi.getKycProfile(userId);
    set({ kycProfile: profile });
  },

  setKycProfile: (profile: KycProfile) => {
    set({ kycProfile: profile });
  },

  // Loan application actions
  loadApplications: (userId: string) => {
    const applications = loanApi.getAllApplications(userId);
    set({ applications });
  },

  setCurrentApplication: (app: LoanApplication | null) => {
    set({ currentApplication: app });
  },

  refreshApplication: (applicationId: string) => {
    const app = loanApi.getApplication(applicationId);
    if (app) {
      set({ currentApplication: app });
      const session = get().session;
      if (session) {
        get().loadApplications(session.user.id);
      }
    }
  },

  // Notification actions
  loadNotifications: (userId: string) => {
    const notifications = notificationApi.getNotifications(userId);
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
  },

  markNotificationRead: (notificationId: string) => {
    notificationApi.markAsRead(notificationId);
    const session = get().session;
    if (session) {
      get().loadNotifications(session.user.id);
    }
  },

  markAllNotificationsRead: (userId: string) => {
    notificationApi.markAllAsRead(userId);
    get().loadNotifications(userId);
  }
}));
