import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Rocket, Upload, X } from 'lucide-react';
import api from '../api/index.js';
import { useApp } from '../context/AppContext';
import {
  StepRail, Toggle, EngineBadge, StatTile,
  LoadingState, ConfirmDialog,
} from '../components/index.jsx';
import './CreateCampaign.css';

const STEPS = ['Identity', 'Targeting', 'Agents & Channels', 'Prompts', 'Review'];

const AGENTS = [
  { key: 'research', name: 'Research & Enrichment', desc: 'Learns about the person and company from multiple sources.', engine: 'dronahq' },
  { key: 'icp_fitment', name: 'ICP Fitment', desc: 'Scores prospect fit and returns qualified/rejected with reason.', engine: 'dronahq' },
  { key: 'personalisation', name: 'Personalisation & Send', desc: 'Writes the message using research and sends it.', engine: 'dronahq' },
  { key: 'conversation', name: 'Conversation', desc: 'Reads replies, classifies intent and decides next action.', engine: 'dronahq' },
  { key: 'outreach_strategy', name: 'Outreach Strategy', desc: 'Picks the best channel and timing for each prospect.', engine: 'dronahq' },
  { key: 'followup_timing', name: 'Follow-up Timing', desc: 'Decides when to nudge or stop following up.', engine: 'our_engine' },
  { key: 'voice_sdr', name: 'Voice SDR (Stretch)', desc: 'Makes voice calls to qualified prospects.', engine: 'dronahq' },
];

const CHANNELS = [
  { key: 'email', name: 'Email' },
  { key: 'linkedin', name: 'LinkedIn' },
  { key: 'sms', name: 'SMS' },
  { key: 'voice', name: 'Voice' },
];

const COLOURS = ['#3B9AE1', '#4FBF92', '#D9A441', '#E05C5C', '#A78BFA', '#F472B6', '#38BDF8', '#FB923C'];

