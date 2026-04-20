import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Instagram, Linkedin, Music, Mail,
  MessageCircle, Globe, Loader2, Plus, X
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { Switch } from '../components/ui/switch'
import { supabase } from '../../lib/supabase'
import type { SupabaseProfile } from '../App'

interface ProfileEditorProps {
  profile: SupabaseProfile
  onSaved: () => Promise<SupabaseProfile | undefined>
}

type Mode = 'Soirée' | 'Pro' | 'Sport' | 'Discret'

const MODES: Mode[] = ['Soirée', 'Pro', 'Sport', 'Discret']

interface Link {
  id: string
  name: string
  icon: LucideIcon
  color: string
  handle: string
  enabled: boolean
}

interface ModeProfile {
  bio: string
  links: Link[]
}

const ALL_LINKS: Omit<Link, 'handle' | 'enabled'>[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram,     color: '#E1306C' },
  { id: 'snapchat',  name: 'Snapchat',  icon: MessageCircle, color: '#FFAA00' },
  { id: 'spotify',   name: 'Spotify',   icon: Music,         color: '#1DB954' },
  { id: 'linkedin',  name: 'LinkedIn',  icon: Linkedin,      color: '#0077B5' },
  { id: 'portfolio', name: 'Portfolio', icon: Globe,         color: '#6A4AB8' },
  { id: 'email',     name: 'Email',     icon: Mail,          color: '#3A6DBF' },
  { id: 'whatsapp',  name: 'WhatsApp',  icon: MessageCircle, color: '#25D366' },
]

const DEFAULT_LINKS_BY_MODE: Record<Mode, string[]> = {
  'Soirée':  ['instagram', 'snapchat', 'spotify'],
  'Pro':     ['linkedin', 'portfolio', 'email'],
  'Sport':   ['instagram', 'spotify', 'whatsapp'],
  'Discret': ['instagram', 'linkedin'],
}

function buildDefaultLinks(mode: Mode): Link[] {
  const defaultIds = DEFAULT_LINKS_BY_MODE[mode]
  return ALL_LINKS.map(l => ({
    ...l,
    handle:  '',
    enabled: defaultIds.includes(l.id),
  }))
}

function buildDefaultProfiles(): Record<Mode, ModeProfile> {
  return {
    'Soirée':  { bio: '', links: buildDefaultLinks('Soirée') },
    'Pro':     { bio: '', links: buildDefaultLinks('Pro') },
    'Sport':   { bio: '', links: buildDefaultLinks('Sport') },
    'Discret': { bio: '', links: buildDefaultLinks('Discret') },
  }
}

