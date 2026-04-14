import { useState, useEffect } from 'react';
import { ProfileEditor } from './components/ProfileEditor';
import { ProfilePreview } from './components/ProfilePreview';
import { BraceletSetup } from './components/BraceletSetup';

function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'preview' | 'editor'>('preview');
  const [isBraceletConfigured, setIsBraceletConfigured] = useState(false);

  useEffect(() => {
    // Check if bracelet is already configured
    const configured = localStorage.getItem('tap-bracelet-configured') === 'true';
    setIsBraceletConfigured(configured);
    
    // If not configured, show setup screen
    if (!configured) {
      setCurrentView('setup');
    }
  }, []);

  const handleSetupComplete = () => {
    setIsBraceletConfigured(true);
    setCurrentView('preview');
  };

  const handleSkipSetup = () => {
    setCurrentView('preview');
  };

  const handleReconfigure = () => {
    localStorage.removeItem('tap-bracelet-configured');
    localStorage.removeItem('tap-bracelet-url');
    setIsBraceletConfigured(false);
    setCurrentView('setup');
  };

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: 'var(--tap-bg-primary)', 
      fontFamily: 'Inter, sans-serif',
      color: 'var(--tap-text-primary)' 
    }}>
      <div className="mx-auto" style={{ maxWidth: '390px' }}>
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
  );
}

export default App;