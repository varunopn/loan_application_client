// ============================================
// Home / Dashboard Screen
// ============================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { loanApi } from '../services/mockApi';

export function HomePage() {
  const navigate = useNavigate();
  const { session, kycProfile, applications, loadKycProfile, loadApplications } = useAppStore();

  useEffect(() => {
    if (session) {
      loadKycProfile(session.user.id);
      loadApplications(session.user.id);
    }
  }, [session, loadKycProfile, loadApplications]);

  if (!session) return null;

  const draftApplication = loanApi.getDraftApplication(session.user.id);
  const latestApplication = applications.length > 0 ? applications[0] : null;

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Welcome back!</h1>
          <p className="page-subtitle">Manage your loan applications</p>
        </div>

        {/* KYC Status Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title">eKYC Status</h3>
              <span className={`badge ${getKycBadgeClass(kycProfile?.status || 'not_started')}`}>
                {formatKycStatus(kycProfile?.status || 'not_started')}
              </span>
            </div>
            {(!kycProfile || kycProfile.status === 'not_started' || kycProfile.status === 'rejected') && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/profile')}
              >
                {kycProfile?.status === 'rejected' ? 'Resubmit' : 'Start eKYC'}
              </button>
            )}
          </div>
        </div>

        {/* Loan Application Card */}
        <div className="card">
          <h3 className="card-title">Loan Application</h3>
          
          {draftApplication ? (
            <div>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                You have a draft application in progress
              </p>
              <button
                className="btn btn-primary btn-block"
                onClick={() => navigate('/loan/new')}
              >
                Resume Draft
              </button>
            </div>
          ) : latestApplication && latestApplication.status !== 'rejected' && latestApplication.status !== 'cancelled' ? (
            <div>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Current Application Status:
              </p>
              <span className={`badge ${getLoanBadgeClass(latestApplication.status)}`}>
                {formatLoanStatus(latestApplication.status)}
              </span>
              <button
                className="btn btn-secondary btn-block mt-3"
                onClick={() => navigate('/loan/result')}
              >
                View Status
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Ready to apply for a loan?
              </p>
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  if (kycProfile?.status !== 'approved') {
                    alert('Please complete eKYC verification first');
                    navigate('/profile');
                  } else {
                    navigate('/loan/new');
                  }
                }}
              >
                New Application
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="card-title">Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary btn-block"
              onClick={() => navigate('/profile')}
            >
              👤 My Profile
            </button>
            <button
              className="btn btn-secondary btn-block"
              onClick={() => navigate('/notifications')}
            >
              🔔 Notifications
            </button>
            {latestApplication && (
              <button
                className="btn btn-secondary btn-block"
                onClick={() => navigate('/loan/result')}
              >
                📊 Application Status
              </button>
            )}
          </div>
        </div>

        {/* Application History */}
        {applications.length > 0 && (
          <div className="card">
            <h3 className="card-title">Application History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {applications.slice(0, 3).map(app => (
                <div
                  key={app.id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    useAppStore.getState().setCurrentApplication(app);
                    navigate('/loan/result');
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        Application #{app.id.slice(0, 8)}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge ${getLoanBadgeClass(app.status)}`}>
                      {formatLoanStatus(app.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Helper functions
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

function formatLoanStatus(status: string): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    signed: 'Signed',
  };
  return map[status] || status;
}

function getLoanBadgeClass(status: string): string {
  const map: Record<string, string> = {
    draft: 'badge-secondary',
    submitted: 'badge-info',
    review: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    cancelled: 'badge-secondary',
    signed: 'badge-success',
  };
  return map[status] || 'badge-secondary';
}
