import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Edit2, AlertCircle, Save, Inbox, ChevronRight, Clock } from 'lucide-react';
import api from '../api/index.js';
import { useApp } from '../context/AppContext';
import {
  LoadingState, ErrorState, EngineBadge, RiskBadge,
  StatusPill, EmptyState, Drawer,
} from '../components/index.jsx';
import './ReviewQueue.css';

export default function ReviewQueue() {
  const navigate = useNavigate();
  const { loadEscalations } = useApp();

  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedEsc, setSelectedEsc] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEscalations();
      setEscalations(data);
    } catch (err) {
      setError(err.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const handleAction = async (id, actionStr) => {
    setActionLoading(id + actionStr);
    try {
      await api.resolveEscalation(id, actionStr);
      setEditingId(null);
      setEditValue('');
      setSelectedEsc(null);
      await loadQueue();
      await loadEscalations();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const typeConfig = {
    needs_review:     { label: 'Needs Review',    color: 'var(--warning)' },
    needs_human:      { label: 'Needs Human',      color: 'var(--accent)' },
    escalate_to_human:{ label: 'Escalated',        color: 'var(--danger)' },
    objection_detected:{ label: 'Objection',       color: 'var(--warning)' },
  };

  if (loading) return <LoadingState message="Loading approvals…" />;
  if (error) return <ErrorState message={error} onRetry={loadQueue} />;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approval Center</h1>
          <p className="page-subtitle">
            {escalations.length > 0
              ? `${escalations.length} item${escalations.length > 1 ? 's' : ''} awaiting your decision — approve, edit, or reject agent actions.`
              : 'All caught up — no pending approvals.'
            }
          </p>
        </div>
        {escalations.length > 0 && (
          <div className="badge badge--danger" style={{ padding: '6px 12px', fontSize: 13 }}>
            {escalations.length} Pending
          </div>
        )}
      </div>

      {escalations.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Approval queue is clear"
          message="All agents are operating autonomously without requiring human review."
        />
      ) : (
        <div className="approvals-list">
          {escalations.map(esc => {
            const type = typeConfig[esc.escalation_type] || { label: esc.escalation_type, color: 'var(--text-secondary)' };
            const isEditing = editingId === esc.id;
            const timeAgo = getTimeAgo(esc.created_at);

            return (
              <div key={esc.id} className={`approval-card card ${esc.risk_level === 'high' ? 'approval-card--high' : ''}`}>
                {/* Header */}
                <div className="approval-card__header">
                  <div className="approval-card__header-left">
                    {esc.risk_level && <RiskBadge level={esc.risk_level} />}
                    <div className="approval-card__type" style={{ color: type.color }}>
                      {type.label}
                    </div>
                    <EngineBadge engine="dronahq" />
                    <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>{esc.source_agent}</strong>
                  </div>
                  <div className="approval-card__time">
                    <Clock size={11} /> {timeAgo}
                  </div>
                </div>

                {/* Meta */}
                <div className="approval-card__meta">
                  <span>Campaign: <strong
                    style={{ cursor: 'pointer', color: 'var(--accent)' }}
                    onClick={() => navigate(`/campaigns/${esc.campaign_id}`)}>
                    {esc.campaign_name || esc.campaign_id}
                  </strong></span>
                  <span className="approval-card__sep" />
                  <span>Prospect: <strong
                    style={{ cursor: 'pointer', color: 'var(--accent)' }}
                    onClick={() => navigate(`/prospects/${esc.prospect_id}`)}>
                    {esc.prospect_name || esc.prospect_id}
                  </strong></span>
                </div>

                {/* Proposed action */}
                <div className="approval-card__body">
                  <div className="approval-card__body-label">Proposed Action / Draft Content</div>
                  {isEditing ? (
                    <textarea
                      className="form-control"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={5}
                      autoFocus
                    />
                  ) : (
                    <div className="approval-card__content" onClick={() => setSelectedEsc(esc)}>
                      {esc.proposed_action}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="approval-card__footer">
                  <button
                    type="button"
                    className="btn btn--danger-outline btn--sm"
                    onClick={() => handleAction(esc.id, 'rejected')}
                    disabled={!!actionLoading}
                  >
                    <X size={13} /> Reject
                  </button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isEditing ? (
                      <>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditingId(null)}>Cancel</button>
                        <button
                          type="button"
                          className="btn btn--success btn--sm"
                          onClick={() => handleAction(esc.id, 'approved')}
                          disabled={!!actionLoading}
                        >
                          <Save size={13} /> Save & Approve
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => { setEditingId(esc.id); setEditValue(esc.proposed_action); }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--success btn--sm"
                          onClick={() => handleAction(esc.id, 'approved')}
                          disabled={!!actionLoading}
                        >
                          <Check size={13} /> Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      {selectedEsc && (
        <Drawer
          open={!!selectedEsc}
          onClose={() => setSelectedEsc(null)}
          title="Approval Detail"
          width={460}
        >
          <EscalationDetail esc={selectedEsc} onAction={handleAction} actionLoading={actionLoading} navigate={navigate} />
        </Drawer>
      )}
    </div>
  );
}

function EscalationDetail({ esc, onAction, actionLoading, navigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {[
        { label: 'Agent', value: esc.source_agent },
        { label: 'Campaign', value: esc.campaign_name },
        { label: 'Prospect', value: esc.prospect_name, link: `/prospects/${esc.prospect_id}` },
        { label: 'Type', value: esc.escalation_type },
        { label: 'Risk Level', value: <RiskBadge level={esc.risk_level} /> },
        {
          label: 'Proposed Action / Content',
          value: <div style={{ whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.6, background: 'var(--surface-raised)', padding: '12px', borderRadius: 8 }}>{esc.proposed_action}</div>
        },
      ].map(({ label, value, link }) => (
        <div key={label} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
          {link
            ? <button className="btn btn--ghost btn--sm" style={{ fontSize: 12, padding: '2px 6px' }} onClick={() => navigate(link)}>{value} <ChevronRight size={10} /></button>
            : <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{value}</div>
          }
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn--danger-outline" onClick={() => onAction(esc.id, 'rejected')} disabled={!!actionLoading}>
          <X size={14} /> Reject
        </button>
        <button className="btn btn--success" onClick={() => onAction(esc.id, 'approved')} disabled={!!actionLoading}>
          <Check size={14} /> Approve
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}
