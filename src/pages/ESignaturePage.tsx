// ============================================
// Loan Application E-Signature
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { loanApi } from '../services/mockApi';

export function ESignaturePage() {
  const navigate = useNavigate();
  const { session, currentApplication, applications, setCurrentApplication } = useAppStore();
  
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const application = currentApplication || (applications.length > 0 ? applications[0] : null);

  useEffect(() => {
    // Verify eligibility
    if (!application || application.status !== 'approved' || !application.signatureRequired) {
      alert('E-signature is not available for this application');
      navigate('/loan/result');
    }
  }, [application, navigate]);

  if (!session || !application || !application.approvedTerms) {
    return null;
  }

  const handleSign = async () => {
    if (!agreed) {
      alert('Please accept the agreement to proceed');
      return;
    }

    if (!confirm('By clicking OK, you are electronically signing this loan agreement. This action is legally binding.')) {
      return;
    }

    setLoading(true);
    try {
      const signed = await loanApi.updateStatus(application.id, 'signed');
      setCurrentApplication(signed);
      alert('Agreement signed successfully!');
      navigate('/loan/result');
    } catch (err) {
      alert('Failed to sign agreement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBackButton title="E-Signature">
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Loan Agreement</h1>
          <p className="page-subtitle">Please review and sign the agreement</p>
        </div>

        {/* Agreement Summary */}
        <div className="card">
          <h3 className="card-title">Loan Terms Summary</h3>
          <InfoRow label="Approved Amount" value={`$${application.approvedTerms.approvedAmount.toLocaleString()}`} />
          <InfoRow label="Interest Rate" value={`${application.approvedTerms.interestRate}% per annum`} />
          <InfoRow label="Monthly Payment" value={`$${application.approvedTerms.monthlyPayment.toLocaleString()}`} />
          <InfoRow label="Loan Period" value={`${application.loanDetails.loanPeriodMonths} months`} />
          <InfoRow
            label="Total Repayment"
            value={`$${(application.approvedTerms.monthlyPayment * application.loanDetails.loanPeriodMonths).toLocaleString()}`}
          />
        </div>

        {/* Agreement Document */}
        <div className="card">
          <h3 className="card-title">Loan Agreement Document</h3>
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              color: '#374151',
            }}
          >
            <h4 style={{ marginBottom: '1rem' }}>LOAN AGREEMENT</h4>
            
            <p><strong>This Loan Agreement</strong> ("Agreement") is entered into on {new Date().toLocaleDateString()} between:</p>
            
            <p><strong>LENDER:</strong> LoanApp Financial Services<br />
            <strong>BORROWER:</strong> {application.personalInfo.fullName}</p>
            
            <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. LOAN AMOUNT AND PURPOSE</h5>
            <p>The Lender agrees to loan the Borrower the principal sum of ${application.approvedTerms.approvedAmount.toLocaleString()} USD ("Loan Amount").</p>
            
            <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. INTEREST RATE</h5>
            <p>The Loan shall bear interest at the rate of {application.approvedTerms.interestRate}% per annum, calculated on the outstanding principal balance.</p>
            
            <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. REPAYMENT TERMS</h5>
            <p>The Borrower shall repay the Loan in {application.loanDetails.loanPeriodMonths} equal monthly installments of ${application.approvedTerms.monthlyPayment.toLocaleString()} each, commencing on the first day of the month following the disbursement date.</p>
            
            <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. PREPAYMENT</h5>
            <p>The Borrower may prepay the Loan in whole or in part at any time without penalty.</p>
            
            <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>5. DEFAULT</h5>
            <p>The Loan shall be in default if the Borrower fails to make any payment when due, or breaches any other term of this Agreement. Upon default, the entire unpaid balance shall become immediately due and payable.</p>
            
            <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>6. LATE PAYMENT</h5>
            <p>Any payment not made within 15 days of its due date shall incur a late fee of 5% of the payment amount.</p>
            
            <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>7. GOVERNING LAW</h5>
            <p>This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction where the Lender is located.</p>
            
            <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>8. ENTIRE AGREEMENT</h5>
            <p>This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.</p>
            
            <h5 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>9. ELECTRONIC SIGNATURE</h5>
            <p>The parties agree that electronic signatures shall have the same legal effect as handwritten signatures.</p>
            
            <p style={{ marginTop: '1.5rem' }}><strong>BORROWER ACKNOWLEDGMENT</strong></p>
            <p>By signing this Agreement electronically, the Borrower acknowledges having read, understood, and agreed to all terms and conditions set forth herein.</p>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="card">
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="signConsent"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="signConsent">
              I have read and understood the loan agreement. I agree to sign this document electronically and acknowledge that my electronic signature is legally binding. I accept all terms and conditions of this loan agreement.
            </label>
          </div>
        </div>

        {/* Signature Info */}
        <div className="alert alert-info">
          <p><strong>Electronic Signature Information:</strong></p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            • Signer: {application.personalInfo.fullName}<br />
            • Email: {application.personalInfo.email}<br />
            • Date: {new Date().toLocaleString()}<br />
            • IP Address: [Captured automatically]<br />
            • Agreement Version: v1.0
          </p>
        </div>

        {/* Sign Button */}
        <button
          className="btn btn-success btn-block btn-lg"
          onClick={handleSign}
          disabled={!agreed || loading}
        >
          {loading ? 'Signing...' : '✍️ Sign Agreement'}
        </button>

        <button
          className="btn btn-secondary btn-block mt-2"
          onClick={() => navigate('/loan/result')}
          disabled={loading}
        >
          Cancel
        </button>
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
