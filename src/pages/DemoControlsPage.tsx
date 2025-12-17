// ============================================
// Demo Controls - For BD Demo
// ============================================

import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { demoApi, loanApi } from '../services/mockApi';
import { KycStatus, LoanStatus } from '../types';

export function DemoControlsPage() {
  const { session, kycProfile, applications, loadKycProfile, loadApplications, refreshApplication } = useAppStore();
  
  const [selectedKycStatus, setSelectedKycStatus] = useState<KycStatus>('not_started');
  const [kycRejectionReason, setKycRejectionReason] = useState('');
  const [selectedLoanStatus, setSelectedLoanStatus] = useState<LoanStatus>('draft');
  const [loanRejectionReason, setLoanRejectionReason] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (kycProfile) {
      setSelectedKycStatus(kycProfile.status);
    }
  }, [kycProfile]);

  useEffect(() => {
    if (applications.length > 0 && !selectedApplicationId) {
      setSelectedApplicationId(applications[0].id);
      setSelectedLoanStatus(applications[0].status);
    }
  }, [applications, selectedApplicationId]);

  if (!session) return null;

  const handleUpdateKyc = async () => {
    setLoading(true);
    try {
      await demoApi.setKycStatus(
        session.user.id,
        selectedKycStatus,
        selectedKycStatus === 'rejected' ? kycRejectionReason : undefined
      );
      loadKycProfile(session.user.id);
      alert('KYC status updated successfully!');
    } catch (err) {
      alert('Failed to update KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLoan = async () => {
    if (!selectedApplicationId) {
      alert('No application selected');
      return;
    }

    setLoading(true);
    try {
      const data: any = {};
      
      if (selectedLoanStatus === 'rejected') {
        data.rejectionReason = loanRejectionReason || 'Application did not meet criteria';
      }
      
      if (selectedLoanStatus === 'approved') {
        const app = loanApi.getApplication(selectedApplicationId);
        if (app) {
          data.approvedTerms = {
            approvedAmount: app.financialInfo.monthlyIncome * 12 * 0.3,
            interestRate: 7.5,
            monthlyPayment: (app.financialInfo.monthlyIncome * 12 * 0.3 * 1.075) / app.loanDetails.loanPeriodMonths,
          };
        }
      }

      await demoApi.setLoanStatus(selectedApplicationId, selectedLoanStatus, data);
      refreshApplication(selectedApplicationId);
      loadApplications(session.user.id);
      alert('Loan status updated successfully!');
    } catch (err) {
      alert('Failed to update loan status');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = () => {
    if (confirm('This will clear ALL demo data including users, applications, and documents. Are you sure?')) {
      demoApi.resetAllData();
      alert('Demo data reset! Please refresh the page.');
      window.location.href = '/';
    }
  };

  return (
    <Layout showBackButton title="Demo Controls">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Demo Controls</h1>
          <p className="page-subtitle">Simulate different scenarios for demonstration</p>
        </div>

        <div className="alert alert-warning">
          <strong>⚠️ Demo Mode:</strong> These controls are for demonstration purposes only. Use them to simulate different application outcomes.
        </div>

        {/* KYC Controls */}
        <div className="card">
          <h3 className="card-title">eKYC Status Control</h3>
          <p className="card-subtitle">
            Current Status: <span className="badge badge-info">{kycProfile?.status || 'not_started'}</span>
          </p>

          <div className="form-group">
            <label className="form-label">Set KYC Status</label>
            <select
              className="form-select"
              value={selectedKycStatus}
              onChange={(e) => setSelectedKycStatus(e.target.value as KycStatus)}
              disabled={loading}
            >
              <option value="not_started">Not Started</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {selectedKycStatus === 'rejected' && (
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., ID photo unclear"
                value={kycRejectionReason}
                onChange={(e) => setKycRejectionReason(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <button
            className="btn btn-primary btn-block"
            onClick={handleUpdateKyc}
            disabled={loading || !kycProfile}
          >
            Update KYC Status
          </button>
        </div>

        {/* Loan Application Controls */}
        <div className="card">
          <h3 className="card-title">Loan Application Control</h3>
          
          {applications.length === 0 ? (
            <p className="card-subtitle">No applications found. Create one first.</p>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Select Application</label>
                <select
                  className="form-select"
                  value={selectedApplicationId}
                  onChange={(e) => {
                    setSelectedApplicationId(e.target.value);
                    const app = applications.find(a => a.id === e.target.value);
                    if (app) setSelectedLoanStatus(app.status);
                  }}
                  disabled={loading}
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.id.slice(0, 12)}... - {app.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Set Loan Status</label>
                <select
                  className="form-select"
                  value={selectedLoanStatus}
                  onChange={(e) => setSelectedLoanStatus(e.target.value as LoanStatus)}
                  disabled={loading}
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="signed">Signed</option>
                </select>
              </div>

              {selectedLoanStatus === 'rejected' && (
                <div className="form-group">
                  <label className="form-label">Rejection Reason</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Insufficient income"
                    value={loanRejectionReason}
                    onChange={(e) => setLoanRejectionReason(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <button
                className="btn btn-primary btn-block"
                onClick={handleUpdateLoan}
                disabled={loading}
              >
                Update Loan Status
              </button>
            </>
          )}
        </div>

        {/* Quick Scenarios */}
        <div className="card">
          <h3 className="card-title">Quick Scenarios</h3>
          <p className="card-subtitle">Common demo scenarios</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary btn-block"
              onClick={() => {
                setSelectedKycStatus('approved');
                setTimeout(handleUpdateKyc, 100);
              }}
              disabled={loading || !kycProfile}
            >
              ✅ Approve KYC
            </button>
            
            <button
              className="btn btn-secondary btn-block"
              onClick={() => {
                if (selectedApplicationId) {
                  setSelectedLoanStatus('approved');
                  setTimeout(handleUpdateLoan, 100);
                } else {
                  alert('No application selected');
                }
              }}
              disabled={loading || !selectedApplicationId}
            >
              ✅ Approve Loan
            </button>
            
            <button
              className="btn btn-secondary btn-block"
              onClick={() => {
                if (selectedApplicationId) {
                  setSelectedLoanStatus('rejected');
                  setLoanRejectionReason('Insufficient income for requested loan amount');
                  setTimeout(handleUpdateLoan, 100);
                } else {
                  alert('No application selected');
                }
              }}
              disabled={loading || !selectedApplicationId}
            >
              ❌ Reject Loan
            </button>
          </div>
        </div>

        {/* Reset Demo Data */}
        <div className="card">
          <h3 className="card-title">Reset Demo</h3>
          <p className="card-subtitle">Clear all data and start fresh</p>
          
          <button
            className="btn btn-danger btn-block"
            onClick={handleResetDemo}
          >
            🗑️ Reset All Demo Data
          </button>
          
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
            This will clear all users, applications, documents, and notifications from localStorage.
          </p>
        </div>

        {/* Current State Info */}
        <div className="card">
          <h3 className="card-title">Current State</h3>
          <div style={{ fontSize: '0.875rem' }}>
            <p><strong>User:</strong> {session.user.phoneOrEmail}</p>
            <p><strong>KYC Status:</strong> {kycProfile?.status || 'not_started'}</p>
            <p><strong>Applications:</strong> {applications.length}</p>
            <p><strong>Location Enabled:</strong> {session.location.locationEnabled ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
