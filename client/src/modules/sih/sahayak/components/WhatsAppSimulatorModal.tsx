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
  audioDuration?: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_CATEGORIES = [
  {
    category: 'Popular Inquiries',
    items: [
      { label: '🌦️ Rain Tomorrow?', text: 'Kal baarish hogi kya?' },
      { label: '🌾 Live Paddy Rate', text: 'Aaj mere paas wali mandi mein dhan ka kya rate hai?' },
      { label: '🥔 Potato Price', text: 'Haldia mandi mein aaloo ka kya bhav hai?' },
      { label: '🦠 Leaf Disease', text: 'meri fasal mein daag hai' },
      { label: '🏛️ PM Kisan Scheme', text: 'PM Kisan ke liye apply kaise karu' },
      { label: '🇧🇩 Bengali Weather', text: 'আগামীকাল কি বৃষ্টি হবে?' }
    ]
  },
  {
    category: 'Smart Mandi & Selling',
    items: [
      { label: '📦 Sell 500kg Wheat', text: 'Mujhe 500 kg gehun bechna hai' },
      { label: '🤝 Supply Aggregation Pool', text: 'Smart mandi pool mein kaise jude?' },
      { label: '🚚 Transport Cost', text: 'Mandi le jaane ka transport kharcha kitna hoga?' }
    ]
  },
  {
    category: 'Advisory & Crop Care',
    items: [
      { label: '🧪 Fertilizer Dosage', text: 'Dhan ki fasal mein urea kab aur kitna dale?' },
      { label: '🛡️ PMFBY Insurance', text: 'Pradhan Mantri Fasal Bima Yojana ka claim kaise kare?' },
      { label: '🚜 Soil Moisture', text: 'Mitti ki nami aur sinchai ki salah do' }
    ]
  }
];

const SAMPLE_LEAF_IMAGES = [
  {
    name: 'Tomato Blight Leaf',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23504?auto=format&fit=crop&w=400&q=80',
    caption: 'Sample photo: Tomato Early Blight with yellow halos'
  },
  {
    name: 'Paddy Brown Spot',
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=400&q=80',
    caption: 'Sample photo: Rice Paddy leaf with brown fungal spots'
  }
];

