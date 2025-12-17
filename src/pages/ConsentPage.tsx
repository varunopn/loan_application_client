// ============================================
// User Registration - Consent Screen (T&C)
// ============================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function ConsentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneOrEmail = location.state?.phoneOrEmail || '';
  
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState('');

  if (!phoneOrEmail) {
    navigate('/register');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!consentAccepted) {
      setError('You must accept the consent to continue');
      return;
    }

    // Store consent info to pass to next step
    const consentRecord = {
      consentAccepted: true,
      consentVersion: 'v1',
      acceptedAt: new Date().toISOString(),
    };

    navigate('/pin', { state: { phoneOrEmail, consent: consentRecord } });
  };

  return (
    <Layout showBackButton title="Consent">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Terms & Consent</h1>
          <p className="page-subtitle">Please review and accept to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="card">
            <h3 className="card-title">Credit Disclosure Consent</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#374151' }}>
                <strong>Credit Information Disclosure</strong>
                <br /><br />
                By accepting this consent, you authorize us to:
                <br /><br />
                • Access your credit information from credit bureaus
                <br />
                • Use this information to assess your loan application
                <br />
                • Share relevant information with lending partners
                <br />
                • Store your credit history for future reference
                <br /><br />
                <strong>Data Privacy & Security</strong>
                <br /><br />
                We are committed to protecting your personal and financial information:
                <br /><br />
                • Your data is encrypted and securely stored
                <br />
                • We comply with all applicable data protection laws
                <br />
                • Your information will not be sold to third parties
                <br />
                • You can request deletion of your data at any time
                <br /><br />
                <strong>Terms of Service</strong>
                <br /><br />
                By using this service, you agree to our terms and conditions, including:
                <br /><br />
                • Providing accurate and truthful information
                <br />
                • Understanding that false information may result in application rejection
                <br />
                • Accepting the loan terms if approved
                <br />
                • Making timely payments according to the loan schedule
                <br /><br />
                This consent remains valid until you withdraw it in writing or close your account.
              </p>
            </div>

            <div className="form-checkbox">
              <input
                type="checkbox"
                id="consent"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
              />
              <label htmlFor="consent">
                I have read and agree to the terms and conditions. I consent to the disclosure of my credit information for the purpose of loan application assessment.
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={!consentAccepted}
          >
            Accept & Continue
          </button>
        </form>
      </div>
    </Layout>
  );
}
