import { useState } from 'react';
import {
  CheckCircle, AlertCircle, Zap, ArrowRight, Database,
  Mail, Link2, MessageCircle, Phone, BarChart3, RefreshCw,
  Box, GitBranch, Activity,
} from 'lucide-react';
import './Integrations.css';

const INTEGRATIONS = [
  {
    id: 'dronahq', name: 'DronaHQ', type: 'Agent Engine',
    status: 'connected', logo: '⚡',
    description: 'Autonomous agent orchestration — powering all SDR agents.',
    color: '#4F46E5',
  },
  {
    id: 'apollo', name: 'Apollo.io', type: 'Prospect Data',
    status: 'disconnected', logo: '🔭',
    description: 'Prospect enrichment, email finding, and company data.',
    color: '#8B5CF6',
  },
  {
    id: 'linkedin', name: 'LinkedIn', type: 'Outreach',
    status: 'disconnected', logo: '💼',
    description: 'LinkedIn message delivery and profile enrichment.',
    color: '#0077B5',
  },
  {
    id: 'sendgrid', name: 'SendGrid', type: 'Email',
    status: 'disconnected', logo: '✉️',
    description: 'Transactional email delivery with open and click tracking.',
    color: '#059669',
  },
  {
    id: 'twilio', name: 'Twilio', type: 'SMS & Voice',
    status: 'disconnected', logo: '📞',
    description: 'SMS and Voice call delivery for multi-channel outreach.',
    color: '#F59E0B',
  },
  {
    id: 'salesforce', name: 'Salesforce', type: 'CRM',
    status: 'disconnected', logo: '☁️',
    description: 'CRM sync for opportunities, accounts, and contacts.',
    color: '#00A1E0',
  },
];

const AGENT_WORKFLOW = [
  { step: 1, agent: 'Lead Research Agent', tool: 'Apollo + LinkedIn', output: 'Enriched profile', color: '#4F46E5' },
  { step: 2, agent: 'ICP Fitment Agent', tool: 'RAG + ICP Definition', output: 'Qualify / Review / Reject verdict', color: '#6366F1' },
  { step: 3, agent: 'Outreach Strategy Agent', tool: 'RAG + Campaign Rules', output: 'Sequence + Channel plan', color: '#818CF8' },
  { step: 4, agent: 'Personalisation Agent', tool: 'Knowledge Base + Profile', output: 'Personalised message', color: '#60A5FA' },
  { step: 5, agent: 'Conversation Agent', tool: 'LLM + Reply History', output: 'Intent classification + Response', color: '#34D399' },
  { step: 6, agent: 'Follow-up Agent', tool: 'Engagement Data + Calendar', output: 'Timed follow-up sequence', color: '#FBBF24' },
  { step: 7, agent: 'Voice SDR Agent', tool: 'Twilio + TTS + LLM', output: 'Live voice conversation', color: '#F59E0B' },
];

const TOOL_CALLS = [];

const RAG_SOURCES = [
  { name: 'ICP Definition v3', queries: 423, last_used: '2 min ago' },
  { name: 'Objection Handling Script', queries: 127, last_used: '5 min ago' },
  { name: 'Product Specs v4.2', queries: 89, last_used: '12 min ago' },
  { name: 'Case Study: Rippling', queries: 64, last_used: '18 min ago' },
  { name: 'BFSI Regulatory Playbook', queries: 41, last_used: '34 min ago' },
  { name: 'Voice AI Founder Deck', queries: 31, last_used: '1h ago' },
  { name: 'Competitor Comparison Grid', queries: 22, last_used: '2h ago' },
];

import { useApp } from '../context/AppContext';

