// ============================================
// User Registration - PIN Setup Screen
// ============================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { authApi, locationApi } from '../services/mockApi';
import { useAppStore } from '../store/useAppStore';
import { validators } from '../utils/validators';

export function PinSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAppStore();
  
  const phoneOrEmail = location.state?.phoneOrEmail || '';
  const consent = location.state?.consent;
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!phoneOrEmail || !consent) {
    navigate('/register');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate username
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate PIN
    const pinError = validators.pin(pin);
    if (pinError) {
      setError(pinError);
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      // Capture location
      const locationData = await locationApi.captureLocation();
      
      // Complete registration
      const { session } = await authApi.completeRegistration(
        phoneOrEmail,
        username,
        password,
        pin,
        consent,
        locationData
      );

      setSession(session);
      navigate('/home');
    } catch (err) {
      setError('Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBackButton title="Account Setup">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Create Your Account</h1>
          <p className="page-subtitle">Set up your login credentials</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="alert alert-info">
            <strong>Note:</strong> For demo purposes, credentials are stored as plain text. In production, they would be securely hashed.
          </div>

          <div className="form-group">
            <label className="form-label required">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <p className="form-help">Minimum 3 characters</p>
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <p className="form-help">Minimum 6 characters</p>
          </div>

          <div className="form-group">
            <label className="form-label required">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Create PIN</label>
            <input
              type="password"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="Enter 4-6 digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              maxLength={6}
              style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
            />
            <p className="form-help">Use 4-6 digits for quick login</p>
          </div>

          <div className="form-group">
            <label className="form-label required">Confirm PIN</label>
            <input
              type="password"
              className={`form-input ${error && pin !== confirmPin ? 'error' : ''}`}
              placeholder="Re-enter PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              maxLength={6}
              style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
