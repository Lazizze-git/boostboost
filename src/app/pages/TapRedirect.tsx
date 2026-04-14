import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Loader2, Wifi, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Step = 'loading' | 'not-found' | 'linking' | 'link-success' | 'already-linked'

export function TapRedirect() {
  const { tapId }    = useParams<{ tapId: string }>()
  const navigate     = useNavigate()
  const [step, setStep]       = useState<Step>('loading')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tapId) return
    checkBracelet()
  }, [tapId])

  const checkBracelet = async () => {
    const { data: bracelet } = await supabase
      .from('bracelets')
      .select('id, profile_id, profiles(username)')
      .eq('tap_id', tapId!.trim())
      .maybeSingle()

    if (!bracelet) {
      setStep('not-found')
      return
    }

    if (bracelet.profile_id) {
      // Déjà lié → redirige vers le profil public
      const profile = bracelet.profiles as unknown as { username: string } | null
      if (profile?.username) {
        navigate(`/p/${profile.username}`, { replace: true })
      } else {
        setStep('not-found')
      }
      return
    }

    // Pas encore lié
    setStep('linking')
  }

  const handleLink = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // Sauvegarde le tapId et redirige vers l'app pour se connecter
      localStorage.setItem('tap-pending-link', tapId!)
      navigate('/', { replace: true })
      return
    }

    // Récupère le profil de l'utilisateur connecté
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (!profile) {
      localStorage.setItem('tap-pending-link', tapId!)
      navigate('/', { replace: true })
      return
    }

    const { error } = await supabase
      .from('bracelets')
      .update({ profile_id: profile.id, linked_at: new Date().toISOString() })
      .eq('tap_id', tapId!.trim())

    if (error) {
      setStep('not-found')
    } else {
      setStep('link-success')
      setTimeout(() => navigate('/', { replace: true }), 2000)
    }

    setLoading(false)
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-tap-bg flex items-center justify-center">
        <Loader2 size={28} className="text-tap-text-3 animate-spin" />
      </div>
    )
  }

  if (step === 'not-found') {
    return (
      <div className="min-h-screen bg-tap-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle size={40} className="text-tap-text-3" />
        <h1 className="text-xl font-bold text-tap-text-1">Bracelet introuvable</h1>
        <p className="text-sm text-tap-text-2">Ce bracelet n'existe pas dans notre système.</p>
      </div>
    )
  }

  if (step === 'link-success') {
    return (
      <div className="min-h-screen bg-tap-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-tap-success flex items-center justify-center">
          <CheckCircle size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-tap-text-1">Bracelet lié !</h1>
        <p className="text-sm text-tap-text-2">Ton bracelet est maintenant associé à ton profil.</p>
      </div>
    )
  }

  // step === 'linking'
  return (
    <div className="min-h-screen bg-tap-bg flex flex-col justify-center px-6 pb-16">
      <div className="animate-fade-up space-y-8">

        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-tap-surface border border-tap-border flex items-center justify-center">
            <Wifi size={40} className="text-tap-text-1" />
          </div>
        </div>

        <div className="space-y-3 text-center">
          <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest">
            Nouveau bracelet
          </p>
          <h1 className="text-3xl font-bold text-tap-text-1 leading-tight">
            Lie ce bracelet<br />à ton profil
          </h1>
          <p className="text-sm text-tap-text-2 leading-relaxed max-w-xs mx-auto">
            Ce bracelet n'est pas encore associé à un compte. Connecte-toi pour le lier à ton profil TAP.
          </p>
        </div>

        <div className="bg-tap-surface rounded-2xl border border-tap-border px-4 py-3 text-center">
          <p className="text-xs text-tap-text-3 font-mono">ID : {tapId}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLink}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-tap-text-1 text-black text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Lier à mon compte
          </button>
          <p className="text-xs text-center text-tap-text-3">
            Tu seras redirigé vers la connexion si nécessaire.
          </p>
        </div>

      </div>
    </div>
  )
}
