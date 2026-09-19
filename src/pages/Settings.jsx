import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChannelRow } from '../components/index.jsx';
import { Users, ShieldOff, DollarSign } from 'lucide-react';
import api from '../api/index.js';

export default function Settings() {
  const { systemControl, setChannelPause, isKilled, dailyCosts } = useApp();
  const [reps, setReps] = useState([]);
  const [suppression, setSuppression] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [r, s] = await Promise.all([api.getReps(), api.getSuppression()]);
        setReps(r);
        setSuppression(s);
      } catch (err) {
        console.error('Settings load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage global channels, reps, suppression and cost guardrails.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)', maxWidth: '900px' }}>
        {/* Channels */}
        <div className="card">
          <div className="card__header"><h3 className="card__title">Global Channels</h3></div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
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

        {/* Cost Summary */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={16} /> Cost Summary
            </h3>
          </div>
          <div className="card__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Spend (Today)</div>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>${(dailyCosts.total_spend || 0).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Avg Latency</div>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{dailyCosts.avg_latency_ms || 0}ms</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Agent Runs</div>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{dailyCosts.total_runs || 0}</div>
              </div>
            </div>
            {dailyCosts.by_campaign?.length > 0 && (
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Per Campaign</div>
                {dailyCosts.by_campaign.map(c => (
                  <div key={c.campaign_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span>{c.campaign_name}</span>
                    <span className="font-mono">${c.spend.toFixed(2)} ({c.runs} runs)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reps */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} /> Sales Reps
            </h3>
          </div>
          <div className="card__body">
            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
            ) : reps.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No reps configured.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reps.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '12px',
                    }}>
                      {r.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{r.full_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.title} · {r.email}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span className={`badge ${r.is_active ? 'badge--success' : 'badge--danger'}`} style={{ fontSize: '10px' }}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Suppression */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldOff size={16} /> Suppression List
            </h3>
          </div>
          <div className="card__body">
            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
            ) : suppression.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No suppressed entries.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {suppression.map(s => (
                  <div key={s.id} style={{ padding: '8px 12px', background: 'var(--canvas)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {s.email || s.domain || s.phone}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          {s.email ? 'Email' : s.domain ? 'Domain' : 'Phone'}
                        </span>
                      </div>
                      <span className="badge badge--danger" style={{ fontSize: '10px' }}>{s.reason}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Added by {s.added_by} · {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
