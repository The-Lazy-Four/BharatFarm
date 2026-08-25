import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.js';
import { Input } from '../../../components/ui/Input.js';
import { Button } from '../../../components/ui/Button.js';
import { ChatWindow } from '../components/ChatWindow.js';
import { VoiceButton } from '../components/VoiceButton.js';
import { SuggestedActions } from '../components/SuggestedActions.js';
import { useKrishiBot } from '../hooks/useKrishiBot.js';
import { useLanguage } from '../../../context/LanguageContext.js';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'bn', label: 'বাংলা' }
];

export const KrishiBotPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { messages, sendMessage, isLoading, error } = useKrishiBot(language);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>AI Agronomist • Active</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            KrishiBot — Your AI Farm Assistant
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Ask questions about your crops, weather, or market conditions in natural text or voice.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Language:</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.85rem',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout Grid matching Stitch */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Interactive Chat Window */}
        <div className="col-span-8">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>🤖</span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>KrishiBot Conversation</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Multilingual Natural Language Assistant</p>
                  </div>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Online</span>
              </div>

              <ChatWindow messages={messages} language={language} />
              <SuggestedActions onSelect={text => sendMessage(text)} />
              {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Input
                  placeholder="Type your agricultural query..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <VoiceButton language={language} onSpeechRecognized={text => sendMessage(text, true)} />
                <Button onClick={handleSend} isLoading={isLoading}>
                  Send
                </Button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem', textAlign: 'center' }}>
                Press the microphone to speak naturally to KrishiBot.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 4): Farm Context & Local Telemetry Panel (Stitch reference) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Farm Context */}
          <Card title="Active Farm Context" subtitle="Data passed automatically to KrishiBot for precise advice.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Crop</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Wheat (PBW 725)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Growth Stage</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Vegetative (Day 42)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Field Location</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Ludhiana, Punjab</strong>
              </div>
            </div>
          </Card>

          {/* Recent Telemetry & Scans */}
          <Card title="Recent Field Scans">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Yellow Rust Alert</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>2 days ago</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Fungicide recommendation issued for Block A.
                </p>
              </div>

              <div style={{ padding: '0.75rem', background: '#F0FDF4', border: '1px solid #B8E1C4', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Soil Moisture Optimal</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Yesterday</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Humidity check 52% — ideal for fertigation.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
