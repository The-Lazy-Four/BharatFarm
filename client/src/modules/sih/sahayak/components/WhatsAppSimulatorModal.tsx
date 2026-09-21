import React, { useState, useRef, useEffect } from 'react';

const waStyles = `
  @keyframes waFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes waTypingDots {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
  }
  @keyframes waBtnPress {
    0% { transform: scale(1); }
    50% { transform: scale(0.97); }
    100% { transform: scale(1); }
  }
  .wa-sim-overlay {
    position: fixed;
    inset: 0;
    background: rgba(11, 20, 26, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 0.75rem;
  }
  .wa-phone-bezel {
    width: 100%;
    max-width: 400px;
    height: 92vh;
    max-height: 840px;
    background: #0B141A;
    border-radius: 40px;
    box-shadow: 0 25px 70px -10px rgba(0,0,0,0.85), 0 0 0 8px #1E293B, 0 0 0 10px #0F172A;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  @media (max-width: 450px) {
    .wa-phone-bezel {
      border-radius: 20px;
      height: 100dvh;
      max-height: 100dvh;
      box-shadow: none;
    }
    .wa-sim-overlay {
      padding: 0;
      align-items: flex-end;
    }
  }
  .wa-chat-wallpaper {
    background-color: #0B141A;
    background-image: 
      radial-gradient(circle at 18% 25%, rgba(32, 44, 51, 0.6) 0%, transparent 22%),
      radial-gradient(circle at 82% 65%, rgba(32, 44, 51, 0.5) 0%, transparent 26%),
      repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 16px);
  }
  .wa-msg-anim {
    animation: waFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .wa-interactive-btn {
    background: #202C33;
    color: #00A884;
    border: 1px solid #2A3942;
    border-radius: 8px;
    padding: 0.6rem 0.85rem;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all 0.15s ease;
    width: 100%;
    text-align: center;
  }
  .wa-interactive-btn:hover {
    background: #263843;
    color: #25D366;
    border-color: #00A884;
  }
  .wa-interactive-btn:active {
    animation: waBtnPress 0.15s ease;
  }
  .wa-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #8696A0;
    display: inline-block;
    animation: waTypingDots 1.2s infinite;
  }
  .wa-dot:nth-child(2) { animation-delay: 0.2s; }
  .wa-dot:nth-child(3) { animation-delay: 0.4s; }
`;

