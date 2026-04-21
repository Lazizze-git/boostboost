import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Home, Layers, Settings as SettingsIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Auth } from './components/Auth'
import { ProfileSetup } from './components/ProfileSetup'
import { ProfileEditor } from './components/ProfileEditor'
import { ProfilePreview } from './components/ProfilePreview'
import { BraceletSetup } from './components/BraceletSetup'
import { Settings } from './components/Settings'

export interface SupabaseProfile {
  id: string
  user_id: string
  username: string
  display_name: string
  bio: string
  bio_soiree: string | null
  bio_pro: string | null
  bio_sport: string | null
  bio_discret: string | null
  active_mode: string
  avatar_url: string | null
}

type Tab = 'preview' | 'editor' | 'settings'
type View = Tab | 'setup'

const TABS: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: 'preview',  label: 'Accueil', Icon: Home },
  { id: 'editor',   label: 'Modes',   Icon: Layers },
  { id: 'settings', label: 'Réglages', Icon: SettingsIcon },
]

function App() {
  const [session, setSession]         = useState<Session | null>(null)
  const [profile, setProfile]         = useState<SupabaseProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('preview')

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
    return data
  }

  useEffect(() => {
    if (!session || !profile) return
    const pendingTapId = localStorage.getItem('tap-pending-link')
    if (!pendingTapId) return
    localStorage.removeItem('tap-pending-link')
    supabase
      .from('bracelets')
      .update({ profile_id: profile.id, linked_at: new Date().toISOString() })
      .eq('tap_id', pendingTapId.trim())
      .then(() => {})
  }, [session, profile])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(28,20,16,0.12)] border-t-[#1C1410] animate-spin" />
      </div>
    )
  }

  if (!session) return <Auth />

  if (!profile) {
    return <ProfileSetup user={session.user} onComplete={fetchProfile} />
  }

  const isTabView = currentView !== 'setup'

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="mx-auto relative" style={{ maxWidth: '430px' }}>

        {/* ─── Screens ─── */}
        {currentView === 'setup' ? (
          <BraceletSetup
            onComplete={() => setCurrentView('preview')}
            onSkip={() => setCurrentView('preview')}
            username={profile.username}
          />
        ) : currentView === 'preview' ? (
          <ProfilePreview profile={profile} />
        ) : currentView === 'editor' ? (
          <ProfileEditor
            profile={profile}
            onSaved={fetchProfile}
          />
        ) : (
          <Settings
            profile={profile}
            onUpdated={fetchProfile}
            onReconfigure={() => setCurrentView('setup')}
          />
        )}

        {/* ─── Bottom tab bar ─── */}
        {isTabView && (
          <nav
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex items-stretch bg-white border-t border-[rgba(28,20,16,0.07)]"
            style={{
              maxWidth: '430px',
              paddingBottom: 'env(safe-area-inset-bottom)',
              boxShadow: '0 -4px 24px rgba(28,20,16,0.06)',
            }}
          >
            {TABS.map(({ id, label, Icon }) => {
              const active = currentView === id
              return (
                <button
                  key={id}
                  onClick={() => setCurrentView(id)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-150 active:scale-95"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={active ? 'text-[#1C1410]' : 'text-[rgba(28,20,16,0.30)]'}
                  />
                  <span
                    className={`text-[10px] font-semibold tracking-wide transition-colors ${
                      active ? 'text-[#1C1410]' : 'text-[rgba(28,20,16,0.30)]'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </nav>
        )}
      </div>
    </div>
  )
}

export default App
