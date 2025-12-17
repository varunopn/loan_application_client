// ============================================
// Loan Application Result - Status Timeline
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { loanApi, timelineApi } from '../services/mockApi';
import { TimelineEvent } from '../types';
import { formatters } from '../utils/formatters';

export function LoanResultPage() {
  const navigate = useNavigate();
  const { session, currentApplication, applications, setCurrentApplication } = useAppStore();
  
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // Use currentApplication from store or get the latest one
  const application = currentApplication || (applications.length > 0 ? applications[0] : null);

  useEffect(() => {
    if (application) {
      const events = timelineApi.getTimeline(application.id);
      setTimeline(events);
    }
  }, [application]);

  useEffect(() => {
    // Refresh application data periodically
    const interval = setInterval(() => {
      if (application) {
        const updated = loanApi.getApplication(application.id);
        if (updated && JSON.stringify(updated) !== JSON.stringify(application)) {
          setCurrentApplication(updated);
          const events = timelineApi.getTimeline(updated.id);
          setTimeline(events);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [application, setCurrentApplication]);

  if (!session || !application) {
    return (
      <Layout showBackButton title="Application Status">
        <div className="page">
          <div className="alert alert-info">
            <p>No application found. Please create a new application.</p>
            <button className="btn btn-primary mt-2" onClick={() => navigate('/loan/new')}>
              New Application
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBackButton title="Application Status">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Application Status</h1>
          <p className="page-subtitle">Application ID: {application.id.slice(0, 12)}...</p>
        </div>

        {/* Status Card */}
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {getStatusIcon(application.status)}
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>{getStatusTitle(application.status)}</h2>
            <span className={`badge ${getStatusBadgeClass(application.status)}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {formatStatus(application.status)}
            </span>
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>
              {getStatusMessage(application.status)}
            </p>
          </div>
        </div>

        {/* Rejection Reason */}
        {application.status === 'rejected' && application.rejectionReason && (
          <div className="alert alert-error">
            <strong>Rejection Reason:</strong><br />
            {application.rejectionReason}
          </div>
        )}

        {/* Approved Terms */}
        {application.status === 'approved' && application.approvedTerms && (
          <div className="card">
            <h3 className="card-title">Approved Loan Terms</h3>
            <InfoRow label="Approved Amount" value={formatters.currency(application.approvedTerms.approvedAmount)} />
            <InfoRow label="Interest Rate" value={`${application.approvedTerms.interestRate}%`} />
            <InfoRow label="Monthly Payment" value={formatters.currency(application.approvedTerms.monthlyPayment)} />
            <InfoRow label="Loan Period" value={`${application.loanDetails.loanPeriodMonths} months`} />
            
            {application.signatureRequired && !application.signedAt && (
              <button
                className="btn btn-success btn-block mt-3"
                onClick={() => navigate('/loan/esign')}
              >
                Proceed to E-Signature
              </button>
            )}
          </div>
        )}

        {/* Signed Confirmation */}
        {application.status === 'signed' && application.signedAt && (
          <div className="alert alert-success">
            ✓ Agreement signed on {formatters.datetime(application.signedAt)}
          </div>
        )}

        {/* Timeline */}
        <div className="card">
          <h3 className="card-title">Application Timeline</h3>
          <div style={{ position: 'relative' }}>
            {timeline.map((event, index) => (
              <div key={event.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#2563eb' : '#10b981',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      zIndex: 1,
                      position: 'relative',
                    }}
                  >
                    {getEventIcon(event.source)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        left: '19px',
                        width: '2px',
                        height: 'calc(100% + 1rem)',
                        backgroundColor: '#e5e7eb',
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{event.eventName}</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {formatters.datetime(event.timestamp)}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Source: {formatSource(event.source)}
                  </p>
                  {event.details && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      {event.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h3 className="card-title">Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {application.status === 'draft' && (
              <button className="btn btn-primary btn-block" onClick={() => navigate('/loan/new')}>
                Continue Application
              </button>
            )}
            {(application.status === 'rejected' || application.status === 'cancelled') && (
              <button className="btn btn-primary btn-block" onClick={() => navigate('/loan/new')}>
                Start New Application
              </button>
            )}
            <button className="btn btn-secondary btn-block" onClick={() => navigate('/home')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ color: '#6b7280' }}>{label}:</span>
      <span style={{ fontWeight: '500' }}>{value}</span>
    </div>
  );
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    draft: '📝',
    submitted: '📤',
    review: '🔍',
    approved: '✅',
    rejected: '❌',
    cancelled: '🚫',
    signed: '✍️',
  };
  return icons[status] || '📄';
}

function getStatusTitle(status: string): string {
  const titles: Record<string, string> = {
    draft: 'Draft Saved',
    submitted: 'Application Submitted',
    review: 'Under Review',
    approved: 'Congratulations!',
    rejected: 'Application Rejected',
    cancelled: 'Application Cancelled',
    signed: 'Agreement Signed',
  };
  return titles[status] || 'Application Status';
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    draft: 'Your application is saved as a draft. Continue to complete and submit it.',
    submitted: 'Your application has been submitted and is being processed.',
    review: 'Your application is currently under review by our loan officers.',
    approved: 'Your loan application has been approved! Please review the terms and sign the agreement.',
    rejected: 'Unfortunately, your application has been rejected. Please see the reason above.',
    cancelled: 'This application has been cancelled.',
    signed: 'Your loan agreement has been signed. The funds will be disbursed soon.',
  };
  return messages[status] || '';
}

function formatStatus(status: string): string {
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

function getStatusBadgeClass(status: string): string {
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

function getEventIcon(source: string): string {
  const icons: Record<string, string> = {
    user: '👤',
    system: '⚙️',
    loanEngineMock: '🤖',
  };
  return icons[source] || '📌';
}

function formatSource(source: string): string {
  const map: Record<string, string> = {
    user: 'User',
    system: 'System',
    loanEngineMock: 'Loan Engine',
  };
  return map[source] || source;
}