export default function Integrations() {
  const { dailyCosts, globalMetrics } = useApp();
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">DronaHQ agent infrastructure, tool calls, and external integrations.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', background: 'var(--success-soft)',
            border: '1px solid var(--success-light)', borderRadius: 'var(--radius-pill)',
            fontSize: 11, fontWeight: 700, color: 'var(--success)',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            DronaHQ Engine Online
          </div>
        </div>
      </div>

      {/* ── DronaHQ Summary ── */}
      <div className="integrations-dronahq-banner">
        <div className="integrations-dronahq-banner__logo">⚡</div>
        <div className="integrations-dronahq-banner__info">
          <div className="integrations-dronahq-banner__title">DronaHQ Agentic AI</div>
          <div className="integrations-dronahq-banner__sub">Agent orchestration layer powering all autonomous SDR workflows</div>
        </div>
        <div className="integrations-dronahq-banner__stats">
          <div className="integrations-dronahq-stat">
            <span className="integrations-dronahq-stat__val">7</span>
            <span className="integrations-dronahq-stat__key">Active Agents</span>
          </div>
          <div className="integrations-dronahq-stat">
            <span className="integrations-dronahq-stat__val">{dailyCosts?.total_runs?.toLocaleString() || 0}</span>
            <span className="integrations-dronahq-stat__key">Runs Today</span>
          </div>
          <div className="integrations-dronahq-stat">
            <span className="integrations-dronahq-stat__val">{globalMetrics?.agent_success_rate || 0}%</span>
            <span className="integrations-dronahq-stat__key">Success Rate</span>
          </div>
          <div className="integrations-dronahq-stat">
            <span className="integrations-dronahq-stat__val">{dailyCosts?.avg_latency_ms ? (dailyCosts.avg_latency_ms / 1000).toFixed(1) : '0'}s</span>
            <span className="integrations-dronahq-stat__key">Avg Latency</span>
          </div>
        </div>
      </div>

      <div className="integrations-main">
        {/* Left Column */}
        <div className="integrations-left">
          {/* Agent Workflow Chain */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitBranch size={14} style={{ color: 'var(--accent)' }} />
                <span className="card__title">Agent Workflow Chain</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Research → ICP → Strategy → Personalise → Converse → Follow-up → Voice</span>
            </div>
            <div className="card__body" style={{ padding: 0 }}>
              {AGENT_WORKFLOW.map((step, i) => (
                <div key={step.step} className="workflow-step" onClick={() => setSelectedWorkflow(step)}>
                  <div className="workflow-step__number" style={{ background: step.color + '18', color: step.color, border: `1px solid ${step.color}30` }}>
                    {step.step}
                  </div>
                  <div className="workflow-step__content">
                    <div className="workflow-step__agent">{step.agent}</div>
                    <div className="workflow-step__meta">
                      <span className="workflow-step__tool">🔧 {step.tool}</span>
                      <ArrowRight size={10} style={{ color: 'var(--text-muted)' }} />
                      <span className="workflow-step__output">→ {step.output}</span>
                    </div>
                  </div>
                  {i < AGENT_WORKFLOW.length - 1 && (
                    <div className="workflow-step__connector" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Tool Calls */}
          <div className="card">
            <div className="card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={14} style={{ color: 'var(--accent)' }} />
                <span className="card__title">Live Tool Calls</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--success)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                Live
              </div>
            </div>
            <div>
              {TOOL_CALLS.length > 0 ? TOOL_CALLS.map(tc => (
                <div key={tc.id} className="tool-call-row">
                  <div
                    className="tool-call-row__status"
                    style={{ background: tc.status === 'success' ? 'var(--success)' : 'var(--danger)' }}
                  />
                  <div className="tool-call-row__content">
                    <div className="tool-call-row__tool">{tc.tool}</div>
                    <div className="tool-call-row__meta">
                      <span>{tc.agent}</span>
                      <span>·</span>
                      <span style={{ color: tc.status === 'success' ? 'var(--success)' : 'var(--danger)' }}>{tc.result}</span>
                    </div>
                  </div>
                  <div className="tool-call-row__time">{tc.time}</div>
                </div>
              )) : (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No active tool calls.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="integrations-right">
          {/* External integrations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <div className="section-heading">External Integrations</div>
            {INTEGRATIONS.map(int => (
              <div key={int.id} className="integration-card">
                <div className="integration-card__logo" style={{ background: int.color + '18', color: int.color }}>
                  {int.logo}
                </div>
                <div className="integration-card__info">
                  <div className="integration-card__name">{int.name}</div>
                  <div className="integration-card__type">{int.type}</div>
                </div>
                <div className="integration-card__right">
                  {int.status === 'connected' ? (
                    <div className="integration-card__status">
                      <CheckCircle size={12} style={{ color: 'var(--success)' }} />
                      <span>Connected</span>
                    </div>
                  ) : (
                    <div className="integration-card__status" style={{ color: 'var(--text-muted)' }}>
                      <AlertCircle size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>Not Connected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RAG sources */}
          <div className="card">
            <div className="card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={14} style={{ color: 'var(--violet)' }} />
                <span className="card__title">Knowledge Base (RAG)</span>
              </div>
            </div>
            <div>
              {RAG_SOURCES.map(source => (
                <div key={source.name} className="rag-source-row">
                  <div className="rag-source-row__name">{source.name}</div>
                  <div className="rag-source-row__meta">
                    <span className="rag-source-row__queries">{source.queries} queries</span>
                    <span className="rag-source-row__time">{source.last_used}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
