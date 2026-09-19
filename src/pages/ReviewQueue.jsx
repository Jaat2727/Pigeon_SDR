import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Edit2, AlertCircle, Save } from 'lucide-react';
import api from '../api/index.js';
import { LoadingState, ErrorState, EngineBadge, StatusPill } from '../components/index.jsx';
import './ReviewQueue.css';

export default function ReviewQueue() {
  const navigate = useNavigate();
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For editing the proposed action
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEscalations();
      setEscalations(data);
    } catch (err) {
      setError(err.message || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const handleAction = async (id, actionStr) => {
    try {
      await api.resolveEscalation(id, actionStr);
      setEditingId(null);
      setEditValue('');
      await loadQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (id, currentAction) => {
    setEditingId(id);
    setEditValue(currentAction);
  };

  if (loading) return <LoadingState message="Loading review queue…" />;
  if (error) return <ErrorState message={error} onRetry={loadQueue} />;

  return (
    <div className="page animate-in review-queue-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Review Queue</h1>
          <p className="page-subtitle">Approve, edit, or reject agent actions escalated for human review.</p>
        </div>
      </div>

      {escalations.length === 0 ? (
        <div className="card">
          <div className="card__body text-center py-10" style={{ color: 'var(--text-muted)', padding: '60px', textAlign: 'center' }}>
            <AlertCircle size={32} style={{ margin: '0 auto var(--sp-3)', opacity: 0.5 }} />
            <p>The queue is empty. All agents are operating autonomously.</p>
          </div>
        </div>
      ) : (
        <div className="escalations-list">
          {escalations.map(esc => {
            const isEditing = editingId === esc.id;
            
            return (
              <div key={esc.id} className="card escalation-card">
                <div className="escalation-header">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <StatusPill status={esc.escalation_type || esc.reason} />
                      <EngineBadge engine="dronahq" />
                      <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{esc.source_agent}</strong>
                    </div>
                    <div className="escalation-meta">
                      <span>Campaign: <strong>{esc.campaign_name || esc.campaign_id}</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>|</span>
                      <span>
                        Prospect:{' '}
                        <strong
                          style={{ cursor: 'pointer', color: 'var(--accent)' }}
                          onClick={() => navigate(`/prospects/${esc.prospect_id}`)}
                        >
                          {esc.prospect_name || esc.prospect_id}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="escalation-body">
                  <div className="escalation-label">Proposed Action / Drafted Content</div>
                  {isEditing ? (
                    <textarea 
                      className="form-control escalation-textarea"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={5}
                      autoFocus
                    />
                  ) : (
                    <div className="escalation-content" style={{ whiteSpace: 'pre-wrap' }}>
                      {esc.proposed_action}
                    </div>
                  )}
                </div>

                <div className="escalation-footer">
                  <button 
                    type="button" 
                    className="btn btn--danger-outline"
                    onClick={() => handleAction(esc.id, 'rejected')}
                  >
                    <X size={16} /> Reject
                  </button>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {isEditing ? (
                      <>
                        <button type="button" className="btn btn--ghost" onClick={() => setEditingId(null)}>Cancel</button>
                        <button 
                          type="button" 
                          className="btn btn--success"
                          onClick={() => handleAction(esc.id, 'approved')}
                        >
                          <Save size={16} /> Save & Approve
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          type="button" 
                          className="btn btn--secondary"
                          onClick={() => startEdit(esc.id, esc.proposed_action)}
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button 
                          type="button" 
                          className="btn btn--success"
                          onClick={() => handleAction(esc.id, 'approved')}
                        >
                          <Check size={16} /> Approve
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
    </div>
  );
}
