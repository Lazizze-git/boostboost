import { useState, useEffect } from 'react';
import { Wifi, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface BraceletSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

type SetupStep = 'intro' | 'scanning' | 'writing' | 'success' | 'error';

export function BraceletSetup({ onComplete, onSkip }: BraceletSetupProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('intro');
  const [errorMessage, setErrorMessage] = useState('');
  const [isNFCSupported, setIsNFCSupported] = useState(true);

  useEffect(() => {
    // Check if NFC is supported
    if (!('NDEFReader' in window)) {
      setIsNFCSupported(false);
    }
  }, []);

  const profileUrl = `https://tap.me/${generateUserId()}`;

  function generateUserId() {
    // Generate a unique ID for this user
    const existingId = localStorage.getItem('tap-user-id');
    if (existingId) return existingId;
    
    const newId = Math.random().toString(36).substring(2, 10);
    localStorage.setItem('tap-user-id', newId);
    return newId;
  }

  const startNFCWrite = async () => {
    if (!isNFCSupported) {
      setErrorMessage('NFC n\'est pas supporté sur cet appareil');
      setCurrentStep('error');
      return;
    }

    setCurrentStep('scanning');

    try {
      // @ts-ignore - NDEFReader is not in TypeScript types yet
      const ndef = new NDEFReader();
      
      setCurrentStep('writing');

      // @ts-ignore
      await ndef.write({
        records: [
          {
            recordType: "url",
            data: profileUrl
          }
        ]
      });

      // Mark bracelet as configured
      localStorage.setItem('tap-bracelet-configured', 'true');
      localStorage.setItem('tap-bracelet-url', profileUrl);
      
      setCurrentStep('success');
      
      // Auto-complete after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error: any) {
      console.error('NFC Write Error:', error);
      setErrorMessage(error.message || 'Erreur lors de l\'écriture NFC');
      setCurrentStep('error');
    }
  };

  const renderIntro = () => (
    <div className="flex flex-col items-center text-center px-6 animate-slide-up">
      <div 
        className="relative mb-8 animate-float"
      >
        <div 
          className="w-32 h-32 rounded-3xl flex items-center justify-center relative"
          style={{ 
            background: 'linear-gradient(135deg, var(--tap-accent) 0%, #E1306C 100%)',
          }}
        >
          <Wifi size={48} color="#fff" />
        </div>
        <div 
          className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ 
            backgroundColor: 'var(--tap-bg-secondary)',
            border: '2px solid var(--tap-accent)'
          }}
        >
          ⚡
        </div>
      </div>

      <h2 style={{ 
        fontSize: '32px', 
        fontWeight: '300', 
        color: 'var(--tap-text-primary)',
        marginBottom: '12px',
        letterSpacing: '-0.03em'
      }}>
        Connecte ton bracelet
      </h2>

      <p style={{ 
        fontSize: '16px', 
        color: 'var(--tap-text-secondary)', 
        lineHeight: '1.6',
        marginBottom: '40px',
        maxWidth: '320px'
      }}>
        Un simple tap suffit pour partager ton profil. Configurons ton bracelet TAP en quelques secondes ✨
      </p>

      <div 
        className="tap-card w-full p-5 rounded-2xl mb-8"
        style={{ 
          backgroundColor: 'var(--tap-bg-secondary)',
          border: '1px solid var(--tap-border-default)'
        }}
      >
        <div style={{ 
          fontSize: '11px', 
          textTransform: 'uppercase',
          color: 'var(--tap-text-tertiary)',
          letterSpacing: '0.1em',
          marginBottom: '12px',
          fontWeight: '500'
        }}>
          Ton URL de profil
        </div>
        <div style={{ 
          fontSize: '15px', 
          color: 'var(--tap-accent)',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          fontWeight: '500',
          padding: '12px',
          backgroundColor: 'var(--tap-bg-primary)',
          borderRadius: '12px'
        }}>
          {profileUrl}
        </div>
      </div>

      <button
        onClick={startNFCWrite}
        disabled={!isNFCSupported}
        className="tap-button w-full rounded-2xl mb-4"
        style={{
          background: isNFCSupported 
            ? 'linear-gradient(135deg, var(--tap-accent) 0%, #E1306C 100%)' 
            : 'var(--tap-bg-tertiary)',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          height: '56px',
          opacity: isNFCSupported ? 1 : 0.5
        }}
      >
        🚀 Commencer la configuration
      </button>

      {onSkip && (
        <button
          onClick={onSkip}
          className="tap-button"
          style={{
            color: 'var(--tap-text-secondary)',
            fontSize: '14px',
            padding: '12px',
            fontWeight: '400'
          }}
        >
          Je le ferai plus tard
        </button>
      )}

      {!isNFCSupported && (
        <div 
          className="tap-card mt-6 p-4 rounded-2xl flex items-start gap-3"
          style={{ 
            backgroundColor: '#FFF5F5',
            border: '1px solid var(--tap-accent)33'
          }}
        >
          <AlertCircle size={20} style={{ color: 'var(--tap-accent)', marginTop: '2px', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'var(--tap-accent)', lineHeight: '1.5' }}>
            NFC n'est pas disponible sur cet appareil
          </span>
        </div>
      )}
    </div>
  );

  const renderScanning = () => (
    <div className="flex flex-col items-center text-center px-6 animate-slide-up">
      <div 
        className="w-40 h-40 rounded-full flex items-center justify-center mb-8 relative"
        style={{ background: 'linear-gradient(135deg, var(--tap-accent)20 0%, #E1306C20 100%)' }}
      >
        <div 
          className="absolute inset-0 rounded-full animate-ping"
          style={{ 
            border: '3px solid var(--tap-accent)',
            opacity: 0.4
          }}
        ></div>
        <div 
          className="absolute inset-4 rounded-full animate-ping"
          style={{ 
            border: '3px solid var(--tap-accent)',
            opacity: 0.6,
            animationDelay: '0.5s'
          }}
        ></div>
        <Wifi size={56} style={{ color: 'var(--tap-accent)' }} />
      </div>

      <h2 style={{ 
        fontSize: '28px', 
        fontWeight: '300', 
        color: 'var(--tap-text-primary)',
        marginBottom: '12px',
        letterSpacing: '-0.02em'
      }}>
        Approche ton bracelet
      </h2>

      <p style={{ 
        fontSize: '16px', 
        color: 'var(--tap-text-secondary)', 
        lineHeight: '1.6',
        maxWidth: '280px'
      }}>
        Maintiens-le près de l'arrière de ton téléphone jusqu'à la vibration
      </p>
    </div>
  );

  const renderWriting = () => (
    <div className="flex flex-col items-center text-center px-6 animate-slide-up">
      <div 
        className="w-40 h-40 rounded-full flex items-center justify-center mb-8"
        style={{ background: 'linear-gradient(135deg, var(--tap-accent) 0%, #E1306C 100%)' }}
      >
        <Loader2 size={56} color="#fff" className="animate-spin" />
      </div>

      <h2 style={{ 
        fontSize: '28px', 
        fontWeight: '300', 
        color: 'var(--tap-text-primary)',
        marginBottom: '12px',
        letterSpacing: '-0.02em'
      }}>
        Ça y est presque...
      </h2>

      <p style={{ 
        fontSize: '16px', 
        color: 'var(--tap-text-secondary)', 
        lineHeight: '1.6',
        maxWidth: '280px'
      }}>
        Ne bouge pas, on écrit ton profil sur le bracelet ✨
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center text-center px-6 animate-slide-up">
      <div 
        className="w-40 h-40 rounded-full flex items-center justify-center mb-8 relative"
        style={{ 
          background: 'linear-gradient(135deg, var(--tap-success) 0%, #1DB954 100%)'
        }}
      >
        <CheckCircle size={72} color="#fff" />
        <div 
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-4xl"
        >
          🎉
        </div>
      </div>

      <h2 style={{ 
        fontSize: '32px', 
        fontWeight: '300', 
        color: 'var(--tap-text-primary)',
        marginBottom: '12px',
        letterSpacing: '-0.03em'
      }}>
        Tout est prêt !
      </h2>

      <p style={{ 
        fontSize: '16px', 
        color: 'var(--tap-text-secondary)', 
        lineHeight: '1.6',
        marginBottom: '40px',
        maxWidth: '300px'
      }}>
        Ton bracelet est configuré. Tu peux maintenant partager ton profil d'un simple tap ⚡
      </p>

      <button
        onClick={onComplete}
        className="tap-button w-full rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, var(--tap-success) 0%, #1DB954 100%)',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          height: '56px'
        }}
      >
        Découvrir mon profil
      </button>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center text-center px-6 animate-slide-up">
      <div 
        className="w-40 h-40 rounded-full flex items-center justify-center mb-8"
        style={{ background: 'linear-gradient(135deg, var(--tap-accent)20 0%, #FF6B6B20 100%)' }}
      >
        <AlertCircle size={72} style={{ color: 'var(--tap-accent)' }} />
      </div>

      <h2 style={{ 
        fontSize: '28px', 
        fontWeight: '300', 
        color: 'var(--tap-text-primary)',
        marginBottom: '12px',
        letterSpacing: '-0.02em'
      }}>
        Oups 😅
      </h2>

      <p style={{ 
        fontSize: '16px', 
        color: 'var(--tap-text-secondary)', 
        lineHeight: '1.6',
        marginBottom: '40px',
        maxWidth: '320px'
      }}>
        {errorMessage || 'Impossible de configurer le bracelet. Réessaye en maintenant le bracelet plus près de ton téléphone.'}
      </p>

      <button
        onClick={() => setCurrentStep('intro')}
        className="tap-button w-full rounded-2xl mb-4"
        style={{
          background: 'linear-gradient(135deg, var(--tap-accent) 0%, #E1306C 100%)',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          height: '56px'
        }}
      >
        Réessayer
      </button>

      {onSkip && (
        <button
          onClick={onSkip}
          className="tap-button"
          style={{
            color: 'var(--tap-text-secondary)',
            fontSize: '14px',
            padding: '12px'
          }}
        >
          Je le ferai plus tard
        </button>
      )}
    </div>
  );

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--tap-bg-primary)' }}
    >
      {currentStep === 'intro' && renderIntro()}
      {currentStep === 'scanning' && renderScanning()}
      {currentStep === 'writing' && renderWriting()}
      {currentStep === 'success' && renderSuccess()}
      {currentStep === 'error' && renderError()}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}