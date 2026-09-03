import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@core/context/AuthContext';
import { useLanguage } from '@core/context/LanguageContext';
import { useKrishiBot } from '../hooks/useKrishiBot';
import { ChatWindow } from './ChatWindow';
import { SuggestedActions } from './SuggestedActions';
import { VoiceButton } from './VoiceButton';
import { Input } from '@core/ui/Input';
import { Button } from '@core/ui/Button';

export const FloatingKrishiBot: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { messages, sendMessage, isLoading, error } = useKrishiBot(language);

  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(true);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setShowLanguageSelect(false);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showLanguageSelect]);

  if (!user) return null; // Only show for logged in users

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // If closing or opening first time, prompt language selection
          if (!isOpen) {
            setShowLanguageSelect(true);
          }
        }}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--signal-lime)',
          color: 'var(--dark-text)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          cursor: 'pointer',
          zIndex: 1001,
          transition: 'var(--transition)',
          outline: 'none'
        }}
        title="Ask KrishiBot"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* Floating Chat popover */}
      {isOpen && (
        <div
          className="ambient-shadow"
          style={{
            position: 'fixed',
            bottom: '150px',
            right: '24px',
            width: '360px',
            height: '500px',
            background: '#FFFFFF',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1001,
            animation: 'slideUp 0.2s ease-out'
          }}
        >
          {/* SlideUp animation keyframes */}
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--sidebar-bg)',
              borderBottom: '1px solid rgba(34,37,31,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--dark-text)' }}>
                smart_toy
              </span>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark-text)', margin: 0 }}>
                  KrishiBot
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {!showLanguageSelect ? `Language: ${language.toUpperCase()}` : 'AI Assistant'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {!showLanguageSelect && (
                <button
                  onClick={() => setShowLanguageSelect(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2'
                  }}
                  title="Change language"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>language</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body Content */}
          {showLanguageSelect ? (
            /* Step 1: Language Selection */
            <div
              style={{
                flex: 1,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--dark-text)' }}>
                translate
              </span>
              <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-text)' }}>
                Choose Language / भाषा चुनें
              </h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Select the language on which you want to converse with KrishiBot
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '200px' }}>
                <Button onClick={() => handleLanguageSelect('en')} variant="primary" style={{ width: '100%' }}>
                  English
                </Button>
                <Button onClick={() => handleLanguageSelect('hi')} variant="secondary" style={{ width: '100%' }}>
                  हिंदी (Hindi)
                </Button>
                <Button onClick={() => handleLanguageSelect('bn')} variant="secondary" style={{ width: '100%' }}>
                  বাংলা (Bengali)
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Active Chat window */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Message scroll container */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                <ChatWindow messages={messages} language={language} />
                <div ref={chatEndRef} />
              </div>

              {/* Error overlay */}
              {error && (
                <div style={{ padding: '0.5rem 1rem', background: '#FEE2E2', color: 'var(--danger)', fontSize: '0.75rem', borderTop: '1px solid rgba(220, 38, 38, 0.1)' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Suggestions & Input area */}
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(34,37,31,0.1)', background: '#FFFFFF' }}>
                <div style={{ maxHeight: '60px', overflowY: 'auto', marginBottom: '0.5rem' }}>
                  <SuggestedActions onSelect={text => sendMessage(text)} />
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <Input
                    placeholder="Ask KrishiBot..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                  <VoiceButton language={language} onSpeechRecognized={text => sendMessage(text, true)} />
                  <Button onClick={handleSend} isLoading={isLoading} size="sm" style={{ padding: '0.5rem 1rem' }}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

