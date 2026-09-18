import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe?.()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span className="loading-text">Loading Login UI...</span>
      </div>
    )
  }

  // If user is signed in, show a simple connected confirmation card with Sign Out
  if (user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-primary, #0c0f14)',
        color: 'var(--text-primary, #e8eaed)',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            animation: 'bounce 1s infinite alternate'
          }}>🎉</div>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.75rem',
            marginBottom: '0.5rem'
          }}>Signed In Successfully!</h2>
          <p style={{ color: 'var(--text-secondary, #848d97)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Logged in as <strong>{user.email || 'Demo User'}</strong>
          </p>

          <button
            onClick={handleSignOut}
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '10px',
              border: 'none',
              background: '#8b5cf6',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Sign Out to return to Login
          </button>
        </div>
      </div>
    )
  }

  // Render the Login page UI
  return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
}

export default App
