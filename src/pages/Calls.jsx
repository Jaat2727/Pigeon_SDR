import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Phone, PhoneOff, Pause, Volume2, MessageSquare,
  User, Clock, ArrowRight, Brain, AlertTriangle, CheckCircle,
  PhoneIncoming,
} from 'lucide-react';
import { StatusPill, Badge, AlertBanner } from '../components/index.jsx';
import './Calls.css';

// Simulated live call transcript lines
const TRANSCRIPT_LINES = [
  { speaker: 'ai', text: 'Hi Rahul, this is Ava from Pigeon SDR. Do you have a quick 15 minutes to chat about how voice AI companies are scaling their outreach?' },
  { speaker: 'prospect', text: 'Uh, sure, but can you tell me more about what you do exactly?' },
  { speaker: 'ai', text: 'Absolutely. We work with voice AI founders specifically — we saw your recent blog post about latency challenges in real-time voice. We help companies like yours build and automate their SDR motion so you can focus on the product.' },
  { speaker: 'prospect', text: "That's actually interesting. We're a team of 6 right now, all focused on product. We haven't really built out sales at all." },
  { speaker: 'ai', text: "That's exactly where we tend to help the most — early-stage founders who need to start generating revenue without hiring a sales team yet. What does your current pipeline look like?" },
  { speaker: 'prospect', text: "We have a few warm intros but nothing systematic. I've been meaning to fix that." },
  { speaker: 'ai', text: "Perfect. Would it make sense to set up a quick 20-minute demo next week? I can show you exactly what companies at your stage are doing." },
];

const CALL_HISTORY = [
  { id: 'call_h1', prospect: 'Ananya Gupta', company: 'Cognigy', duration: '4m 32s', outcome: 'meeting_booked', time: '2:14 PM', campaign: 'Voice AI Founder Outreach' },
  { id: 'call_h2', prospect: 'Priya Sharma', company: 'ElevenLabs', duration: '1m 08s', outcome: 'voicemail', time: '1:52 PM', campaign: 'Voice AI Founder Outreach' },
  { id: 'call_h3', prospect: 'James Anderson', company: 'Retool', duration: '6m 21s', outcome: 'interested', time: '1:30 PM', campaign: 'US SaaS CTO Outreach' },
  { id: 'call_h4', prospect: 'Sarah Johnson', company: 'Linear', duration: '0m 52s', outcome: 'not_interested', time: '12:47 PM', campaign: 'US SaaS CTO Outreach' },
  { id: 'call_h5', prospect: 'Vikram Patel', company: 'HDFC Bank', duration: '3m 15s', outcome: 'callback_scheduled', time: '11:23 AM', campaign: 'India BFSI CIO Outreach' },
];

