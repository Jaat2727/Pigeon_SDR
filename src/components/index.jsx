/**
 * Reusable UI Components — Pigeon SDR
 * All components use CSS classes from components.css
 */
import { useState } from 'react';
import { Loader2, AlertCircle, Inbox, CheckCircle } from 'lucide-react';
import './components.css';

// ── Status Pill ──
export function StatusPill({ status }) {
  const labels = { live: 'Live', paused: 'Paused', draft: 'Draft', stopped: 'Stopped' };
  return (
    <span className={`status-pill status-pill--${status}`}>
      <span className="status-pill__dot" />
      {labels[status] || status}
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
  return <span className={`engine-badge engine-badge--${engine}`}>{label}</span>;
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
      className={`toggle ${on ? 'toggle--on' : ''}`}
      onClick={() => !disabled && onChange?.(!on)}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
    />
  );
}

// ── Stat Tile ──
export function StatTile({ label, value, sub, icon: Icon, color = 'var(--accent)', trend, trendValue, className = '' }) {
  return (
    <div className={`stat-tile ${className}`}>
      <div className="stat-tile__header">
        {Icon && (
          <div className="stat-tile__icon-wrap" style={{ background: color }}>
            <Icon size={20} />
          </div>
        )}
        <div className="stat-tile__title-wrap">
          <span className="stat-tile__label">{label}</span>
          <span className="stat-tile__value">{value}</span>
        </div>
      </div>
      
      {trend && trendValue && (
        <div className="stat-tile__sub">
          <span>{sub || 'vs Last Month'}</span>
          <span className={`stat-tile__trend stat-tile__trend--${trend}`}>
            {trend === 'up' ? '▲' : '▼'} {trendValue}
          </span>
        </div>
      )}
      {!trend && sub && (
        <div className="stat-tile__sub">
          <span>{sub}</span>
        </div>
      )}
      
      {/* Fake wave graphic just for aesthetic matching */}
      <div 
        className="stat-tile__wave" 
        style={{ 
          backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,10 C30,20 70,0 100,10 L100,20 L0,20 Z" fill="${encodeURIComponent(color)}"/></svg>')` 
        }} 
      />
    </div>
  );
}

// ── Campaign Colour Dot ──
export function CampaignDot({ colour, size = 10 }) {
  return (
    <span
      className="campaign-dot"
      style={{ background: colour, width: size, height: size }}
    />
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

// ── Error State ──
export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="state-box">
      <AlertCircle size={40} className="state-box__icon" style={{ color: 'var(--danger)' }} />
      <p className="state-box__title">Error</p>
      <p className="state-box__message">{message}</p>
      {onRetry && <button type="button" className="btn btn--primary btn--sm" onClick={onRetry}>Retry</button>}
    </div>
  );
}

// ── Empty State ──
export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message }) {
  return (
    <div className="state-box">
      <Icon size={40} className="state-box__icon" />
      <p className="state-box__title">{title}</p>
      {message && <p className="state-box__message">{message}</p>}
    </div>
  );
}

// ── Paused Overlay ──
export function PausedState({ message = 'This campaign is paused' }) {
  return (
    <div className="state-box" style={{ opacity: 0.6 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </svg>
      <p className="state-box__title">{message}</p>
    </div>
  );
}

// ── Activity Line ──
export function ActivityLine({ activity }) {
  const time = new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="activity-line">
      <span className="activity-line__time">{time}</span>
      <div className="activity-line__content">
        <span className="activity-line__agent">{activity.agent}</span>
        {' → '}
        <span className="activity-line__prospect">{activity.prospect_name}</span>
        <br />
        <span className="activity-line__outcome">{activity.outcome}</span>
      </div>
      <span className="activity-line__status">
        {activity.status === 'success'
          ? <CheckCircle size={14} style={{ color: 'var(--success)' }} />
          : <AlertCircle size={14} style={{ color: 'var(--danger)' }} />
        }
      </span>
    </div>
  );
}

// ── Agent Row (for dashboard agents panel) ──
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

// ── Channel Row (for settings) ──
export function ChannelRow({ channel, onToggle, disabled = false }) {
  const channelNames = { email: 'Email', linkedin: 'LinkedIn', sms: 'SMS', voice: 'Voice' };
  return (
    <div className={`channel-row ${disabled ? 'channel-row--disabled' : ''}`}>
      <div className="channel-row__info">
        <span className="channel-row__name">{channelNames[channel] || channel}</span>
      </div>
      <Toggle on={!disabled} onChange={(val) => onToggle?.(channel, !val)} ariaLabel={`Pause ${channel} channel`} />
    </div>
  );
}

// ── Funnel Bar ──
export function FunnelBar({ funnel, campaignColour, onSegmentClick }) {
  const stages = [
    { key: 'discovered', label: 'Discovered' },
    { key: 'researched', label: 'Researched' },
    { key: 'qualified', label: 'Qualified' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'engaged', label: 'Engaged' },
    { key: 'meeting', label: 'Meeting' },
    { key: 'opportunity', label: 'Opportunity' },
  ];
  const total = Object.values(funnel || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="funnel-bar">
      {stages.map((s, i) => {
        const count = funnel?.[s.key] || 0;
        const pct = Math.max((count / total) * 100, 8);
        const opacity = 1 - (i * 0.1);
        return (
          <div
            key={s.key}
            className="funnel-bar__segment"
            style={{ flex: pct, background: `${campaignColour || 'var(--accent)'}${Math.round(opacity * 30).toString(16).padStart(2, '0')}` }}
            onClick={() => onSegmentClick?.(s.key)}
            title={`${s.label}: ${count}`}
          >
            <span className="funnel-bar__segment-label">{s.label}</span>
            <span className="funnel-bar__segment-count">{count}</span>
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
                {isCompleted ? '✓' : i + 1}
              </span>
              <span className="step-rail__label">{step}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Kill Banner ──
export function KillBanner() {
  return (
    <div className="kill-banner">
      ⛔ ALL ACTIVITY STOPPED — Global kill switch is engaged. Go to the top bar to resume.
    </div>
  );
}
