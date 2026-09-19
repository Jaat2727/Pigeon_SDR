import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChannelRow } from '../components/index.jsx';
import './Settings.css';
import {
  Building2, Users, Radio, Bot, Shield, Plug, BookOpen,
  CreditCard, FileText, DollarSign, ChevronRight,
} from 'lucide-react';
import api from '../api/index.js';
import './Settings.css';

const NAV_ITEMS = [
  { id: 'workspace',    label: 'Workspace',          icon: Building2 },
  { id: 'channels',     label: 'Channels',           icon: Radio },
  { id: 'agents',       label: 'AI & Agents',        icon: Bot },
  { id: 'safety',       label: 'Safety & Guardrails', icon: Shield },
  { id: 'team',         label: 'Team & Roles',        icon: Users },
  { id: 'integrations', label: 'Integrations',        icon: Plug },
  { id: 'billing',      label: 'Billing & Usage',     icon: CreditCard },
  { id: 'audit',        label: 'Audit Log',           icon: FileText },
];

export default function Settings() {
  const { systemControl, setChannelPause, isKilled, dailyCosts } = useApp();
  const [activeSection, setActiveSection] = useState('workspace');
  const [reps, setReps]             = useState([]);
  const [suppression, setSuppression] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [r, s] = await Promise.all([api.getReps(), api.getSuppression()]);
        setReps(r); setSuppression(s);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspace Settings</h1>
          <p className="page-subtitle">Configure your workspace, team, channels, agents, and safety guardrails.</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Left nav */}
        <nav className="settings-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`settings-nav-item ${activeSection === item.id ? 'settings-nav-item--active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                <ChevronRight size={12} className="settings-nav-chevron" />
              </button>
            );
          })}
        </nav>

        {/* Main panel */}
        <div className="settings-panel">
          {activeSection === 'workspace' && <WorkspaceSection />}
          {activeSection === 'channels' && (
            <ChannelsSection
              systemControl={systemControl}
              isKilled={isKilled}
              setChannelPause={setChannelPause}
            />
          )}
          {activeSection === 'agents' && <AgentsSection />}
          {activeSection === 'safety' && <SafetySection suppression={suppression} loading={loading} />}
          {activeSection === 'team' && <TeamSection reps={reps} loading={loading} />}
          {activeSection === 'integrations' && <IntegrationsSection />}
          {activeSection === 'billing' && <BillingSection dailyCosts={dailyCosts} />}
          {activeSection === 'audit' && <AuditSection />}
        </div>
      </div>
    </div>
  );
}

