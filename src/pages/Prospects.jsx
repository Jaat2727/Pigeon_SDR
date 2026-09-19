import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../api/index.js';
import { useApp } from '../context/AppContext';
import { LoadingState, ErrorState, StatusPill } from '../components/index.jsx';

export default function Prospects() {
  const navigate = useNavigate();
  const { campaigns } = useApp();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await api.getAllProspects();
        if (mounted) setProspects(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingState message="Loading prospects..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const getCampaignName = (id) => campaigns.find(c => c.id === id)?.name || id;

  const filtered = prospects.filter(p => {
    const q = search.toLowerCase();
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    return name.includes(q) || p.company.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  return (
    <div className="page animate-in">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Prospects</h1>
          <p className="page-subtitle">Browse, filter and manage your outreach prospect lists.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="topbar-search" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search prospects..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '220px' }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <table className="campaigns-table">
          <thead>
            <tr>
              <th className="th-name">Prospect</th>
              <th>Company & Role</th>
              <th>Campaign</th>
              <th className="th-status">Stage</th>
              <th className="th-num">Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => navigate(`/prospects/${p.id}`)} style={{ cursor: 'pointer' }}>
                <td className="td-name">
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.first_name} {p.last_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.email}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.company}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.role}</div>
                </td>
                <td>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{getCampaignName(p.campaign_id)}</div>
                </td>
                <td>
                  <span className="badge badge--neutral" style={{ textTransform: 'capitalize' }}>
                    {p.funnel_status}
                  </span>
                </td>
                <td className="td-num font-mono">
                  {p.fit_score != null ? (
                    <span className={`badge ${p.fit_score > 70 ? 'badge--success' : (p.fit_score > 50 ? 'badge--neutral' : 'badge--danger')}`}>
                      {p.fit_score}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No prospects found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
