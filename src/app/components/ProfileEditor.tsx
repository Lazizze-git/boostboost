import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronLeft, Plus, X, Instagram, Linkedin, Music, Mail,
  MessageCircle, Globe, Camera, Trash2, Sparkles, Image as ImageIcon, Loader2
} from 'lucide-react'
import { Switch } from '../components/ui/switch'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { supabase } from '../../lib/supabase'
import type { SupabaseProfile } from '../App'

interface ProfileEditorProps {
  onBack: () => void
  profile: SupabaseProfile
}

type Mode = 'Soirée' | 'Pro' | 'Sport' | 'Discret'

interface Prompt {
  question: string
  answer: string
}

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
  photos: string[]
  prompts: Prompt[]
  links: Link[]
}

const AVAILABLE_PROMPTS = [
  'Mon truc préféré du moment 🔥',
  'Ce qui me rend unique ✨',
  'Mon spot secret 📍',
  'Ma passion secrète 💫',
  'Ce que je cherche 🎯',
  'Mon meilleur conseil 💡',
  'Je suis fier(e) de 🏆',
  'Mon défi actuel 🚀',
]

const DEFAULT_PROFILES: Record<Mode, ModeProfile> = {
  'Soirée': {
    emoji: '🎉', color: '#C8506A',
    bio: 'DJ le weekend, dev la semaine',
    photos: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    ],
    prompts: [
      { question: 'Mon truc préféré du moment 🔥', answer: 'Mixer des sets électro dans les bars underground' },
      { question: 'Ce qui me rend unique ✨', answer: 'Je code le jour, je mixe la nuit 🎧' },
    ],
    links: [
      { id: 'instagram', name: 'Instagram', icon: Instagram,     color: '#E1306C', handle: '@julien.moreau',       enabled: true },
      { id: 'snapchat',  name: 'Snapchat',  icon: MessageCircle, color: '#FFAA00', handle: 'julienm',              enabled: true },
      { id: 'spotify',   name: 'Spotify',   icon: Music,         color: '#1DB954', handle: 'Julien M',             enabled: true },
    ],
  },
  'Pro': {
    emoji: '💼', color: '#3A6DBF',
    bio: 'Full-stack developer · React & Node.js',
    photos: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'],
    prompts: [
      { question: 'Ce que je cherche 🎯', answer: 'Collaborations tech et opportunités de networking' },
    ],
    links: [
      { id: 'linkedin',  name: 'LinkedIn',  icon: Linkedin,      color: '#0077B5', handle: 'julien-moreau',        enabled: true },
      { id: 'portfolio', name: 'Portfolio', icon: Globe,         color: '#6A4AB8', handle: 'julienmoreau.dev',     enabled: true },
      { id: 'email',     name: 'Email',     icon: Mail,          color: '#3A6DBF', handle: 'j.moreau@gmail.com',   enabled: true },
    ],
  },
  'Sport': {
    emoji: '⚡', color: '#2A8A5A',
    bio: 'Runner · Cycliste · Outdoor enthusiast',
    photos: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'],
    prompts: [
      { question: 'Mon défi actuel 🚀', answer: 'Préparer mon premier marathon en moins de 4h' },
    ],
    links: [
      { id: 'whatsapp',  name: 'WhatsApp',  icon: MessageCircle, color: '#25D366', handle: '+33 6 12 34 56 78',    enabled: true },
      { id: 'email',     name: 'Email',     icon: Mail,          color: '#3A6DBF', handle: 'j.moreau@gmail.com',   enabled: true },
    ],
  },
  'Discret': {
    emoji: '🔒', color: '#6A4AB8',
    bio: 'Contact minimal',
    photos: [],
    prompts: [],
    links: [
      { id: 'email', name: 'Email', icon: Mail, color: '#3A6DBF', handle: 'j.moreau@gmail.com', enabled: true },
    ],
  },
}

const MODES: Mode[] = ['Soirée', 'Pro', 'Sport', 'Discret']

