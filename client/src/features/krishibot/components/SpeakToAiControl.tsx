import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { processVoiceQuery } from '../services/speakToAiService.js';
import { speakText, stopSpeaking } from '../utils/krishiBot.utils.js';

export const SpeakToAiControl: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'hi' | 'bn'>('en');

  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  const handleStartVoice = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      alert('Speech recognition is not supported on this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setTranscript(null);
    setResponse(null);

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN'; // Multilingual default in Web Speech API supports EN/HI/BN

    recognition.onstart = () => {
      setIsListening(true);
      setIsThinking(false);
    };

    recognition.onresult = (event: any) => {
      const current = event.results[0][0].transcript;
      setTranscript(current);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setIsThinking(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalQuery = recognitionRef.current?.finalTranscript || transcript;
      if (finalQuery?.trim()) {
        processQuery(finalQuery.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const processQuery = (query: string) => {
    setIsThinking(true);
    setTimeout(() => {
      const result = processVoiceQuery(query);
      setIsThinking(false);
      setResponse(result.responseMessage);
      setActiveLang(result.detectedLanguage);

      // Perform navigation if command recognized
      if (result.isNavigation && result.navPath) {
        navigate(result.navPath);
      }

      // Speak response out loud
      speakText(result.responseMessage, result.detectedLanguage);
    }, 400);
  };

  const handleClose = () => {
    stopSpeaking();
    setIsListening(false);
    setIsThinking(false);
    setTranscript(null);
    setResponse(null);
  };

  return (
    <>
      {/* Floating Speak To AI Control Wrapper */}
      <div
        className="speak-to-ai-wrapper"
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '148px', // Positioned directly ABOVE the 80px chatbot button
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.4rem'
        }}
      >
        {/* Desktop/Mobile Floating Microphone Trigger Button */}
        <button
          onClick={handleStartVoice}
          className="speak-to-ai-trigger"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.1rem',
            borderRadius: '28px',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, var(--emerald-primary) 0%, #064e3b 100%)',
            color: '#FFFFFF',
            border: '1.5px solid var(--signal-lime)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.88rem',
            transition: 'all 0.25s ease',
            outline: 'none'
          }}
          title="Speak to AI Assistant"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px',
              color: 'var(--signal-lime)',
              animation: isListening ? 'pulse 1s infinite' : 'none'
            }}
          >
            {isListening ? 'graphic_eq' : 'mic'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <span>{isListening ? 'Listening...' : 'Speak to AI'}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--signal-lime)', fontWeight: 600 }}>EN • HI • BN</span>
          </div>
        </button>

        {/* CSS Pulse Keyframes */}
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          @media (max-width: 767px) {
            .speak-to-ai-wrapper {
              bottom: 144px !important;
              right: 16px !important;
            }
            .speak-to-ai-trigger {
              padding: 0.5rem 0.85rem !important;
              font-size: 0.8rem !important;
            }
          }
        `}</style>
      </div>

      {/* Compact Interactive Voice Dialog Panel */}
      {(isListening || isThinking || response || transcript) && (
        <div
          className="ambient-shadow"
          style={{
            position: 'fixed',
            bottom: '215px',
            right: '24px',
            width: '320px',
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--surface-2)',
            border: '1.5px solid var(--signal-lime)',
            borderRadius: '16px',
            padding: '1rem',
            zIndex: 1002,
            boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(16px)',
            color: 'var(--text-primary)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--signal-lime)' }}>
                record_voice_over
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                BharatFarm Voice Assistant
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>

          {/* Status Indicator */}
          {isListening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, margin: '0.4rem 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'pulse 1s infinite' }}>graphic_eq</span>
              <span>Listening to your question...</span>
            </div>
          )}

          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--signal-lime)', fontSize: '0.8rem', fontWeight: 700, margin: '0.4rem 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>sync</span>
              <span>Thinking...</span>
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--surface-inset)', padding: '0.4rem 0.6rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <strong>You:</strong> "{transcript}"
            </div>
          )}

          {/* Assistant Response Display */}
          {response && (
            <div style={{ fontSize: '0.82rem', lineHeight: 1.35, color: 'var(--text-primary)', background: 'var(--surface-1)', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                  {activeLang.toUpperCase()} RESPONDING
                </span>
                <button
                  onClick={() => speakText(response, activeLang)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--emerald-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>volume_up</span> Replay
                </button>
              </div>
              <p style={{ margin: 0, fontWeight: 550 }}>{response}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
