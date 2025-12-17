// ============================================
// User Registration - OTP Verification Screen
// ============================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { authApi } from '../services/mockApi';
import { validators } from '../utils/validators';

export function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneOrEmail = location.state?.phoneOrEmail || '';
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!phoneOrEmail) {
    navigate('/register');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validators.otp(otp);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.verifyOtp(phoneOrEmail, otp);
      if (result.success) {
        navigate('/consent', { state: { phoneOrEmail } });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBackButton title="Verify OTP">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Enter OTP</h1>
          <p className="page-subtitle">
            We've sent a verification code to <strong>{phoneOrEmail}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="alert alert-info">
            <strong>Demo Mode:</strong> Use <code>123456</code> as the OTP
          </div>

          <div className="form-group">
            <label className="form-label required">OTP Code</label>
            <input
              type="text"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              maxLength={6}
              style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => authApi.requestOtp(phoneOrEmail)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Resend OTP
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
