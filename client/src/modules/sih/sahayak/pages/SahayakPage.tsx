import React, { useState } from 'react';
import { SihLayout } from '../../shared/SihLayout';
import { useAuth } from '@core/context/AuthContext';
import { SahayakService, LocalSahayak } from '../sahayak.service';

export const SahayakPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ai' | 'whatsapp' | 'human'>('whatsapp');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Sat Sri Akal / Namaste! I am your Sahayak AI Companion. How can I assist your farm today?' }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [sahayaks] = useState<LocalSahayak[]>(SahayakService.getLocalSahayaks());

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsgs = [...messages, { sender: 'user' as const, text: inputText }];
    setMessages(newMsgs);
    setInputText('');

    setTimeout(() => {
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: `For ${user?.primaryCrops?.[0] || 'Wheat'} in ${user?.district || 'Ludhiana'}, current APMC Mandi rates are stable at ₹2,380/Qtl. Weather is fair for harvesting.`
        }
      ]);
    }, 800);
  };

  return (
    <SihLayout
      activeModuleId="sahayak"
      moduleTitle="Sahayak & WhatsApp"
      moduleIcon="💬"
      moduleBadge="Voice & WhatsApp"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>
        
        {/* Module Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #062612 0%, #15803d 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ background: '#22c55e', color: '#04210e', fontWeight: 900, fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                SIH MODULE 5
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>• Assisted Access & WhatsApp Interface</span>
            </div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              Sahayak — Assisted Access & WhatsApp Integration
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.3rem', maxWidth: '780px', lineHeight: 1.4 }}>
              Bridging the digital literacy divide for smallholders via 24/7 WhatsApp AI voice/photo companions and verified in-person village Sahayaks.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.35rem', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveTab('whatsapp')}
              style={{
                background: activeTab === 'whatsapp' ? '#22c55e' : 'transparent',
                color: activeTab === 'whatsapp' ? '#04210e' : '#ffffff',
                border: 'none',
                padding: '0.55rem 0.95rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              📲 WhatsApp AI
            </button>
            <button
              onClick={() => setActiveTab('human')}
              style={{
                background: activeTab === 'human' ? '#22c55e' : 'transparent',
                color: activeTab === 'human' ? '#04210e' : '#ffffff',
                border: 'none',
                padding: '0.55rem 0.95rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              🤝 Village Sahayak
            </button>
          </div>
        </div>

        {/* Tab 1: WhatsApp AI & Assistant Workflow */}
        {activeTab === 'whatsapp' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            
            {/* WhatsApp Integration Gateway Card */}
            <div style={{
              background: 'var(--surface-1, #0d2818)',
              border: '2px solid #22c55e',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem'
            }}>
              <div>
                <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontWeight: 900, fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                  WHATSAPP BUSINESS COMPANION
                </span>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '0.5rem 0 0.3rem 0' }}>
                  Connect BharatFarm on WhatsApp
                </h2>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                  Send voice messages in your local language or crop disease leaf photos directly to our WhatsApp bot number.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                  <div style={{ background: 'var(--surface-0)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    🎙️ <strong>Voice Advisory:</strong> Speak in Hindi or Punjabi
                  </div>
                  <div style={{ background: 'var(--surface-0)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📸 <strong>Photo Diagnosis:</strong> Upload diseased crop photos
                  </div>
                </div>
              </div>

              <a
                href={SahayakService.generateWhatsAppLink(user?.phone)}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)'
                }}
              >
                <span>Launch Official WhatsApp AI Bot</span>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>open_in_new</span>
              </a>
            </div>

            {/* In-App AI Sahayak Simulator */}
            <div style={{
              background: 'var(--surface-1, #0d2818)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
              borderRadius: '20px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              height: '420px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.85rem 0' }}>
                💬 Live In-App Sahayak Assistant
              </h3>

              {/* Chat Viewport */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                paddingRight: '0.3rem'
              }}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: m.sender === 'user' ? '#22c55e' : 'var(--surface-0, #041209)',
                      color: m.sender === 'user' ? '#04210e' : '#ffffff',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      maxWidth: '82%',
                      lineHeight: 1.35
                    }}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Sahayak anything about crops or mandi rates..."
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.85rem',
                    borderRadius: '10px',
                    background: 'var(--surface-0)',
                    border: '1px solid var(--border-default)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  style={{
                    background: '#22c55e',
                    color: '#04210e',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  Send
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Tab 2: Village Human Sahayak Directory */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                🤝 Verified Village Human Sahayaks
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Local village representatives who can visit your farm to assist with online MSP group selling & government scheme registration.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {sahayaks.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: 'var(--surface-1, #0d2818)',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontWeight: 800, fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                        ⭐ {s.rating} Rating ({s.assignedFarmers} Farmers Served)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        📍 {s.distanceKm} km away
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: '0.4rem 0 0.1rem 0' }}>
                      {s.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Assigned Location: <strong>{s.village}</strong>
                    </div>
                  </div>

                  <div style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 700 }}>
                      📞 {s.phone}
                    </span>

                    <button
                      onClick={() => alert(`Calling ${s.name} at ${s.phone}`)}
                      style={{
                        background: '#22c55e',
                        color: '#04210e',
                        border: 'none',
                        padding: '0.55rem 1rem',
                        borderRadius: '10px',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Request Visit ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </SihLayout>
  );
};
