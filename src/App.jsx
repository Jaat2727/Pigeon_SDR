import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Apply from './pages/Apply';
import History from './pages/History';
import Profile from './pages/Profile';
import DashboardLayout from './layouts/DashboardLayout';
import './App.css';

function AuthenticatedApp({ user, onSignOut }) {
  return (
    <DashboardLayout user={user} onSignOut={onSignOut}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/apply" element={<Apply user={user} />} />
        <Route path="/history" element={<History user={user} />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
          <>
            <Route path="/*" element={<AuthenticatedApp user={user} onSignOut={handleSignOut} />} />
          </>
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
