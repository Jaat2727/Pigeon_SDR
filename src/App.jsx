import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// State & Layout
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import CampaignsList from './pages/CampaignsList';
import CampaignDashboard from './pages/CampaignDashboard';
import CreateCampaign from './pages/CreateCampaign';

import './App.css';

// Placeholder for unbuilt pages
function PlaceholderPage({ title, description }) {
  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{description}</p>
        </div>
      </div>
      <div className="card">
        <div className="card__body" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--text-muted)' }}>
          This module is part of the next build phase.
        </div>
      </div>
    </div>
  );
}

function AuthenticatedApp({ user, onSignOut }) {
  return (
    <AppProvider>
      <DashboardLayout user={user} onSignOut={onSignOut}>
        <Routes>
          {/* Campaigns */}
          <Route path="/campaigns" element={<CampaignsList />} />
          <Route path="/campaigns/new" element={<CreateCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignDashboard />} />
          <Route path="/campaigns/:id/edit" element={<CreateCampaign />} />
          
          {/* Prospects */}
          <Route path="/prospects" element={<PlaceholderPage title="Prospects" description="Browse, filter and manage your outreach prospect lists." />} />
          <Route path="/prospects/:id" element={<PlaceholderPage title="Prospect Detail" description="Timeline and knowledge used for this prospect." />} />
          
          {/* Other Modules */}
          <Route path="/prompts" element={<PlaceholderPage title="Prompt Versions" description="Configure reasoning prompts, personalization templates, and reply logic." />} />
          <Route path="/conflicts" element={<PlaceholderPage title="Conflicts" description="Review domain warmup issues, DMARC warnings, and sending conflicts." />} />
          <Route path="/knowledge" element={<PlaceholderPage title="Knowledge Base" description="Manage product docs, case studies, and context fed to AI agents." />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" description="Manage reps, channels, guardrails, and platform costs." />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/campaigns" replace />} />
        </Routes>
      </DashboardLayout>
    </AppProvider>
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
