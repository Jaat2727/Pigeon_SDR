import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  LayoutDashboard, 
  FilePlus, 
  ClipboardList, 
  User, 
  Sun, 
  Moon, 
  LogOut, 
  Mail, 
  Home 
} from 'lucide-react';
import pigeonLogo from '../logo.png';
import './DashboardLayout.css';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Apply / Compose', path: '/apply', icon: FilePlus },
  { name: 'History', path: '/history', icon: ClipboardList },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function DashboardLayout({ children, user, onSignOut }) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('pigeon-theme') || 'dark');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pigeon-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@pigeonsdr.com');
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const userInitial = (user?.email || 'Nishu User').substring(0, 2).toUpperCase();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Nishu';

  return (
    <div className={`pigeon-layout theme-${theme}`}>
      {/* ── Top Header / Navbar ── */}
      <header className="pigeon-navbar">
        <div className="navbar-brand-section">
          <button 
            type="button" 
            className="navbar-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle menu"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="brand-badge" onClick={() => navigate('/dashboard')}>
            <img src={pigeonLogo} alt="Pigeon SDR Logo" className="brand-logo" />
            <div className="brand-text">
              <span className="brand-title">Pigeon SDR</span>
              <span className="brand-subtitle">Automation Suite</span>
            </div>
          </div>
        </div>

        <div className="navbar-spacer" />

        <div className="navbar-actions">
          {copyFeedback && <span className="copy-toast-badge">Copied support@pigeonsdr.com!</span>}
          
          <button 
            type="button" 
            className="nav-icon-btn" 
            onClick={handleCopyEmail}
            title="Contact Support"
          >
            <Mail size={18} />
          </button>

          <button 
            type="button" 
            className="nav-icon-btn" 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            type="button" 
            className="nav-signout-btn" 
            onClick={onSignOut}
            title="Sign Out"
          >
            <LogOut size={16} />
            <span className="btn-label">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Container: Sidebar + Content ── */}
      <div className="pigeon-body">
        {/* Sidebar */}
        <aside className={`pigeon-sidebar ${collapsed ? 'collapsed' : ''}`}>
          {/* Quick Action / Compose */}
          <div className="sidebar-action-wrap">
            <NavLink 
              to="/apply" 
              className={({ isActive }) => `sidebar-compose-btn ${isActive ? 'active' : ''}`}
              title={collapsed ? 'New Application / Bill' : undefined}
            >
              <FilePlus size={19} className="compose-icon" />
              {!collapsed && <span>New Bill / Draft</span>}
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <NavLink 
                  key={item.path} 
                  to={item.path}
                  className={`sidebar-nav-item ${active ? 'active' : ''}`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon size={19} className="nav-icon" />
                  {!collapsed && <span className="nav-label">{item.name}</span>}
                  {!collapsed && active && <div className="active-pill" />}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar User Footer */}
          <div className="sidebar-footer">
            <div className="sidebar-user-card" onClick={() => navigate('/profile')}>
              <div className="user-avatar">{userInitial}</div>
              {!collapsed && (
                <div className="user-details">
                  <span className="user-name">{userName}</span>
                  <span className="user-role">{user?.email || 'Verified Account'}</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="pigeon-main-content">
          <div className="content-inner">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="pigeon-bottom-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/apply" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
          <FilePlus size={20} />
          <span>New</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
          <ClipboardList size={20} />
          <span>History</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
