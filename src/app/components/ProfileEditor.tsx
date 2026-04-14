import { useState } from 'react';
import { ChevronLeft, Plus, X, Instagram, Linkedin, Music, Phone, Mail, MessageCircle, Globe, Camera, Trash2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Switch } from '../components/ui/switch';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfileEditorProps {
  onBack: () => void;
}

interface ModeProfile {
  name: string;
  color: string;
  emoji: string;
  gradient: string;
  photos: string[];
  prompts: { question: string; answer: string }[];
  bio: string;
  links: PlatformField[];
}

interface PlatformField {
  id: string;
  name: string;
  icon: any;
  color: string;
  handle: string;
  enabled: boolean;
}

const availablePrompts = [
  "Mon truc préféré du moment 🔥",
  "Ce qui me rend unique ✨",
  "Mon spot secret 📍",
  "Ma passion secrète 💫",
  "Ce que je cherche 🎯",
  "Mon meilleur conseil 💡",
  "Je suis fier(e) de 🏆",
  "Mon défi actuel 🚀"
];

export function ProfileEditor({ onBack }: ProfileEditorProps) {
  const [activeMode, setActiveMode] = useState<'Soirée' | 'Pro' | 'Sport' | 'Discret'>('Soirée');
  const [editingPrompt, setEditingPrompt] = useState<number | null>(null);
  const [userName, setUserName] = useState('Julien Moreau');

  const [modeProfiles, setModeProfiles] = useState<Record<string, ModeProfile>>({
    'Soirée': {
      name: 'Soirée',
      color: '#C8506A',
      emoji: '🎉',
      gradient: 'linear-gradient(135deg, #C8506A 0%, #E1306C 100%)',
      photos: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400'],
      prompts: [
        { question: "Mon truc préféré du moment 🔥", answer: "Mixer des sets électro dans les bars underground" },
        { question: "Ce qui me rend unique ✨", answer: "Je code le jour, je mixe la nuit 🎧" }
      ],
      bio: "DJ le weekend, dev la semaine",
      links: [
        { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C', handle: '@julien.moreau', enabled: true },
        { id: 'snapchat', name: 'Snapchat', icon: MessageCircle, color: '#FFFC00', handle: 'julienm', enabled: true },
        { id: 'spotify', name: 'Spotify', icon: Music, color: '#1DB954', handle: 'Julien M', enabled: true },
      ]
    },
    'Pro': {
      name: 'Pro',
      color: '#4A7DD4',
      emoji: '💼',
      gradient: 'linear-gradient(135deg, #4A7DD4 0%, #0077B5 100%)',
      photos: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'],
      prompts: [
        { question: "Ce que je cherche 🎯", answer: "Collaborations tech et opportunités de networking" }
      ],
      bio: "Full-stack developer · React & Node.js",
      links: [
        { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077B5', handle: 'julien-moreau', enabled: true },
        { id: 'portfolio', name: 'Portfolio', icon: Globe, color: '#7A5AC8', handle: 'julienmoreau.com', enabled: true },
        { id: 'email', name: 'Email', icon: Mail, color: '#4A7DD4', handle: 'j.moreau@gmail.com', enabled: true },
      ]
    },
    'Sport': {
      name: 'Sport',
      color: '#3A9A6A',
      emoji: '⚡',
      gradient: 'linear-gradient(135deg, #3A9A6A 0%, #1DB954 100%)',
      photos: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'],
      prompts: [
        { question: "Mon défi actuel 🚀", answer: "Préparer mon premier marathon en moins de 4h" }
      ],
      bio: "Runner · Cycliste · Outdoor enthusiast",
      links: [
        { id: 'phone', name: 'Numéro', icon: Phone, color: '#888888', handle: '+33 6 12 34 56 78', enabled: true },
        { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366', handle: '+33 6 12 34 56 78', enabled: true },
      ]
    },
    'Discret': {
      name: 'Discret',
      color: '#7A5AC8',
      emoji: '🔒',
      gradient: 'linear-gradient(135deg, #7A5AC8 0%, #9B59B6 100%)',
      photos: [],
      prompts: [],
      bio: "Contact minimal",
      links: [
        { id: 'email', name: 'Email', icon: Mail, color: '#4A7DD4', handle: 'j.moreau@gmail.com', enabled: true },
      ]
    }
  });

  const currentProfile = modeProfiles[activeMode];

  const modes = [
    { name: 'Soirée', color: '#C8506A', emoji: '🎉', gradient: 'linear-gradient(135deg, #C8506A 0%, #E1306C 100%)' },
    { name: 'Pro', color: '#4A7DD4', emoji: '💼', gradient: 'linear-gradient(135deg, #4A7DD4 0%, #0077B5 100%)' },
    { name: 'Sport', color: '#3A9A6A', emoji: '⚡', gradient: 'linear-gradient(135deg, #3A9A6A 0%, #1DB954 100%)' },
    { name: 'Discret', color: '#7A5AC8', emoji: '🔒', gradient: 'linear-gradient(135deg, #7A5AC8 0%, #9B59B6 100%)' }
  ];

  const currentModeData = modes.find(m => m.name === activeMode);

  const addPhoto = () => {
    const newPhotos = [...currentProfile.photos, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'];
    updateModeProfile('photos', newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = currentProfile.photos.filter((_, i) => i !== index);
    updateModeProfile('photos', newPhotos);
  };

  const addPrompt = () => {
    const newPrompts = [...currentProfile.prompts, { question: availablePrompts[0], answer: '' }];
    updateModeProfile('prompts', newPrompts);
    setEditingPrompt(newPrompts.length - 1);
  };

  const updatePrompt = (index: number, field: 'question' | 'answer', value: string) => {
    const newPrompts = [...currentProfile.prompts];
    newPrompts[index][field] = value;
    updateModeProfile('prompts', newPrompts);
  };

  const removePrompt = (index: number) => {
    const newPrompts = currentProfile.prompts.filter((_, i) => i !== index);
    updateModeProfile('prompts', newPrompts);
  };

  const updateModeProfile = (key: keyof ModeProfile, value: any) => {
    setModeProfiles({
      ...modeProfiles,
      [activeMode]: {
        ...currentProfile,
        [key]: value
      }
    });
  };

  const toggleLink = (id: string) => {
    const newLinks = currentProfile.links.map(link =>
      link.id === id ? { ...link, enabled: !link.enabled } : link
    );
    updateModeProfile('links', newLinks);
  };

  const updateLinkHandle = (id: string, handle: string) => {
    const newLinks = currentProfile.links.map(link =>
      link.id === id ? { ...link, handle } : link
    );
    updateModeProfile('links', newLinks);
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ backgroundColor: 'var(--tap-bg-primary)' }}>
      {/* Decorative Background */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: currentModeData?.gradient }}
      ></div>

      {/* Header - Sticky with glassmorphism */}
      <div 
        className="sticky top-0 z-20 p-5 pb-4 tap-glass"
        style={{ 
          borderBottom: '1px solid var(--tap-border-default)'
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 tap-button px-3 py-2 rounded-xl -ml-3"
          style={{ 
            color: 'var(--tap-text-secondary)', 
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <ChevronLeft size={18} />
          Retour
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '500', 
              color: 'var(--tap-text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}>
              Éditer ton profil
            </h1>
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: currentProfile.color }} />
              <span style={{ fontSize: '13px', color: 'var(--tap-text-secondary)' }}>
                Mode {activeMode}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {modes.map((mode) => (
            <button
              key={mode.name}
              onClick={() => setActiveMode(mode.name as any)}
              className="tap-card flex-shrink-0"
              style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: activeMode === mode.name ? mode.gradient : 'var(--tap-bg-secondary)',
                border: activeMode === mode.name ? 'none' : '1px solid var(--tap-border-default)',
                color: activeMode === mode.name ? '#ffffff' : 'var(--tap-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: activeMode === mode.name ? '500' : '400',
                minWidth: 'fit-content'
              }}
            >
              <span style={{ fontSize: '18px' }}>{mode.emoji}</span>
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-6 animate-slide-up">
        {/* Basic Info */}
        <div className="mb-8">
          <label 
            style={{ 
              fontSize: '12px',
              textTransform: 'uppercase',
              color: 'var(--tap-text-tertiary)',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              fontWeight: '500'
            }}
          >
            <Sparkles size={14} />
            Identité
          </label>
          <div 
            className="tap-card p-5 rounded-2xl"
            style={{ 
              backgroundColor: 'var(--tap-bg-secondary)',
              border: '1px solid var(--tap-border-default)'
            }}
          >
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ton nom"
              className="w-full mb-3 px-0 py-2"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--tap-border-default)',
                color: 'var(--tap-text-primary)',
                fontSize: '20px',
                fontWeight: '500',
                outline: 'none'
              }}
            />
            <textarea
              value={currentProfile.bio}
              onChange={(e) => updateModeProfile('bio', e.target.value)}
              placeholder="Écris quelque chose qui te représente..."
              className="w-full px-0 py-2 resize-none"
              rows={2}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--tap-text-secondary)',
                fontSize: '15px',
                outline: 'none',
                lineHeight: '1.5'
              }}
            />
          </div>
        </div>

        {/* Photos Section */}
        <div className="mb-8">
          <label 
            style={{ 
              fontSize: '12px',
              textTransform: 'uppercase',
              color: 'var(--tap-text-tertiary)',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              fontWeight: '500'
            }}
          >
            <ImageIcon size={14} />
            Photos · {currentProfile.photos.length}/6
          </label>
          <div className="grid grid-cols-3 gap-3">
            {currentProfile.photos.map((photo, index) => (
              <div
                key={index}
                className="tap-card relative aspect-square rounded-2xl overflow-hidden group"
                style={{ backgroundColor: 'var(--tap-bg-secondary)' }}
              >
                <ImageWithFallback
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => removePhoto(index)}
                    className="tap-button opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
            {currentProfile.photos.length < 6 && (
              <button
                onClick={addPhoto}
                className="tap-card aspect-square rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--tap-bg-secondary)',
                  border: `2px dashed ${currentProfile.color}40`
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${currentProfile.color}15` }}
                >
                  <Camera size={20} style={{ color: currentProfile.color }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--tap-text-tertiary)', fontWeight: '500' }}>
                  Ajouter
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Prompts Section */}
        <div className="mb-8">
          <label 
            style={{ 
              fontSize: '12px',
              textTransform: 'uppercase',
              color: 'var(--tap-text-tertiary)',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              fontWeight: '500'
            }}
          >
            <Sparkles size={14} />
            Prompts · {currentProfile.prompts.length}/5
          </label>
          <div className="space-y-3">
            {currentProfile.prompts.map((prompt, index) => (
              <div
                key={index}
                className="tap-card p-5 rounded-2xl relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--tap-bg-secondary)',
                  border: '1px solid var(--tap-border-default)'
                }}
              >
                <div 
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ background: currentModeData?.gradient }}
                ></div>
                <div className="flex items-start justify-between mb-3 pl-3">
                  <select
                    value={prompt.question}
                    onChange={(e) => updatePrompt(index, 'question', e.target.value)}
                    className="flex-1 px-0 py-1"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--tap-text-primary)',
                      fontSize: '14px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    {availablePrompts.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removePrompt(index)}
                    className="tap-button w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ 
                      color: 'var(--tap-text-tertiary)',
                      backgroundColor: 'var(--tap-bg-primary)'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  value={prompt.answer}
                  onChange={(e) => updatePrompt(index, 'answer', e.target.value)}
                  placeholder="Ta réponse ici..."
                  className="w-full px-3 py-2 resize-none rounded-xl"
                  rows={2}
                  style={{
                    backgroundColor: 'var(--tap-bg-primary)',
                    border: '1px solid var(--tap-border-default)',
                    color: 'var(--tap-text-secondary)',
                    fontSize: '14px',
                    outline: 'none',
                    lineHeight: '1.5'
                  }}
                />
              </div>
            ))}
            {currentProfile.prompts.length < 5 && (
              <button
                onClick={addPrompt}
                className="tap-button w-full p-5 rounded-2xl flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--tap-bg-secondary)',
                  border: `2px dashed ${currentProfile.color}40`,
                  color: currentProfile.color,
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Plus size={18} />
                Ajouter un prompt
              </button>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div className="mb-8">
          <label 
            style={{ 
              fontSize: '12px',
              textTransform: 'uppercase',
              color: 'var(--tap-text-tertiary)',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              fontWeight: '500'
            }}
          >
            <Globe size={14} />
            Liens & Réseaux
          </label>
          <div className="space-y-3">
            {currentProfile.links.map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.id}
                  className="tap-card p-4 rounded-2xl flex items-center gap-3"
                  style={{
                    backgroundColor: 'var(--tap-bg-secondary)',
                    border: '1px solid var(--tap-border-default)',
                    opacity: link.enabled ? 1 : 0.5,
                    transition: 'all 0.3s'
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${link.color}20 0%, ${link.color}10 100%)` }}
                  >
                    <Icon size={18} style={{ color: link.color }} />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: '14px', color: 'var(--tap-text-primary)', fontWeight: '500', marginBottom: '4px' }}>
                      {link.name}
                    </div>
                    <input
                      type="text"
                      value={link.handle}
                      onChange={(e) => updateLinkHandle(link.id, e.target.value)}
                      placeholder="Ton identifiant..."
                      className="w-full px-0 py-0"
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--tap-text-tertiary)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <Switch
                    checked={link.enabled}
                    onCheckedChange={() => toggleLink(link.id)}
                    style={{
                      backgroundColor: link.enabled ? link.color : 'var(--tap-bg-tertiary)',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Save Button - Fixed */}
      <div
        className="fixed bottom-0 left-0 right-0 p-5 tap-glass"
        style={{
          borderTop: '1px solid var(--tap-border-default)'
        }}
      >
        <div className="mx-auto" style={{ maxWidth: '390px' }}>
          <button
            onClick={onBack}
            className="tap-button w-full rounded-2xl relative overflow-hidden"
            style={{
              background: currentModeData?.gradient,
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              height: '56px'
            }}
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