export interface WhatsAppMessageItem {
  id: string;
  sender: 'farmer' | 'sahayak';
  text: string;
  time: string;
  interactiveType?: 'button' | 'list';
  listTitle?: string;
  buttons?: Array<{ id: string; title: string }>;
  status?: 'sent' | 'delivered' | 'read';
}

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppSimulatorModal: React.FC<WhatsAppSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<WhatsAppMessageItem[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionState, setSessionState] = useState<string>('START');
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'en' | 'bn'>('hi');
  const [farmerProfile, setFarmerProfile] = useState<{
    name?: string;
    location?: string;
    crop?: string;
    land?: string;
    isLinked?: boolean;
  }>({});
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(`sim-farmer-${Date.now()}`);

  // Auto scroll to bottom on message updates
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // When modal opens, if empty, trigger first message (Farmer sends "HI")
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startAutomationWorkflow();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Reset / Restart Demo
   */
  const handleRestartDemo = async () => {
    sessionIdRef.current = `sim-farmer-${Date.now()}`;
    setMessages([]);
    setFarmerProfile({});
    setSessionState('START');
    setIsTyping(true);

    try {
      await fetch('/api/sahayak/whatsapp/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: sessionIdRef.current,
          action: 'RESET'
        })
      });
    } catch {
      // ignore
    }

    startAutomationWorkflow();
  };

  /**
   * Initial automation start: Farmer sends "HI" -> Bot sends trilingual welcome + language buttons
   */
  const startAutomationWorkflow = async () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Farmer message: "HI"
    const farmerMsg: WhatsAppMessageItem = {
      id: `usr-init-${Date.now()}`,
      sender: 'farmer',
      text: 'HI',
      time: timeStr,
      status: 'read'
    };
    setMessages([farmerMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/sahayak/whatsapp/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: sessionIdRef.current,
          message: 'HI'
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const botMsg: WhatsAppMessageItem = {
          id: `bot-${Date.now()}`,
          sender: 'sahayak',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: json.data.reply,
          interactiveType: json.data.interactiveType || 'button',
          buttons: json.data.buttons || [],
          status: 'read'
        };
        setMessages(prev => [...prev, botMsg]);
        setSessionState(json.data.state || 'LANGUAGE_SELECTION');
        if (json.data.farmer) setFarmerProfile(json.data.farmer);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'sahayak',
          time: timeStr,
          text: `⚠️ Network error communicating with Sahayak: ${err.message}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Dispatch action or user text to backend state machine
   */
  const handleUserAction = async (actionId?: string, buttonTitle?: string, freeText?: string) => {
    const text = freeText || buttonTitle || inputVal;
    if (!text.trim() && !actionId) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Display user message bubble for the tapped button or typed text
    const userMsg: WhatsAppMessageItem = {
      id: `usr-${Date.now()}`,
      sender: 'farmer',
      text: buttonTitle || text,
      time: timeStr,
      status: 'read'
    };

    setMessages(prev => [...prev, userMsg]);
    if (freeText || !buttonTitle) setInputVal('');
    setIsTyping(true);

    try {
      const payload: any = {
        phone: sessionIdRef.current,
        action: actionId,
        message: text
      };

      const res = await fetch('/api/sahayak/whatsapp/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success && json.data) {
        const botMsg: WhatsAppMessageItem = {
          id: `bot-${Date.now()}`,
          sender: 'sahayak',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: json.data.reply,
          interactiveType: json.data.interactiveType,
          listTitle: json.data.listTitle,
          buttons: json.data.buttons || [],
          status: 'read'
        };
        setMessages(prev => [...prev, botMsg]);
        setSessionState(json.data.state);
        if (json.data.detectedLanguage) setSelectedLanguage(json.data.detectedLanguage);
        if (json.data.farmer) setFarmerProfile(json.data.farmer);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'sahayak',
          time: timeStr,
          text: `⚠️ Error processing request: ${err.message}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderFormattedText = (rawText: string = '') => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const boldFormatted = line.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      const italicFormatted = boldFormatted.replace(/_(.*?)_/g, '<em>$1</em>');

      return (
        <span
          key={idx}
          dangerouslySetInnerHTML={{ __html: italicFormatted }}
          style={{ display: 'block', minHeight: line.trim() ? 'auto' : '0.45rem' }}
        />
      );
    });
  };

  return (
    <div className="wa-sim-overlay">
      <style>{waStyles}</style>

      {/* Modern Smartphone Outer Hardware Frame */}
      <div className="wa-phone-bezel">

        {/* Top Hardware Notch / Speaker & Status Bar */}
        <div style={{
          height: '28px',
          background: '#0B141A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          position: 'relative',
          zIndex: 20
        }}>
          <span style={{ fontSize: '11px', color: '#E2E8F0', fontWeight: 800 }}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {/* Speaker Pill */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '4px',
            background: '#334155',
            borderRadius: '4px'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>signal_cellular_alt</span>
            <span>Jio 5G</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>battery_full</span>
          </div>
        </div>

        {/* WhatsApp Mobile Top Header */}
        <div style={{
          background: '#202C33',
          padding: '0.65rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2A3942',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#AEBAC1',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Close Simulator"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>arrow_back</span>
            </button>

            {/* Profile Avatar with Verified Badge */}
            <div
              onClick={() => setIsInfoDrawerOpen(prev => !prev)}
              style={{ position: 'relative', cursor: 'pointer' }}
              title="View BharatFarm Verified Account Info"
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '1.1rem',
                border: '1.5px solid #25D366'
              }}>
                🌾
              </div>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  fontSize: '14px',
                  color: '#25D366',
                  background: '#202C33',
                  borderRadius: '50%'
                }}
              >
                verified
              </span>
            </div>

            {/* Title & Online Presence */}
            <div onClick={() => setIsInfoDrawerOpen(prev => !prev)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#E9EDEF' }}>
                  BharatFarm Sahayak
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366' }} />
                <span style={{ fontSize: '0.72rem', color: '#8696A0' }}>
                  online · Official Helpline
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleRestartDemo}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#D1D7DB',
                borderRadius: '14px',
                padding: '0.25rem 0.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Restart Demo to 'HI'"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#34D399' }}>restart_alt</span>
              Restart
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#E9EDEF',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Business Info Drawer Overlay */}
        {isInfoDrawerOpen && (
          <div style={{
            position: 'absolute',
            top: '72px',
            left: 0,
            right: 0,
            background: '#1F2C34',
            borderBottom: '2px solid #00A884',
            padding: '1rem',
            zIndex: 30,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            color: '#E9EDEF',
            fontSize: '0.82rem',
            lineHeight: 1.5
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', fontWeight: 800, color: '#25D366' }}>
                  BharatFarm Sahayak AI
                </h4>
                <p style={{ margin: 0, color: '#8696A0', fontSize: '0.74rem' }}>
                  Zero-Install Guided WhatsApp Automation Layer
                </p>
              </div>
              <button
                onClick={() => setIsInfoDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
              <div>🌾 <strong>Connected Farmer:</strong> {farmerProfile.name || 'Not Connected (Guest Mode)'}</div>
              <div>📍 <strong>Location:</strong> {farmerProfile.location || 'Nashik / Maharashtra'}</div>
              <div>🌱 <strong>Farm Crop:</strong> {farmerProfile.crop || 'Tomato'} {farmerProfile.land ? `(${farmerProfile.land})` : ''}</div>
              <div>⚙️ <strong>State Machine State:</strong> <code style={{ color: '#34D399' }}>{sessionState}</code></div>
              <div>🔒 <strong>Security:</strong> Meta Cloud API Webhook Verified with deduplication</div>
            </div>
          </div>
        )}

        {/* State Machine Status Bar */}
        <div style={{
          background: '#182229',
          padding: '0.35rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #222E35',
          fontSize: '0.72rem',
          color: '#8696A0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: farmerProfile.isLinked ? '#22C55E' : '#EAB308' }} />
            <span>
              {farmerProfile.isLinked ? `Connected: ${farmerProfile.name}` : 'Zero-Install Farmer Access'}
            </span>
          </div>

          <span style={{ color: '#00A884', fontWeight: 700 }}>
            {sessionState}
          </span>
        </div>

        {/* WhatsApp Chat Body Wallpaper */}
        <div className="wa-chat-wallpaper" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>

          {/* Encryption Badge */}
          <div style={{
            alignSelf: 'center',
            background: 'rgba(24, 34, 41, 0.85)',
            color: '#FFD279',
            fontSize: '0.7rem',
            textAlign: 'center',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            maxWidth: '92%',
            lineHeight: 1.4,
            border: '1px solid rgba(255, 210, 121, 0.15)'
          }}>
            🔒 Messages to this chat and calls are secured with end-to-end Meta WhatsApp encryption.
          </div>

          {/* Message Stream */}
          {messages.map((m) => {
            const isUser = m.sender === 'farmer';

            return (
              <div
                key={m.id}
                className="wa-msg-anim"
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                {/* Message Bubble */}
                <div style={{
                  background: isUser ? '#005C4B' : '#202C33',
                  color: '#E9EDEF',
                  padding: '0.6rem 0.85rem',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '0.86rem',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  position: 'relative'
                }}>
                  {renderFormattedText(m.text)}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.25rem',
                    marginTop: '0.25rem',
                    fontSize: '0.66rem',
                    color: '#8696A0'
                  }}>
                    <span>{m.time}</span>
                    {isUser && (
                      <span style={{ color: '#53BDEB', fontWeight: 900, fontSize: '0.75rem' }}>✓✓</span>
                    )}
                  </div>
                </div>

                {/* WhatsApp Interactive Tappable Buttons (Rendered inside the conversation) */}
                {!isUser && m.buttons && m.buttons.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    marginTop: '0.1rem',
                    width: '100%'
                  }}>
                    {m.buttons.map((btn) => (
                      <button
                        key={btn.id}
                        className="wa-interactive-btn"
                        onClick={() => handleUserAction(btn.id, btn.title)}
                      >
                        {btn.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="wa-msg-anim" style={{
              alignSelf: 'flex-start',
              background: '#202C33',
              color: '#8696A0',
              padding: '0.55rem 0.85rem',
              borderRadius: '14px 14px 14px 2px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span className="wa-dot" />
              <span className="wa-dot" />
              <span className="wa-dot" />
              <span style={{ marginLeft: '0.25rem', fontSize: '0.74rem' }}>BharatFarm Sahayak typing…</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Demo Quick Shortcuts Bar (Helpful during SIH evaluation) */}
        <div style={{
          background: '#111B21',
          padding: '0.35rem 0.65rem',
          borderTop: '1px solid #202C33',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.68rem', color: '#8696A0', fontWeight: 800 }}>Demo Inputs:</span>
          {sessionState === 'ACCOUNT_LINK_PHONE' ? (
            <button
              onClick={() => handleUserAction(undefined, undefined, '9876543210')}
              style={{
                background: '#00A88422',
                border: '1px solid #00A884',
                color: '#25D366',
                borderRadius: '12px',
                padding: '0.2rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📱 9876543210 (Demo Farmer Nashik)
            </button>
          ) : sessionState === 'MAIN_MENU' ? (
            <>
              <button
                onClick={() => handleUserAction('SRV_PRICE_RISK', '🌾 Price Risk')}
                style={{
                  background: '#202C33',
                  border: '1px solid #2A3942',
                  color: '#D1D7DB',
                  borderRadius: '12px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🌾 1. Price Risk
              </button>
              <button
                onClick={() => handleUserAction('SRV_CLIMATE_RISK', '🌦️ Climate Risk')}
                style={{
                  background: '#202C33',
                  border: '1px solid #2A3942',
                  color: '#D1D7DB',
                  borderRadius: '12px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🌦️ 2. Climate
              </button>
              <button
                onClick={() => handleUserAction('SRV_SMART_MANDI', '📊 Smart Mandi')}
                style={{
                  background: '#202C33',
                  border: '1px solid #2A3942',
                  color: '#D1D7DB',
                  borderRadius: '12px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📊 5. Mandi
              </button>
            </>
          ) : (
            <button
              onClick={() => handleUserAction(undefined, undefined, 'kal baarish hogi kya?')}
              style={{
                background: '#202C33',
                border: '1px solid #2A3942',
                color: '#D1D7DB',
                borderRadius: '12px',
                padding: '0.2rem 0.55rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              "kal baarish hogi kya?"
            </button>
          )}
        </div>

        {/* WhatsApp Mobile Message Composer */}
        <div style={{
          background: '#202C33',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderTop: '1px solid #2A3942'
        }}>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUserAction(undefined, undefined, inputVal)}
            placeholder={
              sessionState === 'ACCOUNT_LINK_PHONE'
                ? "Enter phone (e.g. 9876543210)..."
                : "Type message or tap button..."
            }
            style={{
              flex: 1,
              background: '#2A3942',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 0.85rem',
              color: '#D1D7DB',
              fontSize: '0.86rem',
              outline: 'none'
            }}
          />

          <button
            onClick={() => handleUserAction(undefined, undefined, inputVal)}
            title="Send Message"
            style={{
              background: '#00A884',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 168, 132, 0.4)',
              flexShrink: 0
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
          </button>
        </div>

      </div>
    </div>
  );
};
