import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Building, Mail, CheckCircle, AlertTriangle, Eye, EyeOff, Bot, Database } from 'lucide-react';
import api from '../api/index.js';
import { LoadingState, ErrorState, StatusPill, EngineBadge, ProvenanceTag } from '../components/index.jsx';
import './ProspectDetail.css';

export default function ProspectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prospect, setProspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEmailId, setExpandedEmailId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProspect(id);
      setProspect(data);
    } catch (err) {
      setError(err.message || 'Failed to load prospect');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingState message="Loading prospect…" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!prospect) return <ErrorState message="Prospect not found" />;

  const toggleEmail = (idx) => setExpandedEmailId(prev => (prev === idx ? null : idx));

  // Sort timeline chronological (oldest first)
  const timeline = [...(prospect.timeline || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div className="page animate-in prospect-detail">
      <button type="button" className="btn btn--ghost btn--sm mb-3" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--sp-4)' }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="prospect-layout">
        {/* LEFT COLUMN: Profile & Facts (30%) */}
        <div className="prospect-sidebar">
          
          <div className="card mb-4">
            <div className="card__body profile-header">
              <div className="profile-avatar">
                {prospect.first_name?.[0]}{prospect.last_name?.[0]}
              </div>
              <h2 className="profile-name">{prospect.first_name} {prospect.last_name}</h2>
              <div className="profile-meta">
                <span><User size={14}/> {prospect.role}</span>
                <span><Building size={14}/> {prospect.company}</span>
                <span><Mail size={14}/> {prospect.email}</span>
              </div>
            </div>
            
            <div className="profile-section">
              <div className="profile-section-title">Campaign</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="campaign-dot" style={{ background: prospect.campaign_colour || 'var(--accent)', width: 10, height: 10, borderRadius: '50%' }} />
                <strong>{prospect.campaign_id}</strong>
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-section-title">ICP Verdict</div>
              {prospect.icp_verdict ? (
                <div className="icp-verdict">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <StatusPill status={prospect.icp_verdict.status === 'qualify' ? 'live' : prospect.icp_verdict.status === 'reject' ? 'stopped' : 'paused'} />
                    <span className="font-mono text-sm font-bold" style={{ fontSize: '12px' }}>Score: {prospect.icp_verdict.fit_score}</span>
                  </div>
                  <p className="icp-reason">{prospect.icp_verdict.reasoning}</p>
                </div>
              ) : (
                <span className="text-muted text-sm">No verdict yet</span>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Database size={16}/> Facts & Knowledge</h3>
            </div>
            <div className="card__body facts-list">
              {prospect.facts?.length > 0 ? (
                prospect.facts.map((fact, i) => (
                  <div key={i} className="fact-item">
                    <p className="fact-text">{fact.text}</p>
                    <div className="fact-meta">
                      <span className="fact-source">Source: {fact.source}</span>
                      <ProvenanceTag source={fact.tag || 'ai_enriched'} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm">No facts collected yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Timeline (70%) */}
        <div className="prospect-timeline">
          <h2 className="section-heading" style={{ marginTop: 0 }}>Activity Timeline</h2>
          
          <div className="timeline-container">
            {timeline.length > 0 ? (
              timeline.map((event, idx) => (
                <div key={idx} className="timeline-event">
                  <div className="timeline-dot" />
                  <div className="timeline-content card">
                    <div className="timeline-header">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong className="timeline-agent">{event.agent}</strong>
                          <EngineBadge engine={event.agent_engine} />
                        </div>
                        <span className="timeline-time font-mono">{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                      
                      {event.tokens_used > 0 && (
                        <div className="timeline-metrics font-mono">
                          <span>Tokens: {event.tokens_used}</span>
                          <span style={{ color: 'var(--text-muted)' }}>|</span>
                          <span>Cost: ${event.cost.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="timeline-body">
                      <div className="timeline-type">
                        <span style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                          Action: {event.type}
                        </span>
                      </div>
                      
                      {/* Event Specific Details */}
                      {event.details?.verdict && (
                        <div style={{ marginTop: '8px', fontSize: '13px' }}>
                          <strong>Verdict: </strong> <span style={{ textTransform: 'capitalize' }}>{event.details.verdict}</span> 
                          {event.details.reason && <span> — {event.details.reason}</span>}
                        </div>
                      )}
                      
                      {event.details?.reply_text && (
                        <div className="timeline-reply" style={{ marginTop: '8px' }}>
                          <strong>Prospect Reply:</strong>
                          <p style={{ marginTop: '4px', fontStyle: 'italic', borderLeft: '2px solid var(--border)', paddingLeft: '8px' }}>{event.details.reply_text}</p>
                          <div style={{ marginTop: '4px', fontSize: '12px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--accent)', textTransform: 'capitalize' }}>Intent: {event.details.detected_intent}</span>
                          </div>
                        </div>
                      )}

                      {event.details?.message_text && (
                        <div style={{ marginTop: '12px' }}>
                          <button 
                            type="button" 
                            className="btn btn--secondary btn--sm" 
                            onClick={() => toggleEmail(idx)}
                          >
                            {expandedEmailId === idx ? <><EyeOff size={14}/> Hide Email</> : <><Eye size={14}/> View Email Sent</>}
                          </button>
                          
                          {expandedEmailId === idx && (
                            <div className="email-preview animate-in" style={{ marginTop: '8px', padding: '12px', background: 'var(--canvas)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border)' }}>
                              <div style={{ marginBottom: '8px', fontSize: '13px' }}><strong>Subject:</strong> {event.details.subject}</div>
                              <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>{event.details.message_text}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {event.knowledge_chunks?.length > 0 && (
                        <div className="timeline-knowledge" style={{ marginTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Knowledge Used:</span>
                          <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0 0 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {event.knowledge_chunks.map((chunk, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--brand-purple)' }}><Bot size={12}/> {chunk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card">
                <div className="card__body text-center text-muted py-8" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No activity recorded for this prospect yet.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
