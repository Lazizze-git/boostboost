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
  bio_sport: string | null
  bio_discret: string | null
  active_mode: string | null
  avatar_url: string | null
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

const COLOR_MAP: Record<string, string> = {
  instagram: '#E1306C',
  linkedin:  '#0077B5',
  spotify:   '#1DB954',
  email:     '#3A6DBF',
  snapchat:  '#FFAA00',
  whatsapp:  '#25D366',
  portfolio: '#6A4AB8',
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
  const bio = ({
    'Pro':     profile.bio_pro,
    'Sport':   profile.bio_sport,
    'Discret': profile.bio_discret,
  } as Record<string, string | null>)[activeMode] ?? profile.bio_soiree

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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col relative overflow-hidden">

      {/* ─── Background image ─── */}
      {profile.avatar_url && (
        <div
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${profile.avatar_url})` }}
        />
      )}

      {/* ─── Gradient overlay ─── */}
      <div
        className="absolute inset-0"
        style={{
          background: profile.avatar_url
            ? 'linear-gradient(to bottom, transparent 15%, rgba(10,10,10,0.4) 45%, rgba(10,10,10,0.85) 70%, #0A0A0A 88%)'
            : 'linear-gradient(to bottom, transparent, #0A0A0A)',
        }}
      />

      {/* ─── Back button ─── */}
      {window.history.length > 1 && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-12 left-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white transition-all active:scale-90 hover:bg-white/20"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* ─── Content ─── */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-5 pb-8 pt-16">

        {/* Name + username + bio */}
        <div className="space-y-4 mb-6 animate-slide-up">
          <div className="space-y-2">
            <h1 className="text-[2.8rem] font-black text-white leading-[1.1] tracking-tight">
              {profile.display_name}
            </h1>
            <p className="text-sm text-white/60">@{profile.username}</p>
            {bio && (
              <p className="text-base text-white/80 leading-relaxed max-w-sm">
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* ─── CTA buttons ─── */}
        <div className="flex gap-3 mb-6 animate-slide-up [animation-delay:80ms]">
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

        {/* ─── Links ─── */}
        {links.length > 0 && (
          <div className="space-y-2 animate-slide-up [animation-delay:240ms]">
            <p className="text-[11px] font-bold text-white/35 uppercase tracking-[0.22em]">
              Retrouve-moi sur
            </p>
            {links.map((link, index) => {
              const icon  = ICON_MAP[link.icon] ?? <Globe size={18} />
              const color = COLOR_MAP[link.icon] ?? '#FFFFFF'

              return (
                <a
                  key={link.id}
                  href={safeHref(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 py-3 border-b border-white/10 transition-opacity active:opacity-60 group"
                >
                  <span className="text-[11px] font-bold text-white/25 w-4 flex-shrink-0 text-center">
                    {index + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-tight">{link.title}</p>
                    <p className="text-xs text-white/40 truncate mt-0.5">{link.url}</p>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        <p className="text-center text-[10px] font-semibold text-white/25 uppercase tracking-[0.28em] pt-4">
          propulsé par TAP
        </p>
      </div>
    </div>
  )
}
