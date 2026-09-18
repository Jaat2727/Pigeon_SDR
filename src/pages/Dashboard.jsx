import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Wallet, 
  ArrowUpRight, 
  FileEdit, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  // Dashboard state & sample metrics modeled after the reference app
  const stats = [
    { label: 'Under Review', value: 2, subtext: '₹ 14,250 pending', icon: Clock, color: 'amber' },
    { label: 'Approved Bills', value: 5, subtext: '₹ 48,900 cleared', icon: CheckCircle2, color: 'green' },
    { label: 'Paid Reimbursements', value: 3, subtext: '₹ 32,500 transferred', icon: Wallet, color: 'blue' },
    { label: 'Drafts in Progress', value: 1, subtext: 'Last updated today', icon: FileEdit, color: 'slate' }
  ];

  const pendingItems = [
    {
      id: 'BILL-2026-004',
      title: 'Workshop Hardware & RF Dongle Components',
      category: 'Equipment / Lab Consumables',
      date: '18 Sep 2026',
      status: 'pending_review',
      amount: '₹ 8,400'
    },
    {
      id: 'BILL-2026-003',
      title: 'Antenna Mount Kit & Coaxial SDR Adapters',
      category: 'Event Supplies',
      date: '15 Sep 2026',
      status: 'pending_review',
      amount: '₹ 5,850'
    }
  ];

  const recentActivity = [
    {
      id: 'BILL-2026-002',
      title: 'Hackathon Server Infrastructure & Cloud Credits',
      date: '10 Sep 2026',
      status: 'approved',
      amount: '₹ 22,000'
    },
    {
      id: 'BILL-2026-001',
      title: 'Pigeon SDR Prototype PCB Fabrication',
      date: '02 Sep 2026',
      status: 'paid',
      amount: '₹ 26,900'
    }
  ];

  return (
    <div className="dashboard-view">
      {/* ── Welcome Banner ── */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="live-dot" /> Pigeon SDR Workspace Active
          </div>
          <h1 className="hero-title">
            Welcome back, {user?.user_metadata?.full_name || 'Nishu'} 👋
          </h1>
          <p className="hero-desc">
            Track automated bill claims, manage SDR equipment requisitions, and inspect reimbursement approvals in real-time.
          </p>
        </div>

        <div className="hero-actions">
          <button 
            type="button" 
            className="btn-create-bill"
            onClick={() => navigate('/apply')}
          >
            <Plus size={18} />
            <span>Create New Claim</span>
          </button>
        </div>
      </div>

      {/* ── Stat Metric Cards ── */}
      <div className="metrics-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className={`metric-card card-${stat.color}`}>
            <div className="metric-header">
              <span className="metric-label">{stat.label}</span>
              <div className="metric-icon-wrap">
                <stat.icon size={19} />
              </div>
            </div>
            <div className="metric-value">{stat.value}</div>
            <div className="metric-subtext">{stat.subtext}</div>
          </div>
        ))}
      </div>

      {/* ── Main Dashboard Columns ── */}
      <div className="dashboard-grid">
        {/* Left Column: Pending Actions & Drafts */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pending Action Items</h2>
              <p className="card-subtitle">Claims awaiting administrative verification</p>
            </div>
            <span className="badge-counter">{pendingItems.length} Active</span>
          </div>

          <div className="items-list">
            {pendingItems.map((item) => (
              <div key={item.id} className="bill-item-row">
                <div className="item-icon-box">
                  <FileText size={18} />
                </div>
                <div className="item-info">
                  <div className="item-title">{item.title}</div>
                  <div className="item-meta">
                    <span>{item.id}</span>
                    <span className="meta-dot">•</span>
                    <span>{item.category}</span>
                    <span className="meta-dot">•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
                <div className="item-status-col">
                  <span className="status-pill status-amber">Under Review</span>
                  <span className="item-amount">{item.amount}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card-footer">
            <button 
              type="button" 
              className="view-all-link"
              onClick={() => navigate('/history?status=pending')}
            >
              <span>View all pending claims</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Activity</h2>
              <p className="card-subtitle">Recently processed reimbursement entries</p>
            </div>
          </div>

          <div className="items-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="bill-item-row">
                <div className="item-icon-box success">
                  <CheckCircle2 size={18} />
                </div>
                <div className="item-info">
                  <div className="item-title">{activity.title}</div>
                  <div className="item-meta">
                    <span>{activity.id}</span>
                    <span className="meta-dot">•</span>
                    <span>{activity.date}</span>
                  </div>
                </div>
                <div className="item-status-col">
                  <span className={`status-pill status-${activity.status === 'paid' ? 'teal' : 'green'}`}>
                    {activity.status === 'paid' ? 'Reimbursed' : 'Approved'}
                  </span>
                  <span className="item-amount">{activity.amount}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card-footer">
            <button 
              type="button" 
              className="view-all-link"
              onClick={() => navigate('/history')}
            >
              <span>Full transaction logs</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
