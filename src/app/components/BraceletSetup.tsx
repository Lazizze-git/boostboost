import { useState, useEffect } from 'react'
import { Wifi, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface BraceletSetupProps {
  onComplete: () => void
  onSkip?: () => void
}

type Step = 'intro' | 'scanning' | 'writing' | 'success' | 'error'

function generateUserId(): string {
  const existing = localStorage.getItem('tap-user-id')
  if (existing) return existing
  const id = Math.random().toString(36).substring(2, 10)
  localStorage.setItem('tap-user-id', id)
  return id
}

export function BraceletSetup({ onComplete, onSkip }: BraceletSetupProps) {
  const [step, setStep]             = useState<Step>('intro')
  const [errorMsg, setErrorMsg]     = useState('')
  const [nfcSupported, setNfcSupported] = useState(true)

  const profileUrl = `https://tap.me/${generateUserId()}`

  useEffect(() => {
    if (!('NDEFReader' in window)) setNfcSupported(false)
  }, [])

  const startNFCWrite = async () => {
    if (!nfcSupported) {
      setErrorMsg('NFC n\'est pas supporté sur cet appareil')
      setStep('error')
      return
    }

    setStep('scanning')

    try {
      // @ts-expect-error — NDEFReader not yet in TS lib
      const ndef = new NDEFReader()
      setStep('writing')
      // @ts-expect-error — NDEFReader not yet in TS lib
      await ndef.write({ records: [{ recordType: 'url', data: profileUrl }] })

      localStorage.setItem('tap-bracelet-configured', 'true')
      localStorage.setItem('tap-bracelet-url', profileUrl)
      setStep('success')
      setTimeout(onComplete, 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'écriture NFC'
      setErrorMsg(message)
      setStep('error')
    }
  }

  return (
    <div className="min-h-screen bg-tap-bg flex flex-col">
      {/* Progress indicator */}
      <div className="flex justify-center gap-2 pt-14 pb-2">
        {(['intro', 'scanning', 'writing', 'success'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 rounded-full transition-all duration-300 ${
              s === step || (step === 'error' && i === 0)
                ? 'w-8 bg-tap-text-1'
                : 'w-3 bg-tap-border'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-16">
        {step === 'intro'    && <IntroStep profileUrl={profileUrl} nfcSupported={nfcSupported} onStart={startNFCWrite} onSkip={onSkip} />}
        {step === 'scanning' && <ScanningStep />}
        {step === 'writing'  && <WritingStep />}
        {step === 'success'  && <SuccessStep onComplete={onComplete} />}
        {step === 'error'    && <ErrorStep message={errorMsg} onRetry={() => setStep('intro')} onSkip={onSkip} />}
      </div>
    </div>
  )
}

/* ─── Step components ─────────────────────────────── */

interface IntroStepProps {
  profileUrl: string
  nfcSupported: boolean
  onStart: () => void
  onSkip?: () => void
}

function IntroStep({ profileUrl, nfcSupported, onStart, onSkip }: IntroStepProps) {
  return (
    <div className="animate-fade-up space-y-8">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-tap-text-1 flex items-center justify-center">
            <Wifi size={40} className="text-white" />
          </div>
          <span className="absolute -top-2 -right-2 text-2xl">⚡</span>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest">
          Configuration
        </p>
        <h1 className="text-4xl font-bold text-tap-text-1 leading-tight">
          Connecte<br />ton bracelet
        </h1>
        <p className="text-base text-tap-text-2 leading-relaxed">
          Un simple tap suffit pour partager ton profil. Configure ton bracelet TAP en quelques secondes.
        </p>
      </div>

      {/* URL card */}
      <div className="bg-tap-surface rounded-2xl p-5 border border-tap-border">
        <p className="text-xs font-medium text-tap-text-3 uppercase tracking-widest mb-3">
          Ton URL de profil
        </p>
        <p className="text-sm font-mono text-tap-accent break-all bg-tap-bg rounded-xl px-3 py-2.5">
          {profileUrl}
        </p>
      </div>

      {/* NFC not supported warning */}
      {!nfcSupported && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-tap-surface border border-tap-border">
          <AlertCircle size={16} className="text-tap-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm text-tap-text-2">
            NFC n'est pas disponible sur cet appareil. Tu pourras configurer ton bracelet depuis un téléphone compatible.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onStart}
          disabled={!nfcSupported}
          className="w-full h-14 rounded-2xl bg-tap-text-1 text-white text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Commencer la configuration
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full h-11 text-sm text-tap-text-2 transition-all duration-200 hover:text-tap-text-1"
          >
            Je le ferai plus tard
          </button>
        )}
      </div>
    </div>
  )
}

function ScanningStep() {
  return (
    <div className="animate-fade-up flex flex-col items-center text-center space-y-8">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-tap-text-1/20 animate-ping-ring" />
        <div className="absolute inset-4 rounded-full border-2 border-tap-text-1/30 animate-ping-ring [animation-delay:0.4s]" />
        <div className="w-20 h-20 rounded-full bg-tap-surface border border-tap-border flex items-center justify-center">
          <Wifi size={32} className="text-tap-text-1" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-tap-text-1">
          Approche ton<br />bracelet
        </h2>
        <p className="text-tap-text-2 text-base leading-relaxed max-w-xs">
          Maintiens-le contre l'arrière de ton téléphone jusqu'à la vibration.
        </p>
      </div>
    </div>
  )
}

function WritingStep() {
  return (
    <div className="animate-fade-up flex flex-col items-center text-center space-y-8">
      <div className="w-24 h-24 rounded-3xl bg-tap-text-1 flex items-center justify-center">
        <Loader2 size={40} className="text-white animate-spin" />
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-tap-text-1">
          Presque...
        </h2>
        <p className="text-tap-text-2 text-base leading-relaxed max-w-xs">
          Ne bouge pas, on écrit ton profil sur le bracelet.
        </p>
      </div>
    </div>
  )
}

interface SuccessStepProps {
  onComplete: () => void
}

function SuccessStep({ onComplete }: SuccessStepProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center text-center space-y-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-tap-success flex items-center justify-center">
          <CheckCircle size={44} className="text-white" />
        </div>
        <span className="absolute -bottom-2 -right-2 text-2xl">🎉</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-tap-text-1">
          Tout est prêt !
        </h2>
        <p className="text-tap-text-2 text-base leading-relaxed max-w-xs">
          Ton bracelet est configuré. Partage ton profil d'un simple tap.
        </p>
      </div>

      <button
        onClick={onComplete}
        className="w-full h-14 rounded-2xl bg-tap-success text-white text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
      >
        Découvrir mon profil
      </button>
    </div>
  )
}

interface ErrorStepProps {
  message: string
  onRetry: () => void
  onSkip?: () => void
}

function ErrorStep({ message, onRetry, onSkip }: ErrorStepProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center text-center space-y-8">
      <div className="w-24 h-24 rounded-3xl bg-tap-surface border border-tap-border flex items-center justify-center">
        <AlertCircle size={40} className="text-tap-accent" />
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-tap-text-1">Oups 😅</h2>
        <p className="text-tap-text-2 text-base leading-relaxed max-w-xs">
          {message || 'Impossible de configurer le bracelet. Rapproche-le davantage et réessaie.'}
        </p>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={onRetry}
          className="w-full h-14 rounded-2xl bg-tap-text-1 text-white text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        >
          Réessayer
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full h-11 text-sm text-tap-text-2 transition-all duration-200 hover:text-tap-text-1"
          >
            Je le ferai plus tard
          </button>
        )}
      </div>
    </div>
  )
}
