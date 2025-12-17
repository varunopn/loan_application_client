// ============================================
// Layout Component - App Shell
// ============================================

import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBackButton?: boolean;
  title?: string;
}

export function Layout({ children, showHeader = true, showBackButton = false, title }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, clearSession, unreadCount } = useAppStore();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearSession();
      navigate('/');
    }
  };

  const isAuthPage = ['/', '/register', '/login', '/consent', '/pin'].includes(location.pathname);

  return (
    <div className="app-container">
      {showHeader && (
        <header style={headerStyle}>
          <div style={headerContentStyle}>
            {showBackButton ? (
              <button onClick={() => navigate(-1)} style={backButtonStyle}>
                ← Back
              </button>
            ) : (
              <div style={logoStyle}>💰 LoanApp</div>
            )}
            
            {title && <h2 style={titleStyle}>{title}</h2>}
            
            {session && !isAuthPage && (
              <div style={headerActionsStyle}>
                <button
                  onClick={() => navigate('/notifications')}
                  style={notificationButtonStyle}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={badgeStyle}>{unreadCount}</span>
                  )}
                </button>
                <button onClick={handleLogout} style={logoutButtonStyle}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
      )}
      
      <main style={mainStyle}>
        {children}
      </main>
      
      {session && !isAuthPage && <BottomNav />}
    </div>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/loan/result', label: 'Status', icon: '📊' },
    { path: '/demo', label: 'Demo', icon: '🎮' },
  ];

  return (
    <nav style={bottomNavStyle}>
      {navItems.map(item => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            ...navItemStyle,
            ...(location.pathname === item.path ? navItemActiveStyle : {})
          }}
        >
          <span style={navIconStyle}>{item.icon}</span>
          <span style={navLabelStyle}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// Styles
const headerStyle: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: 'white',
  padding: '1rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const headerContentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxWidth: '480px',
  margin: '0 auto',
};

const logoStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: '600',
  margin: 0,
};

const backButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  fontSize: '1rem',
  cursor: 'pointer',
  padding: '0.5rem',
};

const headerActionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const notificationButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  fontSize: '1.5rem',
  cursor: 'pointer',
  position: 'relative',
  padding: '0.5rem',
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  right: '0',
  backgroundColor: '#ef4444',
  color: 'white',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoutButtonStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.2)',
  border: 'none',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  paddingBottom: '80px', // Space for bottom nav
};

const bottomNavStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: '480px',
  backgroundColor: 'white',
  borderTop: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'space-around',
  padding: '0.5rem 0',
  boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
};

const navItemStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  color: '#6b7280',
  fontSize: '0.75rem',
};

const navItemActiveStyle: React.CSSProperties = {
  color: '#2563eb',
};

const navIconStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginBottom: '0.25rem',
};

const navLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
};
