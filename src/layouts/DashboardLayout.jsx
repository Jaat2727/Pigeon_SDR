import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Users,
  MessageSquareText,
  AlertTriangle,
  BookOpen,
  Settings,
  OctagonX,
  Play,
  Search,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, ConfirmDialog, KillBanner } from '../components/index.jsx';
import pigeonLogo from '../logo.png';
import './DashboardLayout.css';

const NAV_ITEMS = [
  { section: 'MENU', items: [
    { name: 'Campaigns',      path: '/campaigns',  icon: Megaphone,        badgeKey: 'campaigns' },
    { name: 'Prospects',      path: '/prospects',   icon: Users,            badgeKey: 'prospects' },
    { name: 'Prompts',        path: '/prompts',     icon: MessageSquareText, badgeKey: null },
  ]},
  { section: 'SYSTEM', items: [
    { name: 'Review Queue',   path: '/review-queue', icon: AlertTriangle,    badgeKey: 'review' },
    { name: 'Conflicts',      path: '/conflicts',   icon: AlertTriangle,    badgeKey: 'conflicts' },
    { name: 'Knowledge',      path: '/knowledge',   icon: BookOpen,         badgeKey: null },
  ]},
  { section: 'TOOLS', items: [
    { name: 'Settings',       path: '/settings',    icon: Settings,         badgeKey: null },
  ]}
];

export default function DashboardLayout({ children, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isKilled, toggleKillSwitch,
    campaigns, conflictsCount,
  } = useApp();

  const [showKillConfirm, setShowKillConfirm] = useState(false);

  const handleKillSwitch = () => {
    if (isKilled) {
      toggleKillSwitch(false);
    } else {
      setShowKillConfirm(true);
    }
  };

  const getBadge = (key) => {
    switch (key) {
      case 'campaigns': return campaigns.length || null;
      case 'conflicts': return conflictsCount || null;
      case 'review': return 2; /* Mocked count for now */
      default: return null;
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const pageTitle = NAV_ITEMS.flatMap(g => g.items).find(i => location.pathname.startsWith(i.path))?.name || 'Dashboard';

  return (
    <div className="sdr-shell">
      {/* ── Sidebar ── */}
      <aside className="sdr-sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/campaigns')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo">
            <img src={pigeonLogo} alt="Logo" />
          </div>
          <span className="sidebar-wordmark">PigeonSDR</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((group, idx) => (
            <div key={idx}>
              <div className="nav-section-label">{group.section}</div>
              {group.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const badge = getBadge(item.badgeKey);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <item.icon size={20} className="nav-item-icon" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="nav-item-label">{item.name}</span>
                    {badge !== null && (
                      <Badge count={badge} variant={isActive ? 'neutral' : (item.badgeKey === 'conflicts' ? 'danger' : 'neutral')} />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

      </aside>


      {/* ── Main Area (includes Topbar) ── */}
      <div className="sdr-main-wrapper">
        {isKilled && <KillBanner />}

        <header className="sdr-topbar">
          <div className="topbar-right" style={{ marginLeft: 'auto' }}>
            <div className="topbar-search">
              <Search size={16} color="var(--text-muted)" />
              <input type="text" placeholder="Search here..." />
            </div>
            
            <button
              type="button"
              className={`btn ${isKilled ? 'btn--danger-solid' : 'btn--danger-outline'}`}
              onClick={handleKillSwitch}
              style={{ borderRadius: '999px', padding: '8px 16px', marginLeft: '8px' }}
            >
              {isKilled ? (
                <><Play size={14} /> Activity stopped, resume</>
              ) : (
                <><OctagonX size={14} /> Stop all activity</>
              )}
            </button>

            <button className="topbar-icon-btn">
              <Bell size={20} />
            </button>
            <div className="topbar-profile">
              <img src={`https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || 'User'}&background=05CD99&color=fff`} alt="Profile" />
              <div className="topbar-profile-info">
                <span className="topbar-profile-name">{user?.user_metadata?.full_name || 'Nishu'}</span>
                <span className="topbar-profile-role">Admin SDR</span>
              </div>
            </div>
          </div>
        </header>

        <main className="sdr-main">
          {children}
        </main>
      </div>

      {showKillConfirm && (
        <ConfirmDialog
          title="Stop all activity?"
          message="This will immediately pause ALL campaigns, agents and outreach across every channel. No messages will be sent until you resume."
          confirmLabel="Stop everything"
          onConfirm={() => { toggleKillSwitch(true); setShowKillConfirm(false); }}
          onCancel={() => setShowKillConfirm(false)}
          variant="danger"
        />
      )}
    </div>
  );
}
