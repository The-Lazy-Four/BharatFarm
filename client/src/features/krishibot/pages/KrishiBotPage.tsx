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
    <Card
      title="KrishiBot — Multilingual AI Agronomist"
      subtitle="Ask farming queries via text or voice in your preferred language."
      action={
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '0.4rem 0.7rem',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }}
        >
          {LANGUAGE_OPTIONS.map(opt => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
      }
    >
      <ChatWindow messages={messages} language={language} />
      <SuggestedActions onSelect={text => sendMessage(text)} />
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <Input
          placeholder="Ask KrishiBot about crop diseases, fertilizers, weather..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <VoiceButton language={language} onSpeechRecognized={text => sendMessage(text, true)} />
        <Button onClick={handleSend} isLoading={isLoading}>
          Send
        </Button>
      </div>
    </Card>
  );
};
