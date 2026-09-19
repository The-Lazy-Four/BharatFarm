import React, { useState, useEffect, useRef } from 'react';

interface CallSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TranscriptItem {
  speaker: 'ai' | 'farmer';
  text: string;
  dtmf?: string;
  timestamp: string;
}

interface MenuOption {
  key: string;
  label: string;
}

const FLOW_STEPS = [
  { id: 'WELCOME_LANGUAGE', label: 'Language Selection', icon: 'translate' },
  { id: 'MAIN_MENU', label: 'Main IVR Menu', icon: 'dialpad' },
  { id: 'MODULE_ROUTED', label: 'BharatFarm Service', icon: 'agriculture' },
  { id: 'AI_GUIDANCE', label: 'Step-by-Step AI Guidance', icon: 'support_agent' }
];

export const CallSimulatorModal: React.FC<CallSimulatorModalProps> = ({ isOpen, onClose }) => {
  // Call States
  const [callState, setCallState] = useState<'IDLE' | 'DIALING' | 'CONNECTED' | 'ENDED'>('IDLE');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<string>('WELCOME_LANGUAGE');
  const [activeModule, setActiveModule] = useState<string>('');
  const [language, setLanguage] = useState<'hi' | 'en' | 'bn'>('hi');
  const [displayPrompt, setDisplayPrompt] = useState<string>('');
  const [spokenText, setSpokenText] = useState<string>('');
  const [optionsMenu, setOptionsMenu] = useState<MenuOption[]>([]);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'phone' | 'flow' | 'transcript'>('phone');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Check Web Speech Recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setSpeechTranscript(text);
          setIsListening(false);
          sendSpeech(text);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Call duration counter
  useEffect(() => {
    if (callState === 'CONNECTED') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Text to Speech playback
  const speakText = (text: string, lang: 'hi' | 'en' | 'bn') => {
    if (!isSpeakerOn || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'bn') utterance.lang = 'bn-IN';
    else utterance.lang = 'en-IN';
    utterance.rate = 0.95; // Farmer friendly deliberate pace
    window.speechSynthesis.speak(utterance);
  };

  // Start Call / Connect
  const startCall = async () => {
    const newSessionId = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setSessionId(newSessionId);
    setCallState('DIALING');
    setCallDuration(0);
    setTranscript([]);

    try {
      const response = await fetch('/api/sahayak/call/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSessionId,
          callerPhone: '+91 98312 00001'
        })
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setCallState('CONNECTED');
        handleResponseData(resJson.data);
      } else {
        fallbackToOfflineDemo(newSessionId);
      }
    } catch (e) {
      fallbackToOfflineDemo(newSessionId);
    }
  };

  const fallbackToOfflineDemo = (sessId: string) => {
    setCallState('CONNECTED');
    const greeting = "Welcome to BharatFarm Sahayak Helpline. For Hindi, press 1. For English, press 2. For Bengali, press 3.";
    setDisplayPrompt(greeting);
    setSpokenText(greeting);
    setCurrentStep('WELCOME_LANGUAGE');
    setOptionsMenu([
      { key: '1', label: 'हिन्दी (Hindi)' },
      { key: '2', label: 'English' },
      { key: '3', label: 'বাংলা (Bengali)' }
    ]);
    setTranscript([
      { speaker: 'ai', text: greeting, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    speakText(greeting, 'en');
  };

  const handleResponseData = (data: any) => {
    setCurrentStep(data.currentStep);
    if (data.activeModule) setActiveModule(data.activeModule);
    if (data.language) setLanguage(data.language);
    setDisplayPrompt(data.displayPrompt);
    setSpokenText(data.spokenText);
    setOptionsMenu(data.optionsMenu || []);

    setTranscript((prev) => [
      ...prev,
      {
        speaker: 'ai',
        text: data.displayPrompt || data.spokenText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    speakText(data.spokenText, data.language || language);

    if (data.isCallEnded) {
      endCall();
    }
  };

  // Send DTMF Digit
  const sendDtmf = async (digit: string) => {
    if (callState !== 'CONNECTED' || !sessionId) return;

    setTranscript((prev) => [
      ...prev,
      {
        speaker: 'farmer',
        text: `[DTMF: Key ${digit}]`,
        dtmf: digit,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const response = await fetch('/api/sahayak/call/dtmf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          digits: digit
        })
      });
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        handleResponseData(resJson.data);
      }
    } catch (e) {
      console.error('DTMF call error', e);
    }
  };

  // Send Transcribed Speech or Natural Text
  const sendSpeech = async (text: string) => {
    if (callState !== 'CONNECTED' || !sessionId || !text.trim()) return;

    setTranscript((prev) => [
      ...prev,
      {
        speaker: 'farmer',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCustomQuery('');

    try {
      const response = await fetch('/api/sahayak/call/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          speechText: text
        })
      });
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        handleResponseData(resJson.data);
      }
    } catch (e) {
      console.error('Speech call error', e);
    }
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Browser Speech Recognition not supported in this browser. Please type spoken query in the text box below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        if (language === 'hi') recognitionRef.current.lang = 'hi-IN';
        else if (language === 'bn') recognitionRef.current.lang = 'bn-IN';
        else recognitionRef.current.lang = 'en-IN';

        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // End Call
  const endCall = async () => {
    if (sessionId) {
      try {
        await fetch('/api/sahayak/call/terminate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch (e) {}
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setCallState('ENDED');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Auto trigger start call when modal opens
  useEffect(() => {
    if (isOpen && callState === 'IDLE') {
      startCall();
    }
    if (!isOpen) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setCallState('IDLE');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Active step index for flowchart
  const getActiveFlowIndex = () => {
    if (currentStep === 'WELCOME_LANGUAGE') return 0;
    if (currentStep === 'MAIN_MENU') return 1;
    if (currentStep.endsWith('_FLOW')) return 2;
    return 3;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#0F172A',
        borderRadius: '32px',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155',
        overflow: 'hidden',
        color: '#F8FAFC'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '1.1rem 1.75rem',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#FFFFFF', fontSize: '24px' }}>call</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#FFFFFF' }}>
                  BharatFarm Sahayak AI Phone Line
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                  background: callState === 'CONNECTED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: callState === 'CONNECTED' ? '#34D399' : '#F87171',
                  border: `1px solid ${callState === 'CONNECTED' ? '#059669' : '#DC2626'}`,
                  fontWeight: 800
                }}>
                  {callState === 'CONNECTED' ? '🟢 LIVE CALL' : callState === 'DIALING' ? '🟡 RINGING...' : '🔴 ENDED'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
                Toll-Free Helpline 1800-BHARAT-FARM (1800-242-728) · Low-Literacy Voice Access Layer
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* View Switcher Tabs */}
            <div style={{ background: '#1E293B', borderRadius: '10px', padding: '0.25rem', display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => setActiveTab('phone')}
                style={{
                  background: activeTab === 'phone' ? '#10B981' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Keypad & Call
              </button>
              <button
                onClick={() => setActiveTab('flow')}
                style={{
                  background: activeTab === 'flow' ? '#10B981' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                IVR Flow Architecture
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                style={{
                  background: activeTab === 'transcript' ? '#10B981' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Call Transcript ({transcript.length})
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          
          {/* Visual IVR Step Flowbar (Judges Architecture View) */}
          <div style={{
            background: '#1E293B',
            borderRadius: '16px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {FLOW_STEPS.map((step, idx) => {
              const isActive = getActiveFlowIndex() === idx;
              const isPast = getActiveFlowIndex() > idx;
              return (
                <React.Fragment key={step.id}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isActive || isPast ? 1 : 0.4
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isActive ? '#10B981' : isPast ? '#059669' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      color: '#FFFFFF'
                    }}>
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#34D399' : '#E2E8F0'
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {idx < FLOW_STEPS.length - 1 && (
                    <span className="material-symbols-outlined" style={{ color: '#475569', fontSize: '18px' }}>
                      arrow_forward
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {activeTab === 'flow' ? (
            /* ARCHITECTURE FLOW DIAGRAM VIEW */
            <div style={{
              background: '#1E293B',
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid #334155'
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 1rem 0', color: '#10B981' }}>
                Telephony & IVR Voice Engine Architecture
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                Sahayak functions as a telephone and digital access layer over BharatFarm's production intelligence.
                Callers interact through dual modalities: <b>DTMF Keypad tones</b> and <b>Natural Spoken Audio</b>.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{ background: '#0F172A', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontWeight: 800, marginBottom: '0.5rem' }}>
                    <span className="material-symbols-outlined">dialpad</span>
                    1. Telephony Channel
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
                    Inbound PSTN/SIP call is received via <code>/api/sahayak/call/incoming</code>. Telephony adapter passes DTMF digits (RFC 2833) or audio stream.
                  </p>
                </div>

                <div style={{ background: '#0F172A', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontWeight: 800, marginBottom: '0.5rem' }}>
                    <span className="material-symbols-outlined">psychology</span>
                    2. Sahayak Core Router
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
                    Maintains persistent caller session state, remembers farmer profile (crop, district, land size), and routes intent without repetitive questioning.
                  </p>
                </div>

                <div style={{ background: '#0F172A', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FBBF24', fontWeight: 800, marginBottom: '0.5rem' }}>
                    <span className="material-symbols-outlined">hub</span>
                    3. Existing BharatFarm Modules
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
                    Executes production services directly: <code>ClimateEngine</code>, <code>SmartMandiMatchingService</code>, and <code>ClaimStore</code>.
                  </p>
                </div>

                <div style={{ background: '#0F172A', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EC4899', fontWeight: 800, marginBottom: '0.5rem' }}>
                    <span className="material-symbols-outlined">record_voice_over</span>
                    4. Voice & Speech Synthesis
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
                    Responses are formatted in simple conversational Hindi, Bengali, or English, delivered step-by-step through slow, deliberate audio playback.
                  </p>
                </div>
              </div>

              {/* Module Mapping Table */}
              <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F1F5F9', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                Keypad Menu Mapping (Zero Logic Duplication)
              </h5>
              <div style={{ background: '#0F172A', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#1E293B', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '0.65rem 1rem' }}>Key</th>
                      <th style={{ padding: '0.65rem 1rem' }}>BharatFarm Module</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Backend Service Executed</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Spoken Intent Example</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#E2E8F0' }}>
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#10B981' }}>1</td>
                      <td style={{ padding: '0.65rem 1rem' }}>Before You Sow</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#94A3B8' }}>Price risk benchmark & pre-sowing check</td>
                      <td style={{ padding: '0.65rem 1rem' }}>"Is baar kaunsa crop lagana sahi rahega?"</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#10B981' }}>2</td>
                      <td style={{ padding: '0.65rem 1rem' }}>Climate Risk</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#94A3B8' }}>WeatherProvider & ClimateEngine.analyze</td>
                      <td style={{ padding: '0.65rem 1rem' }}>"Kal baarish hogi kya?"</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#10B981' }}>3</td>
                      <td style={{ padding: '0.65rem 1rem' }}>Aggregation</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#94A3B8' }}>SmartMandiMatchingService group pools</td>
                      <td style={{ padding: '0.65rem 1rem' }}>"Mujhe group mein fasal bechni hai"</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#10B981' }}>4</td>
                      <td style={{ padding: '0.65rem 1rem' }}>Crop Insurance</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#94A3B8' }}>ClaimStore & Satellite NDVI loss check</td>
                      <td style={{ padding: '0.65rem 1rem' }}>"Fasal ka daawa verify karna hai"</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#10B981' }}>5</td>
                      <td style={{ padding: '0.65rem 1rem' }}>Smart Mandi</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#94A3B8' }}>SmartMandiMatchingService.matchBuyer</td>
                      <td style={{ padding: '0.65rem 1rem' }}>"Dhan bechna hai sabse achhi mandi batao"</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#10B981' }}>6</td>
                      <td style={{ padding: '0.65rem 1rem' }}>Basic Farmer Needs</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#94A3B8' }}>Leaf Scanner, Schemes, Roadmap Guide</td>
                      <td style={{ padding: '0.65rem 1rem' }}>"Leaf scanner kaise use karein?"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'transcript' ? (
            /* FULL TRANSCRIPT VIEW */
            <div style={{
              background: '#1E293B',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid #334155'
            }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#FFFFFF' }}>
                Complete Telephone Audio Transcript & Session History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
                {transcript.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: item.speaker === 'ai' ? '#0F172A' : '#166534',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      alignSelf: item.speaker === 'ai' ? 'flex-start' : 'flex-end',
                      maxWidth: '85%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: item.speaker === 'ai' ? '#38BDF8' : '#86EFAC' }}>
                        {item.speaker === 'ai' ? '🤖 Sahayak IVR Voice' : '👨‍🌾 Farmer'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{item.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#F8FAFC', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* PHONE CALL SIMULATOR VIEW (MAIN) */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(320px, 390px) 1fr',
              gap: '1.5rem',
              alignItems: 'start'
            }}>
              
              {/* LEFT: Realistic Smartphone Call Screen */}
              <div style={{
                background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                borderRadius: '28px',
                border: '2px solid #334155',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
              }}>
                {/* Status bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1rem' }}>
                  <span>BharatFarm Helpline</span>
                  <span style={{ fontWeight: 800, color: '#34D399' }}>{formatDuration(callDuration)}</span>
                </div>

                {/* Caller Profile Header */}
                <div style={{ textAlign: 'center', margin: '0.5rem 0 1.25rem 0' }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem auto',
                    boxShadow: '0 8px 16px rgba(16, 185, 129, 0.35)',
                    border: '3px solid #34D399'
                  }}>
                    <span className="material-symbols-outlined" style={{ color: '#FFFFFF', fontSize: '34px' }}>
                      support_agent
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 0.25rem 0', color: '#FFFFFF' }}>
                    BharatFarm Sahayak AI
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#34D399', margin: 0, fontWeight: 700 }}>
                    {callState === 'CONNECTED' ? 'Call in Progress...' : callState === 'DIALING' ? 'Dialing...' : 'Call Ended'}
                  </p>
                </div>

                {/* Animated Speech / Voice Wave Indicator */}
                <div style={{
                  background: '#0F172A',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid #1E293B',
                  marginBottom: '1.25rem',
                  minHeight: '85px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10B981' }}>
                      volume_up
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>
                      AI VOICE STREAM ({language.toUpperCase()})
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.82rem',
                    color: '#E2E8F0',
                    margin: 0,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    "{displayPrompt || 'Connecting to BharatFarm voice gateway...'}"
                  </p>
                </div>

                {/* DTMF Keypad (1 - 9, *, 0, #) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.65rem',
                  marginBottom: '1.25rem'
                }}>
                  {[
                    { num: '1', sub: 'Before Sow' },
                    { num: '2', sub: 'Climate' },
                    { num: '3', sub: 'Aggregation' },
                    { num: '4', sub: 'Insurance' },
                    { num: '5', sub: 'Mandi' },
                    { num: '6', sub: 'Basic Needs' },
                    { num: '7', sub: 'Guidance' },
                    { num: '8', sub: 'Repeat' },
                    { num: '9', sub: 'Menu' },
                    { num: '*', sub: 'Back' },
                    { num: '0', sub: 'Help' },
                    { num: '#', sub: 'End' }
                  ].map((keyItem) => (
                    <button
                      key={keyItem.num}
                      onClick={() => {
                        if (keyItem.num === '#') endCall();
                        else sendDtmf(keyItem.num);
                      }}
                      disabled={callState !== 'CONNECTED'}
                      style={{
                        background: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '14px',
                        padding: '0.65rem 0.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: callState === 'CONNECTED' ? 'pointer' : 'not-allowed',
                        color: '#FFFFFF',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.background = '#334155')}
                      onMouseUp={(e) => (e.currentTarget.style.background = '#1E293B')}
                    >
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>{keyItem.num}</span>
                      <span style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.2rem', fontWeight: 600 }}>
                        {keyItem.sub}
                      </span>
                    </button>
                  ))}
                </div>

                {/* In-Call Controls (Mute, Speaker, Mic, End Call) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #334155'
                }}>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: isMuted ? '#EF4444' : '#334155',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
                  </button>

                  <button
                    onClick={toggleListening}
                    title="Speak to Sahayak"
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: isListening ? '#F59E0B' : '#10B981',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isListening ? '0 0 15px #F59E0B' : '0 4px 12px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                      {isListening ? 'hearing' : 'mic'}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    title={isSpeakerOn ? 'Mute AI Voice' : 'Enable AI Voice'}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: isSpeakerOn ? '#10B981' : '#334155',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="material-symbols-outlined">{isSpeakerOn ? 'volume_up' : 'volume_off'}</span>
                  </button>

                  {callState === 'CONNECTED' ? (
                    <button
                      onClick={endCall}
                      title="Disconnect Call"
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#EF4444',
                        border: 'none',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <span className="material-symbols-outlined">call_end</span>
                    </button>
                  ) : (
                    <button
                      onClick={startCall}
                      title="Redial Call"
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#10B981',
                        border: 'none',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <span className="material-symbols-outlined">call</span>
                    </button>
                  )}
                </div>

                {isListening && (
                  <p style={{ textAlign: 'center', color: '#FBBF24', fontSize: '0.75rem', fontWeight: 700, margin: '0.6rem 0 0 0' }}>
                    🎙️ Listening to farmer... (speak in {language.toUpperCase()})
                  </p>
                )}
              </div>

              {/* RIGHT: Live Guidance, Active Menu Options & Spoken Query Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Active Menu Options Cards (Clickable for easy testing) */}
                <div style={{
                  background: '#1E293B',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  border: '1px solid #334155'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                      Keypad Menu Options (Click or Press Key)
                    </h5>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      Step: <b>{currentStep}</b>
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.65rem'
                  }}>
                    {optionsMenu.length > 0 ? (
                      optionsMenu.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => sendDtmf(opt.key)}
                          style={{
                            background: '#0F172A',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            padding: '0.65rem 0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            color: '#F8FAFC',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{
                            background: '#10B981',
                            color: '#FFFFFF',
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 900
                          }}>
                            {opt.key}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{opt.label}</span>
                        </button>
                      ))
                    ) : (
                      <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        No keypad options at this step. Speak naturally or type below.
                      </div>
                    )}
                  </div>
                </div>

                {/* Natural Spoken Language Presets (Voice Intent Tests) */}
                <div style={{
                  background: '#1E293B',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  border: '1px solid #334155'
                }}>
                  <h5 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '0 0 0.6rem 0', color: '#FFFFFF' }}>
                    Quick Natural Voice Queries (Bypasses Keypad)
                  </h5>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 0.75rem 0' }}>
                    Low-literacy farmers can simply speak their problem in Hindi, Bengali or English:
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {[
                      { label: '🌦️ Kal baarish hogi kya?', query: 'Kal baarish hogi kya?' },
                      { label: '🌾 Mandi dhan bhav', query: 'Kal dhan bechna hai, sabse achhi mandi kaunsi hai?' },
                      { label: '🛡️ Fasal bima verify', query: 'Fasal ka daawa verify karna hai' },
                      { label: '🌱 Kaunsi fasal lagayein?', query: 'Is baar kaunsa crop lagana sahi rahega?' },
                      { label: '🤝 Group selling', query: 'Mujhe group mein fasal bechni hai' },
                      { label: '📷 Leaf scanner guide', query: 'Leaf scanner kahan hai aur kaise use karein?' },
                      { label: '💊 Spraying timing', query: 'Fasal mein dawai kab spray karni hai?' },
                      { label: '🇧🇩 কাল কি বৃষ্টি হবে?', query: 'কাল কি বৃষ্টি হবে?' }
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => sendSpeech(item.query)}
                        disabled={callState !== 'CONNECTED'}
                        style={{
                          background: '#0F172A',
                          border: '1px solid #334155',
                          borderRadius: '20px',
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.76rem',
                          color: '#CBD5E1',
                          fontWeight: 600,
                          cursor: callState === 'CONNECTED' ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Natural Spoken Input Bar (Microphone or Typed) */}
                <div style={{
                  background: '#1E293B',
                  borderRadius: '20px',
                  padding: '0.85rem 1rem',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <input
                    type="text"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customQuery.trim()) {
                        sendSpeech(customQuery);
                      }
                    }}
                    placeholder={speechSupported ? "Type spoken query or press mic..." : "Type spoken farmer sentence here..."}
                    style={{
                      flex: 1,
                      background: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      padding: '0.65rem 0.95rem',
                      color: '#FFFFFF',
                      fontSize: '0.84rem',
                      outline: 'none'
                    }}
                  />

                  <button
                    onClick={toggleListening}
                    title="Speak via browser microphone"
                    style={{
                      background: isListening ? '#F59E0B' : '#0F172A',
                      border: '1px solid #334155',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mic</span>
                  </button>

                  <button
                    onClick={() => {
                      if (customQuery.trim()) sendSpeech(customQuery);
                    }}
                    style={{
                      background: '#10B981',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      padding: '0.55rem 1rem',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>Speak</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                  </button>
                </div>

                {/* Telephony Special Commands Quick Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: '#94A3B8' }}>
                  <span style={{ fontWeight: 700 }}>Helpline Commands:</span>
                  {[
                    { label: 'Main Menu', cmd: 'main menu' },
                    { label: 'Back', cmd: 'back' },
                    { label: 'Repeat', cmd: 'repeat' },
                    { label: 'Help', cmd: 'help' }
                  ].map((c, i) => (
                    <button
                      key={i}
                      onClick={() => sendSpeech(c.cmd)}
                      style={{
                        background: '#334155',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.2rem 0.55rem',
                        color: '#E2E8F0',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      "{c.label}"
                    </button>
                  ))}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div style={{
          padding: '0.75rem 1.75rem',
          borderTop: '1px solid #1E293B',
          background: '#0B1120',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#94A3B8'
        }}>
          <div>
            Session: <code style={{ color: '#38BDF8' }}>{sessionId || 'Not Connected'}</code> · Current Lang: <b style={{ color: '#10B981' }}>{language.toUpperCase()}</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Voice: Web Speech API Synthesis (Local Indian Accent)</span>
            <span>Zero Business Logic Duplication: 100% BharatFarm APIs</span>
          </div>
        </div>

      </div>
    </div>
  );
};
