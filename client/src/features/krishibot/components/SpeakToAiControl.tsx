import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpeakToAiService } from '../services/speakToAiService.js';
import { detectSpokenLanguage, normalizeText, LanguageCode } from '../voiceKnowledge/intentClassifier.js';
import { speakText, stopSpeaking } from '../utils/krishiBot.utils.js';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'INTERRUPTED' | 'ERROR';

export const SpeakToAiControl: React.FC = () => {
  const [assistantState, setAssistantState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageCode>('en');
  const [micError, setMicError] = useState<string | null>(null);

  // Persistent session refs
  const isModeActiveRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const isRecognitionRunningRef = useRef<boolean>(false);
  const sessionLangRef = useRef<LanguageCode>('en');
  const activeRequestIdRef = useRef<number>(0);
  const currentResponseTextRef = useRef<string>('');
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastIntentRef = useRef<string | undefined>(undefined);

  const navigate = useNavigate();

  // Helper to safely stop current TTS playback
  const cancelTTS = useCallback(() => {
    stopSpeaking();
    ttsUtteranceRef.current = null;
  }, []);

  // Forward declaration of restart listening loop
  const startRecognitionLoop = useCallback(() => {
    if (!isModeActiveRef.current) return;
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setMicError('Speech recognition is not supported on this browser.');
      setAssistantState('ERROR');
      return;
    }

    if (isRecognitionRunningRef.current) return;

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = true;

      const localeMap: Record<LanguageCode, string> = {
        en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', mr: 'mr-IN', te: 'te-IN',
        ta: 'ta-IN', kn: 'kn-IN', gu: 'gu-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN'
      };
      recognition.lang = localeMap[sessionLangRef.current] || 'hi-IN';

      let finalCaptured = '';

      recognition.onstart = () => {
        isRecognitionRunningRef.current = true;
        setAssistantState(prev => (prev === 'SPEAKING' ? 'SPEAKING' : 'LISTENING'));
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          current += event.results[i][0].transcript;
        }
        if (!current.trim()) return;

        const normCurrent = normalizeText(current);

        // Self-trigger protection against assistant's own TTS output
        if (currentResponseTextRef.current) {
          const normResponse = normalizeText(currentResponseTextRef.current);
          if (normResponse.includes(normCurrent) || normCurrent.includes(normResponse)) {
            return; // Ignore echo of assistant's own voice
          }
        }

        // BARGE-IN INTERRUPTION HANDLER:
        // If the farmer speaks while the assistant is speaking, immediately interrupt TTS & cancel previous response!
        if (ttsUtteranceRef.current || window.speechSynthesis.speaking) {
          cancelTTS();
          setAssistantState('INTERRUPTED');
        }

        finalCaptured = current;
        setTranscript(current);

        // Live language detection from speech stream
        const detected = detectSpokenLanguage(current);
        if (detected !== sessionLangRef.current) {
          sessionLangRef.current = detected;
          setActiveLang(detected);
        }
      };

      recognition.onerror = (event: any) => {
        isRecognitionRunningRef.current = false;
        if (event.error === 'not-allowed') {
          isModeActiveRef.current = false;
          let msg = 'Microphone permission denied. Please allow microphone access.';
          if (sessionLangRef.current === 'hi') msg = 'माइक की अनुमति अस्वीकृत। कृपया माइक्रोफ़ोन एक्सेस चालू करें।';
          if (sessionLangRef.current === 'bn') msg = 'মাইক্রোফোনের অনুমতি দেওয়া হয়নি। অনুগ্রহ করে চালুন।';
          setMicError(msg);
          setAssistantState('ERROR');
        } else if (event.error !== 'aborted') {
          // Attempt automatic restart if mode is still active
          if (isModeActiveRef.current) {
            setTimeout(() => startRecognitionLoop(), 300);
          }
        }
      };

      recognition.onend = () => {
        isRecognitionRunningRef.current = false;
        const query = finalCaptured.trim();

        if (query && isModeActiveRef.current) {
          handleUserVoiceQuery(query);
        } else if (isModeActiveRef.current) {
          // If silence occurred, automatically restart listening loop unless currently speaking or processing
          setTimeout(() => {
            if (isModeActiveRef.current && !isRecognitionRunningRef.current && !window.speechSynthesis.speaking) {
              startRecognitionLoop();
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      isRecognitionRunningRef.current = false;
    }
  }, [cancelTTS]);

  // Main voice query handler
  const handleUserVoiceQuery = async (query: string) => {
    const requestId = ++activeRequestIdRef.current;
    cancelTTS();

    setAssistantState('PROCESSING');
    const detected = detectSpokenLanguage(query);
    sessionLangRef.current = detected;
    setActiveLang(detected);

    // Run Two-Layer Intent & AI Service
    const result = await SpeakToAiService.processQuery(query, lastIntentRef.current);
    if (result.matchedIntentId) {
      lastIntentRef.current = result.matchedIntentId;
    }

    // Stale request check (barge-in / newer query invalidates older response)
    if (requestId !== activeRequestIdRef.current || !isModeActiveRef.current) {
      return;
    }

    setResponse(result.responseMessage);
    currentResponseTextRef.current = result.responseMessage;

    // Immediate navigation if command matched
    if (result.isNavigation && result.navPath) {
      if (result.navPath === '-1') {
        navigate(-1);
      } else {
        navigate(result.navPath);
      }
    }

    // Begin speaking response out loud
    setAssistantState('SPEAKING');
    const utterance = speakText(
      result.responseMessage,
      result.detectedLanguage,
      // On TTS completion -> automatically return to continuous LISTENING loop!
      () => {
        if (requestId === activeRequestIdRef.current && isModeActiveRef.current) {
          currentResponseTextRef.current = '';
          setAssistantState('LISTENING');
          startRecognitionLoop();
        }
      },
      // On TTS error
      () => {
        if (requestId === activeRequestIdRef.current && isModeActiveRef.current) {
          currentResponseTextRef.current = '';
          setAssistantState('LISTENING');
          startRecognitionLoop();
        }
      }
    );

    ttsUtteranceRef.current = utterance;
  };

  // Toggle button handler: First Click -> Start persistent mode, Second Click -> Stop completely
  const toggleVoiceMode = () => {
    if (isModeActiveRef.current) {
      stopVoiceAssistantCompletely();
    } else {
      startVoiceAssistantMode();
    }
  };

  const startVoiceAssistantMode = () => {
    cancelTTS();
    isModeActiveRef.current = true;
    setMicError(null);
    setTranscript(null);
    setResponse(null);
    currentResponseTextRef.current = '';
    setAssistantState('LISTENING');
    startRecognitionLoop();
  };

  const stopVoiceAssistantCompletely = () => {
    isModeActiveRef.current = false;
    cancelTTS();

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
    }
    isRecognitionRunningRef.current = false;

    setAssistantState('IDLE');
    setTranscript(null);
    setResponse(null);
    currentResponseTextRef.current = '';
    setMicError(null);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopVoiceAssistantCompletely();
    };
  }, []);

  return (
    <>
      {/* Floating Persistent Voice Assistant Control */}
      <div
        className="speak-to-ai-wrapper"
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '148px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.4rem'
        }}
      >
        <button
          onClick={toggleVoiceMode}
          className="speak-to-ai-trigger"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.1rem',
            borderRadius: '28px',
            background:
              assistantState === 'LISTENING'
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : assistantState === 'PROCESSING'
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : assistantState === 'SPEAKING'
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : assistantState === 'INTERRUPTED'
                ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
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
          title="Toggle Continuous Speak to AI Mode"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px',
              color: 'var(--signal-lime)',
              animation: assistantState === 'LISTENING' ? 'pulse 1s infinite' : assistantState === 'PROCESSING' ? 'spin 1s linear infinite' : 'none'
            }}
          >
            {assistantState === 'LISTENING'
              ? 'graphic_eq'
              : assistantState === 'PROCESSING'
              ? 'sync'
              : assistantState === 'SPEAKING'
              ? 'volume_up'
              : assistantState === 'INTERRUPTED'
              ? 'bolt'
              : 'mic'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <span>
              {assistantState === 'IDLE'
                ? 'Speak to AI'
                : assistantState === 'LISTENING'
                ? 'Listening...'
                : assistantState === 'PROCESSING'
                ? 'Thinking...'
                : assistantState === 'SPEAKING'
                ? 'Speaking (Barge-in On)'
                : assistantState === 'INTERRUPTED'
                ? 'Interrupted!'
                : 'Speak to AI'}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--signal-lime)', fontWeight: 600 }}>
              {isModeActiveRef.current ? `${activeLang.toUpperCase()} • CONTINUOUS MODE` : 'EN • HI • BN'}
            </span>
          </div>
        </button>

        {/* CSS Animations */}
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

      {/* Interactive Status Panel */}
      {assistantState !== 'IDLE' && (
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
              onClick={stopVoiceAssistantCompletely}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
              title="Close Voice Assistant"
            >
              ✕
            </button>
          </div>

          {/* Active Status Display */}
          {assistantState === 'LISTENING' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, margin: '0.4rem 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'pulse 1s infinite' }}>graphic_eq</span>
              <span>Continuous Listening ({activeLang === 'hi' ? 'Hindi' : activeLang === 'bn' ? 'Bengali' : 'English'})...</span>
            </div>
          )}

          {assistantState === 'PROCESSING' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, margin: '0.4rem 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>sync</span>
              <span>Thinking & processing query...</span>
            </div>
          )}

          {assistantState === 'INTERRUPTED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 700, margin: '0.4rem 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bolt</span>
              <span>Speech interrupted! Listening to your new request...</span>
            </div>
          )}

          {micError && (
            <div style={{ fontSize: '0.78rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
              ⚠️ {micError}
            </div>
          )}

          {transcript && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface-inset)', padding: '0.45rem 0.65rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <strong>You:</strong> "{transcript}"
            </div>
          )}

          {response && (
            <div style={{ fontSize: '0.82rem', lineHeight: 1.38, color: 'var(--text-primary)', background: 'var(--surface-1)', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem', fontWeight: 800 }}>
                  {activeLang.toUpperCase()} RESPONSE
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setAssistantState('SPEAKING');
                      const utterance = speakText(response, activeLang, () => {
                        setAssistantState('LISTENING');
                        startRecognitionLoop();
                      });
                      ttsUtteranceRef.current = utterance;
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--emerald-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>volume_up</span> Replay
                  </button>
                  <button
                    onClick={cancelTTS}
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