const AI_ANALYSIS = {
  intent: 'interested',
  intent_label: 'Interested — Pipeline signal',
  intent_confidence: 87,
  objections: [],
  opportunities: ['No systematic sales process — early adopter profile', 'Small team (6 people) — budget-conscious'],
  recommended_action: 'Ask for 20-minute demo slot next week. Prospect is showing high intent. Do not mention pricing yet.',
  escalate: false,
  sentiment: 'positive',
};

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Calls() {
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [duration, setDuration] = useState(87); // Start mid-call for demo
  const [visibleLines, setVisibleLines] = useState(4);
  const [noteValue, setNoteValue] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const timerRef = useRef(null);
  const transcriptRef = useRef(null);

  // Tick call timer
  useEffect(() => {
    if (!callEnded && !onHold) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callEnded, onHold]);

  // Simulate new transcript lines every 8s
  useEffect(() => {
    if (callEnded) return;
    const interval = setInterval(() => {
      setVisibleLines(v => Math.min(v + 1, TRANSCRIPT_LINES.length));
    }, 8000);
    return () => clearInterval(interval);
  }, [callEnded]);

  // Scroll transcript to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const outcomeConfig = {
    meeting_booked:      { label: 'Meeting Booked',      cls: 'success' },
    voicemail:           { label: 'Voicemail Left',       cls: 'neutral' },
    interested:          { label: 'Interested',           cls: 'success' },
    not_interested:      { label: 'Not Interested',       cls: 'neutral' },
    callback_scheduled:  { label: 'Callback Scheduled',   cls: 'warning' },
    escalated:           { label: 'Escalated to Human',   cls: 'danger' },
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Call Center <span style={{fontSize: 12, padding: '2px 8px', background: 'var(--warning-soft)', color: 'var(--warning)', borderRadius: 'var(--radius-pill)', marginLeft: 8, fontWeight: 600, verticalAlign: 'middle'}}>SIMULATED DATA</span></h1>
          <p className="page-subtitle">Voice SDR Agent active calls and call history. Displaying simulated mock data.</p>
        </div>
      </div>

      <div className="calls-layout">
        {/* ── Active Call Panel ── */}
        <div className="calls-main">
          {!callEnded ? (
            <div className="active-call-card">
              {/* Header */}
              <div className="active-call__header">
                <div className="active-call__status">
                  <div className="active-call__dot" />
                  <span>Live Call</span>
                </div>
                <div className="active-call__duration">{formatDuration(duration)}</div>
              </div>

              {/* Prospect info */}
              <div className="active-call__prospect">
                <div className="active-call__avatar">
                  <img
                    src="https://ui-avatars.com/api/?name=Rahul+Patel&background=F59E0B&color=fff&size=80&bold=true"
                    alt="Rahul Patel"
                  />
                  {onHold && <div className="active-call__hold-overlay">ON HOLD</div>}
                </div>
                <div className="active-call__prospect-info">
                  <div className="active-call__name">Rahul Patel</div>
                  <div className="active-call__role">Co-Founder & CEO</div>
                  <div className="active-call__company">Vapi · Voice AI Founder Outreach</div>
                </div>
                <div className="active-call__ai-badge">
                  <Brain size={12} />
                  AI SDR
                </div>
              </div>

              {/* Live Transcript */}
              <div className="active-call__transcript" ref={transcriptRef}>
                <div className="active-call__transcript-label">Live Transcript</div>
                {TRANSCRIPT_LINES.slice(0, visibleLines).map((line, i) => (
                  <div key={i} className={`transcript-line transcript-line--${line.speaker}`}>
                    <div className="transcript-line__speaker">
                      {line.speaker === 'ai' ? 'Ava (AI SDR)' : 'Rahul Patel'}
                    </div>
                    <div className="transcript-line__text">{line.text}</div>
                  </div>
                ))}
                {visibleLines < TRANSCRIPT_LINES.length && (
                  <div className="transcript-typing">
                    <span className="transcript-typing__dot" />
                    <span className="transcript-typing__dot" />
                    <span className="transcript-typing__dot" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="active-call__controls">
                <button
                  className={`call-control ${muted ? 'call-control--active-danger' : ''}`}
                  onClick={() => setMuted(m => !m)}
                  title={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <MicOff size={18} /> : <Mic size={18} />}
                  <span>{muted ? 'Unmute' : 'Mute'}</span>
                </button>
                <button
                  className={`call-control ${onHold ? 'call-control--active' : ''}`}
                  onClick={() => setOnHold(h => !h)}
                  title={onHold ? 'Resume' : 'Hold'}
                >
                  <Pause size={18} />
                  <span>{onHold ? 'Resume' : 'Hold'}</span>
                </button>
                <button
                  className="call-control"
                  onClick={() => setShowNoteInput(s => !s)}
                >
                  <MessageSquare size={18} />
                  <span>Note</span>
                </button>
                <button
                  className="call-control"
                  title="Transfer to human SDR"
                >
                  <User size={18} />
                  <span>Transfer</span>
                </button>
                <button
                  className="call-control call-control--danger"
                  onClick={() => setCallEnded(true)}
                  title="End call"
                >
                  <PhoneOff size={18} />
                  <span>End Call</span>
                </button>
              </div>

              {/* Note input */}
              {showNoteInput && (
                <div className="active-call__note">
                  <textarea
                    className="form-control"
                    placeholder="Add a note for this call…"
                    value={noteValue}
                    onChange={e => setNoteValue(e.target.value)}
                    rows={2}
                  />
                  <button className="btn btn--primary btn--sm" onClick={() => setShowNoteInput(false)}>
                    Save Note
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="call-ended-card">
              <CheckCircle size={36} style={{ color: 'var(--success)' }} />
              <h3>Call ended — {formatDuration(duration)}</h3>
              <p>Rahul Patel · Vapi</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn--success" onClick={() => { setCallEnded(false); setDuration(87); setVisibleLines(4); }}>
                  <PhoneIncoming size={14} /> Make another call
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Panel */}
          <div className="ai-analysis-panel">
            <div className="card__header" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={15} style={{ color: 'var(--accent)' }} />
                <span className="card__title">AI Analysis</span>
              </div>
              <span className="badge badge--accent">{AI_ANALYSIS.intent_confidence}% confidence</span>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Intent */}
              <div>
                <div className="ai-analysis__label">Detected Intent</div>
                <div className="ai-analysis__intent">
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  {AI_ANALYSIS.intent_label}
                </div>
              </div>

              {/* Opportunities */}
              {AI_ANALYSIS.opportunities.length > 0 && (
                <div>
                  <div className="ai-analysis__label">Opportunities</div>
                  {AI_ANALYSIS.opportunities.map((o, i) => (
                    <div key={i} className="ai-analysis__opportunity">→ {o}</div>
                  ))}
                </div>
              )}

              {/* Recommended action */}
              <div>
                <div className="ai-analysis__label">Recommended Next Move</div>
                <div className="ai-analysis__recommendation">
                  {AI_ANALYSIS.recommended_action}
                </div>
              </div>

              {/* Escalate */}
              {AI_ANALYSIS.escalate && (
                <AlertBanner type="warning">
                  <AlertTriangle size={13} /> Escalation recommended — transfer to human SDR.
                </AlertBanner>
              )}
            </div>
          </div>
        </div>

        {/* ── Call History ── */}
        <div className="calls-sidebar">
          <div className="card">
            <div className="card__header">
              <span className="card__title">Today's Calls</span>
              <span className="badge badge--neutral">{CALL_HISTORY.length}</span>
            </div>
            <div>
              {CALL_HISTORY.map(call => {
                const oc = outcomeConfig[call.outcome] || { label: call.outcome, cls: 'neutral' };
                return (
                  <div key={call.id} className="call-history-item">
                    <div className="call-history-item__info">
                      <div className="call-history-item__name">{call.prospect}</div>
                      <div className="call-history-item__company">{call.company}</div>
                    </div>
                    <div className="call-history-item__meta">
                      <span className={`badge badge--${oc.cls}`}>{oc.label}</span>
                      <div className="call-history-item__duration">
                        <Clock size={10} /> {call.duration}
                      </div>
                      <div className="call-history-item__time">{call.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
