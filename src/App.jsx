import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Apply from './pages/Apply';
import History from './pages/History';
import Profile from './pages/Profile';
import DashboardLayout from './layouts/DashboardLayout';
import './App.css';

function PlaceholderPage({ title, description }) {
  return (
    <div style={{
      padding: '32px',
      maxWidth: '800px',
    }}>
      <h1 style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '24px',
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: '8px',
      }}>{title}</h1>
      <p style={{
        fontSize: '14px',
        color: '#64748b',
        marginBottom: '32px',
      }}>{description}</p>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '60px 32px',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '14px',
      }}>
        This section is coming soon. Configuration panel will appear here.
      </div>
    </div>
  );
}

function AuthenticatedApp({ user, onSignOut }) {
  return (
    <DashboardLayout user={user} onSignOut={onSignOut}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/apply" element={<Apply user={user} />} />
        <Route path="/prospects" element={<PlaceholderPage title="Prospect Database" description="Browse, filter and manage your outreach prospect lists." />} />
        <Route path="/prompts" element={<PlaceholderPage title="AI Prompt Templates" description="Configure reasoning prompts, personalization templates, and reply logic." />} />
        <Route path="/conflicts" element={<PlaceholderPage title="Conflict Resolution" description="Review domain warmup issues, DMARC warnings, and sending conflicts." />} />
        <Route path="/knowledge" element={<PlaceholderPage title="Knowledge Base" description="Manage product docs, case studies, and context fed to AI agents." />} />
        <Route path="/settings" element={<Profile user={user} />} />
        <Route path="/history" element={<History user={user} />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

function App() {
  // Default demo user — login state is true for UI development
  const [user, setUser] = useState({
    id: 'demo-user-123',
    email: 'nishu@iitm.ac.in',
    user_metadata: { full_name: 'Nishu User' }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span className="loading-text">Loading Pigeon SDR...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {user ? (
          <Route path="/*" element={<AuthenticatedApp user={user} onSignOut={handleSignOut} />} />
        ) : (
          <>
            <Route path="/login" element={<Login onLoginSuccess={(u) => setUser(u)} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
