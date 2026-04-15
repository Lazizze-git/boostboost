import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronLeft, Instagram, Linkedin, Music, Mail,
  MessageCircle, Globe, Sparkles, Loader2
} from 'lucide-react'
import { Switch } from '../components/ui/switch'
import { supabase } from '../../lib/supabase'
import type { SupabaseProfile } from '../App'

interface ProfileEditorProps {
  onBack: () => void
  profile: SupabaseProfile
}

type Mode = 'Soirée' | 'Pro'

interface Link {
  id: string
  name: string
  icon: LucideIcon
  color: string
  handle: string
  enabled: boolean
}

interface ModeProfile {
  emoji: string
  color: string
  bio: string
  links: Link[]
}

const DEFAULT_PROFILES: Record<Mode, ModeProfile> = {
  'Soirée': {
    emoji: '🎉', color: '#C8506A',
    bio: 'DJ le weekend, dev la semaine',
    links: [
      { id: 'instagram', name: 'Instagram', icon: Instagram,     color: '#E1306C', handle: '@julien.moreau',       enabled: true },
      { id: 'snapchat',  name: 'Snapchat',  icon: MessageCircle, color: '#FFAA00', handle: 'julienm',              enabled: true },
      { id: 'spotify',   name: 'Spotify',   icon: Music,         color: '#1DB954', handle: 'Julien M',             enabled: true },
    ],
  },
  'Pro': {
    emoji: '💼', color: '#3A6DBF',
    bio: 'Full-stack developer · React & Node.js',
    links: [
      { id: 'linkedin',  name: 'LinkedIn',  icon: Linkedin,      color: '#0077B5', handle: 'julien-moreau',        enabled: true },
      { id: 'portfolio', name: 'Portfolio', icon: Globe,         color: '#6A4AB8', handle: 'julienmoreau.dev',     enabled: true },
      { id: 'email',     name: 'Email',     icon: Mail,          color: '#3A6DBF', handle: 'j.moreau@gmail.com',   enabled: true },
    ],
  },
}

const MODES: Mode[] = ['Soirée', 'Pro']

