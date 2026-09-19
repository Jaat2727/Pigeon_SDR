/**
 * Pigeon SDR — Shared Component Library v2
 * Premium B2B SaaS components
 */
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Inbox, CheckCircle, X, AlertTriangle, Info, Check } from 'lucide-react';
import './components.css';

// ── Status Pill ──
export function StatusPill({ status }) {
  const config = {
    live:         { label: 'Live',         cls: 'live' },
    paused:       { label: 'Paused',       cls: 'paused' },
    draft:        { label: 'Draft',        cls: 'draft' },
    stopped:      { label: 'Stopped',      cls: 'stopped' },
    qualify:      { label: 'Qualified',    cls: 'live' },
    reject:       { label: 'Rejected',     cls: 'stopped' },
    needs_review: { label: 'Needs Review', cls: 'warning' },
    running:      { label: 'Running',      cls: 'live' },
    idle:         { label: 'Idle',         cls: 'draft' },
    error:        { label: 'Error',        cls: 'stopped' },
    needs_human:  { label: 'Needs Human',  cls: 'warning' },
    needs_review_type: { label: 'Review',  cls: 'warning' },
    escalate_to_human: { label: 'Escalated', cls: 'stopped' },
    objection_detected: { label: 'Objection', cls: 'warning' },
  };
  const c = config[status] || { label: status, cls: 'draft' };
  return (
    <span className={`status-pill status-pill--${c.cls}`}>
      <span className="status-pill__dot" />
      {c.label}
    </span>
  );
}

// ── Badge ──
export function Badge({ count, variant = 'neutral' }) {
  if (count === null || count === undefined) return null;
  return <span className={`badge badge--${variant}`}>{count}</span>;
}

// ── Engine Badge ──
export function EngineBadge({ engine }) {
  const label = engine === 'dronahq' ? 'DronaHQ' : 'Our Engine';
  const cls = engine === 'dronahq' ? 'dronahq' : 'ours';
  return <span className={`engine-badge engine-badge--${cls}`}>{label}</span>;
}

// ── Provenance Tag ──
export function ProvenanceTag({ source }) {
  const labels = { manual: 'Manual', crm: 'CRM', ai_enriched: 'AI Enriched' };
  return (
    <span className={`provenance-tag provenance-tag--${source}`}>
      {labels[source] || source}
    </span>
  );
}

// ── Toggle ──
export function Toggle({ on, onChange, disabled = false, ariaLabel }) {
  return (
    <button
      type="button"
      className={`toggle ${on ? 'toggle--on' : ''} ${disabled ? 'toggle--disabled' : ''}`}
      onClick={() => !disabled && onChange?.(!on)}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
    />
  );
}

