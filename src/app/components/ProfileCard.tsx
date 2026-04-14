import { ExternalLink, Instagram, Linkedin, Music, Phone, Mail, MessageCircle, Globe } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfileCardProps {
  mode: string;
  color: string;
  name: string;
  bio: string;
  photos: string[];
  prompts: { question: string; answer: string }[];
  links: any[];
}

export function ProfileCard({ mode, color, name, bio, photos, prompts, links }: ProfileCardProps) {
  const enabledLinks = links.filter(l => l.enabled);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--tap-bg-primary)' }}>
      {/* Hero Section */}
      <div className="p-5 text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{
            backgroundColor: `${color}33`,
            color: color,
            fontSize: '20px',
            fontWeight: '500'
          }}
        >
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '300', color: 'var(--tap-text-primary)', marginBottom: '8px' }}>
          {name}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--tap-text-secondary)', marginBottom: '12px' }}>
          {bio}
        </p>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: 'var(--tap-bg-secondary)',
            border: `1px solid ${color}33`,
            fontSize: '11px',
            color: 'var(--tap-text-primary)'
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
          Mode {mode}
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="px-5 mb-6">
          <div className={`grid gap-2 ${photos.length === 1 ? 'grid-cols-1' : photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {photos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-xl overflow-hidden"
                style={{ backgroundColor: 'var(--tap-bg-secondary)' }}
              >
                <ImageWithFallback
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompts */}
      {prompts.length > 0 && (
        <div className="px-5 mb-6">
          <div className="space-y-3">
            {prompts.map((prompt, index) => (
              <div
                key={index}
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: 'var(--tap-bg-secondary)',
                  border: '1px solid var(--tap-border-default)'
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--tap-text-tertiary)',
                    letterSpacing: '0.08em',
                    marginBottom: '8px'
                  }}
                >
                  {prompt.question}
                </div>
                <div style={{ fontSize: '15px', color: 'var(--tap-text-primary)', lineHeight: '1.5' }}>
                  {prompt.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links Section */}
      {enabledLinks.length > 0 && (
        <div className="px-5 mb-6">
          <label
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--tap-text-tertiary)',
              letterSpacing: '0.08em',
              display: 'block',
              marginBottom: '8px'
            }}
          >
            Me contacter
          </label>
          <div className="space-y-2">
            {enabledLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  className="w-full p-4 rounded-xl flex items-center gap-3"
                  style={{
                    backgroundColor: 'var(--tap-bg-secondary)',
                    border: '1px solid var(--tap-border-default)',
                    textAlign: 'left'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${link.color}26` }}
                  >
                    <Icon size={18} style={{ color: link.color }} />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: '14px', color: 'var(--tap-text-primary)', fontWeight: '500', marginBottom: '2px' }}>
                      {link.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--tap-text-tertiary)' }}>
                      {link.handle}
                    </div>
                  </div>
                  <ExternalLink size={16} style={{ color: 'var(--tap-text-tertiary)' }} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--tap-bg-secondary)' }}></div>
          <span style={{ fontSize: '11px', color: 'var(--tap-text-tertiary)', letterSpacing: '0.05em' }}>
            propulsé par tap
          </span>
        </div>
      </div>
    </div>
  );
}
