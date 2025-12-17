// ============================================
// Entry Point - Landing Screen
// ============================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loadSession } = useAppStore();

  useEffect(() => {
    loadSession();
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, loadSession, navigate]);

  return (
    <Layout showHeader={false}>
      <div className="page" style={pageStyle}>
        <div style={contentStyle}>
          <div style={logoStyle}>💰</div>
          <h1 style={titleStyle}>Loan Application Platform</h1>
          <p style={subtitleStyle}>
            Apply for loans quickly and easily. Track your application status in real-time.
          </p>
          
          <div style={ctaContainerStyle}>
            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
            <button
              className="btn btn-outline btn-lg btn-block"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
          
          <div style={featuresStyle}>
            <div style={featureStyle}>
              <span style={featureIconStyle}>🔒</span>
              <span>Secure & Safe</span>
            </div>
            <div style={featureStyle}>
              <span style={featureIconStyle}>⚡</span>
              <span>Quick Approval</span>
            </div>
            <div style={featureStyle}>
              <span style={featureIconStyle}>📱</span>
              <span>Easy Process</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const pageStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  color: 'white',
  maxWidth: '400px',
};

const logoStyle: React.CSSProperties = {
  fontSize: '5rem',
  marginBottom: '1rem',
};

const titleStyle: React.CSSProperties = {
  color: 'white',
  marginBottom: '1rem',
};

const subtitleStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.9)',
  fontSize: '1.125rem',
  marginBottom: '3rem',
};

const ctaContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '3rem',
};

const featuresStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  gap: '1rem',
};

const featureStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.875rem',
};

const featureIconStyle: React.CSSProperties = {
  fontSize: '2rem',
};
