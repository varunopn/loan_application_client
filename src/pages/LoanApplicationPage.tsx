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
    carDetails: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      estimatedPrice: 0,
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
    { label: 'Car Details', completed: currentStep > 2 },
    { label: 'Loan Details', completed: currentStep > 3 },
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
      // Car Details validation
      if (!formData.carDetails?.brand) newErrors.brand = 'Car brand is required';
      if (!formData.carDetails?.model) newErrors.model = 'Car model is required';
      if (!formData.carDetails?.year || formData.carDetails.year < 1900) newErrors.year = 'Valid year is required';
      if (!formData.carDetails?.estimatedPrice || formData.carDetails.estimatedPrice <= 0) {
        newErrors.estimatedPrice = 'Estimated price must be greater than 0';
      }
    } else if (currentStep === 3) {
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

  const updateCarDetails = (field: string, value: any) => {
    setFormData({
      ...formData,
      carDetails: { ...formData.carDetails!, [field]: value },
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
          <CarDetailsStep
            data={formData.carDetails!}
            errors={errors}
            onChange={updateCarDetails}
          />
        )}

        {currentStep === 3 && (
          <LoanDetailsStep
            data={formData.loanDetails!}
            carPrice={formData.carDetails?.estimatedPrice || 0}
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
          {currentStep < 3 ? (
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

// Step 3: Car Details
function CarDetailsStep({ data, errors, onChange }: any) {
  const currentYear = new Date().getFullYear();
  const carBrands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 
    'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus', 
    'Tesla', 'Porsche', 'Land Rover', 'Jeep', 'Ram', 'GMC', 'Other'
  ];

  return (
    <div>
      <h2 className="mb-3">Car Details</h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Tell us about the car you want to finance
      </p>

      <div className="form-group">
        <label className="form-label required">Car Brand</label>
        <select
          className={`form-select ${errors.brand ? 'error' : ''}`}
          value={data.brand}
          onChange={(e) => onChange('brand', e.target.value)}
        >
          <option value="">Select brand</option>
          {carBrands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
        {errors.brand && <p className="form-error">{errors.brand}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Car Model</label>
        <input
          type="text"
          className={`form-input ${errors.model ? 'error' : ''}`}
          placeholder="e.g., Camry, Accord, Model 3"
          value={data.model}
          onChange={(e) => onChange('model', e.target.value)}
        />
        {errors.model && <p className="form-error">{errors.model}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Year</label>
        <input
          type="number"
          className={`form-input ${errors.year ? 'error' : ''}`}
          value={data.year}
          onChange={(e) => onChange('year', parseInt(e.target.value) || currentYear)}
          min="1900"
          max={currentYear + 1}
        />
        {errors.year && <p className="form-error">{errors.year}</p>}
      </div>

      <div className="form-group">
        <label className="form-label required">Estimated Price ($)</label>
        <input
          type="number"
          className={`form-input ${errors.estimatedPrice ? 'error' : ''}`}
          placeholder="e.g., 25000"
          value={data.estimatedPrice}
          onChange={(e) => onChange('estimatedPrice', parseFloat(e.target.value) || 0)}
          min="0"
          step="1000"
        />
        {errors.estimatedPrice && <p className="form-error">{errors.estimatedPrice}</p>}
        <p className="form-help">Enter the estimated price of the car</p>
      </div>

      <div className="alert alert-info mt-3">
        <p><strong>💡 Tip:</strong> Research the market value of your desired car to ensure you enter an accurate price.</p>
      </div>
    </div>
  );
}

// Step 4: Loan Details
function LoanDetailsStep({ data, carPrice, errors, onChange }: any) {
  const loanAmount = carPrice > data.downPayment ? carPrice - data.downPayment : 0;

  return (
    <div>
      <h2 className="mb-3">Loan Request Details</h2>

      <div className="card mb-3" style={{ backgroundColor: '#f0f9ff', border: '1px solid #3b82f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#6b7280' }}>Car Price:</span>
          <span style={{ fontWeight: '600' }}>${carPrice.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#6b7280' }}>Down Payment:</span>
          <span style={{ fontWeight: '600' }}>- ${data.downPayment.toLocaleString()}</span>
        </div>
        <div style={{ borderTop: '1px solid #3b82f6', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Loan Amount Needed:</span>
            <span style={{ fontWeight: '700', color: '#1e40af', fontSize: '1.25rem' }}>
              ${loanAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

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
        <p className="form-help">Minimum recommended: 20% of car price (${(carPrice * 0.2).toLocaleString()})</p>
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
        <p><strong>Note:</strong> Final loan terms including interest rate and monthly payment will be calculated upon approval based on your credit profile and financial information.</p>
      </div>
    </div>
  );
}
