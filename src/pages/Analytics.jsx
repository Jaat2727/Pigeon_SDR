import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, DollarSign, Mail, Link2, MessageCircle, Phone,
  Bot, BarChart3, Target,
} from 'lucide-react';
import api from '../api/index.js';
import { useApp } from '../context/AppContext';
import { LoadingState, CampaignDot, ProgressBar } from '../components/index.jsx';
import './Analytics.css';

const CHANNEL_DATA = [
  { channel: 'Email',    icon: Mail,           sent: 540, replied: 52, reply_rate: 9.6, meetings: 8,  color: '#4F46E5' },
  { channel: 'LinkedIn', icon: Link2,          sent: 205, replied: 38, reply_rate: 18.5, meetings: 9, color: '#0077B5' },
  { channel: 'SMS',      icon: MessageCircle,  sent: 110, replied: 9,  reply_rate: 8.2, meetings: 1,  color: '#059669' },
  { channel: 'Voice',    icon: Phone,          sent: 14,  replied: 7,  reply_rate: 50,  meetings: 5,  color: '#F59E0B' },
];

const AGENT_PERF = [
  { name: 'ICP Fitment Agent',       runs: 847, success: 94, failures: 4,   cost: 0.18, value: 'Qualified 423 prospects' },
  { name: 'Lead Research Agent',     runs: 623, success: 97, failures: 1,   cost: 0.09, value: 'Enriched 623 profiles' },
  { name: 'Personalisation Agent',   runs: 389, success: 89, failures: 12,  cost: 0.24, value: 'Wrote 389 messages' },
  { name: 'Conversation Agent',      runs: 127, success: 96, failures: 2,   cost: 0.06, value: 'Classified 127 replies' },
  { name: 'Outreach Strategy Agent', runs: 412, success: 91, failures: 8,   cost: 0.15, value: 'Planned 412 sequences' },
  { name: 'Follow-up Agent',         runs: 203, success: 99, failures: 0,   cost: 0.03, value: 'Scheduled 203 follow-ups' },
  { name: 'Voice SDR Agent',         runs: 14,  success: 82, failures: 1,   cost: 0.12, value: 'Completed 14 calls' },
];

