import React, { useState, useRef, useEffect } from 'react';

export interface WhatsAppMessageItem {
  id: string;
  sender: 'farmer' | 'sahayak';
  text?: string;
  time: string;
  image?: string;
  intent?: string;
  quickReplies?: string[];
  isLocation?: boolean;
}

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_QUERIES = [
  { label: '🌦️ Weather Forecast', text: 'Kal baarish hogi kya?' },
  { label: '🌾 Mandi Rates', text: 'Aaj mere paas wali mandi mein dhan ka kya rate hai?' },
  { label: '🦠 Crop Disease', text: 'meri fasal mein daag hai' },
  { label: '🏛️ Govt Schemes', text: 'PM Kisan ke liye apply kaise karu' },
  { label: '🇧🇩 Bengali Query', text: 'আগামীকাল কি বৃষ্টি হবে?' }
];

export const WhatsAppSimulatorModal: React.FC<WhatsAppSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<WhatsAppMessageItem[]>([
    {
      id: 'msg-0',
      sender: 'sahayak',
      time: '10:00 AM',
      text: '🙏 *Namaste! Welcome to BharatFarm Sahayak WhatsApp Service.*\n\nI am your 24/7 AI agricultural companion. You can ask me about:\n• 🌦️ Weather & Rain alerts\n• 🌾 Real-time Mandi rates\n• 🔬 Leaf disease diagnosis\n• 🏛️ Government schemes & subsidies\n\nTry sending a message or tap one of the quick options below!'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'hi' | 'bn' | 'en'>('auto');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (messageToSend?: string, imageBase64?: string, isLocationPin?: boolean) => {
    const text = messageToSend || inputVal;
    if (!text.trim() && !imageBase64 && !isLocationPin) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: WhatsAppMessageItem = {
      id: `usr-${Date.now()}`,
      sender: 'farmer',
      text: text.trim() || (imageBase64 ? '📷 Sent a leaf photo' : '📍 Shared live location'),
      time: timeStr,
      image: imageBase64,
      isLocation: isLocationPin
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageToSend) setInputVal('');
    setIsTyping(true);

    try {
      const payload: any = {
        phone: 'demo-user-sih',
        language: selectedLanguage !== 'auto' ? selectedLanguage : undefined
      };

      if (isLocationPin) {
        payload.location = { latitude: 22.0667, longitude: 88.0667, name: 'Haldia, Purba Medinipur' };
      } else if (imageBase64) {
        payload.imageBase64 = imageBase64;
      } else {
        payload.message = text;
      }

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
          intent: json.data.intent,
          quickReplies: json.data.suggestedQuickReplies
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'sahayak',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: '⚠️ *Sahayak System Notice*\nSorry, could not process that request right now. Please try again in a moment.'
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'sahayak',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ *Network Error*: ${err.message || 'Failed to reach Sahayak API'}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleSend(undefined, base64, false);
    };
    reader.readAsDataURL(file);
  };

  const renderFormattedText = (rawText: string = '') => {
    // Basic WhatsApp markdown parser (*bold*, _italic_, newlines)
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Bold replace *text* -> <strong>text</strong>
      const boldFormatted = line.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      // Italic replace _text_ -> <em>text</em>
      const italicFormatted = boldFormatted.replace(/_(.*?)_/g, '<em>$1</em>');

      return (
        <span
          key={idx}
          dangerouslySetInnerHTML={{ __html: italicFormatted }}
          style={{ display: 'block', minHeight: line.trim() ? 'auto' : '0.5rem' }}
        />
      );
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      {/* Smartphone Frame Container */}
      <div style={{
        width: '100%',
        maxWidth: '430px',
        height: '92vh',
        maxHeight: '820px',
        background: '#111B21',
        borderRadius: '38px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 10px #1E293B',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>

        {/* Top Speaker & Camera Notch */}
        <div style={{
          height: '24px',
          background: '#0B141A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{ width: '60px', height: '4px', background: '#334155', borderRadius: '4px' }} />
          <div style={{
            position: 'absolute',
            right: '1.2rem',
            top: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '11px',
            color: '#94A3B8',
            fontWeight: 700
          }}>
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* WhatsApp Header Bar */}
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
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '1.1rem'
              }}>
                🌾
              </div>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  fontSize: '15px',
                  color: '#25D366',
                  background: '#202C33',
                  borderRadius: '50%'
                }}
              >
                verified
              </span>
            </div>

            {/* Title & Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: '#E9EDEF', fontWeight: 700, fontSize: '0.98rem' }}>
                  BharatFarm Sahayak
                </span>
              </div>
              <span style={{ color: '#25D366', fontSize: '0.74rem', fontWeight: 600 }}>
                {isTyping ? 'typing...' : 'Official WhatsApp Business Account'}
              </span>
            </div>
          </div>

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#AEBAC1' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '20px', cursor: 'pointer' }}
              title="Voice Call Simulated"
              onClick={() => alert('Simulated WhatsApp Voice Call to BharatFarm Sahayak Extension Hotline (+91 98765 43210)')}
            >
              call
            </span>
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
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Real Meta Cloud API Status Bar */}
        <div style={{
          background: '#182229',
          padding: '0.4rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #222E35',
          fontSize: '0.74rem',
          color: '#8696A0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
            <span>SIH Live Test Bench (Zero Token Cost)</span>
          </div>

          <select
            value={selectedLanguage}
            onChange={(e: any) => setSelectedLanguage(e.target.value)}
            style={{
              background: '#2A3942',
              border: 'none',
              color: '#D1D7DB',
              borderRadius: '6px',
              padding: '0.2rem 0.4rem',
              fontSize: '0.72rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="auto">Auto Language</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Messages Body (WhatsApp Chat Wallpaper Background) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: '#0B141A radial-gradient(circle at 50% 50%, rgba(32, 44, 51, 0.4) 0%, rgba(11, 20, 26, 0.95) 100%)'
        }}>

          {/* Encryption Notice */}
          <div style={{
            alignSelf: 'center',
            background: 'rgba(24, 34, 41, 0.85)',
            color: '#FFD279',
            fontSize: '0.72rem',
            textAlign: 'center',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            maxWidth: '92%',
            lineHeight: 1.4,
            border: '1px solid rgba(255, 210, 121, 0.15)'
          }}>
            🔒 Messages to this chat and calls are now secured with end-to-end Meta WhatsApp Cloud encryption.
          </div>

          {messages.map((m) => {
            const isUser = m.sender === 'farmer';

            return (
              <div
                key={m.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{
                  background: isUser ? '#005C4B' : '#202C33',
                  color: '#E9EDEF',
                  padding: '0.55rem 0.85rem',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '0.86rem',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  position: 'relative'
                }}>
                  {/* Attached Image Preview */}
                  {m.image && (
                    <img
                      src={m.image}
                      alt="Crop leaf attachment"
                      style={{
                        width: '100%',
                        borderRadius: '10px',
                        marginBottom: '0.45rem',
                        maxHeight: '180px',
                        objectFit: 'cover'
                      }}
                    />
                  )}

                  {/* Text */}
                  {m.text && renderFormattedText(m.text)}

                  {/* Message Timestamp & Double Checkmarks */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.25rem',
                    marginTop: '0.25rem',
                    fontSize: '0.68rem',
                    color: '#8696A0'
                  }}>
                    <span>{m.time}</span>
                    {isUser && (
                      <span style={{ color: '#53BDEB', fontWeight: 900, fontSize: '0.75rem' }}>✓✓</span>
                    )}
                  </div>
                </div>

                {/* Interactive Quick Reply Buttons sent by Sahayak */}
                {!isUser && m.quickReplies && m.quickReplies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.1rem' }}>
                    {m.quickReplies.map((qr, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(qr)}
                        style={{
                          background: 'rgba(32, 44, 51, 0.95)',
                          border: '1px solid #00A884',
                          color: '#00A884',
                          borderRadius: '18px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator bubble */}
          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              background: '#202C33',
              color: '#8696A0',
              padding: '0.6rem 0.9rem',
              borderRadius: '14px 14px 14px 2px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1.5s infinite linear' }}>
                sync
              </span>
              <span>Sahayak is thinking...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Query Pills */}
        <div style={{
          background: '#111B21',
          padding: '0.45rem 0.75rem',
          borderTop: '1px solid #202C33',
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.text)}
              style={{
                background: '#202C33',
                color: '#D1D7DB',
                border: '1px solid #2A3942',
                borderRadius: '14px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Bottom Chat Bar with Real WhatsApp styling */}
        <div style={{
          background: '#202C33',
          padding: '0.55rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderTop: '1px solid #2A3942'
        }}>

          {/* Location Pin Trigger */}
          <button
            onClick={() => handleSend(undefined, undefined, true)}
            title="Send WhatsApp Location Pin"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8696A0',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>location_on</span>
          </button>

          {/* Attachment / Camera Icon */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach Leaf Photo"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8696A0',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>photo_camera</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />

          {/* Text Input */}
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message Sahayak..."
            style={{
              flex: 1,
              background: '#2A3942',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 0.85rem',
              color: '#D1D7DB',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />

          {/* Send / Voice Button */}
          {inputVal.trim() ? (
            <button
              onClick={() => handleSend()}
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
                boxShadow: '0 2px 6px rgba(0, 168, 132, 0.4)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
            </button>
          ) : (
            <button
              onClick={() => handleSend('Aaj mere paas wali mandi mein dhan ka kya rate hai?')}
              title="Voice Message (Simulate Speech-to-Text)"
              style={{
                background: '#2A3942',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8696A0',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mic</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