// ── KPI Card (Dashboard 5-card strip) ──
export function KPICard({ label, value, sub, icon: Icon, color = 'var(--accent)', trend, trendValue, onClick }) {
  return (
    <div className={`kpi-card ${onClick ? 'kpi-card--clickable' : ''}`} onClick={onClick}>
      <div className="kpi-card__header">
        <div className="kpi-card__icon" style={{ background: `${color}18`, color }}>
          {Icon && <Icon size={16} />}
        </div>
        <span className="kpi-card__label">{label}</span>
      </div>
      <div className="kpi-card__value">{value}</div>
      {sub && <div className="kpi-card__sub">{sub}</div>}
      {trend && trendValue && (
        <div className={`kpi-card__trend kpi-card__trend--${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </div>
      )}
    </div>
  );
}

// ── Stat Tile (kept for backwards compat) ──
export function StatTile({ label, value, sub, icon: Icon, color = 'var(--accent)', trend, trendValue }) {
  return (
    <KPICard label={label} value={value} sub={sub} icon={Icon} color={color} trend={trend} trendValue={trendValue} />
  );
}

// ── Campaign Dot ──
export function CampaignDot({ colour, size = 10 }) {
  return (
    <span
      className="campaign-dot"
      style={{ background: colour, width: size, height: size, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}
    />
  );
}

// ── Progress Bar ──
export function ProgressBar({ value, color = 'var(--accent)', height = 4, showLabel = false }) {
  const pct = Math.min(Math.max(value || 0, 0), 100);
  return (
    <div className="progress-bar-wrap" style={{ height }}>
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%`, background: color, height }}
      />
      {showLabel && <span className="progress-bar-label">{pct}%</span>}
    </div>
  );
}

// ── Needs Attention Item ──
export function NeedsAttentionItem({ item, onClick }) {
  const typeConfig = {
    approval:    { color: 'var(--accent)',  bgColor: 'var(--accent-soft)',   icon: '⏳' },
    conflict:    { color: 'var(--warning)', bgColor: 'var(--warning-soft)',  icon: '⚡' },
    escalation:  { color: 'var(--danger)',  bgColor: 'var(--danger-soft)',   icon: '🔴' },
    opportunity: { color: 'var(--success)', bgColor: 'var(--success-soft)',  icon: '🟢' },
  };
  const config = typeConfig[item.type] || typeConfig.approval;
  const timeAgo = getTimeAgo(item.created_at);

  return (
    <button type="button" className="attention-item" onClick={onClick}>
      <div className="attention-item__icon" style={{ background: config.bgColor, color: config.color }}>
        {config.icon}
      </div>
      <div className="attention-item__content">
        <div className="attention-item__title">{item.title}</div>
        <div className="attention-item__desc">{item.description}</div>
        <div className="attention-item__meta">
          {item.campaign && <span className="attention-item__campaign">{item.campaign}</span>}
          <span className="attention-item__time">{timeAgo}</span>
        </div>
      </div>
      <div className="attention-item__priority" style={{
        color: item.priority === 'high' ? 'var(--danger)' : item.priority === 'medium' ? 'var(--warning)' : 'var(--text-muted)',
      }}>
        {item.priority === 'high' ? '●' : item.priority === 'medium' ? '●' : '○'}
      </div>
    </button>
  );
}

// ── Pipeline Stage ──
export function PipelineStage({ label, count, total, color, onClick, active }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      type="button"
      className={`pipeline-stage ${active ? 'pipeline-stage--active' : ''}`}
      onClick={onClick}
    >
      <div className="pipeline-stage__bar-bg">
        <div
          className="pipeline-stage__bar-fill"
          style={{ height: `${Math.max(pct, 8)}%`, background: color || 'var(--accent)' }}
        />
      </div>
      <div className="pipeline-stage__count" style={{ color: color || 'var(--accent)' }}>{count}</div>
      <div className="pipeline-stage__label">{label}</div>
    </button>
  );
}

// ── Activity Event ──
export function ActivityEvent({ event, onClick }) {
  const statusColor = event.status === 'success' ? 'var(--success)' : 'var(--danger)';
  const timeStr = new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return (
    <button type="button" className="activity-event" onClick={onClick}>
      <div className="activity-event__status-dot" style={{ background: statusColor }} />
      <div className="activity-event__content">
        <div className="activity-event__agent">{event.agent}</div>
        <div className="activity-event__outcome">{event.outcome}</div>
        {event.prospect_name && (
          <div className="activity-event__prospect">
            {event.prospect_name}{event.prospect_company ? ` · ${event.prospect_company}` : ''}
          </div>
        )}
      </div>
      <div className="activity-event__time">{timeStr}</div>
    </button>
  );
}

// ── Activity Line (legacy compat) ──
export function ActivityLine({ activity }) {
  return <ActivityEvent event={activity} />;
}

// ── Agent Card ──
export function AgentCard({ agent, onToggle, disabled = false }) {
  const statusColor = agent.paused ? 'var(--warning)' :
    (agent.status === 'running' ? 'var(--success)' :
     agent.status === 'error' ? 'var(--danger)' : 'var(--text-muted)');
  const successPct = agent.runs_today > 0
    ? Math.round(((agent.runs_today - agent.failures_today) / agent.runs_today) * 100)
    : agent.success_rate || 0;

  return (
    <div className={`agent-card ${disabled ? 'agent-card--disabled' : ''} ${agent.paused ? 'agent-card--paused' : ''}`}>
      <div className="agent-card__header">
        <div className="agent-card__status-dot" style={{ background: statusColor }} />
        <div className="agent-card__name">{agent.name}</div>
        <EngineBadge engine={agent.engine} />
        <Toggle on={!agent.paused} onChange={(val) => onToggle?.(agent.key || agent.name, !val)} disabled={disabled} ariaLabel={`Toggle ${agent.name}`} />
      </div>
      <div className="agent-card__task">{agent.current_task || agent.status}</div>
      <div className="agent-card__stats">
        <div className="agent-card__stat">
          <span className="agent-card__stat-label">Success Rate</span>
          <span className="agent-card__stat-value" style={{ color: 'var(--success)' }}>{successPct}%</span>
        </div>
        <div className="agent-card__stat">
          <span className="agent-card__stat-label">Runs Today</span>
          <span className="agent-card__stat-value">{agent.runs_today}</span>
        </div>
        {agent.failures_today > 0 && (
          <div className="agent-card__stat">
            <span className="agent-card__stat-label">Failures</span>
            <span className="agent-card__stat-value" style={{ color: 'var(--danger)' }}>{agent.failures_today}</span>
          </div>
        )}
      </div>
      {agent.last_action && (
        <div className="agent-card__last-action">{agent.last_action}</div>
      )}
    </div>
  );
}

