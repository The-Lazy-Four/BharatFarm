import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.js';
import { Input } from '../../../components/ui/Input.js';
import { Button } from '../../../components/ui/Button.js';
import { ChatWindow } from '../components/ChatWindow.js';
import { VoiceButton } from '../components/VoiceButton.js';
import { SuggestedActions } from '../components/SuggestedActions.js';
import { useKrishiBot } from '../hooks/useKrishiBot.js';
import { useLanguage } from '../../../context/LanguageContext.js';
import { FEATURE_IMAGES } from '../../../constants/featureImages.js';

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
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>AI Agronomist • Active</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            KrishiBot — Your AI Farm Assistant
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Ask questions about your crops, weather, or market conditions in natural text or voice.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Language:</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="input-field"
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              outline: 'none'
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-default)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text-primary)' }}>smart_toy</span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>KrishiBot Conversation</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multilingual Natural Language Assistant</p>
                  </div>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Online</span>
              </div>

              <ChatWindow messages={messages} language={language} />
              <SuggestedActions onSelect={text => sendMessage(text)} />
              {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <VoiceButton language={language} onSpeechRecognized={(text: string) => sendMessage(text)} />
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Type your question in English, Hindi, or Bengali..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                  />
                </div>
                <Button onClick={handleSend} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 4): Agronomist Image Card & Advisory Context */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* KrishiBot Featured Advisory Image Card */}
          <div className="card-feature-backed" style={{ minHeight: '160px' }}>
            <img src={FEATURE_IMAGES.krishibot.url} alt="KrishiBot Agronomist" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <span className="badge badge-primary">Multilingual voice AI</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>Instant Agronomic Advisory</h4>
              <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>Powered by OpenRouter LLM trained on PAU agricultural guidelines.</p>
            </div>
          </div>

          <Card title="Example Prompt Topics" subtitle="Ideas on what you can ask KrishiBot">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="alert-info" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bug_report</span>
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Pest & Disease Remedies</h5>
                  <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>"What organic spray controls yellow rust in wheat?"</p>
                </div>
              </div>

              <div className="alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>water_drop</span>
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Irrigation Schedules</h5>
                  <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>"How often should I water Basmati rice at flowering stage?"</p>
                </div>
              </div>

              <div className="alert-warning" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Mandi Price Benchmarks</h5>
                  <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>"What is the MSP rate for Mustard in Alwar today?"</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
