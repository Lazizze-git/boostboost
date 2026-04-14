import { useState } from 'react'
import { Loader2, AtSign } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

interface ProfileSetupProps {
  user: User
  onComplete: () => void
}

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [username, setUsername]       = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (clean.length < 3) {
      setError('Le nom d\'utilisateur doit faire au moins 3 caractères.')
      setLoading(false)
      return
    }

    // Vérifie si le username est déjà pris
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

    const { error: insertError } = await supabase.from('profiles').insert({
      user_id: user.id,
      username: clean,
      display_name: displayName || clean,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      onComplete()
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-tap-bg flex flex-col justify-center px-6 pb-16">
      <div className="animate-fade-up space-y-10">

        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-tap-surface border border-tap-border flex items-center justify-center">
            <AtSign size={26} className="text-tap-text-1" />
          </div>
          <div>
            <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest mb-1">
              Dernière étape
            </p>
            <h1 className="text-4xl font-bold text-tap-text-1 leading-tight">
              Crée ton<br />profil
            </h1>
            <p className="text-sm text-tap-text-2 mt-2">
              Ton lien public sera : <span className="text-tap-text-1 font-mono">tap.me/<span className="text-tap-green">{username || 'username'}</span></span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="bg-tap-surface rounded-2xl border border-tap-border px-5 py-4">
              <label className="text-xs font-medium text-tap-text-3 uppercase tracking-widest block mb-2">
                Nom d'affichage
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full bg-transparent text-tap-text-1 placeholder:text-tap-text-3 outline-none text-base"
              />
            </div>

            <div className="bg-tap-surface rounded-2xl border border-tap-border px-5 py-4">
              <label className="text-xs font-medium text-tap-text-3 uppercase tracking-widest block mb-2">
                Nom d'utilisateur
              </label>
              <div className="flex items-center gap-2">
                <span className="text-tap-text-3">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="jean_dupont"
                  required
                  className="flex-1 bg-transparent text-tap-text-1 placeholder:text-tap-text-3 outline-none text-base"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 px-1">{error}</p>}

          <button
            type="submit"
            disabled={loading || username.length < 3}
            className="w-full h-14 rounded-2xl bg-tap-text-1 text-black text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Créer mon profil
          </button>
        </form>

      </div>
    </div>
  )
}