export function ProfileEditor({ onBack, profile: supabaseProfile }: ProfileEditorProps) {
  const [activeMode, setActiveMode] = useState<Mode>('Soirée')
  const [userName, setUserName]     = useState(supabaseProfile.display_name)
  const [profiles, setProfiles]     = useState<Record<Mode, ModeProfile>>(DEFAULT_PROFILES)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    const loadAllLinks = async () => {
      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', supabaseProfile.id)
        .order('order')

      const allLinks = data ?? []

      setProfiles(prev => {
        const updated = { ...prev }
        for (const mode of MODES) {
          const modeLinks = allLinks.filter(d => d.mode === mode)
          updated[mode] = {
            ...prev[mode],
            bio: (mode === 'Soirée' ? supabaseProfile.bio_soiree : supabaseProfile.bio_pro) || prev[mode].bio,
            links: prev[mode].links.map(link => {
              const saved = modeLinks.find(d => d.icon === link.id)
              return saved ? { ...link, handle: saved.url, enabled: true } : { ...link, enabled: false }
            }),
          }
        }
        return updated
      })
    }
    loadAllLinks()
  }, [supabaseProfile.id])

  const handleSave = async () => {
    setSaving(true)
    const activeProfile = profiles[activeMode]

    await supabase.from('profiles').update({
      display_name: userName,
      ...(activeMode === 'Soirée' ? { bio_soiree: activeProfile.bio } : { bio_pro: activeProfile.bio }),
    }).eq('id', supabaseProfile.id)

    await supabase.from('links').delete()
      .eq('profile_id', supabaseProfile.id)
      .eq('mode', activeMode)

    const linksToSave = activeProfile.links
      .filter(l => l.enabled)
      .map((l, i) => ({
        profile_id: supabaseProfile.id,
        title: l.name,
        url: l.handle,
        icon: l.id,
        mode: activeMode,
        order: i,
      }))

    if (linksToSave.length > 0) {
      await supabase.from('links').insert(linksToSave)
    }

    setSaving(false)
    onBack()
  }

  const profile = profiles[activeMode]

  const updateProfile = <K extends keyof ModeProfile>(key: K, value: ModeProfile[K]) => {
    setProfiles(prev => ({
      ...prev,
      [activeMode]: { ...prev[activeMode], [key]: value },
    }))
  }

  const toggleLink = (id: string) => {
    updateProfile('links', profile.links.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l))
  }

  const updateLinkHandle = (id: string, handle: string) => {
    updateProfile('links', profile.links.map(l => l.id === id ? { ...l, handle } : l))
  }

  return (
    <div className="min-h-screen bg-tap-bg">

      {/* ─── Sticky header ─── */}
      <div className="sticky top-0 z-20 bg-tap-bg/90 backdrop-blur-md border-b border-tap-border px-5 pt-12 pb-4 space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-tap-text-2 transition-all hover:text-tap-text-1 -ml-1"
        >
          <ChevronLeft size={16} />
          Retour
        </button>

        <div>
          <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest mb-1">
            Éditeur de profil
          </p>
          <h1 className="text-2xl font-bold text-tap-text-1 tracking-tight">
            Mode {activeMode}
          </h1>
        </div>

        {/* Mode tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5"
          style={{ scrollbarWidth: 'none' }}
        >
          {MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                activeMode === mode
                  ? 'bg-tap-text-1 text-black'
                  : 'bg-tap-surface text-tap-text-2 border border-tap-border'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Form ─── */}
      <div className="px-5 pt-6 pb-32 space-y-8 animate-fade-up">

        {/* Identity */}
        <section className="space-y-3">
          <SectionLabel icon={<Sparkles size={13} />} label="Identité" />
          <div className="bg-tap-surface rounded-2xl border border-tap-border p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-tap-text-3 font-medium">Nom</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ton nom"
                className="w-full bg-transparent border-0 border-b border-tap-border pb-2 text-xl font-bold text-tap-text-1 placeholder:text-tap-text-3 outline-none focus:border-tap-text-1 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-tap-text-3 font-medium">Bio du mode</label>
              <textarea
                value={profile.bio}
                onChange={(e) => updateProfile('bio', e.target.value)}
                placeholder="Décris-toi dans ce mode..."
                rows={2}
                className="w-full bg-transparent border-0 text-sm text-tap-text-2 placeholder:text-tap-text-3 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="space-y-3">
          <SectionLabel icon={<Globe size={13} />} label="Liens & Réseaux" />
          <div className="space-y-2">
            {profile.links.map((link) => {
              const Icon = link.icon
              return (
                <div
                  key={link.id}
                  className={`bg-tap-surface rounded-2xl border border-tap-border p-4 flex items-center gap-3 transition-all duration-200 ${
                    !link.enabled ? 'opacity-50' : ''
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${link.color}18` }}
                  >
                    <Icon size={17} style={{ color: link.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tap-text-1 mb-1">{link.name}</p>
                    <input
                      type="text"
                      value={link.handle}
                      onChange={(e) => updateLinkHandle(link.id, e.target.value)}
                      placeholder="Ton identifiant..."
                      className="w-full bg-tap-bg border border-tap-border rounded-lg px-2 py-1.5 text-xs text-tap-text-2 outline-none focus:border-tap-text-2 transition-colors placeholder:text-tap-text-3"
                    />
                  </div>
                  <Switch
                    checked={link.enabled}
                    onCheckedChange={() => toggleLink(link.id)}
                  />
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* ─── Fixed save button ─── */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-5 bg-tap-bg/90 backdrop-blur-md border-t border-tap-border">
        <div className="mx-auto" style={{ maxWidth: '430px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 rounded-2xl bg-tap-text-1 text-black text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Helper component ─── */

interface SectionLabelProps {
  icon: React.ReactNode
  label: string
}

function SectionLabel({ icon, label }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-tap-text-3">{icon}</span>
      <p className="text-xs font-semibold text-tap-text-3 uppercase tracking-widest">{label}</p>
    </div>
  )
}
