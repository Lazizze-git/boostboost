import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Instagram, Linkedin, Music, Mail, MessageCircle, Globe, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import type { SupabaseProfile } from '../App'

type Mode = 'Soirée' | 'Pro' | 'Sport' | 'Discret'

const MODES: Mode[] = ['Soirée', 'Pro', 'Sport', 'Discret']

const MODE_COLORS: Record<Mode, string> = {
  'Soirée':  '#FF62D7',
  'Pro':     '#2495FF',
  'Sport':   '#A6FE5A',
  'Discret': '#FFCC00',
}

const MODE_TAGLINES: Record<Mode, string> = {
  'Soirée':  "Provoquez le hasard aujourd'hui. Une belle rencontre n'est qu'à un tap.",
  'Pro':     "Votre réseau professionnel, simplifié. Partagez votre expertise en un instant.",
  'Sport':   "Connectez-vous avec vos partenaires de sport. Trouvez votre prochain défi.",
  'Discret': "Partagez ce que vous voulez, quand vous le voulez. Discrétion totale.",
}

const LINK_SHORT: Record<string, string> = {
  instagram: 'Insta',
  linkedin:  'LinkedIn',
  spotify:   'Spotify',
  email:     'Email',
  snapchat:  'Snap',
  whatsapp:  'WhatsApp',
  portfolio: 'Portfolio',
}

const ICON_MAP: Record<string, LucideIcon> = {
  instagram: Instagram,
  linkedin:  Linkedin,
  spotify:   Music,
  email:     Mail,
  snapchat:  MessageCircle,
  whatsapp:  MessageCircle,
  portfolio: Globe,
}

interface SavedLink { id: string; title: string; url: string; icon: string; order: number }

interface ProfilePreviewProps {
  profile: SupabaseProfile
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55
}