// ── Agent Row (legacy compat) ──
export function AgentRow({ agent, onToggle, disabled = false }) {
  return (
    <div className={`agent-row ${disabled ? 'agent-row--disabled' : ''}`}>
      <div className="agent-row__info">
        <div className="agent-row__name">
          {agent.name}
          <EngineBadge engine={agent.engine} />
        </div>
      </div>
      <div className="agent-row__stats">
        <span>{agent.runs_today} runs</span>
        {agent.failures_today > 0 && (
          <span style={{ color: 'var(--danger)' }}>{agent.failures_today} failed</span>
        )}
      </div>
      <Toggle on={agent.enabled} onChange={(val) => onToggle?.(agent.name, val)} disabled={disabled} ariaLabel={`Toggle ${agent.name}`} />
    </div>
  );
}

// ── Channel Row ──
export function ChannelRow({ channel, isPaused, onToggle, disabled = false }) {
  const channelNames = { email: 'Email', linkedin: 'LinkedIn', sms: 'SMS', voice: 'Voice' };
  const channelIcons = { email: '✉️', linkedin: '💼', sms: '💬', voice: '📞' };
  return (
    <div className={`channel-row ${disabled ? 'channel-row--disabled' : ''}`}>
      <div className="channel-row__info">
        <span className="channel-row__icon">{channelIcons[channel]}</span>
        <span className="channel-row__name">{channelNames[channel] || channel}</span>
        {isPaused && <span className="channel-row__badge">PAUSED</span>}
      </div>
      <Toggle on={!isPaused} onChange={(val) => onToggle?.(channel, !val)} disabled={disabled} ariaLabel={`Pause ${channel} channel`} />
    </div>
  );
}