// ── SVG Donut Chart ──
function DonutChart({ segments, center, label }) {
  const SIZE = 120;
  const R = 46;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const circ = 2 * Math.PI * R;

  let offset = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  const arcs = segments.map(seg => {
    const frac = total > 0 ? seg.value / total : 0;
    const dash = frac * circ;
    const arc = { ...seg, dash, gap: circ - dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="donut-wrap">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={arc.color}
            strokeWidth={14}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={-arc.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px`, transition: 'all 0.6s ease' }}
          />
        ))}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-primary)" fontFamily="var(--font-mono)">{center}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="var(--font-ui)" textTransform="uppercase">{label}</text>
      </svg>
      <div className="donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="donut-legend-row">
            <span className="donut-legend-dot" style={{ background: seg.color }} />
            <span className="donut-legend-label">{seg.label}</span>
            <span className="donut-legend-val">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function MetricRow({ label, value, sub, color, barPct }) {
  return (
    <div className="metric-row">
      <div className="metric-row__left">
        <div className="metric-row__label">{label}</div>
        {sub && <div className="metric-row__sub">{sub}</div>}
      </div>
      <div className="metric-row__right">
        <div className="metric-row__value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
        {barPct !== undefined && (
          <ProgressBar value={barPct} color={color || 'var(--accent)'} height={4} />
        )}
      </div>
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const { campaigns, globalMetrics } = useApp();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [costs, setCosts] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [metricsArr, costsData] = await Promise.all([
          Promise.all(campaigns.map(c => api.getCampaignMetrics(c.id).then(m => ({ ...m, campaign: c })))),
          api.getCosts(),
        ]);
        if (mounted) {
          setMetrics(metricsArr);
          setCosts(costsData);
          setLoading(false);
        }
      } catch { setLoading(false); }
    }
    if (campaigns.length) load();
  }, [campaigns]);

  const totalSent = metrics.reduce((sum, m) => sum + (m.messages_sent || 0), 0);
  const totalReplies = metrics.reduce((sum, m) => sum + (m.replies || 0), 0);
  const totalMeetings = metrics.reduce((sum, m) => sum + (m.meetings_booked || 0), 0);
  const overallReplyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : 0;
  const meetingRate = totalReplies > 0 ? ((totalMeetings / totalReplies) * 100).toFixed(1) : 0;
  const qualifiedLeads = metrics.reduce((sum, m) => sum + (m.funnel?.qualified || 0), 0);
  const totalProspects = metrics.reduce((sum, m) => sum + (m.total_prospects || 0), 0);
  const qualifiedRate = totalProspects > 0 ? ((qualifiedLeads / totalProspects) * 100).toFixed(1) : 0;
  const pipelineValue = globalMetrics.pipeline_value || 0;
  const costPerMeeting = costs && totalMeetings > 0 ? (costs.total_spend / totalMeetings).toFixed(2) : '—';

  if (loading && campaigns.length > 0) return <LoadingState message="Loading analytics..." />;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Campaign performance, channel breakdown, and agent efficiency.</p>
        </div>
      </div>

      {/* ── Primary Metrics ── */}
      <div className="analytics-metrics-grid">
        <div className="card">
          <div className="analytics-metric">
            <div className="analytics-metric__label">Reply Rate</div>
            <div className="analytics-metric__value" style={{ color: 'var(--accent)' }}>{overallReplyRate}%</div>
            <div className="analytics-metric__sub">{totalReplies} of {totalSent} sent</div>
          </div>
        </div>
        <div className="card">
          <div className="analytics-metric">
            <div className="analytics-metric__label">Meeting Rate</div>
            <div className="analytics-metric__value" style={{ color: 'var(--success)' }}>{meetingRate}%</div>
            <div className="analytics-metric__sub">{totalMeetings} meetings from {totalReplies} replies</div>
          </div>
        </div>
        <div className="card">
          <div className="analytics-metric">
            <div className="analytics-metric__label">Qualified Lead Rate</div>
            <div className="analytics-metric__value" style={{ color: 'var(--violet)' }}>{qualifiedRate}%</div>
            <div className="analytics-metric__sub">{qualifiedLeads} of {totalProspects} prospects</div>
          </div>
        </div>
        <div className="card">
          <div className="analytics-metric">
            <div className="analytics-metric__label">Cost / Meeting</div>
            <div className="analytics-metric__value" style={{ color: 'var(--warning)' }}>
              {costPerMeeting === '—' ? '—' : `$${costPerMeeting}`}
            </div>
            <div className="analytics-metric__sub">Total spend: ${costs?.total_spend?.toFixed(2) ?? '0.00'}</div>
          </div>
        </div>
        <div className="card">
          <div className="analytics-metric">
            <div className="analytics-metric__label">Pipeline Value</div>
            <div className="analytics-metric__value" style={{ color: 'var(--brand-teal)' }}>
              ${(pipelineValue / 1000).toFixed(0)}K
            </div>
            <div className="analytics-metric__sub">from {totalMeetings} booked meetings</div>
          </div>
        </div>
        <div className="card">
          <div className="analytics-metric">
            <div className="analytics-metric__label">Agent Success Rate</div>
            <div className="analytics-metric__value" style={{ color: 'var(--success)' }}>
              {globalMetrics.agent_success_rate ?? 0}%
            </div>
            <div className="analytics-metric__sub">{costs?.total_runs?.toLocaleString() ?? 0} total runs</div>
          </div>
        </div>
      </div>

      {/* ── 2-col analytics layout ── */}
      <div className="analytics-main">
        {/* Left */}
        <div className="analytics-left">
          {/* Campaign comparison */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card__header">
              <span className="card__title">Campaign Comparison</span>
            </div>
            <table className="campaigns-table">
              <thead>
                <tr>
                  <th className="th-name">Campaign</th>
                  <th className="th-num">Sent</th>
                  <th className="th-num">Replies</th>
                  <th className="th-num">Reply Rate</th>
                  <th className="th-num">Meetings</th>
                  <th className="th-num">Pipeline</th>
                  <th className="th-num">Agent ✓%</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.campaign.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/campaigns/${m.campaign.id}`)}>
                    <td>
                      <div className="campaign-name-cell">
                        <CampaignDot colour={m.campaign.colour} size={8} />
                        <div>
                          <span className="campaign-primary-name" style={{ fontSize: 12 }}>{m.campaign.name}</span>
                          <span className="campaign-audience">{m.campaign.icp}</span>
                        </div>
                      </div>
                    </td>
                    <td className="td-num">{m.messages_sent}</td>
                    <td className="td-num">{m.replies}</td>
                    <td className="td-num">
                      <span style={{ color: parseFloat(m.response_rate) >= 10 ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>
                        {m.response_rate}%
                      </span>
                    </td>
                    <td className="td-num" style={{ color: m.meetings_booked > 0 ? 'var(--success)' : undefined, fontWeight: m.meetings_booked > 0 ? 700 : undefined }}>
                      {m.meetings_booked}
                    </td>
                    <td className="td-num">${((m.pipeline_value || 0) / 1000).toFixed(0)}K</td>
                    <td className="td-num">
                      <span style={{ color: m.agent_success_rate >= 90 ? 'var(--success)' : 'var(--warning)' }}>
                        {m.agent_success_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Agent Performance */}
          <div className="card">
            <div className="card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bot size={14} style={{ color: 'var(--accent)' }} />
                <span className="card__title">Agent Performance</span>
              </div>
            </div>
            <table className="campaigns-table">
              <thead>
                <tr>
                  <th className="th-name">Agent</th>
                  <th className="th-num">Runs</th>
                  <th className="th-num">Success Rate</th>
                  <th className="th-num">Failures</th>
                  <th className="th-num">Spend</th>
                  <th>Output</th>
                </tr>
              </thead>
              <tbody>
                {AGENT_PERF.map(agent => (
                  <tr key={agent.name}>
                    <td>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{agent.name}</span>
                    </td>
                    <td className="td-num">{agent.runs.toLocaleString()}</td>
                    <td className="td-num">
                      <span style={{ color: agent.success >= 95 ? 'var(--success)' : agent.success >= 85 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>
                        {agent.success}%
                      </span>
                    </td>
                    <td className="td-num" style={{ color: agent.failures > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {agent.failures}
                    </td>
                    <td className="td-num">${agent.cost}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{agent.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right */}
        <div className="analytics-right">
          {/* Channel Mix donut */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card__header">
              <span className="card__title">Channel Mix</span>
            </div>
            <div style={{ padding: '8px 16px 12px' }}>
              <DonutChart
                center={totalSent || 869}
                label="messages"
                segments={[
                  { label: 'Email',    value: 540, pct: 42, color: '#4F46E5' },
                  { label: 'LinkedIn', value: 205, pct: 28, color: '#0077B5' },
                  { label: 'SMS',      value: 110, pct: 18, color: '#059669' },
                  { label: 'Voice',    value: 14,  pct: 12, color: '#F59E0B' },
                ]}
              />
            </div>
          </div>

          {/* Campaign Contribution donut */}
          {metrics.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card__header">
                <span className="card__title">Campaign Contribution</span>
              </div>
              <div style={{ padding: '8px 16px 12px' }}>
                <DonutChart
                  center={`${totalMeetings || 0}`}
                  label="meetings"
                  segments={metrics.map((m, i) => {
                    const colors = ['#4F46E5', '#059669', '#F59E0B'];
                    const pct = totalMeetings > 0
                      ? Math.round((m.meetings_booked / totalMeetings) * 100)
                      : Math.round(100 / metrics.length);
                    return {
                      label: m.campaign?.name?.split(' ')[0] || `Campaign ${i + 1}`,
                      value: m.meetings_booked || 1,
                      pct,
                      color: m.campaign?.colour || colors[i % colors.length],
                    };
                  })}
                />
              </div>
            </div>
          )}

          {/* Cost metrics */}
          <div className="card">
            <div className="card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={14} style={{ color: 'var(--warning)' }} />
                <span className="card__title">Cost Efficiency</span>
              </div>
            </div>
            <div style={{ padding: '4px 0' }}>
              <MetricRow
                label="Cost / Prospect"
                value={costs && totalProspects > 0 ? `$${(costs.total_spend / totalProspects).toFixed(3)}` : '—'}
                sub="avg spend per prospect processed"
              />
              <MetricRow
                label="Cost / Qualified Lead"
                value={costs && qualifiedLeads > 0 ? `$${(costs.total_spend / qualifiedLeads).toFixed(3)}` : '—'}
                sub="avg spend per ICP-qualified lead"
              />
              <MetricRow
                label="Cost / Reply"
                value={costs && totalReplies > 0 ? `$${(costs.total_spend / totalReplies).toFixed(3)}` : '—'}
                sub="avg spend per inbound reply"
              />
              <MetricRow
                label="Cost / Meeting"
                value={costPerMeeting === '—' ? '—' : `$${costPerMeeting}`}
                sub="avg spend per meeting booked"
                color="var(--warning)"
              />
              <MetricRow
                label="Avg Latency"
                value={costs ? `${costs.avg_latency_ms}ms` : '—'}
                sub="avg agent run latency"
              />
              <MetricRow
                label="Total Agent Runs"
                value={costs ? costs.total_runs.toLocaleString() : '—'}
                sub="across all campaigns"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
