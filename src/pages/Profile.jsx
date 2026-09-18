import { useState } from 'react';
import { 
  User, 
  Mail, 
  Building, 
  ShieldCheck, 
  CreditCard, 
  Save, 
  Check, 
  Lock 
} from 'lucide-react';
import './Profile.css';

export default function Profile({ user }) {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || 'Nishu User');
  const [email] = useState(user?.email || 'nishu@iitm.ac.in');
  const [rollNumber, setRollNumber] = useState('EE23B042');
  const [department, setDepartment] = useState('Electrical Engineering / SDR Team');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('••••••••8492');
  const [ifsc, setIfsc] = useState('SBIN0001234');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="profile-view">
      <div className="profile-header">
        <h1 className="profile-title">Account & Reimbursement Profile</h1>
        <p className="profile-subtitle">Manage your personal identification, default banking details, and credentials.</p>
      </div>

      <div className="profile-grid">
        {/* Left Column: Avatar & Summary */}
        <div className="profile-summary-card">
          <div className="profile-avatar-large">
            {fullName.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="user-profile-name">{fullName}</h2>
          <span className="user-role-badge">Avionics / SDR Contributor</span>
          <p className="user-affiliation">{department}</p>

          <div className="account-meta-list">
            <div className="meta-line">
              <Mail size={15} />
              <span>{email}</span>
            </div>
            <div className="meta-line">
              <ShieldCheck size={15} className="text-green" />
              <span>Verified IITM Account</span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="profile-form-card">
          <form onSubmit={handleSave}>
            <h3 className="section-head">Personal Details</h3>
            
            <div className="form-row-2">
              <div className="field-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                />
              </div>

              <div className="field-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  disabled 
                  className="input-disabled" 
                />
              </div>

              <div className="field-group">
                <label>Student / Employee ID</label>
                <input 
                  type="text" 
                  value={rollNumber} 
                  onChange={(e) => setRollNumber(e.target.value)} 
                />
              </div>

              <div className="field-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
            </div>

            <h3 className="section-head" style={{ marginTop: '2rem' }}>Default Bank Account (For Automated Direct Credits)</h3>
            
            <div className="form-row-2">
              <div className="field-group">
                <label>Bank Name</label>
                <input 
                  type="text" 
                  value={bankName} 
                  onChange={(e) => setBankName(e.target.value)} 
                />
              </div>

              <div className="field-group">
                <label>Account Number</label>
                <input 
                  type="text" 
                  value={accountNumber} 
                  onChange={(e) => setAccountNumber(e.target.value)} 
                />
              </div>

              <div className="field-group">
                <label>IFSC Code</label>
                <input 
                  type="text" 
                  value={ifsc} 
                  onChange={(e) => setIfsc(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-submit-row">
              {saved && (
                <span className="save-success-msg">
                  <Check size={16} /> Preferences updated successfully!
                </span>
              )}

              <button type="submit" className="btn-save-profile">
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
