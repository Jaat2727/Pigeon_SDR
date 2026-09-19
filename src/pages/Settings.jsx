import { useApp } from '../context/AppContext';
import { ChannelRow } from '../components/index.jsx';

export default function Settings() {
  const { systemControl, setChannelPause, isKilled } = useApp();

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage global channels and guardrails.</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
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
    </div>
  );
}
