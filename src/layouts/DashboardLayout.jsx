import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  Users, 
  MessageSquareText, 
  AlertTriangle, 
  BookOpen, 
  Settings, 
  Activity,
  ChevronRight
} from 'lucide-react';
import pigeonLogo from '../logo.png';
import './DashboardLayout.css';

const navItems = [
  { name: 'Campaigns', path: '/dashboard', icon: Megaphone, badge: 5 },
  { name: 'Prospects', path: '/prospects', icon: Users, badge: 847 },
  { name: 'Prompts', path: '/prompts', icon: MessageSquareText, badge: null },
  { name: 'Conflicts', path: '/conflicts', icon: AlertTriangle, badge: 2, badgeType: 'danger' },
  { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen, badge: null },
  { name: 'Settings', path: '/settings', icon: Settings, badge: null },
];

export default function DashboardLayout({ children, user, onSignOut }) {
  const [theme] = useState('dark');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="sdr-app">
      {/* ── Sidebar ── */}
      <aside className="sdr-sidebar">
        {/* Brand */}
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
          <div className="brand-icon-wrap">
            <img src={pigeonLogo} alt="Pigeon SDR" className="brand-logo-img" />
          </div>
          <span className="brand-name">Pigeon SDR</span>
        </div>

        {/* Nav Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} className="nav-item-icon" />
                <span className="nav-item-label">{item.name}</span>
                {item.badge !== null && (
                  <span className={`nav-badge ${item.badgeType === 'danger' ? 'badge-danger' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Agent Engine Status */}
        <div className="agent-engine-card">
          <div className="engine-header">
            <span className="engine-label">AGENT ENGINE</span>
            <span className="engine-status-pill">ACTIVE</span>
          </div>
          <div className="engine-metric">
            <Activity size={14} className="engine-metric-icon" />
            <span>94.8% success rate</span>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <main className="sdr-main">
        {children}
      </main>
    </div>
  );
}
