import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Auth } from './components/Auth'
import { ProfileSetup } from './components/ProfileSetup'
import { ProfileEditor } from './components/ProfileEditor'
import { ProfilePreview } from './components/ProfilePreview'
import { BraceletSetup } from './components/BraceletSetup'

export interface SupabaseProfile {
  id: string
  user_id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string | null
}

type View = 'setup' | 'preview' | 'editor'

function App() {
  const [session, setSession]         = useState<Session | null>(null)
  const [profile, setProfile]         = useState<SupabaseProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('preview')

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Charge le profil quand la session est disponible
  useEffect(() => {
    if (!session) return
    fetchProfile()
  }, [session])

  const fetchProfile = async () => {
    if (!session) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()
    setProfile(data)
  }

  const handleReconfigure = () => {
    localStorage.removeItem('tap-bracelet-configured')
    localStorage.removeItem('tap-bracelet-url')
    setCurrentView('setup')
  }

  // Chargement initial
  if (authLoading) {
    return (
      <div className="min-h-screen bg-tap-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-tap-text-3 border-t-tap-text-1 animate-spin" />
      </div>
    )
  }

  // Non connecté
  if (!session) return <Auth />

  // Connecté mais pas de profil encore
  if (!profile) {
    return <ProfileSetup user={session.user} onComplete={fetchProfile} />
  }

  // Connecté + profil OK
  return (
    <div className="min-h-screen bg-tap-bg font-sans">
      <div className="mx-auto" style={{ maxWidth: '430px' }}>
        {currentView === 'setup' ? (
          <BraceletSetup
            onComplete={() => setCurrentView('preview')}
            onSkip={() => setCurrentView('preview')}
            username={profile.username}
          />
        ) : currentView === 'preview' ? (
          <ProfilePreview
            profile={profile}
            onEdit={() => setCurrentView('editor')}
            onReconfigure={handleReconfigure}
          />
        ) : (
          <ProfileEditor
            profile={profile}
            onBack={() => { fetchProfile(); setCurrentView('preview') }}
          />
        )}
      </div>
    </div>
  )
}

export default App
