// ============================================
// User Authentication - Login Screen
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { authApi } from '../services/mockApi';
import { useAppStore } from '../store/useAppStore';
import { validators } from '../utils/validators';

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession, isAuthenticated, loadSession } = useAppStore();
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'pin'>('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSession();
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, loadSession, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail) {
      setError('Username or email is required');
      return;
    }

    if (loginMethod === 'password') {
      if (!password || password.length < 6) {
        setError('Password is required');
        return;
      }
    } else {
      const pinError = validators.pin(pin);
      if (pinError) {
        setError(pinError);
        return;
      }
    }

    setLoading(true);
    try {
      const result = loginMethod === 'password' 
        ? await authApi.login(usernameOrEmail, password)
        : await authApi.quickLogin(usernameOrEmail, pin);
        
      if (result.success && result.session) {
        setSession(result.session);
        navigate('/home');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBackButton title="Sign In">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Welcome Back</h1>
          <p className="page-subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Login Method Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`btn ${loginMethod === 'password' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLoginMethod('password')}
              style={{ flex: 1 }}
            >
              Password
            </button>
            <button
              type="button"
              className={`btn ${loginMethod === 'pin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLoginMethod('pin')}
              style={{ flex: 1 }}
            >
              Quick PIN
            </button>
          </div>

          <div className="form-group">
            <label className="form-label required">Username or Email</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter username or email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {loginMethod === 'password' ? (
            <div className="form-group">
              <label className="form-label required">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label required">PIN</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                maxLength={6}
                style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: '#6b7280' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Register
              </button>
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
}