export const WhatsAppSimulatorModal: React.FC<WhatsAppSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<WhatsAppMessageItem[]>([
    {
      id: 'msg-0',
      sender: 'sahayak',
      time: '10:00 AM',
      text: '🙏 *Namaste! Welcome to BharatFarm Sahayak WhatsApp Service.*\n\nI am your 24/7 AI agricultural companion. You can ask me directly here:\n• 🌦️ *Weather & Rain alerts* ("Kal baarish hogi kya?")\n• 🌾 *Real-time Mandi rates* ("Aaj dhan ka rate kya hai?")\n• 🔬 *Leaf disease diagnosis* (Send a leaf photo or describe symptoms)\n• 🏛️ *Government schemes & subsidies* ("PM Kisan ke baare mein batao")\n\nTap the *Attachment (+)* icon to send sample leaf photos, *Location (📍)* to share GPS pins, or tap any quick question below!',
      status: 'read'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'hi' | 'bn' | 'en'>('auto');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState(0);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isRecordingVoice) {
      voiceTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(voiceTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(voiceTimerRef.current);
  }, [isRecordingVoice]);

  if (!isOpen) return null;

  const handleSend = async (
    messageToSend?: string,
    imageBase64?: string,
    isLocationPin?: boolean,
    isVoiceNote?: boolean
  ) => {
    const text = messageToSend || inputVal;
    if (!text.trim() && !imageBase64 && !isLocationPin && !isVoiceNote) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let displayText = text.trim();
    if (isLocationPin) {
      displayText = '📍 Live GPS Location: Haldia APMC Cluster (22.0667° N, 88.0667° E)';
    } else if (isVoiceNote) {
      displayText = '🎤 Voice Note (0:04) — "Mandi mein dhan ka kya bhav chal raha hai?"';
    } else if (imageBase64 && !displayText) {
      displayText = '📷 Sent Crop Leaf Photo for Pathology Diagnostic';
    }

    const userMsg: WhatsAppMessageItem = {
      id: `usr-${Date.now()}`,
      sender: 'farmer',
      text: displayText,
      time: timeStr,
      image: imageBase64,
      isLocation: isLocationPin,
      status: 'read'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageToSend) setInputVal('');
    setIsAttachmentMenuOpen(false);
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
      } else if (isVoiceNote) {
        payload.audioBase64 = 'mock_voice_audio_base64_stream';
        payload.message = 'Aaj mere paas wali mandi mein dhan ka kya rate hai?';
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
          quickReplies: json.data.suggestedQuickReplies,
          status: 'read'
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

  const handleSendSampleLeaf = async (imageUrl: string) => {
    setIsAttachmentMenuOpen(false);
    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleSend('Diagnose this leaf photo', base64, false);
      };
      reader.readAsDataURL(blob);
    } catch {
      handleSend('meri fasal mein daag hai', undefined, false);
    }
  };

  const finishVoiceRecording = () => {
    setIsRecordingVoice(false);
    handleSend(undefined, undefined, false, true);
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '0.75rem'
    }}>
      {/* Smartphone Outer Hardware Bezel */}
      <div style={{
        width: '100%',
        maxWidth: '430px',
        height: '94vh',
        maxHeight: '850px',
        background: '#111B21',
        borderRadius: '42px',
        boxShadow: '0 25px 70px -10px rgba(0, 0, 0, 0.8), 0 0 0 12px #1E293B, 0 0 0 14px #0F172A',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>

        {/* Top Speaker, Camera Island & Status Bar */}
        <div style={{
          height: '28px',
          background: '#0B141A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.2rem',
          position: 'relative',
          zIndex: 20
        }}>
          {/* Time */}
          <span style={{ fontSize: '11px', color: '#E2E8F0', fontWeight: 800 }}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {/* Speaker capsule */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '64px',
            height: '4.5px',
            background: '#334155',
            borderRadius: '4px'
          }} />

          {/* Status indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '11px',
            color: '#94A3B8',
            fontWeight: 700
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>signal_cellular_alt</span>
            <span>5G</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>battery_full</span>
          </div>
        </div>

        {/* WhatsApp Top Header Bar */}
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

            {/* Profile Avatar with Verified Badge & Clickable Info Drawer */}
            <div
              onClick={() => setIsInfoDrawerOpen(prev => !prev)}
              style={{ position: 'relative', cursor: 'pointer' }}
              title="View Business Profile"
            >
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
                fontSize: '1.2rem',
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
            <div
              onClick={() => setIsInfoDrawerOpen(prev => !prev)}
              style={{ cursor: 'pointer' }}
            >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#AEBAC1' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '20px', cursor: 'pointer' }}
              title="Voice Call Simulated"
              onClick={() => alert('Simulated WhatsApp Voice Call to BharatFarm Sahayak Extension Officer Hotline (+91 98765 43210)')}
            >
              call
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '20px', cursor: 'pointer' }}
              title="Business Information"
              onClick={() => setIsInfoDrawerOpen(prev => !prev)}
            >
              info
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
                <p style={{ margin: 0, color: '#8696A0', fontSize: '0.76rem' }}>
                  Meta Cloud API Verified Enterprise ID: 1048291039
                </p>
              </div>
              <button
                onClick={() => setIsInfoDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>📍 <strong>Registered Node:</strong> Haldia / Purba Medinipur Agricultural Command</div>
              <div>🌾 <strong>Supported Services:</strong> Climate Risk, Smart Mandi, Crop Disease Scanner, Govt Schemes</div>
              <div>🌐 <strong>Web App Sync:</strong> Linked to https://bharatfarm.app</div>
              <div>🔒 <strong>Security:</strong> AES-256 Meta Webhook Verified with message deduplication</div>
            </div>
          </div>
        )}

        {/* Sub-bar: Language & Cloud API Indicator */}
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
            <span>Interactive Meta Cloud Simulator</span>
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
            <option value="auto">Language: Auto-Detect</option>
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
          background: '#0B141A radial-gradient(circle at 50% 50%, rgba(32, 44, 51, 0.45) 0%, rgba(11, 20, 26, 0.98) 100%)'
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
            🔒 Messages to this chat and calls are secured with end-to-end Meta WhatsApp Cloud encryption.
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
                    <div style={{ position: 'relative', marginBottom: '0.45rem' }}>
                      <img
                        src={m.image}
                        alt="Crop leaf attachment"
                        style={{
                          width: '100%',
                          borderRadius: '10px',
                          maxHeight: '200px',
                          objectFit: 'cover'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#34D399',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700
                      }}>
                        AI Leaf Scan Target
                      </span>
                    </div>
                  )}

                  {/* Text with markdown styling */}
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
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e: any) => e.target.style.background = '#00A88422'}
                        onMouseLeave={(e: any) => e.target.style.background = 'rgba(32, 44, 51, 0.95)'}
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
              <span>Sahayak is analyzing crop telemetry...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Attachment Drawer Menu (Photos, GPS Location, Voice) */}
        {isAttachmentMenuOpen && (
          <div style={{
            background: '#1F2C34',
            borderTop: '1px solid #2A3942',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#D1D7DB' }}>
                Share Agricultural Inputs
              </span>
              <button
                onClick={() => setIsAttachmentMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#AEBAC1', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
              {/* 1. Upload Own Leaf Photo */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#7F66FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  <span className="material-symbols-outlined">image</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#D1D7DB', fontWeight: 600 }}>Gallery</span>
              </div>

              {/* 2. Sample Tomato Blight */}
              <div
                onClick={() => handleSendSampleLeaf(SAMPLE_LEAF_IMAGES[0].url)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  <span className="material-symbols-outlined">pest_control</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#D1D7DB', fontWeight: 600 }}>Tomato Leaf</span>
              </div>

              {/* 3. Sample Paddy Spot */}
              <div
                onClick={() => handleSendSampleLeaf(SAMPLE_LEAF_IMAGES[1].url)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  <span className="material-symbols-outlined">grass</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#D1D7DB', fontWeight: 600 }}>Paddy Leaf</span>
              </div>

              {/* 4. Live GPS Pin */}
              <div
                onClick={() => {
                  setIsAttachmentMenuOpen(false);
                  handleSend(undefined, undefined, true);
                }}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#D1D7DB', fontWeight: 600 }}>Location Pin</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabbed Quick Query Bar */}
        <div style={{
          background: '#111B21',
          padding: '0.4rem 0.6rem 0.2rem 0.6rem',
          borderTop: '1px solid #202C33',
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {PRESET_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategoryTab(i)}
              style={{
                background: activeCategoryTab === i ? '#00A884' : '#202C33',
                color: activeCategoryTab === i ? '#FFFFFF' : '#8696A0',
                border: 'none',
                borderRadius: '12px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Query Pills from Active Category */}
        <div style={{
          background: '#111B21',
          padding: '0.35rem 0.6rem 0.55rem 0.6rem',
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {PRESET_CATEGORIES[activeCategoryTab].items.map((q, idx) => (
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

          {/* Plus / Attachment Menu Button */}
          <button
            onClick={() => setIsAttachmentMenuOpen(prev => !prev)}
            title="Attach Leaf Image, GPS Location or Preset"
            style={{
              background: isAttachmentMenuOpen ? '#00A884' : 'transparent',
              border: 'none',
              color: isAttachmentMenuOpen ? '#FFFFFF' : '#8696A0',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              {isAttachmentMenuOpen ? 'close' : 'add'}
            </span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />

          {/* In-chat recording indicator */}
          {isRecordingVoice ? (
            <div style={{
              flex: 1,
              background: '#1F2C34',
              borderRadius: '8px',
              padding: '0.55rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#EF4444'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'pulse 1s infinite' }}>
                  fiber_manual_record
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Recording audio... 0:0{recordingSeconds}
                </span>
              </div>
              <button
                onClick={() => setIsRecordingVoice(false)}
                style={{ background: 'transparent', border: 'none', color: '#8696A0', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            /* Regular Text Input */
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message Sahayak (Hindi/Bengali/English)..."
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
          )}

          {/* Send / Voice Action Buttons */}
          {isRecordingVoice ? (
            <button
              onClick={finishVoiceRecording}
              title="Send Voice Recording"
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
          ) : inputVal.trim() ? (
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
              onClick={() => setIsRecordingVoice(true)}
              title="Record WhatsApp Voice Note"
              style={{
                background: '#2A3942',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00A884',
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
