import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, Users, Bot, Phone, BarChart3,
  BookOpen, Plug, Settings, ChevronRight, Bell, Search,
  MoreHorizontal, OctagonX, Play, ShieldAlert, PauseCircle,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmDialog, KillBanner, Toast } from '../components/index.jsx';
import pigeonLogo from '../logo.png';
import './DashboardLayout.css';

// Primary nav items
const PRIMARY_NAV = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Campaigns', path: '/campaigns', icon: Megaphone,
    sub: [
      { name: 'All Campaigns', path: '/campaigns', exact: true },
      { name: 'Approvals', path: '/review-queue', badgeKey: 'review' },
      { name: 'Conflicts', path: '/conflicts', badgeKey: 'conflicts' },
    ]
  },
  { name: 'Prospects', path: '/prospects', icon: Users },
  { name: 'Agents', path: '/agents', icon: Bot },
  { name: 'Calls', path: '/calls', icon: Phone },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

const SECONDARY_NAV = [
  { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
  { name: 'Integrations', path: '/integrations', icon: Plug },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function DashboardLayout({ children, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isKilled, toggleKillSwitch,
    campaigns, conflictsCount,
    escalationsCount, liveCampaignCount,
    dailyCosts, toasts, removeToast,
  } = useApp();

  const [showKillConfirm, setShowKillConfirm] = useState(false);
  const [campaignsOpen, setCampaignsOpen] = useState(
    location.pathname.startsWith('/campaigns') ||
    location.pathname === '/review-queue' ||
    location.pathname === '/conflicts'
  );
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const getBadge = (key) => {
    switch (key) {
      case 'conflicts': return conflictsCount || null;
      case 'review': return escalationsCount || null;
      default: return null;
    }
  };

  const isActive = (path) => {
    if (path === '/campaigns') {
      return location.pathname === '/campaigns' || location.pathname.startsWith('/campaigns/');
    }
    return location.pathname.startsWith(path);
  };

  // Hour-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="sdr-shell">
      {/* ── Sidebar ── */}
      <aside className="sdr-sidebar">
        {/* Brand */}
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
          <div className="sidebar-logo">
            <img src={pigeonLogo} alt="Pigeon SDR" />
          </div>
          <span className="sidebar-wordmark">Pigeon SDR</span>
        </div>

        <nav className="sidebar-nav">
          {/* Primary nav */}
          <div className="nav-section">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              if (item.sub) {
                const subActive = item.sub.some(s => location.pathname === s.path || location.pathname.startsWith(s.path));
                return (
                  <div key={item.path}>
                    <button
                      type="button"
                      className={`nav-item ${subActive ? 'active' : ''}`}
                      onClick={() => setCampaignsOpen(o => !o)}
                    >
                      <Icon size={17} className="nav-item-icon" />
                      <span className="nav-item-label">{item.name}</span>
                      {conflictsCount + escalationsCount > 0 && (
                        <span className="nav-item-badge nav-item-badge--danger">
                          {conflictsCount + escalationsCount}
                        </span>
                      )}
                      <ChevronRight size={13} className={`nav-chevron ${campaignsOpen ? 'open' : ''}`} />
                    </button>
                    <div className={`nav-subnav ${campaignsOpen ? 'open' : ''}`}>
                      {item.sub.map((sub) => {
                        const badge = getBadge(sub.badgeKey);
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            className={({ isActive: ia }) =>
                              `nav-subitem ${ia || (sub.path === '/campaigns' && location.pathname === '/campaigns') ? 'active' : ''}`
                            }
                          >
                            <span style={{ flex: 1 }}>{sub.name}</span>
                            {badge !== null && (
                              <span className={`nav-item-badge nav-item-badge--${sub.badgeKey === 'conflicts' || sub.badgeKey === 'review' ? 'danger' : 'neutral'}`}>
                                {badge}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: ia }) => `nav-item ${ia ? 'active' : ''}`}
                >
                  <Icon size={17} className="nav-item-icon" />
                  <span className="nav-item-label">{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Divider */}
          <div className="sidebar-divider" />

          {/* Secondary nav */}
          <div className="nav-section">
            <div className="nav-section-label">Tools</div>
            {SECONDARY_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: ia }) => `nav-item ${ia ? 'active' : ''}`}
                >
                  <Icon size={17} className="nav-item-icon" />
                  <span className="nav-item-label">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* DronaHQ engine badge */}
          <div className="sidebar-engine-badge" style={{ marginBottom: '8px' }}>
            <div className="sidebar-engine-dot" />
            <span className="sidebar-engine-label">DronaHQ · Agent Engine</span>
            <Zap size={10} style={{ color: '#818CF8', marginLeft: 'auto' }} />
          </div>

          {/* User */}
          <div className="sidebar-user">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'Kriti Jasuja')}&background=4F46E5&color=fff&size=64&bold=true`}
              alt="User"
              className="sidebar-user-avatar"
            />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.user_metadata?.full_name || 'Kriti Jasuja'}</div>
              <div className="sidebar-user-team">Growth Team</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="sdr-main-wrapper">
        {isKilled && <KillBanner />}

        {/* Topbar */}
        <header className="sdr-topbar">
          {/* Search */}
          <div className="topbar-search">
            <Search size={14} color="var(--text-muted)" />
            <input type="text" placeholder="Search campaigns, prospects, agents…" />
            <span className="topbar-search-shortcut">⌘K</span>
          </div>

          <div className="topbar-right">
            {/* Live campaigns pill */}
            <div className={`topbar-live-pill ${liveCampaignCount > 0 ? 'has-live' : 'no-live'}`}>
              <div className={`topbar-live-dot ${liveCampaignCount > 0 ? 'pulsing' : ''}`} />
              {liveCampaignCount} Live
            </div>

            {/* Notifications */}
            <button className="topbar-icon-btn" title="Notifications">
              <Bell size={17} />
              {(conflictsCount + escalationsCount) > 0 && <span className="notification-dot" />}
            </button>

            {/* More / Emergency */}
            <div className="more-menu-wrapper">
              <button
                className="topbar-icon-btn"
                title="More options"
                onClick={() => setMoreMenuOpen(o => !o)}
              >
                <MoreHorizontal size={17} />
              </button>

              {moreMenuOpen && (
                <div className="more-menu-dropdown" onClick={() => setMoreMenuOpen(false)}>
                  <button className="more-menu-item" onClick={() => navigate('/settings')}>
                    <Settings size={14} />
                    Settings
                  </button>
                  <div className="more-menu-divider" />
                  <div className="emergency-panel">
                    <div className="emergency-panel-title">
                      <ShieldAlert size={10} style={{ display: 'inline', marginRight: 4 }} />
                      Emergency Controls
                    </div>
                    <button
                      type="button"
                      className="more-menu-item danger"
                      style={{ borderRadius: 6, padding: '8px 10px' }}
                      onClick={() => {
                        setMoreMenuOpen(false);
                        if (isKilled) {
                          toggleKillSwitch(false);
                        } else {
                          setShowKillConfirm(true);
                        }
                      }}
                    >
                      {isKilled
                        ? <><Play size={14} /> Resume all activity</>
                        : <><OctagonX size={14} /> Global kill switch</>
                      }
                    </button>
                    <button
                      type="button"
                      className="more-menu-item"
                      style={{ borderRadius: 6, padding: '8px 10px', fontSize: 12 }}
                      onClick={() => { setMoreMenuOpen(false); navigate('/agents'); }}
                    >
                      <PauseCircle size={14} />
                      Pause all agents
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="topbar-profile">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'Kriti Jasuja')}&background=4F46E5&color=fff&size=64&bold=true`}
                alt="Profile"
              />
              <div className="topbar-profile-info">
                <span className="topbar-profile-name">{user?.user_metadata?.full_name || 'Kriti Jasuja'}</span>
                <span className="topbar-profile-role">Growth Team</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="sdr-main">
          {children}
        </main>

        {/* Status bar */}
        <div className="sdr-statusbar">
          <div className="sdr-statusbar-left">
            <span className="statusbar-indicator">
              <div
                className="statusbar-dot"
                style={{ background: isKilled ? 'var(--danger)' : 'var(--success)' }}
              />
              {isKilled ? 'System Stopped' : 'System Normal'}
            </span>
            <span>Latency: {dailyCosts.avg_latency_ms || 0}ms</span>
            <span>Agent Runs: {dailyCosts.total_runs || 0}</span>
          </div>
          <div>
            Daily Spend: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              ${(dailyCosts.total_spend || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Kill switch confirm dialog */}
      {showKillConfirm && (
        <ConfirmDialog
          title="Stop all autonomous activity?"
          message="This will immediately halt ALL campaigns, agents, and outreach across every channel. No messages will be sent until you resume."
          confirmLabel="Stop everything"
          onConfirm={() => { toggleKillSwitch(true); setShowKillConfirm(false); }}
          onCancel={() => setShowKillConfirm(false)}
          variant="danger"
        />
      )}

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 48, right: 24, zIndex: 1000,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
