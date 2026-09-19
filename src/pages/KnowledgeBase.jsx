import { useState } from 'react';
import { FileText, FileSpreadsheet, Upload, Search, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './KnowledgeBase.css';

/* ── Mock Data ── */
const MOCK_FILES = [
  {
    id: 'f1',
    name: 'Product Specs v4.2.pdf',
    size: '4.2 MB',
    uploadedAt: 'Oct 24, 2026',
    type: 'pdf',
    status: 'indexed',
  },
  {
    id: 'f2',
    name: 'Greenhouse API Integration Checklist.docx',
    size: '1.8 MB',
    uploadedAt: 'Oct 22, 2026',
    type: 'docx',
    status: 'indexed',
  },
  {
    id: 'f3',
    name: 'Objection Handling Script - Tech leaders.txt',
    size: '24 KB',
    uploadedAt: 'Oct 20, 2026',
    type: 'txt',
    status: 'indexed',
  },
  {
    id: 'f4',
    name: 'Figma Case Study Master.pdf',
    size: '12.4 MB',
    uploadedAt: 'Oct 19, 2026',
    type: 'pdf',
    status: 'chunking',
  },
  {
    id: 'f5',
    name: 'Competitor Comparison Grid.xlsx',
    size: '820 KB',
    uploadedAt: 'Oct 14, 2026',
    type: 'xlsx',
    status: 'indexed',
  },
  {
    id: 'f6',
    name: 'Outbound Strategy Playbook.pdf',
    size: '5.1 MB',
    uploadedAt: 'Oct 10, 2026',
    type: 'pdf',
    status: 'failed',
  },
];

const MOCK_STATS = {
  totalDocuments: 8,
  totalChunks: 242,
  lastSync: '5 mins ago',
};

const MOCK_SESSIONS = [
  {
    id: 's1',
    prospect: 'Sarah Jenkins (Acme)',
    score: 0.89,
    snippet: '"Figma Case Study Master.pdf: ...achieved zero manual data pipeline entry by coupling Greenhouse integrations..."',
    high: true,
  },
  {
    id: 's2',
    prospect: 'Marc Dubois (Qonto)',
    score: 0.82,
    snippet: '"Product Specs v4.2.pdf: ...enterprise API supports multi-tenant onboarding flows for global teams..."',
    high: false,
  },
  {
    id: 's3',
    prospect: 'Priya Sharma (Razorpay)',
    score: 0.76,
    snippet: '"Competitor Comparison Grid.xlsx: ...pricing tier comparison shows 40% cost advantage in mid-market segment..."',
    high: false,
  },
];

const FILE_ICON_CLASS = {
  pdf: 'kb-file-icon--pdf',
  docx: 'kb-file-icon--docx',
  txt: 'kb-file-icon--txt',
  xlsx: 'kb-file-icon--xlsx',
};

const STATUS_LABELS = {
  indexed: 'Indexed',
  chunking: 'Chunking...',
  failed: 'Failed',
};

export default function KnowledgeBase() {
  const { campaigns } = useApp();
  const [selectedCampaign, setSelectedCampaign] = useState('default');
  const [dragging, setDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = MOCK_FILES.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    // In production, would handle file upload here
  };

  return (
    <div className="kb-page animate-in">
      {/* Header */}
      <div className="kb-header">
        <div className="kb-header-left">
          <h1>Agent Context & Knowledge Base</h1>
          <p>Upload assets, notes, playbooks and case studies used by autonomous agents for query reasoning.</p>
        </div>
        <div className="kb-header-right">
          <span className="kb-context-label">Campaign Context:</span>
          <select
            className="kb-context-select"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="default">All Campaigns (Global)</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Body — Two Columns */}
      <div className="kb-body">
        {/* Left Column */}
        <div>
          {/* Upload Zone */}
          <div
            className={`kb-upload-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="kb-upload-icon">
              <Upload size={24} />
            </div>
            <span className="kb-upload-title">Drag and drop file here to index</span>
            <span className="kb-upload-sub">Supports PDF, DOCX, TXT, and Excel up to 50MB. Auto chunking will begin immediately.</span>
          </div>

          {/* Search */}
          <div style={{ marginBottom: 'var(--sp-3)', display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
            <div className="kb-section-title" style={{ marginBottom: 0, flex: 1 }}>
              Indexed Context Files
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--canvas)', padding: '6px 12px', borderRadius: '999px',
              border: '1px solid var(--border)'
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  fontSize: '12px', fontFamily: 'var(--font-ui)', width: '120px',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          {/* File List */}
          <div className="kb-file-list">
            {filteredFiles.map(file => (
              <div key={file.id} className="kb-file-row">
                <div className={`kb-file-icon ${FILE_ICON_CLASS[file.type] || ''}`}>
                  {file.type === 'xlsx' ? <FileSpreadsheet size={18} /> : <FileText size={18} />}
                </div>
                <div className="kb-file-info">
                  <div className="kb-file-name">{file.name}</div>
                  <div className="kb-file-meta">{file.size} · Uploaded on {file.uploadedAt}</div>
                </div>
                <span className={`kb-status kb-status--${file.status}`}>
                  {STATUS_LABELS[file.status]}
                </span>
              </div>
            ))}
            {filteredFiles.length === 0 && (
              <div style={{ padding: 'var(--sp-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                No files match your search.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="kb-footer">
            Files are securely stored and vectorized in DronaHQ.{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Open in DronaHQ <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div className="kb-right-col">
          {/* Vector Storage Stats */}
          <div>
            <div className="kb-stats-title">Vector Storage Stats</div>
            <div className="kb-stats-card">
              <div className="kb-stat-row">
                <span className="kb-stat-label">Total Documents</span>
                <span className="kb-stat-value">{MOCK_STATS.totalDocuments} Documents</span>
              </div>
              <div className="kb-stat-row">
                <span className="kb-stat-label">Total Vector Chunks</span>
                <span className="kb-stat-value">{MOCK_STATS.totalChunks} Chunks</span>
              </div>
              <div className="kb-stat-row">
                <span className="kb-stat-label">Last Sync Run</span>
                <span className="kb-stat-value">{MOCK_STATS.lastSync}</span>
              </div>
            </div>
          </div>

          {/* Retrieved Context Sessions */}
          <div>
            <div className="kb-sessions-title">Retrieved Context Sessions</div>
            <div className="kb-session-card">
              {MOCK_SESSIONS.map(session => (
                <div key={session.id} className={`kb-session-item ${session.high ? 'kb-session-item--high' : ''}`}>
                  <div className="kb-session-header">
                    <span className="kb-session-prospect">{session.prospect}</span>
                    <span className="kb-session-score">Score: {session.score.toFixed(2)}</span>
                  </div>
                  <div className="kb-session-snippet">{session.snippet}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
