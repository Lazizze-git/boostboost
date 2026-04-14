import { useState, useEffect } from 'react'
import { ProfileEditor } from './components/ProfileEditor'
import { ProfilePreview } from './components/ProfilePreview'
import { BraceletSetup } from './components/BraceletSetup'

type View = 'setup' | 'preview' | 'editor'

function App() {
  const [currentView, setCurrentView] = useState<View>('preview')

  useEffect(() => {
    const configured = localStorage.getItem('tap-bracelet-configured') === 'true'
    if (!configured) setCurrentView('setup')
  }, [])

  const handleSetupComplete = () => setCurrentView('preview')
  const handleSkipSetup    = () => setCurrentView('preview')

  const handleReconfigure = () => {
    localStorage.removeItem('tap-bracelet-configured')
    localStorage.removeItem('tap-bracelet-url')
    setCurrentView('setup')
  }

  return (
    <div className="min-h-screen bg-tap-bg font-sans">
      <div className="mx-auto" style={{ maxWidth: '430px' }}>
        {currentView === 'setup' ? (
          <BraceletSetup
            onComplete={handleSetupComplete}
            onSkip={handleSkipSetup}
          />
        ) : currentView === 'preview' ? (
          <ProfilePreview
            onEdit={() => setCurrentView('editor')}
            onReconfigure={handleReconfigure}
          />
        ) : (
          <ProfileEditor onBack={() => setCurrentView('preview')} />
        )}
      </div>
    </div>
  )
}

export default App