export function ProfileEditor({ onBack, profile: supabaseProfile }: ProfileEditorProps) {
  const [activeMode, setActiveMode] = useState<Mode>('Soirée')
  const [userName, setUserName]     = useState(supabaseProfile.display_name)
  const [profiles, setProfiles]     = useState<Record<Mode, ModeProfile>>(DEFAULT_PROFILES)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    const loadLinks = async () => {
      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', supabaseProfile.id)
        .order('order')

      if (!data || data.length === 0) return

      setProfiles(prev => ({
        ...prev,
        [activeMode]: {
          ...prev[activeMode],
          links: prev[activeMode].links.map(link => {
            const saved = data.find(d => d.icon === link.id)
            return saved ? { ...link, handle: saved.url, enabled: true } : { ...link, enabled: false }
          }),
        },
      }))
    }
    loadLinks()
  }, [supabaseProfile.id])

  const handleSave = async () => {
    setSaving(true)
    const activeProfile = profiles[activeMode]

    // 1. Met à jour le profil
    await supabase.from('profiles').update({
      display_name: userName,
    }).eq('id', supabaseProfile.id)

    // 2. Supprime les anciens liens
    await supabase.from('links').delete().eq('profile_id', supabaseProfile.id)

    // 3. Insère les nouveaux liens (uniquement ceux activés)
    const linksToSave = activeProfile.links
      .filter(l => l.enabled)
      .map((l, i) => ({
        profile_id: supabaseProfile.id,
        title: l.name,
        url: l.handle,
        icon: l.id,
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

  const addPhoto = () => {
    if (profile.photos.length >= 6) return
    updateProfile('photos', [
      ...profile.photos,
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
    ])
  }

  const removePhoto = (index: number) => {
    updateProfile('photos', profile.photos.filter((_, i) => i !== index))
  }

  const addPrompt = () => {
    if (profile.prompts.length >= 5) return
    const newPrompts: Prompt[] = [...profile.prompts, { question: AVAILABLE_PROMPTS[0], answer: '' }]
    updateProfile('prompts', newPrompts)
  }

  const updatePrompt = (index: number, field: keyof Prompt, value: string) => {
    const updated = profile.prompts.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    updateProfile('prompts', updated)
  }

  const removePrompt = (index: number) => {
    updateProfile('prompts', profile.prompts.filter((_, i) => i !== index))
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

        {/* Photos */}
        <section className="space-y-3">
          <SectionLabel icon={<ImageIcon size={13} />} label={`Photos · ${profile.photos.length}/6`} />
          <div className="grid grid-cols-3 gap-2.5">
            {profile.photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-2xl overflow-hidden bg-tap-surface border border-tap-border group"
              >
                <ImageWithFallback
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => removePhoto(index)}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}

            {profile.photos.length < 6 && (
              <button
                onClick={addPhoto}
                className="aspect-square rounded-2xl border-2 border-dashed border-tap-border flex flex-col items-center justify-center gap-1.5 transition-all hover:border-tap-text-2"
              >
                <Camera size={20} className="text-tap-text-3" />
                <span className="text-xs text-tap-text-3 font-medium">Ajouter</span>
              </button>
            )}
          </div>
        </section>

        {/* Prompts */}
        <section className="space-y-3">
          <SectionLabel icon={<Sparkles size={13} />} label={`Prompts · ${profile.prompts.length}/5`} />
          <div className="space-y-3">
            {profile.prompts.map((prompt, index) => (
              <div
                key={index}
                className="bg-tap-surface rounded-2xl border border-tap-border p-5 space-y-3 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: profile.color }} />
                <div className="flex items-start justify-between gap-3 pl-3">
                  <select
                    value={prompt.question}
                    onChange={(e) => updatePrompt(index, 'question', e.target.value)}
                    className="flex-1 bg-transparent text-sm font-semibold text-tap-text-1 outline-none cursor-pointer"
                  >
                    {AVAILABLE_PROMPTS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removePrompt(index)}
                    className="w-7 h-7 rounded-lg bg-tap-bg flex items-center justify-center text-tap-text-3 hover:text-tap-text-1 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <textarea
                  value={prompt.answer}
                  onChange={(e) => updatePrompt(index, 'answer', e.target.value)}
                  placeholder="Ta réponse ici..."
                  rows={2}
                  className="w-full bg-tap-bg rounded-xl px-3 py-2.5 text-sm text-tap-text-2 placeholder:text-tap-text-3 outline-none resize-none border border-tap-border focus:border-tap-text-2 transition-colors leading-relaxed"
                />
              </div>
            ))}

            {profile.prompts.length < 5 && (
              <button
                onClick={addPrompt}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-tap-border flex items-center justify-center gap-2 text-sm font-medium text-tap-text-2 transition-all hover:border-tap-text-2 hover:text-tap-text-1"
              >
                <Plus size={16} />
                Ajouter un prompt
              </button>
            )}
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