export default function CreateCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadCampaigns, isKilled } = useApp();
  const isEdit = !!id;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showGoLive, setShowGoLive] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', owner: 'Nishu', colour: COLOURS[0],
    target_audience: '', geography: '', target_roles: '', company_size: '', industry: '', never_contact: '', prospect_source: '',
    agents: { research: true, icp_fitment: true, personalisation: true, conversation: true, outreach_strategy: true, followup_timing: true, voice_sdr: false },
    channels: { email: true, linkedin: false, sms: false, voice: false },
    channel_limits: { email: 50, linkedin: 30, sms: 10, voice: 5 },
    working_hours: { start: '09:00', end: '18:00', timezone: 'America/New_York' },
    reps: [],
    approval_required: false,
    prompt_content: '',
    knowledge_files: [],
  });

  // Load existing campaign if editing
  useEffect(() => {
    if (isEdit) {
      api.getCampaign(id).then(c => {
        setForm(prev => ({ ...prev, ...c, geography: c.geography?.join(', ') || '', target_roles: c.target_roles?.join(', ') || '', industry: c.industry?.join(', ') || '' }));
      });
    }
  }, [id, isEdit]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateNested = (parent, key, value) => setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }));

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await api.updateCampaign(id, { ...form, status: 'draft' });
      } else {
        await api.createCampaign({ ...form, status: 'draft' });
      }
      await loadCampaigns();
    } finally {
      setSaving(false);
    }
  };

  const handleGoLive = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await api.setCampaignStatus(id, 'live');
      } else {
        const created = await api.createCampaign({ ...form, status: 'live' });
      }
      await loadCampaigns();
      navigate('/campaigns');
    } finally {
      setSaving(false);
      setShowGoLive(false);
    }
  };

  // Validation
  const missingFields = [];
  if (!form.name) missingFields.push('Campaign name');
  if (!form.target_audience) missingFields.push('Target audience');
  if (!Object.values(form.channels).some(v => v)) missingFields.push('At least one channel');
  if (!Object.values(form.agents).some(v => v)) missingFields.push('At least one agent');
  const canGoLive = missingFields.length === 0;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate('/campaigns')} style={{ marginBottom: 'var(--sp-2)', marginLeft: '-12px' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Campaign' : 'Create Campaign'}</h1>
          <p className="page-subtitle">Configure your autonomous sales workflow.</p>
        </div>
      </div>

      <StepRail steps={STEPS} currentStep={step} onStepClick={(s) => setStep(s)} />

      <div className="wizard-body">
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="wizard-step">
            <h2 className="wizard-step-title">Campaign Identity</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Campaign Name *</label>
                <input className="form-input" value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="e.g. Enterprise HR Tech Outreach" />
              </div>
              <div className="form-group">
                <label className="form-label">Owner</label>
                <input className="form-input" value={form.owner} onChange={e => updateForm('owner', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="What this campaign is about…" />
            </div>
            <div className="form-group">
              <label className="form-label">Campaign Colour</label>
              <div className="colour-picker">
                {COLOURS.map(c => (
                  <button key={c} type="button" className={`colour-swatch ${form.colour === c ? 'active' : ''}`} style={{ background: c }} onClick={() => updateForm('colour', c)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Targeting */}
        {step === 2 && (
          <div className="wizard-step">
            <h2 className="wizard-step-title">Targeting</h2>
            <div className="form-group">
              <label className="form-label">Ideal Customer Profile (free text) *</label>
              <textarea className="form-textarea" value={form.target_audience} onChange={e => updateForm('target_audience', e.target.value)} placeholder="Describe your ideal customer: role, seniority, company type, buying signals…" />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Geography tags</label>
                <input className="form-input" value={form.geography} onChange={e => updateForm('geography', e.target.value)} placeholder="US, UK, Germany…" />
              </div>
              <div className="form-group">
                <label className="form-label">Target Role tags</label>
                <input className="form-input" value={form.target_roles} onChange={e => updateForm('target_roles', e.target.value)} placeholder="VP Engineering, CTO, Head of AI…" />
              </div>
              <div className="form-group">
                <label className="form-label">Company Size</label>
                <input className="form-input" value={form.company_size} onChange={e => updateForm('company_size', e.target.value)} placeholder="200-2000" />
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input className="form-input" value={form.industry} onChange={e => updateForm('industry', e.target.value)} placeholder="SaaS, Fintech, Healthcare…" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Never-contact tags</label>
                <input className="form-input" value={form.never_contact} onChange={e => updateForm('never_contact', e.target.value)} placeholder="competitor.com, government.gov…" />
              </div>
              <div className="form-group">
                <label className="form-label">Prospect Source</label>
                <input className="form-input" value={form.prospect_source} onChange={e => updateForm('prospect_source', e.target.value)} placeholder="LinkedIn Sales Nav, CSV upload…" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Agents & Channels */}
        {step === 3 && (
          <div className="wizard-step">
            <h2 className="wizard-step-title">Agents & Channels</h2>
            <h3 className="wizard-section-label">AI Agents</h3>
            <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
              {AGENTS.map(a => (
                <div key={a.key} className="agent-config-row">
                  <div className="agent-config-info">
                    <div className="agent-config-name">
                      {a.name}
                      <EngineBadge engine={a.engine} />
                    </div>
                    <p className="agent-config-desc">{a.desc}</p>
                  </div>
                  <Toggle on={form.agents[a.key]} onChange={v => updateNested('agents', a.key, v)} ariaLabel={`Toggle ${a.name}`} />
                </div>
              ))}
            </div>

            <h3 className="wizard-section-label">Channels</h3>
            <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
              {CHANNELS.map(ch => (
                <div key={ch.key} className="channel-row">
                  <span className="channel-row__name">{ch.name}</span>
                  <div className="channel-row__limit">
                    <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Daily limit</span>
                    <input
                      type="number"
                      value={form.channel_limits[ch.key]}
                      onChange={e => updateNested('channel_limits', ch.key, parseInt(e.target.value) || 0)}
                      disabled={!form.channels[ch.key]}
                    />
                  </div>
                  <Toggle on={form.channels[ch.key]} onChange={v => updateNested('channels', ch.key, v)} ariaLabel={`Toggle ${ch.name}`} />
                </div>
              ))}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Working Hours Start</label>
                <input className="form-input" type="time" value={form.working_hours.start} onChange={e => updateNested('working_hours', 'start', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Working Hours End</label>
                <input className="form-input" type="time" value={form.working_hours.end} onChange={e => updateNested('working_hours', 'end', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.approval_required} onChange={e => updateForm('approval_required', e.target.checked)} />
                Require human approval before sending
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Prompts */}
        {step === 4 && (
          <div className="wizard-step">
            <h2 className="wizard-step-title">Prompt Instructions</h2>
            <div className="form-group">
              <label className="form-label">Campaign Prompt</label>
              <textarea className="form-textarea" style={{ minHeight: '250px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }} value={form.prompt_content} onChange={e => updateForm('prompt_content', e.target.value)} placeholder="Write the instructions your AI agents will follow for this campaign…" />
            </div>
            <div className="form-group">
              <label className="form-label">Knowledge Files</label>
              <div className="drop-zone">
                <Upload size={28} />
                <div className="drop-zone__title">Drop files here or click to upload</div>
                <div className="drop-zone__sub">PDF, TXT, MD — product docs, case studies, playbooks</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="wizard-step">
            <h2 className="wizard-step-title">Review & Go Live</h2>
            <div className="review-stats-grid">
              <StatTile label="Agents Enabled" value={Object.values(form.agents).filter(v => v).length} />
              <StatTile label="Channels Active" value={Object.values(form.channels).filter(v => v).length} />
              <StatTile label="Daily Cap" value={Object.entries(form.channel_limits).filter(([k]) => form.channels[k]).reduce((s, [, v]) => s + v, 0)} />
              <StatTile label="First Send" value="~15 min" sub="after going live" />
            </div>

            <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
              <div className="card__header"><span className="card__title">What will happen</span></div>
              <div className="card__body">
                <ol className="review-steps-list">
                  <li>Prospect list will be loaded from {form.prospect_source || 'configured sources'}.</li>
                  <li>Research agent will enrich each prospect with company and role data.</li>
                  <li>ICP Fitment agent will score and qualify or reject each prospect.</li>
                  <li>Qualified prospects will receive personalised messages via {Object.entries(form.channels).filter(([,v]) => v).map(([k]) => k).join(', ') || 'enabled channels'}.</li>
                  <li>Conversation agent will monitor replies and classify intent.</li>
                  <li>Follow-up timing agent will schedule or stop nurture sequences.</li>
                  <li>All activity will appear in the campaign dashboard in real time.</li>
                </ol>
              </div>
            </div>

            {!canGoLive && (
              <div className="alert-banner alert-banner--warning" style={{ marginBottom: 'var(--sp-5)' }}>
                <span>⚠️ Missing: {missingFields.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="sticky-footer">
        <div>
          {step > 1 && (
            <button type="button" className="btn btn--secondary" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <button type="button" className="btn btn--ghost" onClick={handleSaveDraft} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save Draft'}
          </button>
          {step < 5 ? (
            <button type="button" className="btn btn--primary" onClick={() => setStep(s => s + 1)}>
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--success btn--lg"
              disabled={!canGoLive || isKilled}
              onClick={() => setShowGoLive(true)}
              title={!canGoLive ? `Missing: ${missingFields.join(', ')}` : isKilled ? 'Kill switch engaged' : 'Go live'}
            >
              <Rocket size={16} /> Go Live
            </button>
          )}
        </div>
      </div>

      {showGoLive && (
        <ConfirmDialog
          title="Launch campaign?"
          message={`"${form.name}" will start processing prospects and sending messages. You can pause at any time.`}
          confirmLabel="Go Live"
          onConfirm={handleGoLive}
          onCancel={() => setShowGoLive(false)}
          variant="primary"
        />
      )}
    </div>
  );
}
