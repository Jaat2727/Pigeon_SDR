import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, Clock, Pause, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  StatusPill, CampaignDot, LoadingState, ErrorState, EmptyState,
} from '../components/index.jsx';
import './CampaignsList.css';

export default function CampaignsList() {
  const navigate = useNavigate();
  const {
    campaigns, campaignsLoading, campaignsError,
    setCampaignStatus, isKilled, conflictsCount, loadCampaigns,
  } = useApp();

  const pendingApprovals = campaigns.reduce((sum, c) => sum + (c.metrics?.pending_approvals || 0), 0);

  if (campaignsLoading) return <LoadingState message="Loading campaigns…" />;
  if (campaignsError) return <ErrorState message={campaignsError} onRetry={loadCampaigns} />;

  const handleToggle = (campaign) => {
    if (isKilled) return;
    const newStatus = campaign.status === 'live' ? 'paused' : 'live';
    setCampaignStatus(campaign.id, newStatus);
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">Manage your AI outreach campaigns and monitor performance.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/campaigns/new')}>
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* Alert Banners */}
      {conflictsCount > 0 && (
        <div className="alert-banner alert-banner--warning" onClick={() => navigate('/conflicts')} style={{ cursor: 'pointer' }}>
          <AlertTriangle size={16} />
          <div>
            <strong>{conflictsCount} prospect conflict{conflictsCount > 1 ? 's' : ''} detected</strong>
            <span>— prospects claimed by multiple campaigns need resolution.</span>
          </div>
        </div>
      )}
      {pendingApprovals > 0 && (
        <div className="alert-banner alert-banner--info">
          <Clock size={16} />
          <div>
            <strong>{pendingApprovals} pending approval{pendingApprovals > 1 ? 's' : ''}</strong>
            <span>— AI-generated messages waiting for human review.</span>
          </div>
        </div>
      )}

      {/* Campaign Table */}
      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          message="Create your first campaign to start reaching prospects."
        />
      ) : (
        <div className="campaigns-table-card card">
          <table className="campaigns-table">
            <thead>
              <tr>
                <th className="th-name">Campaign</th>
                <th className="th-status">Status</th>
                <th className="th-num">Prospects</th>
                <th className="th-num">Sent</th>
                <th className="th-num">Replies</th>
                <th className="th-num">Meetings</th>
                <th className="th-num">Response</th>
                <th className="th-num">Meeting</th>
                <th className="th-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const m = c.metrics || {};
                const isPaused = c.status === 'paused';
                const isDraft = c.status === 'draft';
                const isLive = c.status === 'live';
                return (
                  <tr
                    key={c.id}
                    className={`campaign-row ${isPaused ? 'dimmed' : ''} ${isLive ? 'campaign-row--live' : ''}`}
                    onClick={() => !isDraft && navigate(`/campaigns/${c.id}`)}
                    style={{ cursor: isDraft ? 'default' : 'pointer' }}
                  >
                    <td className="td-name">
                      <div className="campaign-name-cell">
                        <CampaignDot colour={c.colour} />
                        <div>
                          <span className="campaign-primary-name">{c.name}</span>
                          <span className="campaign-audience">{c.target_audience}</span>
                        </div>
                      </div>
                    </td>
                    <td><StatusPill status={c.status} /></td>
                    <td className="td-num font-mono">{m.total_prospects ?? '—'}</td>
                    <td className="td-num font-mono">{m.messages_sent ?? '—'}</td>
                    <td className="td-num font-mono">{m.replies ?? '—'}</td>
                    <td className="td-num font-mono">{m.meetings ?? '—'}</td>
                    <td className="td-num font-mono">{m.response_rate != null ? `${m.response_rate}%` : '—'}</td>
                    <td className="td-num font-mono">{m.meeting_rate != null ? `${m.meeting_rate}%` : '—'}</td>
                    <td className="td-action" onClick={e => e.stopPropagation()}>
                      {!isDraft && (
                        <button
                          type="button"
                          className={`btn btn--ghost btn--sm ${isLive ? '' : 'btn-resume'}`}
                          onClick={() => handleToggle(c)}
                          disabled={isKilled}
                          title={isKilled ? 'Kill switch is engaged' : undefined}
                        >
                          {isLive ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                        </button>
                      )}
                      {isDraft && (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => navigate(`/campaigns/${c.id}/edit`)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
