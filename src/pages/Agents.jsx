import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Zap, RefreshCw } from 'lucide-react';
import api from '../api/index.js';
import { useApp } from '../context/AppContext';
import {
  AgentCard, Drawer, LoadingState, ErrorState, Toggle
} from '../components/index.jsx';
import './Agents.css';

export default function Agents() {
  const navigate = useNavigate();
  const { isKilled, setAgentPause, addToast } = useApp();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [toggling, setToggling] = useState(null);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGlobalAgents();
      setAgents(data);
    } catch (err) {
      setError(err.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const handleToggle = useCallback(async (agentKey, shouldPause) => {
    setToggling(agentKey);
    try {
      await setAgentPause(agentKey, shouldPause);
      setAgents(prev => prev.map(a =>
        (a.key === agentKey || a.name === agentKey)
          ? { ...a, paused: shouldPause, status: shouldPause ? 'paused' : 'idle' }
          : a
      ));
      addToast({
        type: 'success',
        title: `Agent ${shouldPause ? 'paused' : 'resumed'}`,
        message: `${agentKey} has been ${shouldPause ? 'paused' : 'resumed'}.`,
      });
    } catch {
      addToast({ type: 'error', title: 'Failed to update agent' });
    } finally {
      setToggling(null);
    }
  }, [setAgentPause, addToast]);

  const runningCount = agents.filter(a => !a.paused && a.status === 'running').length;
  const pausedCount = agents.filter(a => a.paused).length;
  const idleCount = agents.filter(a => !a.paused && a.status === 'idle').length;

  if (loading) return <LoadingState message="Loading agent status..." />;
  if (error) return <ErrorState message={error} onRetry={loadAgents} />;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agents</h1>
          <p className="page-subtitle">
            {runningCount} running · {idleCount} idle · {pausedCount} paused
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--secondary btn--sm" onClick={loadAgents}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/integrations')}>
            View infrastructure <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* AI Infrastructure banner — shown once */}
      <div className="agents-infra-banner">
        <div className="agents-infra-dot" />
        <span className="agents-infra-label">AI Agent Infrastructure</span>
        <span className="agents-infra-sep">·</span>
        <span className="agents-infra-engine">DronaHQ Agentic AI connected</span>
        <Zap size={11} style={{ color: 'var(--accent)', marginLeft: 'auto' }} />
      </div>

      {isKilled && (
        <div className="alert-banner" style={{
          background: 'var(--danger-soft)', borderColor: 'var(--danger-light)', color: 'var(--danger)',
          marginBottom: 16,
        }}>
          ⛔ Global kill switch is active — all agents are halted.
        </div>
      )}

      {/* Stats strip */}
      <div className="agents-stat-strip">
        <div className="agents-stat">
          <div className="agents-stat__value agents-stat__value--running">{runningCount}</div>
          <div className="agents-stat__label">Running</div>
        </div>
        <div className="agents-stat">
          <div className="agents-stat__value agents-stat__value--idle">{idleCount}</div>
          <div className="agents-stat__label">Idle</div>
        </div>
        <div className="agents-stat">
          <div className="agents-stat__value agents-stat__value--paused">{pausedCount}</div>
          <div className="agents-stat__label">Paused</div>
        </div>
        <div className="agents-stat">
          <div className="agents-stat__value">
            {agents.length > 0
              ? `${Math.round(agents.reduce((sum, a) => sum + (a.success_rate || 0), 0) / agents.length)}%`
              : '—'
            }
          </div>
          <div className="agents-stat__label">Avg Success Rate</div>
        </div>
        <div className="agents-stat">
          <div className="agents-stat__value">
            {agents.reduce((sum, a) => sum + (a.runs_today || 0), 0).toLocaleString()}
          </div>
          <div className="agents-stat__label">Total Runs Today</div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="agents-grid">
        {agents.map(agent => (
          <div key={agent.id} className="agent-grid-cell">
            <AgentCard
              agent={agent}
              disabled={isKilled || toggling === agent.key}
              onToggle={(key, shouldPause) => handleToggle(key, shouldPause)}
            />
            <button
              className="agent-grid-details"
              onClick={() => setSelectedAgent(agent)}
            >
              View details <ChevronRight size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Agent Detail Drawer */}
      {selectedAgent && (
        <Drawer
          open={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
          title={selectedAgent.name}
          width={480}
        >
          <AgentDrawer agent={selectedAgent} onToggle={handleToggle} isKilled={isKilled} />
        </Drawer>
      )}
    </div>
  );
}

function AgentDrawer({ agent, onToggle, isKilled }) {
  const statusColor = agent.paused ? 'var(--warning)' :
    (agent.status === 'running' ? 'var(--success)' :
     agent.status === 'error' ? 'var(--danger)' : 'var(--text-muted)');

  return (
    <div className="agent-drawer">
      {/* Header */}
      <div className="agent-drawer__header">
        <div className="agent-drawer__status" style={{ background: statusColor }} />
        <div className="agent-drawer__name-wrap">
          <div className="agent-drawer__status-label" style={{ color: statusColor }}>
            {agent.paused ? 'Paused' : agent.status}
          </div>
          <EngineBadge engine={agent.engine} />
        </div>
        <Toggle
          on={!agent.paused}
          onChange={(val) => onToggle(agent.key, !val)}
          disabled={isKilled}
          ariaLabel={`Toggle ${agent.name}`}
        />
      </div>

      {/* Description */}
      <div className="agent-drawer__section">
        <div className="agent-drawer__label">Description</div>
        <div className="agent-drawer__value">{agent.description}</div>
      </div>

      {/* Current task */}
      <div className="agent-drawer__section">
        <div className="agent-drawer__label">Current Task</div>
        <div className="agent-drawer__value">{agent.current_task || 'Idle'}</div>
      </div>

      {/* Stats */}
      <div className="agent-drawer__section">
        <div className="agent-drawer__label">Performance Today</div>
        <div className="agent-drawer__stats-grid">
          <div className="agent-drawer__stat">
            <span className="agent-drawer__stat-val">{agent.runs_today?.toLocaleString()}</span>
            <span className="agent-drawer__stat-key">Runs</span>
          </div>
          <div className="agent-drawer__stat">
            <span className="agent-drawer__stat-val" style={{ color: 'var(--success)' }}>
              {agent.success_rate}%
            </span>
            <span className="agent-drawer__stat-key">Success</span>
          </div>
          <div className="agent-drawer__stat">
            <span className="agent-drawer__stat-val" style={{ color: agent.failures_today > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
              {agent.failures_today}
            </span>
            <span className="agent-drawer__stat-key">Failures</span>
          </div>
        </div>
      </div>

      {/* Last action */}
      {agent.last_action && (
        <div className="agent-drawer__section">
          <div className="agent-drawer__label">Last Action</div>
          <div className="agent-drawer__value">{agent.last_action}</div>
          {agent.last_action_at && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {new Date(agent.last_action_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <div style={{ marginTop: 8, padding: '12px 16px', background: 'var(--surface-raised)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <Zap size={11} style={{ marginRight: 4, verticalAlign: 'middle', color: 'var(--accent)' }} />
        Pausing this agent stops it globally across all campaigns. Campaign-level agent controls are available in each campaign's Agents tab.
      </div>
    </div>
  );
}
