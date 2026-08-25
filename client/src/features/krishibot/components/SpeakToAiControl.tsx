import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SpeakToAiService } from '../services/speakToAiService.js';
import { detectSpokenLanguage } from '../voiceKnowledge/intentClassifier.js';
import { speakText, stopSpeaking } from '../utils/krishiBot.utils.js';

export const SpeakToAiControl: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'hi' | 'bn'>('en');
  const [micError, setMicError] = useState<string | null>(null);

  // Active recognition locale stored in session (remembers detected language across interactions)
  const sessionLangRef = useRef<'en' | 'hi' | 'bn'>('en');
  const recognitionRef = useRef<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  const handleStartVoice = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setMicError('Speech recognition is not supported on this browser.');
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    stopSpeaking();
    setIsSpeakingState(false);
    setTranscript(null);
    setResponse(null);
    setMicError(null);

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;

    // Use preferred session locale or default to Indian English / Hindi multi-locales
    const localeMap = { en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN' };
    recognition.lang = localeMap[sessionLangRef.current] || 'hi-IN';

    let capturedTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setIsThinking(false);
    };

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        current += event.results[i][0].transcript;
      }
      capturedTranscript = current;
      setTranscript(current);

      // Dynamically detect script/language from live transcript if confident
      const liveLang = detectSpokenLanguage(current);
      if (liveLang !== sessionLangRef.current) {
        sessionLangRef.current = liveLang;
        setActiveLang(liveLang);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setIsThinking(false);
      if (event.error === 'not-allowed') {
        let msg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
        if (sessionLangRef.current === 'hi') msg = 'माइक की अनुमति अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स में माइक्रोफ़ोन एक्सेस चालू करें।';
        if (sessionLangRef.current === 'bn') msg = 'মাইক্রোফোনের অনুমতি দেওয়া হয়নি। আপনার ব্রাউজার সেটিংসে মাইক্রোফোন চালুন।';
        setMicError(msg);
      } else if (event.error !== 'aborted') {
        let msg = 'Speech recognition failed. Please try speaking again.';
        if (sessionLangRef.current === 'hi') msg = 'आवाज़ पहचानने में विफलता। कृपया पुनः प्रयास करें।';
        if (sessionLangRef.current === 'bn') msg = 'কথা শুনতে সমস্যা হয়েছে। অনুগ্রহ করে আবার বলুন।';
        setMicError(msg);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      const query = capturedTranscript.trim() || transcript?.trim();
      if (query) {
        processQuery(query);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsListening(false);
  };

  const processQuery = async (query: string) => {
    const detected = detectSpokenLanguage(query);
    sessionLangRef.current = detected;
    setActiveLang(detected);

    setIsThinking(true);

    // Call two-layer SpeakToAiService
    const result = await SpeakToAiService.processQuery(query, location.pathname);

    setIsThinking(false);
    setResponse(result.responseMessage);

    // If navigation intent recognized, execute immediate routing
    if (result.isNavigation && result.navPath) {
      if (result.navPath === '-1') {
        navigate(-1);
      } else {
        navigate(result.navPath);
      }
    }

    // Speak output out loud
    setIsSpeakingState(true);
    speakText(result.responseMessage, result.detectedLanguage);
  };

  const handleClose = () => {
    stopSpeaking();
    stopListening();
    setIsListening(false);
    setIsThinking(false);
    setIsSpeakingState(false);
    setTranscript(null);
    setResponse(null);
    setMicError(null);
  };

  return (
    <>
      {/* Floating Speak To AI Control Wrapper */}
      <div
        className="speak-to-ai-wrapper"
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '148px', // Positioned floating above the chatbot button
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.4rem'
        }}
      >
        {/* Floating Microphone Trigger Button */}
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
              : isThinking
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : isSpeakingState
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
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
              animation: isListening ? 'pulse 1s infinite' : isThinking ? 'spin 1s linear infinite' : 'none'
            }}
          >
            {isListening ? 'graphic_eq' : isThinking ? 'sync' : isSpeakingState ? 'volume_up' : 'mic'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <span>
              {isListening ? 'Listening...' : isThinking ? 'Thinking...' : isSpeakingState ? 'Speaking...' : 'Speak to AI'}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--signal-lime)', fontWeight: 600 }}>
              {activeLang.toUpperCase()} • EN / HI / BN
            </span>
          </div>
        </button>

        {/* CSS Keyframes */}
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
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

      {/* Interactive Voice Assistant Status & Dialog Card */}
      {(isListening || isThinking || response || transcript || micError) && (
        <div
          className="ambient-shadow"
          style={{
            position: 'fixed',
            bottom: '215px',
            right: '24px',
            width: '340px',
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
          {/* Panel Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--signal-lime)' }}>
                record_voice_over
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
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

          {/* Status Indicator Bar */}
          {isListening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, margin: '0.4rem 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'pulse 1s infinite' }}>graphic_eq</span>
              <span>Listening in {activeLang === 'hi' ? 'Hindi' : activeLang === 'bn' ? 'Bengali' : 'English'}...</span>
            </div>
          )}

          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, margin: '0.4rem 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>sync</span>
              <span>Thinking & consulting advisor...</span>
            </div>
          )}

          {/* Error Banner */}
          {micError && (
            <div style={{ fontSize: '0.78rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
              ⚠️ {micError}
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface-inset)', padding: '0.45rem 0.65rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <strong>You:</strong> "{transcript}"
            </div>
          )}

          {/* Assistant Response Display */}
          {response && (
            <div style={{ fontSize: '0.82rem', lineHeight: 1.38, color: 'var(--text-primary)', background: 'var(--surface-1)', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem', fontWeight: 800 }}>
                  {activeLang.toUpperCase()} RESPONSE
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setIsSpeakingState(true);
                      speakText(response, activeLang);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--emerald-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>volume_up</span> Replay
                  </button>
                  <button
                    onClick={() => stopSpeaking()}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Stop
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, fontWeight: 550 }}>{response}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
