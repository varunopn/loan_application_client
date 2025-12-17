// ============================================
// Loan Application Form - Multi-step Wizard
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Stepper } from '../components/Stepper';
import { useAppStore } from '../store/useAppStore';
import { loanApi } from '../services/mockApi';
import { LoanApplication } from '../types';

export function LoanApplicationPage() {
  const navigate = useNavigate();
  const { session } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<LoanApplication>>({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      nationalId: '',
      phoneNumber: '',
      email: '',
      maritalStatus: 'single',
      hasGuarantor: false,
    },
    financialInfo: {
      employmentStatus: 'employed',
      monthlyIncome: 0,
      yearsOfWork: 0,
    },
    loanDetails: {
      downPayment: 0,
      loanPeriodMonths: 48,
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session) {
      const draft = loanApi.getDraftApplication(session.user.id);
      if (draft) {
        setFormData(draft);
      }
    }
  }, [session]);

  if (!session) return null;

  const steps = [
    { label: 'Personal', completed: currentStep > 0 },
    { label: 'Financial', completed: currentStep > 1 },
    { label: 'Loan Details', completed: currentStep > 2 },
  ];

  const saveDraft = () => {
    if (session) {
      loanApi.saveDraft(session.user.id, formData);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      saveDraft();
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    saveDraft();
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleReview = () => {
    if (validateStep()) {
      const draft = loanApi.saveDraft(session.user.id, formData);
      navigate('/loan/review', { state: { applicationId: draft.id } });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      // Personal Info validation
      if (!formData.personalInfo?.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.personalInfo?.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.personalInfo?.nationalId) newErrors.nationalId = 'National ID is required';
      if (!formData.personalInfo?.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.personalInfo?.email) newErrors.email = 'Email is required';
      
      if (formData.personalInfo?.hasGuarantor) {
        if (!formData.personalInfo?.guarantorName) newErrors.guarantorName = 'Guarantor name is required';
        if (!formData.personalInfo?.guarantorPhone) newErrors.guarantorPhone = 'Guarantor phone is required';
      }
    } else if (currentStep === 1) {
      // Financial Info validation
      if (!formData.financialInfo?.monthlyIncome || formData.financialInfo.monthlyIncome <= 0) {
        newErrors.monthlyIncome = 'Monthly income must be greater than 0';
      }
      if (!formData.financialInfo?.yearsOfWork || formData.financialInfo.yearsOfWork < 0) {
        newErrors.yearsOfWork = 'Years of work is required';
      }
    } else if (currentStep === 2) {
      // Loan Details validation
      if (!formData.loanDetails?.downPayment || formData.loanDetails.downPayment <= 0) {
        newErrors.downPayment = 'Down payment must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updatePersonalInfo = (field: string, value: any) => {
    setFormData({
      ...formData,
      personalInfo: { ...formData.personalInfo!, [field]: value },
    });
  };

  const updateFinancialInfo = (field: string, value: any) => {
    setFormData({
      ...formData,
      financialInfo: { ...formData.financialInfo!, [field]: value },
    });
  };

  const updateLoanDetails = (field: string, value: any) => {
    setFormData({
      ...formData,
      loanDetails: { ...formData.loanDetails!, [field]: value },
    });
  };

  return (
    <Layout showBackButton title="Loan Application">
      <div className="page">
        <Stepper steps={steps} currentStep={currentStep} />

        {currentStep === 0 && (
          <PersonalInfoStep
            data={formData.personalInfo!}
            errors={errors}
            onChange={updatePersonalInfo}
          />
        )}

        {currentStep === 1 && (
          <FinancialInfoStep
            data={formData.financialInfo!}
            errors={errors}
            onChange={updateFinancialInfo}
          />
        )}

        {currentStep === 2 && (
          <LoanDetailsStep
            data={formData.loanDetails!}
            errors={errors}
            onChange={updateLoanDetails}
          />
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {currentStep > 0 && (
            <button className="btn btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}
          {currentStep < 2 ? (
            <button className="btn btn-primary" onClick={handleNext} style={{ flex: 1 }}>
              Next
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleReview} style={{ flex: 1 }}>
              Review Application
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Step 1: Personal Info
function PersonalInfoStep({ data, errors, onChange }: any) {
  return (
    <div>
      <h2 className="mb-3">Personal Information</h2>

      <div className="form-group">
        <label className="form-label required">Full Name</label>
        <input
          type="text"
          className={`form-input ${errors.fullName ? 'error' : ''}`}
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
        />
        {errors.fullName && <p className="form-error">{errors.fullName}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Date of Birth</label>
        <input
          type="date"
          className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
          value={data.dateOfBirth}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
        />
        {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">National ID</label>
        <input
          type="text"
          className={`form-input ${errors.nationalId ? 'error' : ''}`}
          value={data.nationalId}
          onChange={(e) => onChange('nationalId', e.target.value)}
        />
        {errors.nationalId && <p className="form-error">{errors.nationalId}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Phone Number</label>
        <input
          type="tel"
          className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
          value={data.phoneNumber}
          onChange={(e) => onChange('phoneNumber', e.target.value)}
        />
        {errors.phoneNumber && <p className="form-error">{errors.phoneNumber}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Email</label>
        <input
          type="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Marital Status</label>
        <select
          className="form-select"
          value={data.maritalStatus}
          onChange={(e) => onChange('maritalStatus', e.target.value)}
        >
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-checkbox">
        <input
          type="checkbox"
          id="hasGuarantor"
          checked={data.hasGuarantor}
          onChange={(e) => onChange('hasGuarantor', e.target.checked)}
        />
        <label htmlFor="hasGuarantor">I have a guarantor</label>
      </div>

      {data.hasGuarantor && (
        <>
          <div className="form-group">
            <label className="form-label required">Guarantor Name</label>
            <input
              type="text"
              className={`form-input ${errors.guarantorName ? 'error' : ''}`}
              value={data.guarantorName || ''}
              onChange={(e) => onChange('guarantorName', e.target.value)}
            />
            {errors.guarantorName && <p className="form-error">{errors.guarantorName}</p>}
          </div>

          <div className="form-group">
            <label className="form-label required">Guarantor Phone</label>
            <input
              type="tel"
              className={`form-input ${errors.guarantorPhone ? 'error' : ''}`}
              value={data.guarantorPhone || ''}
              onChange={(e) => onChange('guarantorPhone', e.target.value)}
            />
            {errors.guarantorPhone && <p className="form-error">{errors.guarantorPhone}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Relationship</label>
            <input
              type="text"
              className="form-input"
              value={data.guarantorRelationship || ''}
              onChange={(e) => onChange('guarantorRelationship', e.target.value)}
              placeholder="e.g., Spouse, Parent, Friend"
            />
          </div>
        </>
      )}
    </div>
  );
}

// Step 2: Financial Info
function FinancialInfoStep({ data, errors, onChange }: any) {
  return (
    <div>
      <h2 className="mb-3">Financial Information</h2>

      <div className="form-group">
        <label className="form-label required">Employment Status</label>
        <select
          className="form-select"
          value={data.employmentStatus}
          onChange={(e) => onChange('employmentStatus', e.target.value)}
        >
          <option value="employed">Employed</option>
          <option value="self_employed">Self-Employed</option>
          <option value="unemployed">Unemployed</option>
        </select>
      </div>

      {data.employmentStatus !== 'unemployed' && (
        <div className="form-group">
          <label className="form-label">Employer Name</label>
          <input
            type="text"
            className="form-input"
            value={data.employerName || ''}
            onChange={(e) => onChange('employerName', e.target.value)}
            placeholder="Enter employer name"
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label required">Monthly Income ($)</label>
        <input
          type="number"
          className={`form-input ${errors.monthlyIncome ? 'error' : ''}`}
          value={data.monthlyIncome}
          onChange={(e) => onChange('monthlyIncome', parseFloat(e.target.value) || 0)}
          min="0"
          step="100"
        />
        {errors.monthlyIncome && <p className="form-error">{errors.monthlyIncome}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Years of Work Experience</label>
        <input
          type="number"
          className={`form-input ${errors.yearsOfWork ? 'error' : ''}`}
          value={data.yearsOfWork}
          onChange={(e) => onChange('yearsOfWork', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.5"
        />
        {errors.yearsOfWork && <p className="form-error">{errors.yearsOfWork}</p>}
      </div>
    </div>
  );
}

// Step 3: Loan Details
function LoanDetailsStep({ data, errors, onChange }: any) {
  return (
    <div>
      <h2 className="mb-3">Loan Request Details</h2>

      <div className="form-group">
        <label className="form-label required">Down Payment ($)</label>
        <input
          type="number"
          className={`form-input ${errors.downPayment ? 'error' : ''}`}
          value={data.downPayment}
          onChange={(e) => onChange('downPayment', parseFloat(e.target.value) || 0)}
          min="0"
          step="1000"
        />
        {errors.downPayment && <p className="form-error">{errors.downPayment}</p>}
        <p className="form-help">Minimum recommended: $5,000</p>
      </div>

      <div className="form-group">
        <label className="form-label required">Loan Period (Months)</label>
        <select
          className="form-select"
          value={data.loanPeriodMonths}
          onChange={(e) => onChange('loanPeriodMonths', parseInt(e.target.value))}
        >
          <option value="48">48 months (4 years)</option>
          <option value="60">60 months (5 years)</option>
          <option value="72">72 months (6 years)</option>
        </select>
      </div>

      <div className="alert alert-info mt-3">
        <p><strong>Note:</strong> The loan amount will be calculated based on your income, down payment, and selected loan period. Final terms will be provided upon approval.</p>
      </div>
    </div>
  );
}
