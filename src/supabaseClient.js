import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http')
)

let client = null

if (isSupabaseConfigured) {
  client = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.info(
    '%c[Supabase] Note:%c Running in local UI demo mode. To connect to real Supabase, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
    'color: #8b5cf6; font-weight: bold;',
    'color: inherit;'
  )

  // Demo fallback client so the UI never crashes without .env configured
  client = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async ({ email }) => {
        // Simulate brief delay
        await new Promise((resolve) => setTimeout(resolve, 600))
        return {
          data: {
            user: { id: 'demo-user-123', email },
            session: { access_token: 'demo-token' }
          },
          error: null
        }
      },
      signUp: async ({ email, options }) => {
        await new Promise((resolve) => setTimeout(resolve, 600))
        return {
          data: {
            user: { id: 'demo-user-123', email, user_metadata: options?.data },
            session: { access_token: 'demo-token' }
          },
          error: null
        }
      },
      signInWithOAuth: async ({ provider }) => {
        await new Promise((resolve) => setTimeout(resolve, 400))
        alert(`Demo OAuth: Sign-in with ${provider} triggered. Configure .env with your Supabase credentials to enable real OAuth.`)
        return { data: null, error: null }
      },
      signOut: async () => ({ error: null }),
    },
    isDemoMode: true
  }
}

export const supabase = client
