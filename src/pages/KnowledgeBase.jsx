import { useState } from 'react';
import { FileText, FileSpreadsheet, Upload, Search, Globe, Folder, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './KnowledgeBase.css';

/* ── Global knowledge files ── */
const GLOBAL_CATEGORIES = [
  {
    id: 'product',
    label: 'Product',
    files: [
      { id: 'f1', name: 'Product Specs v4.2.pdf',               size: '4.2 MB', uploadedAt: 'Oct 24, 2026', type: 'pdf',  status: 'indexed'     },
      { id: 'f2', name: 'API Integration Checklist.docx',        size: '1.8 MB', uploadedAt: 'Oct 22, 2026', type: 'docx', status: 'indexed'     },
    ],
  },
  {
    id: 'sales',
    label: 'Sales Playbook',
    files: [
      { id: 'f3', name: 'Outbound Strategy Playbook.pdf',        size: '5.1 MB', uploadedAt: 'Oct 10, 2026', type: 'pdf',  status: 'indexed'     },
      { id: 'f4', name: 'Objection Handling Script.txt',         size: '24 KB',  uploadedAt: 'Oct 20, 2026', type: 'txt',  status: 'indexed'     },
      { id: 'f5', name: 'Competitor Comparison Grid.xlsx',       size: '820 KB', uploadedAt: 'Oct 14, 2026', type: 'xlsx', status: 'indexed'     },
    ],
  },
  {
    id: 'brand',
    label: 'Brand Voice',
    files: [
      { id: 'f6', name: 'Brand Voice Guidelines v2.pdf',         size: '3.2 MB', uploadedAt: 'Oct 5, 2026',  type: 'pdf',  status: 'indexed'     },
    ],
  },
  {
    id: 'objections',
    label: 'General Objections',
    files: [
      { id: 'f7', name: 'Pricing Objections Playbook.pdf',       size: '1.1 MB', uploadedAt: 'Oct 8, 2026',  type: 'pdf',  status: 'indexed'     },
    ],
  },
  {
    id: 'policies',
    label: 'Global Policies',
    files: [
      { id: 'f8', name: 'Suppression and Opt-out Policy.pdf',    size: '540 KB', uploadedAt: 'Oct 1, 2026',  type: 'pdf',  status: 'indexed'     },
      { id: 'f9', name: 'GDPR Compliance Checklist.docx',        size: '890 KB', uploadedAt: 'Sep 28, 2026', type: 'docx', status: 'processing'  },
    ],
  },
];

/* ── Campaign-specific files ── */
const CAMPAIGN_FILES = {
  'US SaaS CTO Outreach': [
    { id: 'c1', name: 'Figma Case Study Master.pdf',             size: '12.4 MB', uploadedAt: 'Oct 19, 2026', type: 'pdf',  status: 'indexed'    },
    { id: 'c2', name: 'SaaS CTO Persona Guide.pdf',              size: '2.2 MB',  uploadedAt: 'Oct 15, 2026', type: 'pdf',  status: 'indexed'    },
    { id: 'c3', name: 'US Tech Market Report Q4.pdf',            size: '6.8 MB',  uploadedAt: 'Oct 12, 2026', type: 'pdf',  status: 'failed'     },
  ],
  'India BFSI CIO Outreach': [
    { id: 'c4', name: 'BFSI Regulatory Playbook 2026.pdf',       size: '8.1 MB',  uploadedAt: 'Oct 18, 2026', type: 'pdf',  status: 'indexed'    },
    { id: 'c5', name: 'India FinTech Landscape Report.pdf',      size: '4.5 MB',  uploadedAt: 'Oct 16, 2026', type: 'pdf',  status: 'indexed'    },
    { id: 'c6', name: 'RBI Compliance Notes.docx',               size: '1.2 MB',  uploadedAt: 'Oct 9, 2026',  type: 'docx', status: 'processing' },
  ],
  'Voice AI Founder Outreach': [
    { id: 'c7', name: 'Voice AI Founder Deck.pdf',               size: '3.8 MB',  uploadedAt: 'Oct 20, 2026', type: 'pdf',  status: 'indexed'    },
    { id: 'c8', name: 'Voice AI Market Map 2026.xlsx',           size: '1.6 MB',  uploadedAt: 'Oct 11, 2026', type: 'xlsx', status: 'indexed'    },
  ],
};

const FILE_ICON = { pdf: 'kb-file-icon--pdf', docx: 'kb-file-icon--docx', txt: 'kb-file-icon--txt', xlsx: 'kb-file-icon--xlsx' };

const STATUS_CONFIG = {
  indexed:    { label: 'Indexed',              icon: CheckCircle, color: 'var(--success)' },
  processing: { label: 'Document Processing', icon: Clock,        color: 'var(--warning)' },
  failed:     { label: 'Failed',              icon: AlertCircle,  color: 'var(--danger)'  },
};

function FileRow({ file }) {
  const status = STATUS_CONFIG[file.status] || STATUS_CONFIG.indexed;
  const StatusIcon = status.icon;
  return (
    <div className="kb-file-row">
      <div className={`kb-file-icon ${FILE_ICON[file.type] || ''}`}>
        {file.type === 'xlsx' ? <FileSpreadsheet size={16} /> : <FileText size={16} />}
      </div>
      <div className="kb-file-info">
        <div className="kb-file-name">{file.name}</div>
        <div className="kb-file-meta">{file.size} · Uploaded {file.uploadedAt}</div>
      </div>
      <span className="kb-file-status" style={{ color: status.color }}>
        <StatusIcon size={11} />
        {status.label}
      </span>
    </div>
  );
}

function UploadZone({ dragging, onDragOver, onDragLeave, onDrop }) {
  return (
    <div className={`kb-upload-zone ${dragging ? 'dragging' : ''}`}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
      <span className="kb-upload-title">Drag files here to upload</span>
      <span className="kb-upload-sub">PDF, DOCX, TXT, Excel up to 50 MB · Documents are processed and indexed for AI retrieval.</span>
    </div>
  );
}

export default function KnowledgeBase() {
  const { campaigns } = useApp();
  const [activeTab, setActiveTab]             = useState('global');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [openCategories, setOpenCategories]   = useState({ product: true, sales: true });
  const [dragging, setDragging]               = useState(false);
  const [search, setSearch]                   = useState('');

  const campaignNames = campaigns.length > 0
    ? campaigns.map(c => c.name)
    : Object.keys(CAMPAIGN_FILES);

  const activeCampaign = selectedCampaign || campaignNames[0];
  const campaignFiles  = CAMPAIGN_FILES[activeCampaign] || [];
  const filteredCampaignFiles = search
    ? campaignFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : campaignFiles;

  const toggleCategory = (id) =>
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop      = (e) => { e.preventDefault(); setDragging(false); };

  return (
    <div className="kb-page animate-in">
      {/* Header */}
      <div className="kb-header">
        <div className="kb-header-left">
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-subtitle">AI knowledge used by agents for research, personalisation, and objection handling.</p>
        </div>
      </div>

      {/* Global / Campaign tab switcher */}
      <div className="kb-tab-bar">
        <button
          className={`kb-tab ${activeTab === 'global' ? 'kb-tab--active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          <Globe size={14} /> Global Knowledge
        </button>
        <button
          className={`kb-tab ${activeTab === 'campaigns' ? 'kb-tab--active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          <Folder size={14} /> Campaign Knowledge
        </button>
      </div>

      {/* ── GLOBAL TAB ── */}
      {activeTab === 'global' && (
        <div className="kb-body-single">
          <UploadZone
            dragging={dragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          <div className="kb-search-bar" style={{ marginTop: 16 }}>
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search global files…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GLOBAL_CATEGORIES.map(cat => {
              const files = search
                ? cat.files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
                : cat.files;
              if (search && files.length === 0) return null;
              return (
                <div key={cat.id} className="kb-category card">
                  <button
                    className="kb-category__header"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <span className="kb-category__label">{cat.label}</span>
                    <span className="kb-category__count">{files.length} file{files.length !== 1 ? 's' : ''}</span>
                    <span className="kb-category__chevron" style={{
                      transform: openCategories[cat.id] ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      color: 'var(--text-muted)', fontSize: 11,
                    }}>▾</span>
                  </button>
                  {openCategories[cat.id] && (
                    <div className="kb-category__files">
                      {files.map(f => <FileRow key={f.id} file={f} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CAMPAIGNS TAB ── */}
      {activeTab === 'campaigns' && (
        <div className="kb-body-campaigns">
          {/* Campaign selector */}
          <div className="kb-campaign-tabs">
            {campaignNames.map(name => (
              <button
                key={name}
                className={`kb-campaign-tab ${activeCampaign === name ? 'kb-campaign-tab--active' : ''}`}
                onClick={() => setSelectedCampaign(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="kb-body-single">
            <UploadZone
              dragging={dragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />

            <div className="kb-search-bar" style={{ marginTop: 16 }}>
              <Search size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={`Search ${activeCampaign} files…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="kb-file-list" style={{ marginTop: 12 }}>
              {filteredCampaignFiles.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No files found for this campaign.
                </div>
              ) : (
                filteredCampaignFiles.map(f => <FileRow key={f.id} file={f} />)
              )}
            </div>
          </div>
        </div>
      )}

      {/* DronaHQ Footer */}
      <div style={{
        marginTop: 'var(--sp-5)', padding: '12px 16px',
        background: 'var(--surface-card)', borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '12px', color: 'var(--text-muted)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}>
          ⚡
        </span>
        Files are stored and vectorised in DronaHQ. Chunks are automatically embedded and available to all agents via RAG retrieval.
      </div>
    </div>
  );
}
