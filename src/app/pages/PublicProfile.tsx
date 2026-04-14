import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { ExternalLink, Instagram, Linkedin, Music, Mail, MessageCircle, Globe, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
}

interface Link {
  id: string
  title: string
  url: string
  icon: string
  order: number
}

const ICON_MAP: Record<string, React.ReactNode> = {
  instagram:  <Instagram  size={18} />,
  linkedin:   <Linkedin   size={18} />,
  spotify:    <Music      size={18} />,
  email:      <Mail       size={18} />,
  snapchat:   <MessageCircle size={18} />,
  whatsapp:   <MessageCircle size={18} />,
  portfolio:  <Globe      size={18} />,
}

const COLOR_MAP: Record<string, string> = {
  instagram:  '#E1306C',
  linkedin:   '#0077B5',
  spotify:    '#1DB954',
  email:      '#3A6DBF',
  snapchat:   '#FFAA00',
  whatsapp:   '#25D366',
  portfolio:  '#6A4AB8',
}

export function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks]     = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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
      .order('order')

    setLinks(linksData ?? [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-tap-bg flex items-center justify-center">
        <Loader2 size={28} className="text-tap-text-3 animate-spin" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-tap-bg flex flex-col items-center justify-center gap-3">
        <p className="text-5xl">🔍</p>
        <h1 className="text-xl font-bold text-tap-text-1">Profil introuvable</h1>
        <p className="text-sm text-tap-text-2">@{username} n'existe pas.</p>
      </div>
    )
  }

  const initials = profile.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-tap-bg">
      <div className="mx-auto pb-16" style={{ maxWidth: '430px' }}>

        {/* Hero */}
        <div className="px-6 pt-16 pb-8 text-center animate-fade-up">
          <div className="w-20 h-20 rounded-2xl bg-tap-surface border border-tap-border flex items-center justify-center text-2xl font-bold text-tap-text-1 mx-auto mb-4">
            {initials}
          </div>
          <h1 className="text-2xl font-bold text-tap-text-1 mb-1">
            {profile.display_name}
          </h1>
          <p className="text-sm text-tap-text-3 mb-1">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-tap-text-2 mt-3 leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Links */}
        {links.length > 0 ? (
          <div className="px-5 space-y-3 animate-fade-up [animation-delay:80ms]">
            <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest px-1">
              Liens
            </p>
            <div className="space-y-2">
              {links.map(link => {
                const color = COLOR_MAP[link.icon] ?? '#FFFFFF'
                const icon  = ICON_MAP[link.icon]  ?? <Globe size={18} />
                return (
                  <a
                    key={link.id}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-tap-surface rounded-2xl border border-tap-border p-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-tap-text-1">{link.title}</p>
                      <p className="text-xs text-tap-text-3 truncate">{link.url}</p>
                    </div>
                    <ExternalLink size={14} className="text-tap-text-3 flex-shrink-0" />
                  </a>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="px-5 text-center py-8">
            <p className="text-sm text-tap-text-3">Aucun lien pour l'instant.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-10">
          <p className="text-xs text-tap-text-3/50 uppercase tracking-widest">
            propulsé par TAP
          </p>
        </div>

      </div>
    </div>
  )
}
