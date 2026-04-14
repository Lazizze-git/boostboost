import { useState, useEffect } from 'react'
import { ChevronLeft, Loader2, Wifi } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { SupabaseProfile } from '../App'

interface SettingsProps {
  profile: SupabaseProfile
  onBack: () => void
  onUpdated: () => Promise<void>
  onReconfigure: () => void
}

export function Settings({ profile, onBack, onUpdated, onReconfigure }: SettingsProps) {
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
      setError('Le nom d\'utilisateur doit faire au moins 3 caractères.')
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
    <div className="min-h-screen bg-tap-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-tap-bg/90 backdrop-blur-md border-b border-tap-border px-5 pt-12 pb-4 space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-tap-text-2 transition-all hover:text-tap-text-1 -ml-1"
        >
          <ChevronLeft size={16} />
          Retour
        </button>
        <h1 className="text-2xl font-bold text-tap-text-1 tracking-tight">Paramètres</h1>
      </div>

      <div className="px-5 pt-6 pb-16 space-y-6 animate-fade-up">

        {/* Profil */}
        <section className="space-y-2">
          <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest px-1">Profil</p>
          <form onSubmit={handleSave} className="bg-tap-surface rounded-2xl border border-tap-border p-5 space-y-4">

            <div className="space-y-1">
              <label className="text-xs font-medium text-tap-text-3 uppercase tracking-widest">
                Nom d'affichage
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ton nom"
                className="w-full bg-tap-bg border border-tap-border rounded-xl px-3 py-2.5 text-sm text-tap-text-1 outline-none focus:border-tap-text-2 transition-colors placeholder:text-tap-text-3"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-tap-text-3 uppercase tracking-widest">
                Nom d'utilisateur
              </label>
              <div className="flex items-center bg-tap-bg border border-tap-border rounded-xl px-3 py-2.5 gap-1">
                <span className="text-tap-text-3 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  className="flex-1 bg-transparent text-sm text-tap-text-1 outline-none placeholder:text-tap-text-3"
                />
              </div>
              <p className="text-xs text-tap-text-3 px-1">
                Ton profil public : <span className="text-tap-text-2 font-mono">/p/{username || 'username'}</span>
              </p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading || username.length < 3}
              className="w-full h-12 rounded-xl bg-tap-text-1 text-black text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Enregistrer
            </button>
          </form>
        </section>

        {/* Alerte reconfigurer bracelet si username changé */}
        {saved && usernameChanged && (
          <div className="bg-tap-surface rounded-2xl border border-tap-border p-5 space-y-3">
            <p className="text-sm text-tap-text-1 font-medium">Ton username a changé</p>
            <p className="text-xs text-tap-text-2">
              Ton lien NFC pointe encore vers l'ancienne URL. Reprogramme ton bracelet pour qu'il fonctionne.
            </p>
            <button
              onClick={onReconfigure}
              className="w-full h-10 rounded-xl bg-tap-text-1 text-black text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Wifi size={15} />
              Reconfigurer le bracelet
            </button>
          </div>
        )}

        {saved && !usernameChanged && (
          <p className="text-sm text-center text-tap-success">Modifications enregistrées !</p>
        )}

        {/* Bracelet */}
        <section className="space-y-2">
          <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest px-1">Bracelet</p>
          <div className="bg-tap-surface rounded-2xl border border-tap-border p-5 space-y-3">
            {linkedTapId ? (
              <>
                <div>
                  <p className="text-sm font-medium text-tap-text-1">Bracelet lié</p>
                  <p className="text-xs text-tap-text-3 font-mono mt-0.5">{linkedTapId}</p>
                </div>
                <button
                  onClick={handleUnlink}
                  disabled={unlinking}
                  className="w-full h-10 rounded-xl bg-tap-bg border border-tap-border text-red-400 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                >
                  {unlinking && <Loader2 size={14} className="animate-spin" />}
                  Délier ce bracelet
                </button>
              </>
            ) : (
              <p className="text-sm text-tap-text-3">Aucun bracelet lié à ce compte.</p>
            )}
          </div>
        </section>

        {/* Déconnexion */}
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-xl bg-tap-surface border border-tap-border text-red-400 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        >
          Se déconnecter
        </button>

      </div>
    </div>
  )
}
