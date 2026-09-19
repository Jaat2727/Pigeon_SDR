import { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api/index.js';
import { LoadingState, ErrorState } from '../components/index.jsx';
import './Prompts.css';

const AGENT_TABS = [
  'System Prompt',
  'Research Agent',
  'ICP Agent',
  'Personalisation Agent',
  'Conversation Agent',
];

const STATUS_LABELS = {
  'active': 'Active',
  'draft': 'Draft',
  'rolled-back': 'Rolled Back',
  'archived': 'Archived',
};

export default function Prompts() {
  const { campaigns } = useApp();
  const [activeTab, setActiveTab] = useState('System Prompt');
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareSource, setCompareSource] = useState(null);
  const [compareTarget, setCompareTarget] = useState(null);

  const campaignId = campaigns[0]?.id;
  const campaignName = campaigns[0]?.name || 'Loading...';

  const loadPrompts = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const data = await api.getCampaignPrompts(campaignId);
      // Sort reverse chronological
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Assign statuses based on active flag and order
      const activeIdx = data.findIndex(v => v.is_active);
      const enriched = data.map((v, i) => {
        let status = 'draft';
        if (v.is_active) status = 'active';
        else if (activeIdx !== -1 && i > activeIdx) status = 'archived'; // older than active
        else if (activeIdx !== -1 && i < activeIdx) status = 'rolled-back'; // newer than active but not active? Wait, usually newer is draft or rolled-back.
        else status = 'draft';
        
        return { ...v, status };
      });

      setVersions(enriched);
      
      if (enriched.length > 0) {
        const active = enriched.find(v => v.status === 'active') || enriched[0];
        const prev = enriched.find(v => v.status === 'archived') || enriched[enriched.length - 1];
        
        if (!selectedVersion) setSelectedVersion(active.id);
        if (!compareSource) setCompareSource(prev.id);
        if (!compareTarget) setCompareTarget(active.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [campaignId, selectedVersion, compareSource, compareTarget]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleActivate = async (id) => {
    if (!id) return;
    try {
      await api.activatePrompt(id);
      await loadPrompts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && versions.length === 0) return <LoadingState message="Loading prompts..." />;
  if (error) return <ErrorState message={error} onRetry={loadPrompts} />;

  const activeVersionInfo = versions.find(v => v.status === 'active');
  const sourceVersion = versions.find(v => v.id === compareSource);
  const targetVersion = versions.find(v => v.id === compareTarget);

  return (
    <div className="prompts-page animate-in">
      {/* Header */}
      <div className="prompts-header">
        <h1>Prompt Versions & Rollback</h1>
        <div className="prompts-header-sub">
          Campaign: <strong>{campaignName}</strong> · Review diffs and deploy prompt instructions.
        </div>
        <div className="prompts-header-actions">
          <div /> {/* spacer */}
          <button className="btn btn--primary" style={{ borderRadius: 'var(--radius-btn)' }}>
            <Plus size={16} /> Create Draft
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="prompts-tabs">
        {AGENT_TABS.map(tab => (
          <button
            key={tab}
            className={`prompts-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="prompts-body">
        {/* Left — Version History */}
        <div>
          <div className="prompts-history-title">Version History</div>
          <div className="prompts-history-list">
            {versions.map(v => (
              <div
                key={v.id}
                className={`prompts-version-card ${selectedVersion === v.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedVersion(v.id);
                  setCompareSource(v.id);
                }}
              >
                <div className="prompts-version-top">
                  <span className="prompts-version-label">v{v.version}</span>
                  <span className={`pv-status pv-status--${v.status}`}>
                    {STATUS_LABELS[v.status]}
                  </span>
                </div>
                <div className="prompts-version-author">
                  by {v.author}<br />
                  {new Date(v.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Comparison */}
        <div className="prompts-compare">
          <div className="prompts-compare-header">
            <span className="prompts-compare-title">Comparing Prompt Versions</span>
            <div className="prompts-compare-selector">
              <span>Compare</span>
              <select value={compareSource || ''} onChange={(e) => setCompareSource(e.target.value)}>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>v{v.version} ({STATUS_LABELS[v.status]})</option>
                ))}
              </select>
              <span>with</span>
              <select value={compareTarget || ''} onChange={(e) => setCompareTarget(e.target.value)}>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>v{v.version} ({STATUS_LABELS[v.status]})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-side diff */}
          <div className="prompts-diff-columns">
            {/* Source (left) */}
            <div className="prompts-diff-col">
              <div className="prompts-diff-col-header">
                <div>
                  <div className="prompts-diff-col-title">
                    Version v{sourceVersion?.version} Prompt
                  </div>
                  <div className="prompts-diff-col-date">
                    {sourceVersion ? new Date(sourceVersion.created_at).toLocaleString() : ''}
                  </div>
                </div>
              </div>
              <div className="prompts-diff-content">
                {renderDiffContent(sourceVersion?.content, targetVersion?.content, 'source')}
              </div>
            </div>

            {/* Target (right) */}
            <div className="prompts-diff-col">
              <div className="prompts-diff-col-header">
                <div>
                  <div className="prompts-diff-col-title">
                    Version v{targetVersion?.version} Prompt ({STATUS_LABELS[targetVersion?.status]})
                  </div>
                  <div className="prompts-diff-col-date">
                    {targetVersion ? new Date(targetVersion.created_at).toLocaleString() : ''}
                  </div>
                </div>
                {targetVersion?.status === 'active' && (
                  <span className="prompts-diff-col-badge">Active Agent Standard</span>
                )}
              </div>
              <div className="prompts-diff-content">
                {renderDiffContent(sourceVersion?.content, targetVersion?.content, 'target')}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="prompts-compare-footer">
            <span className="prompts-compare-footer-note">
              The next agent run will use v{activeVersionInfo?.version} (Active).
            </span>
            <div className="prompts-compare-footer-actions">
              <button className="btn btn--secondary" style={{ borderRadius: 'var(--radius-btn)' }}>
                Save as New Version
              </button>
              {targetVersion && targetVersion.status !== 'active' && (
                <button 
                  className="btn btn--primary" 
                  style={{ borderRadius: 'var(--radius-btn)' }}
                  onClick={() => handleActivate(targetVersion.id)}
                >
                  Activate Version v{targetVersion.version}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Simple diff renderer ── */
function renderDiffContent(sourceContent, targetContent, side) {
  if (side === 'source' && !sourceContent) return null;
  if (side === 'target' && !targetContent) return null;

  const content = side === 'source' ? sourceContent : targetContent;
  const lines = content.split('\n');
  const otherLines = (side === 'source' ? targetContent : sourceContent)?.split('\n') || [];

  return lines.map((line, i) => {
    // Very basic exact-line diff matching
    const inOther = otherLines.includes(line);
    
    if (!inOther && side === 'source') {
      return <span key={i} className="diff-removed">- {line}</span>;
    }
    if (!inOther && side === 'target') {
      return <span key={i} className="diff-added">+ {line}</span>;
    }

    return <span key={i}>{line}{'\n'}</span>;
  });
}