/* ── Section: Workspace ── */
function WorkspaceSection() {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Workspace</h2>
        <p className="settings-section-sub">Your organisation's Pigeon SDR workspace configuration.</p>
      </div>

      <div className="settings-overview-grid">
        <div className="settings-overview-card">
          <div className="settings-overview-label">Workspace</div>
          <div className="settings-overview-value">Pigeon SDR</div>
          <div className="settings-overview-sub">Autonomous Sales Intelligence</div>
        </div>
        <div className="settings-overview-card">
          <div className="settings-overview-label">Team</div>
          <div className="settings-overview-value">2</div>
          <div className="settings-overview-sub">Active members</div>
        </div>
        <div className="settings-overview-card">
          <div className="settings-overview-label">Channels</div>
          <div className="settings-overview-value">4</div>
          <div className="settings-overview-sub">Email · LinkedIn · SMS · Voice</div>
        </div>
        <div className="settings-overview-card">
          <div className="settings-overview-label">AI Agents</div>
          <div className="settings-overview-value">7</div>
          <div className="settings-overview-sub">Configured & active</div>
        </div>
        <div className="settings-overview-card">
          <div className="settings-overview-label">Infrastructure</div>
          <div className="settings-overview-value" style={{ fontSize: 14, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            Connected
          </div>
          <div className="settings-overview-sub">DronaHQ Agentic AI</div>
        </div>
      </div>
    </div>
  );
}

/* ── Section: Channels ── */
function ChannelsSection({ systemControl, isKilled, setChannelPause }) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Channels</h2>
        <p className="settings-section-sub">Enable or pause outreach channels globally across all campaigns.</p>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card__header"><span className="card__title">Global Channel Controls</span></div>
        <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['email', 'linkedin', 'sms', 'voice'].map(ch => (
            <ChannelRow
              key={ch}
              channel={ch}
              isPaused={systemControl.channel_pauses[ch]}
              disabled={isKilled}
              onToggle={(channel, paused) => setChannelPause(channel, paused)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Section: AI & Agents ── */
function AgentsSection() {
  const agents = [
    { name: 'Lead Research Agent',     enabled: true },
    { name: 'ICP Fitment Agent',       enabled: true },
    { name: 'Outreach Strategy Agent', enabled: true },
    { name: 'Personalisation Agent',   enabled: true },
    { name: 'Conversation Agent',      enabled: true },
    { name: 'Follow-up Agent',         enabled: true },
    { name: 'Voice SDR Agent',         enabled: true },
  ];
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">AI & Agents</h2>
        <p className="settings-section-sub">Configure autonomous agents and their operating parameters.</p>
      </div>
      <div className="card" style={{ maxWidth: 540 }}>
        <div className="card__header"><span className="card__title">Agent Configuration</span></div>
        {agents.map(a => (
          <div key={a.name} className="settings-agent-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{a.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>DronaHQ Agentic AI</div>
            </div>
            <span className="badge badge--success" style={{ fontSize: 10 }}>Enabled</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section: Safety ── */
function SafetySection({ suppression, loading }) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Safety & Guardrails</h2>
        <p className="settings-section-sub">Suppression lists, contact frequency limits, and approval rules.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        <div className="card">
          <div className="card__header"><span className="card__title">Contact Frequency Limits</span></div>
          <div className="card__body">
            {[
              { label: 'Max touches / prospect / day', value: '3' },
              { label: 'Min cooldown between touches', value: '48h' },
              { label: 'Max sequences per prospect', value: '2' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__header"><span className="card__title">Suppression List</span></div>
          <div className="card__body">
            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
            ) : suppression.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No suppressed entries.</div>
            ) : (
              suppression.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 13 }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {s.email || s.domain || s.phone}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {s.email ? 'Email' : s.domain ? 'Domain' : 'Phone'}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>{s.reason}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section: Team ── */
function TeamSection({ reps, loading }) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Team & Roles</h2>
        <p className="settings-section-sub">Manage team members and their access levels.</p>
      </div>
      <div className="card" style={{ maxWidth: 500 }}>
        <div className="card__header"><span className="card__title">Members</span></div>
        <div className="card__body">
          {/* Current user */}
          <div className="settings-member-row">
            <div className="settings-member-avatar">AS</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Aayush Sharma</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Growth Team · Admin</div>
            </div>
            <span className="badge badge--success" style={{ fontSize: 10, marginLeft: 'auto' }}>Active</span>
          </div>

          {loading ? null : reps.map(r => (
            <div key={r.id} className="settings-member-row">
              <div className="settings-member-avatar">
                {r.full_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{r.full_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.title} · {r.email}</div>
              </div>
              <span className={`badge ${r.is_active ? 'badge--success' : 'badge--danger'}`} style={{ fontSize: 10, marginLeft: 'auto' }}>
                {r.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Section: Integrations ── */
function IntegrationsSection() {
  const integrations = [
    { name: 'DronaHQ Agentic AI', status: 'Connected', color: 'var(--success)' },
    { name: 'Apollo.io',           status: 'Connected', color: 'var(--success)' },
    { name: 'SendGrid',            status: 'Connected', color: 'var(--success)' },
    { name: 'Twilio',              status: 'Connected', color: 'var(--success)' },
    { name: 'LinkedIn',            status: 'Connected', color: 'var(--success)' },
    { name: 'Salesforce',          status: 'Connected', color: 'var(--success)' },
  ];
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Integrations</h2>
        <p className="settings-section-sub">External services connected to your workspace.</p>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        {integrations.map(i => (
          <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{i.name}</span>
            <span style={{ color: i.color, fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: i.color, display: 'inline-block' }} />
              {i.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section: Billing ── */
function BillingSection({ dailyCosts }) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Billing & Usage</h2>
        <p className="settings-section-sub">Monitor AI agent spend and usage metrics.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 560 }}>
        {[
          { label: 'Total Spend (Today)', value: `$${(dailyCosts.total_spend || 0).toFixed(2)}`, color: 'var(--text-primary)' },
          { label: 'Avg Latency',         value: `${dailyCosts.avg_latency_ms || 0}ms`,          color: 'var(--text-primary)' },
          { label: 'Total Agent Runs',    value: (dailyCosts.total_runs || 0).toLocaleString(),  color: 'var(--text-primary)' },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
      {dailyCosts.by_campaign?.length > 0 && (
        <div className="card" style={{ marginTop: 16, maxWidth: 560 }}>
          <div className="card__header"><span className="card__title">Per Campaign</span></div>
          <div className="card__body">
            {dailyCosts.by_campaign.map(c => (
              <div key={c.campaign_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{c.campaign_name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${c.spend.toFixed(2)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({c.runs} runs)</span></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Section: Audit ── */
function AuditSection() {
  const logs = [
    { action: 'Campaign paused',             actor: 'Aayush Sharma', time: '2h ago',  detail: 'US SaaS CTO Outreach' },
    { action: 'Approval: Message approved',  actor: 'Aayush Sharma', time: '3h ago',  detail: 'Prospect: Sarah Chen' },
    { action: 'Conflict resolved',           actor: 'Aayush Sharma', time: '5h ago',  detail: 'Jennifer Brown — kept Campaign A' },
    { action: 'Kill switch activated',       actor: 'Aayush Sharma', time: '1d ago',  detail: 'Duration: 4 minutes' },
    { action: 'Knowledge file uploaded',     actor: 'Aayush Sharma', time: '2d ago',  detail: 'BFSI Regulatory Playbook.pdf' },
    { action: 'Agent paused',               actor: 'Aayush Sharma', time: '2d ago',  detail: 'Voice SDR Agent' },
  ];
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Audit Log</h2>
        <p className="settings-section-sub">A record of all human actions taken in this workspace.</p>
      </div>
      <div className="card" style={{ maxWidth: 640 }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{log.action}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.detail}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.actor}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{log.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