export function ProfileEditor({ profile: supabaseProfile, onSaved }: ProfileEditorProps) {
  const navigate = useNavigate()
  const [activeMode, setActiveMode] = useState<Mode>('Soirée')
  const [profiles, setProfiles]     = useState<Record<Mode, ModeProfile>>(buildDefaultProfiles())
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', supabaseProfile.id)
        .order('order')

      const allLinks = data ?? []

      setProfiles(prev => {
        const updated = { ...prev }
        for (const mode of MODES) {
          const modeLinks = allLinks.filter((d: { mode: string }) => d.mode === mode)
          updated[mode] = {
            bio: (mode === 'Soirée' ? supabaseProfile.bio_soiree : supabaseProfile.bio_pro) || '',
            links: prev[mode].links.map(link => {
              const saved = modeLinks.find((d: { icon: string; url: string }) => d.icon === link.id)
              return saved ? { ...link, handle: saved.url, enabled: true } : { ...link, enabled: false }
            }),
          }
        }
        return updated
      })
    }
    load()
  }, [supabaseProfile.id])

  const handleSave = async () => {
    setSaving(true)
    const activeProfile = profiles[activeMode]

    await supabase.from('profiles').update({
      ...(activeMode === 'Soirée' ? { bio_soiree: activeProfile.bio } : {}),
      ...(activeMode === 'Pro'    ? { bio_pro:    activeProfile.bio } : {}),
    }).eq('id', supabaseProfile.id)

    await supabase.from('links').delete()
      .eq('profile_id', supabaseProfile.id)
      .eq('mode', activeMode)

    const linksToSave = activeProfile.links
      .filter(l => l.enabled && l.handle.trim())
      .map((l, i) => ({
        profile_id: supabaseProfile.id,
        title:      l.name,
        url:        l.handle,
        icon:       l.id,
        mode:       activeMode,
        order:      i,
      }))

    if (linksToSave.length > 0) {
      await supabase.from('links').insert(linksToSave)
    }

    await onSaved()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const profile      = profiles[activeMode]
  const initials     = supabaseProfile.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const enabledCount = profile.links.filter(l => l.enabled).length

  const updateBio = (bio: string) => {
    setProfiles(prev => ({ ...prev, [activeMode]: { ...prev[activeMode], bio } }))
  }

  const toggleLink = (id: string) => {
    setProfiles(prev => ({
      ...prev,
      [activeMode]: {
        ...prev[activeMode],
        links: prev[activeMode].links.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l),
      },
    }))
  }

  const updateHandle = (id: string, handle: string) => {
    setProfiles(prev => ({
      ...prev,
      [activeMode]: {
        ...prev[activeMode],
        links: prev[activeMode].links.map(l => l.id === id ? { ...l, handle } : l),
      },
    }))
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0]">

      {/* ─── Header ─── */}
      <div className="sticky top-0 z-20 bg-[#F5F4F0]/95 backdrop-blur-md px-5 pt-12 pb-4 space-y-4">

        {/* Top row: title + aperçu */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.20em]">
              Mes modes
            </p>
            <h1 className="text-xl font-black text-[#1C1410] tracking-tight mt-0.5">
              {activeMode}
            </h1>
          </div>
          <button
            onClick={() => navigate(`/p/${supabaseProfile.username}`)}
            className="px-4 py-2 rounded-full border border-[rgba(28,20,16,0.15)] text-sm font-semibold text-[rgba(28,20,16,0.60)] hover:border-[rgba(28,20,16,0.30)] transition-colors active:scale-95"
          >
            Aperçu
          </button>
        </div>

        {/* Profile identity row */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(28,20,16,0.10)] flex items-center justify-center text-sm font-black text-[rgba(28,20,16,0.40)] flex-shrink-0 select-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1C1410] leading-tight">{supabaseProfile.display_name}</p>
            <p className="text-xs text-[rgba(28,20,16,0.35)] truncate">
              {profile.bio || 'Ajouter une bio pour ce mode…'}
            </p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(28,20,16,0.06)] flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C95470] animate-pulse-dot" />
            <span className="text-[10px] font-semibold text-[rgba(28,20,16,0.50)]">{activeMode}</span>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1" style={{ scrollbarWidth: 'none' }}>
          {MODES.map(mode => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
                activeMode === mode
                  ? 'bg-[#1C1410] text-white'
                  : 'bg-white border border-[rgba(28,20,16,0.12)] text-[rgba(28,20,16,0.55)]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="px-5 pt-4 pb-36 space-y-5">

        {/* ─── Liens visibles ─── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.20em]">
              Liens visibles
            </p>
            <span className="text-[11px] text-[rgba(28,20,16,0.35)]">
              {enabledCount} actif{enabledCount > 1 ? 's' : ''}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[rgba(28,20,16,0.07)] overflow-hidden divide-y divide-[rgba(28,20,16,0.06)]">
            {profile.links.map(link => {
              const Icon = link.icon
              return (
                <div
                  key={link.id}
                  className={`flex items-center gap-3.5 px-4 py-4 transition-opacity ${!link.enabled ? 'opacity-35' : ''}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${link.color}15`, color: link.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1C1410] leading-tight">{link.name}</p>
                    {link.enabled ? (
                      <input
                        type="text"
                        value={link.handle}
                        onChange={e => updateHandle(link.id, e.target.value)}
                        placeholder="Ton identifiant…"
                        className="w-full text-xs text-[rgba(28,20,16,0.40)] bg-transparent outline-none placeholder:text-[rgba(28,20,16,0.22)] mt-0.5"
                      />
                    ) : (
                      <p className="text-xs text-[rgba(28,20,16,0.22)] mt-0.5">Non activé</p>
                    )}
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

        {/* ─── Bio ─── */}
        <section className="space-y-2">
          <p className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.20em] px-0.5">
            Bio du mode
          </p>
          <div className="bg-white rounded-2xl border border-[rgba(28,20,16,0.07)] p-4">
            <textarea
              value={profile.bio}
              onChange={e => updateBio(e.target.value)}
              placeholder={`Décris-toi en mode ${activeMode}…`}
              rows={3}
              className="w-full bg-transparent text-sm text-[#1C1410] placeholder:text-[rgba(28,20,16,0.25)] outline-none resize-none leading-relaxed"
            />
          </div>
        </section>

        {/* ─── Photos ─── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.20em]">
              Photos
            </p>
            <p className="text-[11px] text-[rgba(28,20,16,0.35)]">visible sur profil</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['portrait', 'event', 'coffee'] as const).map(label => (
              <div
                key={label}
                className="aspect-square rounded-2xl bg-white border border-[rgba(28,20,16,0.07)] flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #1C1410 0, #1C1410 1px, transparent 0, transparent 50%)',
                    backgroundSize: '12px 12px',
                  }}
                />
                <button className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[rgba(28,20,16,0.10)] flex items-center justify-center">
                  <X size={10} className="text-[rgba(28,20,16,0.50)]" />
                </button>
                <p className="text-[10px] text-[rgba(28,20,16,0.25)] font-medium relative z-10">{label}</p>
              </div>
            ))}
            <div className="aspect-square rounded-2xl border border-dashed border-[rgba(28,20,16,0.15)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/60 transition-colors active:scale-95">
              <Plus size={18} className="text-[rgba(28,20,16,0.25)]" />
              <p className="text-[10px] text-[rgba(28,20,16,0.30)] font-medium">Ajouter</p>
            </div>
          </div>
          <p className="text-[11px] text-[rgba(28,20,16,0.30)] px-0.5">
            Max 6 photos · Visible en mode {activeMode}
          </p>
        </section>
      </div>

      {/* ─── Fixed save button (above tab bar) ─── */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full bottom-[64px] px-5 py-4 pointer-events-none"
        style={{
          maxWidth: '430px',
          background: 'linear-gradient(to top, #F5F4F0 60%, transparent)',
        }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-[56px] rounded-full text-white text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 pointer-events-auto"
          style={{
            backgroundColor: saved ? '#2D8A5A' : '#1C1410',
            transition: 'background-color 0.3s ease',
          }}
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Enregistrement…' : saved ? 'Enregistré ✓' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
