// ============================================
// User Profile & eKYC Integration
// ============================================

import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { kycApi } from '../services/mockApi';
import { validators } from '../utils/validators';

export function ProfilePage() {
  const { session, kycProfile, loadKycProfile, setKycProfile } = useAppStore();
  
  const [showKycForm, setShowKycForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      loadKycProfile(session.user.id);
    }
  }, [session, loadKycProfile]);

  useEffect(() => {
    if (kycProfile) {
      setFullName(kycProfile.fullName || '');
      setNationalIdNumber(kycProfile.nationalIdNumber || '');
    }
  }, [kycProfile]);

  if (!session) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelfieFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !nationalIdNumber || !selfieFile) {
      setError('Please fill all required fields');
      return;
    }

    const nameError = validators.required(fullName);
    if (nameError) {
      setError(nameError);
      return;
    }

    const idError = validators.nationalId(nationalIdNumber);
    if (idError) {
      setError(idError);
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const profile = await kycApi.submitKyc(session.user.id, fullName, nationalIdNumber, base64);
        setKycProfile(profile);
        setShowKycForm(false);
        alert('eKYC submitted successfully! It is now under review.');
      };
      reader.readAsDataURL(selfieFile);
    } catch (err) {
      setError('Failed to submit eKYC. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBackButton title="Profile">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
        </div>

        {/* User Info Card */}
        <div className="card">
          <h3 className="card-title">Account Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Username</p>
              <p style={{ fontWeight: '500' }}>@{session.user.username}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Contact</p>
              <p style={{ fontWeight: '500' }}>{session.user.phoneOrEmail}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Member Since</p>
              <p style={{ fontWeight: '500' }}>
                {new Date(session.user.createdAt).toLocaleDateString()}
              </p>
            </div>
            {session.location.locationEnabled && (
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Location</p>
                <p style={{ fontWeight: '500' }}>
                  {session.location.latitude?.toFixed(4)}, {session.location.longitude?.toFixed(4)}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  Captured: {session.location.capturedAt ? new Date(session.location.capturedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* KYC Status Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>eKYC Status</h3>
            <span className={`badge ${getKycBadgeClass(kycProfile?.status || 'not_started')}`}>
              {formatKycStatus(kycProfile?.status || 'not_started')}
            </span>
          </div>

          {kycProfile?.status === 'rejected' && (
            <div className="alert alert-error">
              <strong>Rejection Reason:</strong> {kycProfile.rejectionReason || 'Please resubmit with correct information'}
            </div>
          )}

          {kycProfile?.status === 'approved' && (
            <div className="alert alert-success">
              Your eKYC has been approved! You can now apply for loans.
            </div>
          )}

          {kycProfile?.status === 'under_review' && (
            <div className="alert alert-info">
              Your eKYC is under review. We'll notify you once it's processed.
            </div>
          )}

          {kycProfile && kycProfile.status !== 'not_started' && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Full Name</p>
                  <p style={{ fontWeight: '500' }}>{kycProfile.fullName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>National ID</p>
                  <p style={{ fontWeight: '500' }}>{kycProfile.nationalIdNumber}</p>
                </div>
                {kycProfile.submittedAt && (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Submitted</p>
                    <p style={{ fontWeight: '500' }}>
                      {new Date(kycProfile.submittedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(!kycProfile || kycProfile.status === 'not_started' || kycProfile.status === 'rejected') && !showKycForm && (
            <button
              className="btn btn-primary btn-block mt-3"
              onClick={() => setShowKycForm(true)}
            >
              {kycProfile?.status === 'rejected' ? 'Resubmit eKYC' : 'Start eKYC'}
            </button>
          )}

          {showKycForm && (
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label required">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full legal name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">National ID Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your national ID"
                  value={nationalIdNumber}
                  onChange={(e) => setNationalIdNumber(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">ID Selfie</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  style={{ marginBottom: '0.5rem' }}
                />
                <p className="form-help">
                  Upload a clear photo of yourself holding your ID
                </p>
                {selfieFile && (
                  <p style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.5rem' }}>
                    ✓ File selected: {selfieFile.name}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !fullName || !nationalIdNumber || !selfieFile}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Submitting...' : 'Submit eKYC'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowKycForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

function formatKycStatus(status: string): string {
  const map: Record<string, string> = {
    not_started: 'Not Started',
    submitted: 'Submitted',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return map[status] || status;
}

function getKycBadgeClass(status: string): string {
  const map: Record<string, string> = {
    not_started: 'badge-secondary',
    submitted: 'badge-info',
    under_review: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
  };
  return map[status] || 'badge-secondary';
}