// ── Funnel Bar ──
export function FunnelBar({ funnel, campaignColour, onSegmentClick }) {
  const stages = [
    { key: 'discovered',  label: 'Discovered' },
    { key: 'researched',  label: 'Researched' },
    { key: 'qualified',   label: 'Qualified' },
    { key: 'contacted',   label: 'Contacted' },
    { key: 'engaged',     label: 'Engaged' },
    { key: 'meeting',     label: 'Meeting' },
    { key: 'opportunity', label: 'Opportunity' },
  ];
  const total = funnel?.discovered || Object.values(funnel || {}).reduce((a, b) => a + b, 0) || 1;
  const color = campaignColour || 'var(--accent)';

  return (
    <div className="funnel-bar">
      {stages.map((s, i) => {
        const count = funnel?.[s.key] || 0;
        const pct = Math.max((count / total) * 100, 0);
        return (
          <div
            key={s.key}
            className="funnel-bar__segment"
            style={{ flex: Math.max(pct, 4) }}
            onClick={() => onSegmentClick?.(s.key)}
            title={`${s.label}: ${count}`}
          >
            <div
              className="funnel-bar__fill"
              style={{ background: color, opacity: 1 - (i * 0.11) }}
            />
            <span className="funnel-bar__label">{s.label}</span>
            <span className="funnel-bar__count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Step Rail ──
export function StepRail({ steps, currentStep, onStepClick }) {
  return (
    <div className="step-rail">
      {steps.map((step, i) => {
        const isActive = i + 1 === currentStep;
        const isCompleted = i + 1 < currentStep;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div className="step-rail__connector" />}
            <div
              className={`step-rail__item ${isActive ? 'step-rail__item--active' : ''} ${isCompleted ? 'step-rail__item--completed' : ''}`}
              onClick={() => onStepClick?.(i + 1)}
            >
              <span className="step-rail__number">
                {isCompleted ? <Check size={12} /> : i + 1}
              </span>
              <span className="step-rail__label">{step}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Confirm Dialog ──
export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, variant = 'danger' }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog animate-in" onClick={e => e.stopPropagation()}>
        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={`btn btn--${variant === 'danger' ? 'danger-solid' : 'primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Loading State ──
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p className="state-box__message">{message}</p>
    </div>
  );
}

// ── Skeleton ──
export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

// ── Error State ──
export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="state-box">
      <AlertCircle size={36} style={{ color: 'var(--danger)', opacity: 0.8 }} />
      <p className="state-box__title">Error</p>
      <p className="state-box__message">{message}</p>
      {onRetry && <button type="button" className="btn btn--secondary btn--sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

// ── Empty State ──
export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="state-box">
      <Icon size={36} className="state-box__icon" />
      <p className="state-box__title">{title}</p>
      {message && <p className="state-box__message">{message}</p>}
      {action && (
        <button type="button" className="btn btn--primary btn--sm" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Paused State ──
export function PausedState({ message = 'This campaign is paused' }) {
  return (
    <div className="state-box" style={{
      background: 'var(--warning-soft)',
      border: '1px solid var(--warning-light)',
      borderRadius: 'var(--radius-card)',
    }}>
      <div style={{ fontSize: 28 }}>⏸️</div>
      <p className="state-box__title" style={{ color: 'var(--warning)' }}>{message}</p>
    </div>
  );
}

// ── Kill Banner ──
export function KillBanner() {
  return (
    <div className="kill-banner">
      ⛔ ALL ACTIVITY STOPPED — Global kill switch is engaged. Click ··· → Resume all activity.
    </div>
  );
}

// ── Toast ──
export function Toast({ toast, onClose }) {
  const config = {
    success: { icon: <CheckCircle size={16} />, color: 'var(--success)', bg: 'var(--success-soft)', border: 'var(--success-light)' },
    error:   { icon: <AlertCircle size={16} />, color: 'var(--danger)',  bg: 'var(--danger-soft)',  border: 'var(--danger-light)' },
    warning: { icon: <AlertTriangle size={16} />, color: 'var(--warning)', bg: 'var(--warning-soft)', border: 'var(--warning-light)' },
    info:    { icon: <Info size={16} />,         color: 'var(--accent)',  bg: 'var(--accent-soft)',  border: 'var(--accent-light)' },
  };
  const c = config[toast.type || 'info'];

  return (
    <div className="toast" style={{ borderLeft: `3px solid ${c.color}`, background: c.bg }}>
      <div className="toast__icon" style={{ color: c.color }}>{c.icon}</div>
      <div className="toast__content">
        {toast.title && <div className="toast__title">{toast.title}</div>}
        {toast.message && <div className="toast__message">{toast.message}</div>}
      </div>
      <button type="button" className="toast__close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}

// ── Drawer ──
export function Drawer({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div
        className="drawer"
        style={{ width }}
        onClick={e => e.stopPropagation()}
      >
        <div className="drawer__header">
          <h3 className="drawer__title">{title}</h3>
          <button type="button" className="drawer__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="drawer__body">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Alert Banner ──
export function AlertBanner({ type = 'warning', children, onClick }) {
  const config = {
    warning: { bg: 'var(--warning-soft)', border: 'var(--warning-light)', color: 'var(--warning)', icon: <AlertTriangle size={14} /> },
    info:    { bg: 'var(--info-soft)',    border: 'var(--info-light)',    color: 'var(--info)',    icon: <Info size={14} /> },
    danger:  { bg: 'var(--danger-soft)',  border: 'var(--danger-light)',  color: 'var(--danger)',  icon: <AlertCircle size={14} /> },
    success: { bg: 'var(--success-soft)', border: 'var(--success-light)', color: 'var(--success)', icon: <Check size={14} /> },
  };
  const c = config[type];
  return (
    <div
      className="alert-banner"
      style={{ background: c.bg, borderColor: c.border, color: c.color, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {c.icon}
      <div>{children}</div>
    </div>
  );
}

// ── Tabs ──
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab.key}
          type="button"
          className={`tab-btn ${active === tab.key ? 'tab-btn--active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge !== null && (
            <span className="tab-badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Risk Badge ──
export function RiskBadge({ level }) {
  const config = {
    high:   { label: 'High Risk',   cls: 'danger' },
    medium: { label: 'Medium Risk', cls: 'warning' },
    low:    { label: 'Low Risk',    cls: 'success' },
  };
  const c = config[level] || { label: level, cls: 'neutral' };
  return <span className={`badge badge--${c.cls}`}>{c.label}</span>;
}

// ── Utility ──
function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
