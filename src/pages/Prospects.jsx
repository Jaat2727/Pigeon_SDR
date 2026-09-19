import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../api/index.js';
import { useApp } from '../context/AppContext';
import { LoadingState, ErrorState, StatusPill } from '../components/index.jsx';

export default function Prospects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { campaigns } = useApp();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('fit_score');
  const [sortDir, setSortDir] = useState('desc');

  // Read query params from funnel click-through
  const campaignFilter = searchParams.get('campaign') || '';
  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = campaignFilter
          ? await api.getCampaignProspects(campaignFilter)
          : await api.getAllProspects();
        if (mounted) setProspects(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [campaignFilter]);

  const getCampaignName = (id) => campaigns.find(c => c.id === id)?.name || id;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  // Filter
  const filtered = useMemo(() => {
    let list = [...prospects];

    // Status filter from query params
    if (statusFilter) {
      list = list.filter(p => p.funnel_status === statusFilter);
    }

    // Text search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => {
        const name = `${p.first_name} ${p.last_name}`.toLowerCase();
        return name.includes(q) || p.company.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
      });
    }

    // Sort
    list.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'name': aVal = `${a.first_name} ${a.last_name}`; bVal = `${b.first_name} ${b.last_name}`; break;
        case 'company': aVal = a.company; bVal = b.company; break;
        case 'fit_score': aVal = a.fit_score ?? 0; bVal = b.fit_score ?? 0; break;
        case 'stage': aVal = a.funnel_status; bVal = b.funnel_status; break;
        default: aVal = a.fit_score ?? 0; bVal = b.fit_score ?? 0;
      }
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [prospects, statusFilter, search, sortField, sortDir]);

  const filterLabel = [
    campaignFilter ? getCampaignName(campaignFilter) : null,
    statusFilter ? `Stage: ${statusFilter}` : null,
  ].filter(Boolean).join(' · ');

  if (loading) return <LoadingState message="Loading prospects..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="page animate-in">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Prospects</h1>
          <p className="page-subtitle">Browse, filter and manage your outreach prospect lists.</p>
          {filterLabel && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge--neutral" style={{ fontSize: '11px' }}>{filterLabel}</span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => navigate('/prospects')}
                style={{ fontSize: '11px' }}
              >
                Clear filters
              </button>
            </div>
          )}
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
              <th className="th-name" onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Prospect <SortIcon field="name" />
              </th>
              <th onClick={() => handleSort('company')} style={{ cursor: 'pointer' }}>
                Company & Role <SortIcon field="company" />
              </th>
              <th>Campaign</th>
              <th className="th-status" onClick={() => handleSort('stage')} style={{ cursor: 'pointer' }}>
                Stage <SortIcon field="stage" />
              </th>
              <th className="th-num" onClick={() => handleSort('fit_score')} style={{ cursor: 'pointer' }}>
                Score <SortIcon field="fit_score" />
              </th>
              <th>Reason</th>
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
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.campaign_name || getCampaignName(p.campaign_id)}</div>
                </td>
                <td>
                  <span className="badge badge--neutral" style={{ textTransform: 'capitalize' }}>
                    {p.funnel_status}
                  </span>
                </td>
                <td className="td-num font-mono">
                  {p.fit_score != null ? (
                    <span className={`badge ${p.fit_score > 65 ? 'badge--success' : (p.fit_score >= 40 ? 'badge--neutral' : 'badge--danger')}`}>
                      {p.fit_score}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.fit_reason || '—'}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No prospects found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
