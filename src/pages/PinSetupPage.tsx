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
    <Layout showBackButton title="Setup PIN">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Create Your PIN</h1>
          <p className="page-subtitle">Choose a secure PIN to protect your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="alert alert-info">
            <strong>Note:</strong> For demo purposes, PIN is stored as plain text. In production, it would be securely hashed.
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
            <p className="form-help">Use 4-6 digits</p>
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
            disabled={loading || pin.length < 4 || pin !== confirmPin}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
