// ============================================
// User Registration - Register Screen
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { authApi } from '../services/mockApi';
import { validators } from '../utils/validators';

export function RegisterPage() {
  const navigate = useNavigate();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validators.emailOrPhone(phoneOrEmail);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.requestOtp(phoneOrEmail);
      if (result.success) {
        navigate('/register/otp', { state: { phoneOrEmail } });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBackButton title="Register">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Create Account</h1>
          <p className="page-subtitle">Enter your phone number or email to get started</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label required">Phone or Email</label>
            <input
              type="text"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="Enter phone or email"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              disabled={loading}
            />
            <p className="form-help">
              We'll send you a verification code
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Request OTP'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
}
