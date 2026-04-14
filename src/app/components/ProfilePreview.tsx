import { Instagram, Linkedin, Music, Phone, Mail, MessageCircle, Globe, Wifi, Sparkles, ArrowRight, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProfilePreviewProps {
  onEdit: () => void;
  onPreview?: () => void;
  onReconfigure?: () => void;
}

export function ProfilePreview({ onEdit, onPreview, onReconfigure }: ProfilePreviewProps) {
  const [activeMode, setActiveMode] = useState('Soirée');
  const [isBraceletConfigured, setIsBraceletConfigured] = useState(false);

  useEffect(() => {
    const configured = localStorage.getItem('tap-bracelet-configured') === 'true';
    setIsBraceletConfigured(configured);
  }, []);

  const modes = [
    { name: 'Soirée', color: '#C8506A', emoji: '🎉', gradient: 'linear-gradient(135deg, #C8506A 0%, #E1306C 100%)' },
    { name: 'Pro', color: '#4A7DD4', emoji: '💼', gradient: 'linear-gradient(135deg, #4A7DD4 0%, #0077B5 100%)' },
    { name: 'Sport', color: '#3A9A6A', emoji: '⚡', gradient: 'linear-gradient(135deg, #3A9A6A 0%, #1DB954 100%)' },
    { name: 'Discret', color: '#7A5AC8', emoji: '🔒', gradient: 'linear-gradient(135deg, #7A5AC8 0%, #9B59B6 100%)' }
  ];

  const currentMode = modes.find(m => m.name === activeMode) || modes[0];

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: '#E1306C', handle: '@julien.moreau', active: activeMode === 'Soirée' },
    { name: 'LinkedIn', icon: Linkedin, color: '#0077B5', handle: 'julien-moreau', active: activeMode === 'Pro' },
    { name: 'Spotify', icon: Music, color: '#1DB954', handle: 'Julien M', active: activeMode === 'Soirée' },
    { name: 'Email', icon: Mail, color: '#4A7DD4', handle: 'j.moreau@gmail.com', active: true },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--tap-bg-primary)' }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl animate-float" 
           style={{ background: currentMode.gradient }}></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl" 
           style={{ background: currentMode.gradient, animationDelay: '1.5s' }}></div>

      <div className="relative z-10 p-6 animate-slide-up">
        {/* Header with greeting */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} style={{ color: 'var(--tap-accent)' }} />
            <span style={{ fontSize: '14px', color: 'var(--tap-text-tertiary)', fontWeight: '400' }}>
              Salut Julien 👋
            </span>
          </div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '300', 
            color: 'var(--tap-text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: '8px'
          }}>
            Ton profil TAP
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--tap-text-secondary)' }}>
            Prêt à partager ton monde
          </p>
        </div>

        {/* Mode Selector - Modern Pills */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {modes.map((mode) => (
              <button
                key={mode.name}
                onClick={() => setActiveMode(mode.name)}
                className="tap-card flex-shrink-0"
                style={{
                  padding: '16px 20px',
                  borderRadius: '20px',
                  background: activeMode === mode.name 
                    ? mode.gradient
                    : 'var(--tap-bg-secondary)',
                  border: activeMode === mode.name 
                    ? 'none' 
                    : '1px solid var(--tap-border-default)',
                  color: activeMode === mode.name ? '#ffffff' : 'var(--tap-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: 'fit-content',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <span style={{ fontSize: '20px' }}>{mode.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: '500',
                    marginBottom: '2px'
                  }}>
                    {mode.name}
                  </div>
                  {activeMode === mode.name && (
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.9
                    }}>
                      Mode actif
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Card with Glassmorphism */}
        <div 
          className="tap-card mb-6 relative overflow-hidden"
          style={{
            background: 'var(--tap-bg-secondary)',
            borderRadius: '24px',
            padding: '28px',
            border: '1px solid var(--tap-border-default)'
          }}
        >
          {/* Accent bar */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: currentMode.gradient }}
          ></div>
          
          <div className="flex items-start gap-4 mb-6">
            <div 
              className="relative"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: currentMode.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                flexShrink: 0
              }}
            >
              {currentMode.emoji}
              <div 
                className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: 'var(--tap-success)',
                  border: '2px solid var(--tap-bg-secondary)'
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '500', 
                color: 'var(--tap-text-primary)',
                marginBottom: '4px',
                letterSpacing: '-0.02em'
              }}>
                Julien Moreau
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--tap-text-secondary)',
                marginBottom: '12px',
                lineHeight: '1.5'
              }}>
                {activeMode === 'Soirée' && 'DJ le weekend, dev la semaine 🎧'}
                {activeMode === 'Pro' && 'Full-stack developer · React & Node.js'}
                {activeMode === 'Sport' && 'Runner · Cycliste · Outdoor enthusiast'}
                {activeMode === 'Discret' && 'Contact minimal'}
              </p>
              
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: `${currentMode.color}15`,
                  border: `1px solid ${currentMode.color}30`
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    backgroundColor: currentMode.color,
                    animation: 'pulse-glow 2s ease-in-out infinite'
                  }}
                ></div>
                <span style={{ fontSize: '12px', color: currentMode.color, fontWeight: '500' }}>
                  Mode {activeMode}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onEdit}
              className="tap-button flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{
                background: currentMode.gradient,
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Modifier
              <ArrowRight size={16} />
            </button>
            <button 
              className="tap-button flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{
                backgroundColor: 'var(--tap-bg-primary)',
                color: 'var(--tap-text-primary)',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid var(--tap-border-default)'
              }}
            >
              Partager
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Bracelet Status - Modern */}
        <div 
          className="tap-card mb-6"
          style={{
            background: isBraceletConfigured 
              ? 'var(--tap-bg-secondary)' 
              : `linear-gradient(135deg, ${currentMode.color}15 0%, ${currentMode.color}08 100%)`,
            borderRadius: '20px',
            padding: '20px',
            border: isBraceletConfigured 
              ? '1px solid var(--tap-border-default)' 
              : `1px solid ${currentMode.color}30`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ 
                  background: isBraceletConfigured 
                    ? 'var(--tap-bg-primary)' 
                    : `${currentMode.color}20`
                }}
              >
                <Wifi 
                  size={20} 
                  style={{ 
                    color: isBraceletConfigured ? 'var(--tap-text-secondary)' : currentMode.color 
                  }} 
                />
              </div>
              <div>
                <div style={{ 
                  fontSize: '15px', 
                  fontWeight: '500', 
                  color: 'var(--tap-text-primary)',
                  marginBottom: '2px'
                }}>
                  {isBraceletConfigured ? 'Bracelet configuré' : 'Configurer ton bracelet'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--tap-text-secondary)' }}>
                  {isBraceletConfigured ? 'Prêt à partager' : 'Synchronise ton profil'}
                </div>
              </div>
            </div>
            
            {!isBraceletConfigured && onReconfigure && (
              <button
                onClick={onReconfigure}
                className="tap-button px-5 py-2 rounded-xl"
                style={{
                  background: currentMode.gradient,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Commencer
              </button>
            )}
            
            {isBraceletConfigured && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 rounded-full relative" style={{ backgroundColor: 'var(--tap-bg-primary)' }}>
                  <div className="absolute top-0.5 right-0.5 w-6 h-3 rounded-full" 
                       style={{ backgroundColor: 'var(--tap-success)' }}></div>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--tap-text-tertiary)' }}>87%</span>
              </div>
            )}
          </div>
        </div>

        {/* Social Links - Compact and Modern */}
        <div>
          <h3 style={{ 
            fontSize: '13px',
            textTransform: 'uppercase',
            color: 'var(--tap-text-tertiary)',
            letterSpacing: '0.1em',
            marginBottom: '16px',
            fontWeight: '500'
          }}>
            Liens actifs · {platforms.filter(p => p.active).length}
          </h3>
          
          <div className="space-y-2">
            {platforms.filter(p => p.active).map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.name}
                  className="tap-card flex items-center gap-3 p-4 rounded-2xl"
                  style={{
                    backgroundColor: 'var(--tap-bg-secondary)',
                    border: '1px solid var(--tap-border-default)'
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${platform.color}20 0%, ${platform.color}10 100%)`
                    }}
                  >
                    <Icon size={20} style={{ color: platform.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ 
                      fontSize: '14px', 
                      color: 'var(--tap-text-primary)', 
                      fontWeight: '500',
                      marginBottom: '2px'
                    }}>
                      {platform.name}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: 'var(--tap-text-tertiary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {platform.handle}
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--tap-text-tertiary)', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer branding */}
        <div className="text-center mt-12 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" 
               style={{ backgroundColor: 'var(--tap-bg-secondary)' }}>
            <div className="w-5 h-5 rounded-full" style={{ background: 'var(--tap-accent)' }}></div>
            <span style={{ 
              fontSize: '11px', 
              color: 'var(--tap-text-tertiary)', 
              letterSpacing: '0.05em',
              fontWeight: '500'
            }}>
              propulsé par TAP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
