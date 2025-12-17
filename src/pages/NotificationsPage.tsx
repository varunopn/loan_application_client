// ============================================
// Notification - In-App Notifications
// ============================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { formatters } from '../utils/formatters';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { session, notifications, loadNotifications, markNotificationRead, markAllNotificationsRead } = useAppStore();

  useEffect(() => {
    if (session) {
      loadNotifications(session.user.id);
    }
  }, [session, loadNotifications]);

  if (!session) return null;

  const handleNotificationClick = (notificationId: string, applicationId?: string) => {
    markNotificationRead(notificationId);
    if (applicationId) {
      navigate('/loan/result');
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(session.user.id);
  };

  return (
    <Layout showBackButton title="Notifications">
      <div className="page">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="page-title">Notifications</h1>
            {notifications.some(n => !n.read) && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleMarkAllRead}
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <p style={{ color: '#6b7280' }}>No notifications yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  backgroundColor: notification.read ? '#ffffff' : '#f0f9ff',
                  borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                }}
                onClick={() => handleNotificationClick(notification.id, notification.relatedApplicationId)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: notification.read ? '500' : '600' }}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#2563eb',
                            marginTop: '0.25rem',
                          }}
                        />
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      {notification.message}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                      {formatters.relativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };
  return icons[type] || 'ℹ️';
}

function getNotificationColor(type: string): string {
  const colors: Record<string, string> = {
    info: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };
  return colors[type] || '#06b6d4';
}
