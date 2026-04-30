import { useState, useEffect } from 'react'
import { Loader2, LogOut, Link2Off, Copy, Check, Upload, X } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { supabase } from '../../lib/supabase'
import type { SupabaseProfile } from '../App'

interface SettingsProps {
  profile: SupabaseProfile
  onUpdated: () => Promise<SupabaseProfile | undefined>
}

export function Settings({ profile, onUpdated }: SettingsProps) {
  const [username, setUsername]       = useState(profile.username)
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [saved, setSaved]             = useState(false)
  const [linkedTapId, setLinkedTapId] = useState<string | null>(null)
  const [unlinking, setUnlinking]     = useState(false)
  const [copied, setCopied]           = useState(false)
  const [avatarUrl, setAvatarUrl]     = useState(profile.avatar_url)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const profileUrl = `https://boostboost.vercel.app/p/${profile.username}`

  useEffect(() => {
    supabase
      .from('bracelets')
      .select('tap_id')
      .eq('profile_id', profile.id)
      .maybeSingle()
      .then(({ data }) => setLinkedTapId(data?.tap_id ?? null))
  }, [profile.id])

  const handleUnlink = async () => {
    if (!linkedTapId) return
    setUnlinking(true)
    await supabase
      .from('bracelets')
      .update({ profile_id: null, linked_at: null })
      .eq('tap_id', linkedTapId)
    setLinkedTapId(null)
    setUnlinking(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    try {
      // Compresser l'image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      })

      // Upload dans Supabase Storage
      const fileName = `${profile.id}-${Date.now()}.jpg`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedFile, { upsert: false })

      if (uploadError) throw uploadError

      // Générer l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Sauvegarder l'URL dans le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrlData.publicUrl)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'upload'
      setError(message)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return

    setAvatarUploading(true)
    try {
      // Supprimer l'URL du profil
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id)

      if (error) throw error

      setAvatarUrl(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(message)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (clean.length < 3) {
      setError("Le nom d'utilisateur doit faire au moins 3 caractères.")
      setLoading(false)
      return
    }

    if (clean !== profile.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', clean)
        .maybeSingle()

      if (existing) {
        setError("Ce nom d'utilisateur est déjà pris.")
        setLoading(false)
        return
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: clean, display_name: displayName || clean })
      .eq('id', profile.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    await onUpdated()
    setSaved(true)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0]">

      {/* ─── Header ─── */}
      <div className="px-5 pt-14 pb-6">
        <p className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.20em] mb-1">
          Compte
        </p>
        <h1 className="text-[2rem] font-black text-[#1C1410] tracking-tight leading-tight">
          Réglages
        </h1>
      </div>

      <div className="px-5 pb-32 space-y-5">

        {/* ─── Photo de profil ─── */}
        <section className="space-y-2">
          <p className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.20em] px-0.5">
            Photo de profil
          </p>
          <div className="bg-white rounded-2xl border border-[rgba(28,20,16,0.07)] overflow-hidden">
            <div className="px-4 py-6 flex flex-col items-center gap-4">
              {/* Avatar actuel */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border border-[rgba(28,20,16,0.10)]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[rgba(28,20,16,0.06)] flex items-center justify-center text-sm text-[rgba(28,20,16,0.30)]">
                  {profile.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}

              {/* Upload ou Supprimer */}
              <div className="w-full flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={(e) => (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)?.click()}
                    disabled={avatarUploading}
                    className="w-full h-11 rounded-full bg-[#1C1410] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                  >
                    {avatarUploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {avatarUploading ? 'Upload...' : 'Changer la photo'}
                  </button>
                </label>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading}
                    className="w-11 h-11 rounded-full bg-[rgba(28,20,16,0.06)] text-red-500 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 hover:bg-[rgba(28,20,16,0.10)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Mon lien profil ─── */}
        <section className="space-y-2">
          <p className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.20em] px-0.5">
            Mon lien profil
          </p>
          <div className="bg-white rounded-2xl border border-[rgba(28,20,16,0.07)] px-4 py-4 flex items-center gap-3">
            <p className="flex-1 text-sm font-mono text-[rgba(28,20,16,0.55)] truncate">{profileUrl}</p>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-[rgba(28,20,16,0.06)] flex items-center justify-center transition-all active:scale-95"
            >
              {copied
                ? <Check size={15} className="text-[#2D8A5A]" />
                : <Copy size={15} className="text-[rgba(28,20,16,0.50)]" />
              }
            </button>
          </div>
        </section>

        {/* ─── Profil ─── */}
        <section className="space-y-2">
          <p className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.20em] px-0.5">
            Profil public
          </p>
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[rgba(28,20,16,0.07)] overflow-hidden divide-y divide-[rgba(28,20,16,0.06)]">

            <div className="px-4 py-4 space-y-1">
              <label className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.15em]">
                Nom d'affichage
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ton nom"
                className="w-full bg-transparent text-sm font-semibold text-[#1C1410] outline-none placeholder:text-[rgba(28,20,16,0.25)] mt-1"
              />
            </div>

            <div className="px-4 py-4 space-y-1">
              <label className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.15em]">
                Nom d'utilisateur
              </label>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-[rgba(28,20,16,0.30)]">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  className="flex-1 bg-transparent text-sm font-semibold text-[#1C1410] outline-none placeholder:text-[rgba(28,20,16,0.25)]"
                />
              </div>
            </div>

            {error && (
              <div className="px-4 py-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="px-4 py-4">
              <button
                type="submit"
                disabled={loading || username.length < 3}
                className="w-full h-12 rounded-full bg-[#1C1410] text-white text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </section>

        {saved && (
          <p className="text-sm text-center text-[#2D8A5A] font-medium">Modifications enregistrées !</p>
        )}

        {/* ─── Bracelet ─── */}
        <section className="space-y-2">
          <p className="text-[11px] font-bold text-[rgba(28,20,16,0.35)] uppercase tracking-[0.20em] px-0.5">
            Bracelet NFC
          </p>
          <div className="bg-white rounded-2xl border border-[rgba(28,20,16,0.07)] overflow-hidden">
            {linkedTapId ? (
              <div className="divide-y divide-[rgba(28,20,16,0.06)]">
                <div className="px-4 py-4">
                  <p className="text-sm font-semibold text-[#1C1410]">Bracelet lié</p>
                  <p className="text-xs text-[rgba(28,20,16,0.35)] font-mono mt-1">{linkedTapId}</p>
                </div>
                <div className="px-4 py-4">
                  <button
                    onClick={handleUnlink}
                    disabled={unlinking}
                    className="w-full h-11 rounded-full border border-[rgba(28,20,16,0.12)] text-red-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 hover:border-red-200"
                  >
                    {unlinking ? <Loader2 size={14} className="animate-spin" /> : <Link2Off size={14} />}
                    Délier le bracelet
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-5">
                <p className="text-sm text-[rgba(28,20,16,0.40)]">Aucun bracelet lié à ce compte.</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── Déconnexion ─── */}
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-full border border-[rgba(28,20,16,0.12)] bg-white text-red-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 hover:border-red-200"
        >
          <LogOut size={15} />
          Se déconnecter
        </button>

      </div>
    </div>
  )
}
