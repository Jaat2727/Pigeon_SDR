import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// State & Layout
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages — existing
import Login from './pages/Login';
import CampaignsList from './pages/CampaignsList';
import CampaignDashboard from './pages/CampaignDashboard';
import CreateCampaign from './pages/CreateCampaign';
import KnowledgeBase from './pages/KnowledgeBase';
import Prompts from './pages/Prompts';
import ProspectDetail from './pages/ProspectDetail';
import Prospects from './pages/Prospects';
import ReviewQueue from './pages/ReviewQueue';
import Settings from './pages/Settings';
import Conflicts from './pages/Conflicts';

// Pages — new
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Calls from './pages/Calls';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';

import './App.css';

function AuthenticatedApp({ user, onSignOut }) {
  return (
    <AppProvider>
      <DashboardLayout user={user} onSignOut={onSignOut}>
        <Routes>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Campaigns */}
          <Route path="/campaigns" element={<CampaignsList />} />
          <Route path="/campaigns/new" element={<CreateCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignDashboard />} />
          <Route path="/campaigns/:id/edit" element={<CreateCampaign />} />

          {/* Prospects */}
          <Route path="/prospects" element={<Prospects />} />
          <Route path="/prospects/:id" element={<ProspectDetail />} />

          {/* Agents */}
          <Route path="/agents" element={<Agents />} />

          {/* Calls */}
          <Route path="/calls" element={<Calls />} />

          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />

          {/* Integrations */}
          <Route path="/integrations" element={<Integrations />} />

          {/* Prompts */}
          <Route path="/prompts" element={<Prompts />} />

          {/* Review Queue / Approvals */}
          <Route path="/review-queue" element={<ReviewQueue />} />
          <Route path="/campaigns/approvals" element={<ReviewQueue />} />

          {/* Conflicts */}
          <Route path="/conflicts" element={<Conflicts />} />

          {/* Knowledge */}
          <Route path="/knowledge" element={<KnowledgeBase />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </AppProvider>
  );
}

function App() {
  // Default demo user — Aayush Sharma
  const [user, setUser] = useState({
    id: 'demo-user-kriti',
    email: 'kriti@pigeonsdr.com',
    user_metadata: { full_name: 'Aayush Sharma' },
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
        <span className="loading-text">Loading Pigeon SDR…</span>
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
