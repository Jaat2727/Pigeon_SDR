import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Pause,
  Play,
  Circle
} from 'lucide-react';
import './Dashboard.css';

const CAMPAIGNS = [
  {
    id: 1,
    name: 'Enterprise HR Tech Outreach',
    subtitle: 'CHROs, US Enterprise 5k-10k employees',
    status: 'live',
    prospects: 1248,
    sentOutbound: 462,
    meetingsBooked: 12,
    meetingsHighlight: true,
  },
  {
    id: 2,
    name: 'Mid-Market CFO Campaign',
    subtitle: 'CFOs, EU Fintech and SaaS companies',
    status: 'live',
    prospects: 820,
    sentOutbound: 211,
    meetingsBooked: 8,
    meetingsHighlight: true,
  },
  {
    id: 3,
    name: 'SaaS Dev Tools - Tech Leaders',
    subtitle: 'VPs of Engineering, Dev Tools, Series A',
    status: 'paused',
    prospects: 438,
    sentOutbound: 98,
    meetingsBooked: 3,
    meetingsHighlight: false,
  },
  {
    id: 4,
    name: 'Healthcare AI Discovery',
    subtitle: 'Heads of AI, US Healthcare Providers',
    status: 'live',
    prospects: 520,
    sentOutbound: 34,
    meetingsBooked: 1,
    meetingsHighlight: false,
  },
  {
    id: 5,
    name: 'APAC Logistics Outreach',
    subtitle: 'Heads of Supply Chain, APAC',
    status: 'draft',
    prospects: 150,
    sentOutbound: 0,
    meetingsBooked: 0,
    meetingsHighlight: false,
  },
];

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState(CAMPAIGNS);

  const activeCampaigns = campaigns.filter(c => c.status === 'live').length;

  const togglePause = (id) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        if (c.status === 'live') return { ...c, status: 'paused' };
        if (c.status === 'paused') return { ...c, status: 'live' };
      }
      return c;
    }));
  };

  return (
    <div className="command-center">
      {/* ── Top Bar ── */}
      <div className="cc-topbar">
        <div className="cc-topbar-left">
          <h2 className="cc-topbar-title">COMMAND CENTER</h2>
          <span className="cc-topbar-meta">
            <Circle size={8} fill="#22c55e" stroke="none" />
            {activeCampaigns} Campaigns Active
          </span>
        </div>
        <div className="cc-topbar-right">
          <div className="topbar-stat">
            <Zap size={14} />
            <span>THREADS : <strong>48/50</strong></span>
          </div>
          <div className="topbar-stat">
            <span>Auto-Approve Threshold : <strong>&gt;85% Fit</strong></span>
          </div>
          <button type="button" className="btn-danger">
            KILL ALL AGENTS
          </button>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="cc-content">
        <div className="cc-page-header">
          <div>
            <h1 className="cc-heading">AI Outreach Campaigns</h1>
            <p className="cc-subheading">Configure target filters, AI reasoning logic, and safety guardrails.</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => navigate('/apply')}>
            <Plus size={16} />
            New Campaign
          </button>
        </div>

        {/* ── Alert Banners ── */}
        <div className="cc-alerts-row">
          <div className="alert-banner alert-warning">
            <AlertTriangle size={16} />
            <div>
              <strong>2 Domain Warmup Conflicts Detected</strong>
              <span>DMARC policy warning for outbound mailing pool. Immediate attention required.</span>
            </div>
          </div>
          <div className="alert-banner alert-info">
            <Clock size={16} />
            <div>
              <strong>14 Pending Draft Approvals</strong>
              <span>Personalization results generated for Enterprise Campaign are waiting review.</span>
            </div>
          </div>
        </div>

        {/* ── Campaign Table ── */}
        <div className="cc-table-card">
          <table className="cc-table">
            <thead>
              <tr>
                <th className="th-name">CAMPAIGN NAME</th>
                <th className="th-status">STATUS</th>
                <th className="th-num">PROSPECTS</th>
                <th className="th-num">SENT OUTBOUND</th>
                <th className="th-num">MEETINGS BOOKED</th>
                <th className="th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="td-name">
                    <div className="campaign-name-cell">
                      <span className="campaign-primary-name">{c.name}</span>
                      <span className="campaign-sub">{c.subtitle}</span>
                    </div>
                  </td>
                  <td className="td-status">
                    <span className={`status-chip chip-${c.status}`}>
                      <Circle size={7} fill="currentColor" stroke="none" />
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="td-num">{c.prospects.toLocaleString()}</td>
                  <td className="td-num">{c.sentOutbound.toLocaleString()}</td>
                  <td className="td-num">
                    <span className={c.meetingsHighlight ? 'meetings-highlight' : ''}>
                      {c.meetingsBooked}
                    </span>
                  </td>
                  <td className="td-actions">
                    {c.status !== 'draft' ? (
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => togglePause(c.id)}
                      >
                        {c.status === 'live' ? <Pause size={14} /> : <Play size={14} />}
                        <span>{c.status === 'live' ? 'Pause' : 'Resume'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => togglePause(c.id)}
                      >
                        <Play size={14} />
                        <span>Resume</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