export function ProfilePreview({ profile }: ProfilePreviewProps) {
  const navigate = useNavigate()
  const [activeMode, setActiveMode] = useState<Mode>((profile.active_mode as Mode) || 'Soirée')
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([])
  const [modesCount, setModesCount] = useState(0)

  useEffect(() => {
    supabase
      .from('links')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('mode', activeMode)
      .order('order')
      .then(({ data }) => setSavedLinks(data ?? []))
  }, [profile.id, activeMode])

  useEffect(() => {
    supabase
      .from('links')
      .select('mode')
      .eq('profile_id', profile.id)
      .then(({ data }) => {
        const modes = new Set((data ?? []).map((l: { mode: string }) => l.mode))
        setModesCount(modes.size)
      })
  }, [profile.id])

  const switchMode = async (mode: Mode) => {
    setActiveMode(mode)
    await supabase.from('profiles').update({ active_mode: mode }).eq('id', profile.id)
  }

  const bg       = MODE_COLORS[activeMode]
  const light    = isLight(bg)
  const t1       = light ? '#0A0A0A'               : '#FFFFFF'
  const t2       = light ? 'rgba(0,0,0,0.52)'      : 'rgba(255,255,255,0.65)'
  const t3       = light ? 'rgba(0,0,0,0.32)'      : 'rgba(255,255,255,0.40)'
  const sep      = light ? 'rgba(0,0,0,0.10)'      : 'rgba(255,255,255,0.18)'
  const cardBg   = light ? 'rgba(0,0,0,0.07)'      : 'rgba(255,255,255,0.18)'
  const cardBo   = light ? 'rgba(0,0,0,0.08)'      : 'rgba(255,255,255,0.10)'
  const pillBg   = light ? 'rgba(0,0,0,0.08)'      : 'rgba(255,255,255,0.18)'
  const pillBo   = light ? 'rgba(0,0,0,0.14)'      : 'rgba(255,255,255,0.20)'
  const activePillBg   = light ? '#0A0A0A' : '#FFFFFF'
  const activePillText = light ? '#FFFFFF'  : '#0A0A0A'
  const ctaBg    = light ? '#0A0A0A' : '#FFFFFF'
  const ctaText  = light ? '#FFFFFF'  : '#0A0A0A'

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{ backgroundColor: bg }}
    >
      <div className="px-5 pt-14 pb-32 space-y-6">

        {/* ─── Header ─── */}
        <header className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight" style={{ color: t1 }}>tap</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t1, opacity: 0.9 }} />
            <span className="text-sm" style={{ color: t2 }}>connecté</span>
          </div>
        </header>

        {/* ─── Mode actif ─── */}
        <section className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.20em]" style={{ color: t3 }}>
            Mode actif
          </p>
          <h1
            className="text-[5rem] font-black leading-[0.95] tracking-tight transition-colors duration-300"
            style={{ color: t1 }}
          >
            {activeMode}
          </h1>
          <p className="text-sm leading-relaxed pt-1" style={{ color: t2 }}>
            {MODE_TAGLINES[activeMode]}
          </p>

          {savedLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {savedLinks.map(link => (
                <span
                  key={link.id}
                  className="px-3.5 py-1.5 rounded-full text-sm"
                  style={{ backgroundColor: pillBg, border: `1px solid ${pillBo}`, color: t2 }}
                >
                  {LINK_SHORT[link.icon] ?? link.title}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ─── Separator ─── */}
        <div className="h-px" style={{ backgroundColor: sep }} />

        {/* ─── Dernier tap ─── */}
        <button className="w-full flex items-center gap-3 text-left active:opacity-60 transition-opacity">
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: pillBg }}
          >
            <span className="text-[10px] font-bold select-none" style={{ color: t3 }}>SR</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: t1 }}>Sarah Roux</p>
            <p className="text-xs" style={{ color: t3 }}>Dernier tap · il y a 2h</p>
          </div>
          <ChevronRight size={15} style={{ color: t3 }} className="flex-shrink-0" />
        </button>

        {/* ─── Separator ─── */}
        <div className="h-px" style={{ backgroundColor: sep }} />

        {/* ─── Changer de mode ─── */}
        <section className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.20em]" style={{ color: t3 }}>
            Changer de mode
          </p>
          <div className="flex gap-2 flex-wrap">
            {MODES.map(mode => (
              <button
                key={mode}
                onClick={() => switchMode(mode)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
                style={
                  activeMode === mode
                    ? { backgroundColor: activePillBg, color: activePillText }
                    : { backgroundColor: pillBg, border: `1px solid ${pillBo}`, color: t2 }
                }
              >
                {mode}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Stats ─── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '23',                               label: 'taps ce mois' },
            { value: '14',                               label: 'retours reçus' },
            { value: String(modesCount || MODES.length), label: 'modes actifs' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl p-4"
              style={{ backgroundColor: cardBg, border: `1px solid ${cardBo}` }}
            >
              <p className="text-[2rem] font-black leading-none mb-1.5" style={{ color: t1 }}>
                {stat.value}
              </p>
              <p className="text-[11px] leading-tight" style={{ color: t3 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Bracelet status ─── */}
        <div className="flex items-center justify-center gap-2">
          <BraceletIcon color={t3} />
          <span className="text-sm" style={{ color: t2 }}>Bracelet connecté · 87%</span>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t1, opacity: 0.7 }} />
        </div>

        {/* ─── Aperçu profil ─── */}
        <button
          onClick={() => navigate(`/p/${profile.username}`)}
          className="w-full h-[60px] rounded-full text-base font-semibold flex items-center justify-center active:scale-95 transition-all duration-200"
          style={{ backgroundColor: ctaBg, color: ctaText }}
        >
          Aperçu de mon profil
        </button>
      </div>
    </div>
  )
}

function BraceletIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="20" height="4" rx="2" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
      <path d="M7 14v3a5 5 0 0 0 10 0v-3" />
    </svg>
  )
}
