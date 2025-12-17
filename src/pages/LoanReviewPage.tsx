// ============================================
// Loan Application Review & Submit
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { loanApi, documentApi } from '../services/mockApi';
import { LoanApplication, DocumentItem } from '../types';

export function LoanReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setCurrentApplication } = useAppStore();
  
  const applicationId = location.state?.applicationId;
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (applicationId) {
      const app = loanApi.getApplication(applicationId);
      setApplication(app);
      if (app) {
        const docs = documentApi.getDocuments(app.id);
        setDocuments(docs);
      }
    }
  }, [applicationId]);

  if (!session || !application) {
    return null;
  }

  const handleFileUpload = async (category: DocumentItem['category'], file: File) => {
    setUploading(true);
    try {
      const doc = await documentApi.uploadDocument(application.id, category, file);
      setDocuments([...documents.filter(d => d.category !== category), doc]);
      alert('Document uploaded successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentByCategory = (category: DocumentItem['category']) => {
    return documents.find(doc => doc.category === category);
  };

  const requiredDocs: Array<{ category: DocumentItem['category']; label: string; required: boolean }> = [
    { category: 'id_document', label: 'ID Document', required: true },
    { category: 'income_proof', label: 'Income Proof', required: true },
    { category: 'address_proof', label: 'Address Proof', required: true },
  ];

  if (application.personalInfo.maritalStatus === 'married') {
    requiredDocs.push({ category: 'marriage_certificate', label: 'Marriage Certificate', required: false });
  }

  if (application.personalInfo.hasGuarantor) {
    requiredDocs.push({ category: 'guarantor_document', label: 'Guarantor Document', required: false });
  }

  const allRequiredDocsUploaded = requiredDocs
    .filter(doc => doc.required)
    .every(doc => getDocumentByCategory(doc.category));

  const handleSubmit = async () => {
    if (!allRequiredDocsUploaded) {
      alert('Please upload all required documents before submitting');
      return;
    }

    if (!confirm('Are you sure you want to submit this application? You cannot edit it after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      const submitted = await loanApi.submitApplication(application.id);
      setCurrentApplication(submitted);
      alert('Application submitted successfully!');
      navigate('/loan/result');
    } catch (err) {
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout showBackButton title="Review Application">
      <div className="page">
        <h2 className="page-title">Review Your Application</h2>
        <p className="page-subtitle">Please review all information before submitting</p>

        {/* Personal Info */}
        <div className="card">
          <h3 className="card-title">Personal Information</h3>
          <InfoRow label="Full Name" value={application.personalInfo.fullName} />
          <InfoRow label="Date of Birth" value={application.personalInfo.dateOfBirth} />
          <InfoRow label="National ID" value={application.personalInfo.nationalId} />
          <InfoRow label="Phone" value={application.personalInfo.phoneNumber} />
          <InfoRow label="Email" value={application.personalInfo.email} />
          <InfoRow label="Marital Status" value={application.personalInfo.maritalStatus} />
          {application.personalInfo.hasGuarantor && (
            <>
              <InfoRow label="Guarantor Name" value={application.personalInfo.guarantorName || 'N/A'} />
              <InfoRow label="Guarantor Phone" value={application.personalInfo.guarantorPhone || 'N/A'} />
            </>
          )}
        </div>

        {/* Financial Info */}
        <div className="card">
          <h3 className="card-title">Financial Information</h3>
          <InfoRow label="Employment Status" value={application.financialInfo.employmentStatus} />
          {application.financialInfo.employerName && (
            <InfoRow label="Employer" value={application.financialInfo.employerName} />
          )}
          <InfoRow label="Monthly Income" value={`$${application.financialInfo.monthlyIncome.toLocaleString()}`} />
          <InfoRow label="Years of Work" value={`${application.financialInfo.yearsOfWork} years`} />
        </div>

        {/* Loan Details */}
        <div className="card">
          <h3 className="card-title">Loan Request</h3>
          <InfoRow label="Down Payment" value={`$${application.loanDetails.downPayment.toLocaleString()}`} />
          <InfoRow label="Loan Period" value={`${application.loanDetails.loanPeriodMonths} months`} />
        </div>

        {/* Supporting Documents */}
        <div className="card">
          <h3 className="card-title">Supporting Documents</h3>
          <p className="card-subtitle">Upload required documents to complete your application</p>
          
          {requiredDocs.map(({ category, label, required }) => {
            const doc = getDocumentByCategory(category);
            return (
              <div key={category} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{label}</strong> {required && <span style={{ color: '#ef4444' }}>*</span>}
                  </div>
                  {doc && <span className="badge badge-success">Uploaded</span>}
                </div>
                
                {doc ? (
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    <p>📄 {doc.filename}</p>
                    <p>Version: {doc.version} | Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</p>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(category, file);
                    }}
                    disabled={uploading}
                    style={{ fontSize: '0.875rem' }}
                  />
                )}
              </div>
            );
          })}

          <div className="alert alert-info mt-2">
            <strong>Allowed formats:</strong> PDF, JPG, PNG (Max 10MB)
          </div>
        </div>

        {/* Consent Confirmation */}
        <div className="card">
          <div className="alert alert-success">
            ✓ You have accepted the terms and conditions (Version: v1)
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-success btn-block btn-lg"
          onClick={handleSubmit}
          disabled={!allRequiredDocsUploaded || submitting || uploading}
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>

        <button
          className="btn btn-secondary btn-block mt-2"
          onClick={() => navigate('/loan/new')}
          disabled={submitting}
        >
          Back to Edit
        </button>
      </div>
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ color: '#6b7280' }}>{label}:</span>
      <span style={{ fontWeight: '500' }}>{value}</span>
    </div>
  );
}
