import { useState } from 'react';
import { 
  FileText, 
  IndianRupee, 
  Calendar, 
  User, 
  Phone, 
  Building2, 
  Landmark, 
  UploadCloud, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';
import './Apply.css';

export default function Apply({ user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    eventName: '',
    department: 'SDR Team / Avionics Lab',
    contactPerson: user?.user_metadata?.full_name || 'Nishu',
    phoneNumber: '+91 98765 43210',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    paymentType: 'reimbursement',
    bankName: 'State Bank of India',
    accountNumber: '••••••••8492',
    ifscCode: 'SBIN0001234'
  });

  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { num: 1, title: 'Basic Details' },
    { num: 2, title: 'Claim & Budget' },
    { num: 3, title: 'Bank Transfer' },
    { num: 4, title: 'Review & Submit' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="apply-container">
        <div className="success-banner-card">
          <div className="success-icon-wrap">
            <CheckCircle size={44} />
          </div>
          <h2>Reimbursement Claim Submitted!</h2>
          <p>
            Your claim for <strong>{formData.eventName || 'SDR Automation Event'}</strong> (₹{formData.amount || '0'}) has been lodged with reference number <strong>PIGN-{(Math.random() * 9000 + 1000).toFixed(0)}</strong>.
          </p>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => { setSubmitted(false); setCurrentStep(1); }}
          >
            Create Another Claim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-container">
      <div className="page-header-block">
        <h1 className="page-title">New Claim & Reimbursement Form</h1>
        <p className="page-subtitle">Submit expense verification proofs and automated SDR claims for audit.</p>
      </div>

      {/* Stepper Header */}
      <div className="stepper-bar">
        {steps.map((s) => (
          <div 
            key={s.num} 
            className={`step-bubble-item ${currentStep === s.num ? 'active' : ''} ${currentStep > s.num ? 'completed' : ''}`}
          >
            <div className="bubble-circle">{currentStep > s.num ? '✓' : s.num}</div>
            <span className="bubble-label">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="form-card-container">
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="step-panel">
              <h3 className="section-title">1. Basic Requisition Information</h3>
              
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Event or Project Name</label>
                  <div className="input-wrap">
                    <FileText size={17} className="input-icon" />
                    <input 
                      type="text" 
                      name="eventName" 
                      placeholder="e.g. Pigeon SDR Ground Station Deployment"
                      value={formData.eventName} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Department / Lab Division</label>
                  <div className="input-wrap">
                    <Building2 size={17} className="input-icon" />
                    <input 
                      type="text" 
                      name="department" 
                      value={formData.department} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Person</label>
                  <div className="input-wrap">
                    <User size={17} className="input-icon" />
                    <input 
                      type="text" 
                      name="contactPerson" 
                      value={formData.contactPerson} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Date of Expenditure</label>
                  <div className="input-wrap">
                    <Calendar size={17} className="input-icon" />
                    <input 
                      type="date" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-panel">
              <h3 className="section-title">2. Claim Details & Amount</h3>
              
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Total Amount Claimed (INR)</label>
                  <div className="input-wrap">
                    <IndianRupee size={17} className="input-icon" />
                    <input 
                      type="number" 
                      name="amount" 
                      placeholder="e.g. 12500" 
                      value={formData.amount} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Claim Category</label>
                  <select 
                    name="paymentType" 
                    value={formData.paymentType} 
                    onChange={handleInputChange}
                    className="select-field"
                  >
                    <option value="reimbursement">Direct Reimbursement</option>
                    <option value="vendor_advance">Vendor Direct Settlement</option>
                    <option value="petty_cash">Lab Petty Cash Recoup</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Itemized Description & Purpose</label>
                <textarea 
                  name="description" 
                  rows={4} 
                  placeholder="Provide justification and invoice bill numbers for audit..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea-field"
                />
              </div>

              <div className="file-drop-zone">
                <UploadCloud size={32} />
                <p className="drop-title">Drop PDF Invoices / Receipts here</p>
                <span className="drop-sub">Supported formats: PDF, PNG, JPEG up to 10MB</span>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-panel">
              <h3 className="section-title">3. Disbursal Bank Information</h3>
              
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Bank Name</label>
                  <div className="input-wrap">
                    <Landmark size={17} className="input-icon" />
                    <input 
                      type="text" 
                      name="bankName" 
                      value={formData.bankName} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Account Number</label>
                  <div className="input-wrap">
                    <Landmark size={17} className="input-icon" />
                    <input 
                      type="text" 
                      name="accountNumber" 
                      value={formData.accountNumber} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>IFSC Code</label>
                  <div className="input-wrap">
                    <Landmark size={17} className="input-icon" />
                    <input 
                      type="text" 
                      name="ifscCode" 
                      value={formData.ifscCode} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="step-panel">
              <h3 className="section-title">4. Summary Review & Declaration</h3>

              <div className="review-box">
                <div className="review-row">
                  <span className="rev-label">Project / Event</span>
                  <span className="rev-val">{formData.eventName || 'Not specified'}</span>
                </div>
                <div className="review-row">
                  <span className="rev-label">Division</span>
                  <span className="rev-val">{formData.department}</span>
                </div>
                <div className="review-row">
                  <span className="rev-label">Claim Total</span>
                  <span className="rev-val highlight">₹ {formData.amount || '0'}</span>
                </div>
                <div className="review-row">
                  <span className="rev-label">Account Disbursal</span>
                  <span className="rev-val">{formData.bankName} ({formData.accountNumber})</span>
                </div>
              </div>

              <p className="declaration-text">
                ✓ I hereby certify that the stated expenses were incurred solely for Pigeon SDR operations and adhere to financial policies.
              </p>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="stepper-footer-actions">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn-back"
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button 
                type="button" 
                className="btn-next"
                onClick={handleNext}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-submit"
              >
                <span>Authorize & Submit Claim</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
