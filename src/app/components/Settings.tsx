import { useState, useEffect } from 'react'
import { Loader2, Wifi, LogOut, Link2Off } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { SupabaseProfile } from '../App'

interface SettingsProps {
  profile: SupabaseProfile
  onUpdated: () => Promise<SupabaseProfile | undefined>
  onReconfigure: () => void
}

export function Settings({ profile, onUpdated, onReconfigure }: SettingsProps) {
  const [username, setUsername]       = useState(profile.username)
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [saved, setSaved]             = useState(false)
  const [usernameChanged, setUsernameChanged] = useState(false)
  const [linkedTapId, setLinkedTapId] = useState<string | null>(null)
  const [unlinking, setUnlinking]     = useState(false)

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
        setError('Ce nom d\'utilisateur est déjà pris.')
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
    setUsernameChanged(clean !== profile.username)
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
              <p className="text-[11px] text-[rgba(28,20,16,0.30)] mt-1">
                Profil public :{' '}
                <span className="font-mono">/p/{username || 'username'}</span>
              </p>
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

        {/* ─── Alerte username changé ─── */}
        {saved && usernameChanged && (
          <div className="bg-white rounded-2xl border border-[rgba(28,20,16,0.07)] p-5 space-y-3">
            <p className="text-sm font-bold text-[#1C1410]">Ton username a changé</p>
            <p className="text-sm text-[rgba(28,20,16,0.50)] leading-relaxed">
              Ton lien NFC pointe encore vers l'ancienne URL. Reprogramme ton bracelet pour qu'il fonctionne.
            </p>
            <button
              onClick={onReconfigure}
              className="w-full h-11 rounded-full bg-[#1C1410] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Wifi size={15} />
              Reconfigurer le bracelet
            </button>
          </div>
        )}

        {saved && !usernameChanged && (
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
                <div className="px-4 py-4 flex gap-2">
                  <button
                    onClick={handleUnlink}
                    disabled={unlinking}
                    className="flex-1 h-11 rounded-full border border-[rgba(28,20,16,0.12)] text-red-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 hover:border-red-200"
                  >
                    {unlinking ? <Loader2 size={14} className="animate-spin" /> : <Link2Off size={14} />}
                    Délier
                  </button>
                  <button
                    onClick={onReconfigure}
                    className="flex-1 h-11 rounded-full bg-[rgba(28,20,16,0.06)] text-[rgba(28,20,16,0.70)] text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-[rgba(28,20,16,0.10)]"
                  >
                    <Wifi size={14} />
                    Reconfigurer
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
