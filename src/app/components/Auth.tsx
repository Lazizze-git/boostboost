import { useState } from 'react'
import { Loader2, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Mode = 'login' | 'signup'

export function Auth() {
  const [mode, setMode]         = useState<Mode>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Vérifie ton email pour confirmer ton compte.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email ou mot de passe incorrect.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-tap-bg flex flex-col justify-center px-6 pb-16">
      <div className="animate-fade-up space-y-10">

        {/* Logo */}
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-tap-surface border border-tap-border flex items-center justify-center">
            <Zap size={26} className="text-tap-text-1" />
          </div>
          <div>
            <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest mb-1">
              Bienvenue
            </p>
            <h1 className="text-4xl font-bold text-tap-text-1 leading-tight">
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="bg-tap-surface rounded-2xl border border-tap-border px-5 py-4">
              <label className="text-xs font-medium text-tap-text-3 uppercase tracking-widest block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                className="w-full bg-transparent text-tap-text-1 placeholder:text-tap-text-3 outline-none text-base"
              />
            </div>

            <div className="bg-tap-surface rounded-2xl border border-tap-border px-5 py-4">
              <label className="text-xs font-medium text-tap-text-3 uppercase tracking-widest block mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-transparent text-tap-text-1 placeholder:text-tap-text-3 outline-none text-base"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 px-1">{error}</p>
          )}
          {success && (
            <p className="text-sm text-tap-green px-1">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-tap-text-1 text-black text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-tap-text-2">
          {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
            className="text-tap-text-1 font-semibold underline underline-offset-2"
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>

      </div>
    </div>
  )
}
