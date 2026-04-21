import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Instagram, Linkedin, Music, Mail, MessageCircle, Globe, Loader2, UserPlus, Share2, ChevronLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  bio_soiree: string | null
  bio_pro: string | null
  active_mode: string | null
}

interface Link {
  id: string
  title: string
  url: string
  icon: string
  order: number
}

const ICON_MAP: Record<string, React.ReactNode> = {
  instagram: <Instagram  size={18} />,
  linkedin:  <Linkedin   size={18} />,
  spotify:   <Music      size={18} />,
  email:     <Mail       size={18} />,
  snapchat:  <MessageCircle size={18} />,
  whatsapp:  <MessageCircle size={18} />,
  portfolio: <Globe      size={18} />,
}

const ICON_LETTER: Record<string, string> = {
  instagram: 'I',
  linkedin:  'Li',
  spotify:   'S',
  email:     'E',
  snapchat:  'Sc',
  whatsapp:  'W',
  portfolio: 'P',
}

const MODE_COLORS: Record<string, string> = {
  'Soirée':  '#C95470',
  'Pro':     '#4B6DC7',
  'Sport':   '#2D8A5A',
  'Discret': '#7C5ABF',
}

function safeHref(url: string): string {
  if (!url) return '#'
  if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) return url
  if (url.includes('@') && !url.includes('/') && !url.includes(' ')) return `mailto:${url}`
  return `https://${url}`
}

function downloadVCard(profile: Profile, links: Link[], bio: string | null) {
  const email     = links.find(l => l.icon === 'email')?.url
  const portfolio = links.find(l => l.icon === 'portfolio')?.url
  const profileUrl = `${window.location.origin}/p/${profile.username}`

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.display_name}`,
    `NICKNAME:${profile.username}`,
    bio ? `NOTE;CHARSET=UTF-8:${bio}` : '',
    email ? `EMAIL:${email}` : '',
    portfolio ? `URL;TYPE=PORTFOLIO:${safeHref(portfolio)}` : '',
    `URL;TYPE=PROFILE:${profileUrl}`,
    'END:VCARD',
  ].filter(Boolean).join('\r\n')

  const blob = new Blob([lines], { type: 'text/vcard;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${profile.username}.vcf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [links, setLinks]       = useState<Link[]>([])
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [contactSaved, setContactSaved] = useState(false)

  useEffect(() => {
    if (!username) return
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', (username ?? '').trim())
      .maybeSingle()

    if (!profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(profileData)

    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', profileData.id)
      .eq('mode', profileData.active_mode || 'Soirée')
      .order('order')

    setLinks(linksData ?? [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <Loader2 size={28} className="text-white/30 animate-spin" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-5xl font-black text-white/10">404</p>
        <h1 className="text-xl font-bold text-white">Profil introuvable</h1>
        <p className="text-sm text-white/40">@{username} n'existe pas.</p>
      </div>
    )
  }

  const initials   = profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const activeMode = profile.active_mode || 'Soirée'
  const modeColor  = MODE_COLORS[activeMode] ?? '#C95470'
  const bio        = activeMode === 'Pro' ? profile.bio_pro : profile.bio_soiree

  const handleContact = () => {
    downloadVCard(profile, links, bio ?? null)
    setContactSaved(true)
    setTimeout(() => setContactSaved(false), 3000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: profile.display_name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">

      {/* ─── Back button ─── */}
      {window.history.length > 1 && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-12 left-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white transition-all active:scale-90 hover:bg-white/20"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* ─── Photo hero ─── */}
      <div className="relative h-[52vh] bg-[#111111] overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${modeColor}18 0%, transparent 70%)`,
          }}
        >
          <div className="text-center space-y-3">
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-black"
              style={{ background: `${modeColor}20`, color: `${modeColor}80` }}
            >
              {initials}
            </div>
            <p className="text-[11px] text-white/15 uppercase tracking-[0.25em] font-medium px-8 leading-relaxed">
              photo de profil · portrait · fashion · soiree
            </p>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }}
        />
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 px-5 pt-6 pb-10 space-y-6 animate-slide-up">

        {/* Name + username */}
        <div className="space-y-1">
          <h1 className="text-[2.4rem] font-black text-white leading-[1.05] tracking-tight">
            {profile.display_name}
          </h1>
          <p className="text-sm text-white/40">@{profile.username}</p>
        </div>

        {/* ─── CTA buttons ─── */}
        <div className="flex gap-3">
          <button
            onClick={handleContact}
            className="flex-1 h-12 rounded-full border border-white/25 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 hover:border-white/50"
            style={contactSaved ? { borderColor: '#2D8A5A', color: '#2D8A5A' } : {}}
          >
            <UserPlus size={16} strokeWidth={2} />
            {contactSaved ? 'Contact enregistré !' : '+ Ajouter à mes contacts'}
          </button>
          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full border border-white/25 text-white flex items-center justify-center flex-shrink-0 transition-all active:scale-95 hover:border-white/50"
          >
            <Share2 size={15} />
          </button>
        </div>

        {/* ─── Mode badge ─── */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{ borderColor: `${modeColor}30`, backgroundColor: `${modeColor}10` }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: modeColor }} />
            <span className="text-[11px] font-semibold" style={{ color: modeColor }}>
              Mode {activeMode}
            </span>
          </div>
        </div>

        {/* ─── Bio ─── */}
        {bio && (
          <p className="text-[14px] text-white/60 leading-relaxed">
            {bio}
          </p>
        )}

        {/* ─── Links ─── */}
        {links.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-white/25 uppercase tracking-[0.22em]">
              Retrouve-moi sur
            </p>
            {links.map((link, index) => {
              const icon  = ICON_MAP[link.icon] ?? <Globe size={18} />
              const letter = ICON_LETTER[link.icon] ?? link.title[0]

              return (
                <a
                  key={link.id}
                  href={safeHref(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 py-4 border-b border-white/06 transition-opacity active:opacity-60 group"
                >
                  <span className="text-[11px] font-bold text-white/20 w-4 flex-shrink-0 text-center">
                    {index + 1}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white/08 flex items-center justify-center flex-shrink-0 text-white/50 group-hover:bg-white/12 transition-colors">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white leading-tight">{link.title}</p>
                    <p className="text-[12px] text-white/35 truncate mt-0.5">{link.url}</p>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {links.length === 0 && (
          <div className="rounded-2xl border border-white/08 p-8 text-center bg-white/04">
            <p className="text-sm text-white/25">Aucun lien pour l'instant.</p>
          </div>
        )}

        <p className="text-center text-[10px] font-semibold text-white/15 uppercase tracking-[0.28em] pt-2">
          propulsé par TAP
        </p>
      </div>
    </div>
  )
}
