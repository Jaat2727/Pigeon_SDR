import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import api from '../api/index.js';
import { useApp } from '../context/AppContext';
import { LoadingState, ErrorState, ConfirmDialog } from '../components/index.jsx';

export default function Conflicts() {
  const navigate = useNavigate();
  const { loadConflicts: reloadGlobalConflicts } = useApp();
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolving, setResolving] = useState(null); // conflict being resolved

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await api.getConflicts();
        if (mounted) setConflicts(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleResolve = async (conflictId, winningCampaignId) => {
    try {
      await api.resolveConflict(conflictId, winningCampaignId);
      setConflicts(prev => prev.filter(c => c.id !== conflictId));
      setResolving(null);
      await reloadGlobalConflicts();
    } catch (err) {
      console.error('Failed to resolve conflict:', err);
    }
  };

  if (loading) return <LoadingState message="Checking for conflicts..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="page animate-in">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Conflicts</h1>
          <p className="page-subtitle">Review and resolve prospect campaign overlaps.</p>
        </div>
      </div>

      <div className="card">
        {conflicts.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertTriangle size={32} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3>No conflicts detected</h3>
            <p>All prospects are cleanly assigned to single campaigns.</p>
          </div>
        ) : (
          <table className="campaigns-table">
            <thead>
              <tr>
                <th className="th-name">Prospect</th>
                <th>Conflicting Campaigns</th>
                <th>Last Touch</th>
                <th>Resolution Rule</th>
                <th className="th-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.map(c => (
                <tr key={c.id}>
                  <td className="td-name">
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.prospect_name}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {c.campaigns.map((camp, i) => (
                        <span key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{camp}</span>
                      ))}
                    </div>
                  </td>
                  <td className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(c.last_touch).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${c.rule.includes('Manual') ? 'badge--danger' : 'badge--neutral'}`} style={{ fontSize: '11px' }}>
                      {c.rule}
                    </span>
                  </td>
                  <td className="td-action">
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => setResolving(c)}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Resolve Dialog — pick winning campaign */}
      {resolving && (
        <div className="confirm-overlay" onClick={() => setResolving(null)}>
          <div className="confirm-dialog animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 className="confirm-dialog__title">Resolve Conflict</h3>
            <p className="confirm-dialog__message">
              <strong>{resolving.prospect_name}</strong> is claimed by multiple campaigns. Choose which campaign wins:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0' }}>
              {resolving.campaigns.map((camp, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn--secondary"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => handleResolve(resolving.id, resolving.campaign_ids?.[i] || camp)}
                >
                  Assign to: {camp}
                </button>
              ))}
            </div>
            <div className="confirm-dialog__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setResolving(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
