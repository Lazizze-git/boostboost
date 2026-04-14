import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Instagram, Linkedin, Music, Mail, MessageCircle, Globe, Wifi, ArrowRight, Share2, Pencil } from 'lucide-react'

type Mode = 'Soirée' | 'Pro' | 'Sport' | 'Discret'

interface ModeConfig {
  emoji: string
  color: string
  bio: string
}

const MODES: Record<Mode, ModeConfig> = {
  'Soirée':  { emoji: '🎉', color: '#C8506A', bio: 'DJ le weekend, dev la semaine 🎧' },
  'Pro':     { emoji: '💼', color: '#3A6DBF', bio: 'Full-stack developer · React & Node.js' },
  'Sport':   { emoji: '⚡', color: '#2A8A5A', bio: 'Runner · Cycliste · Outdoor enthusiast' },
  'Discret': { emoji: '🔒', color: '#6A4AB8', bio: 'Contact minimal' },
}

interface Platform {
  id: string
  name: string
  icon: LucideIcon
  color: string
  handle: string
  modes: Mode[]
}

const PLATFORMS: Platform[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram,      color: '#E1306C', handle: '@julien.moreau',       modes: ['Soirée'] },
  { id: 'snapchat',  name: 'Snapchat',  icon: MessageCircle,  color: '#FFAA00', handle: 'julienm',              modes: ['Soirée'] },
  { id: 'spotify',   name: 'Spotify',   icon: Music,          color: '#1DB954', handle: 'Julien M',             modes: ['Soirée', 'Sport'] },
  { id: 'linkedin',  name: 'LinkedIn',  icon: Linkedin,       color: '#0077B5', handle: 'julien-moreau',        modes: ['Pro'] },
  { id: 'portfolio', name: 'Portfolio', icon: Globe,          color: '#6A4AB8', handle: 'julienmoreau.dev',     modes: ['Pro'] },
  { id: 'email',     name: 'Email',     icon: Mail,           color: '#3A6DBF', handle: 'j.moreau@gmail.com',   modes: ['Pro', 'Sport', 'Discret'] },
  { id: 'whatsapp',  name: 'WhatsApp',  icon: MessageCircle,  color: '#25D366', handle: '+33 6 12 34 56 78',    modes: ['Sport'] },
]

interface ProfilePreviewProps {
  onEdit: () => void
  onReconfigure?: () => void
}

export function ProfilePreview({ onEdit, onReconfigure }: ProfilePreviewProps) {
  const [activeMode, setActiveMode]               = useState<Mode>('Soirée')
  const [isBraceletConfigured, setIsBraceletConfigured] = useState(false)

  useEffect(() => {
    const configured = localStorage.getItem('tap-bracelet-configured') === 'true'
    setIsBraceletConfigured(configured)
  }, [])

  const modeKeys    = Object.keys(MODES) as Mode[]
  const config      = MODES[activeMode]
  const activePlatforms = PLATFORMS.filter(p => p.modes.includes(activeMode))

  return (
    <div className="min-h-screen bg-tap-bg relative overflow-hidden">

      {/* ─── Unexpected element: oversized mode watermark ─── */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none"
        aria-hidden
      >
        <p className="text-[32vw] font-black uppercase leading-none text-black/[0.035] -ml-1 transition-all duration-500">
          {activeMode}
        </p>
      </div>

      <div className="relative z-10 px-5 pt-14 pb-28 space-y-7">

        {/* ─── Header ─── */}
        <header className="animate-fade-up">
          <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest mb-2">
            Profil TAP
          </p>
          <h1 className="text-[2.6rem] font-bold text-tap-text-1 leading-tight tracking-tight">
            Salut,<br />Julien 👋
          </h1>
        </header>

        {/* ─── Mode selector ─── */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 animate-fade-up [animation-delay:80ms]"
          style={{ scrollbarWidth: 'none' }}
        >
          {modeKeys.map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                activeMode === mode
                  ? 'bg-tap-text-1 text-white'
                  : 'bg-tap-surface text-tap-text-2 border border-tap-border hover:-translate-y-0.5'
              }`}
            >
              <span>{MODES[mode].emoji}</span>
              {mode}
            </button>
          ))}
        </div>

        {/* ─── Profile card ─── */}
        <div className="bg-tap-surface rounded-3xl border border-tap-border overflow-hidden animate-fade-up [animation-delay:120ms]">
          {/* Accent line */}
          <div className="h-0.5 w-full" style={{ backgroundColor: config.color }} />

          <div className="p-6 space-y-5">
            {/* Identity */}
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: `${config.color}18` }}
              >
                {config.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-tap-text-1 tracking-tight mb-1">
                  Julien Moreau
                </h2>
                <p className="text-sm text-tap-text-2 leading-relaxed">
                  {config.bio}
                </p>
              </div>
            </div>

            {/* Mode badge */}
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs font-medium" style={{ color: config.color }}>
                Mode {activeMode} actif
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-tap-text-1 text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                <Pencil size={13} />
                Modifier
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-tap-bg text-tap-text-1 text-sm font-semibold border border-tap-border transition-all duration-200 hover:-translate-y-0.5 active:scale-95">
                <Share2 size={13} />
                Partager
              </button>
            </div>
          </div>
        </div>

        {/* ─── Bracelet status ─── */}
        <div className="bg-tap-surface rounded-2xl border border-tap-border p-5 flex items-center justify-between animate-fade-up [animation-delay:160ms]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tap-bg flex items-center justify-center">
              <Wifi size={18} className="text-tap-text-3" />
            </div>
            <div>
              <p className="text-sm font-medium text-tap-text-1">
                {isBraceletConfigured ? 'Bracelet configuré' : 'Bracelet non configuré'}
              </p>
              <p className="text-xs text-tap-text-3 mt-0.5">
                {isBraceletConfigured ? 'Prêt à partager · 87%' : 'Synchronise ton profil'}
              </p>
            </div>
          </div>

          {!isBraceletConfigured && onReconfigure ? (
            <button
              onClick={onReconfigure}
              className="px-4 py-2 rounded-xl bg-tap-text-1 text-white text-xs font-semibold transition-all active:scale-95"
            >
              Configurer
            </button>
          ) : (
            <span className="w-2 h-2 rounded-full bg-tap-success" />
          )}
        </div>

        {/* ─── Social links ─── */}
        <div className="animate-fade-up [animation-delay:200ms] space-y-3">
          <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest">
            Liens actifs · {activePlatforms.length}
          </p>

          <div className="space-y-2">
            {activePlatforms.map((platform) => {
              const Icon = platform.icon
              return (
                <div
                  key={platform.id}
                  className="bg-tap-surface rounded-2xl border border-tap-border p-4 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${platform.color}15` }}
                  >
                    <Icon size={17} style={{ color: platform.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tap-text-1">{platform.name}</p>
                    <p className="text-xs text-tap-text-3 truncate">{platform.handle}</p>
                  </div>
                  <ArrowRight size={14} className="text-tap-text-3 flex-shrink-0" />
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="text-center pt-2">
          <p className="text-xs font-medium text-tap-text-3/60 uppercase tracking-[0.2em]">
            propulsé par TAP
          </p>
        </div>
      </div>
    </div>
  )
}
