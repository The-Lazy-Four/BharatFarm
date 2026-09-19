import React, { useState } from 'react';
import { SihLayout } from '../../shared/SihLayout';
import { useLanguage } from '@core/context/LanguageContext';
import { WhatsAppSimulatorModal } from '../components/WhatsAppSimulatorModal';
import { CallSimulatorModal } from '../components/CallSimulatorModal';

/* Sahayak AI voice/text companion page with human advisor directory */
export const SahayakPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ai' | 'human'>('ai');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: t('sahayakPage.aiGreeting') }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const updated = [...messages, { sender: 'user' as const, text }];
    setMessages(updated);
    if (!textToSend) setInputText('');

    setTimeout(() => {
      setMessages([
        ...updated,
        { sender: 'ai', text: t('sahayakPage.aiRecommendation') }
      ]);
    }, 600);
  };

  // Quick action buttons with translated labels
  const quickActions = [
    { icon: 'help_outline', text: t('sahayakPage.askQuestion'), prompt: t('sahayakPage.askQuestionPrompt') },
    { icon: 'mic', text: t('sahayakPage.voiceSupport'), prompt: t('sahayakPage.voicePrompt') },
    { icon: 'photo_camera', text: t('sahayakPage.sendPhoto'), prompt: t('sahayakPage.photoPrompt') },
    { icon: 'support_agent', text: t('sahayakPage.talkToHuman'), prompt: t('sahayakPage.humanPrompt') }
  ];

  return (
    <SihLayout activeModuleId="sahayak" moduleTitle="Sahayak" moduleIcon="eco">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Title */}
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            {t('sahayakPage.title')}
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.35rem', margin: 0 }}>
            {t('sahayakPage.subtitle')}
          </p>
        </div>

        {/* AI Assistant / Human Sahayak Tabs */}
        <div style={{
          display: 'inline-flex',
          background: '#E2E8F0',
          padding: '0.35rem',
          borderRadius: '12px',
          gap: '0.35rem',
          alignSelf: 'flex-start'
        }}>
          <button
            onClick={() => setActiveTab('ai')}
            style={{
              background: activeTab === 'ai' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'ai' ? '#0F172A' : '#64748B',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'ai' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {t('sahayakPage.aiAssistant')}
          </button>
          <button
            onClick={() => setActiveTab('human')}
            style={{
              background: activeTab === 'human' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'human' ? '#0F172A' : '#64748B',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'human' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {t('sahayakPage.humanSahayak')}
          </button>
        </div>

        {activeTab === 'ai' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Quick Actions Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0' }}>
                {t('sahayakPage.howCanIHelp')}
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.85rem'
              }}>
                {quickActions.map((qa, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qa.prompt)}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#334155',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '20px' }}>{qa.icon}</span>
                    <span>{qa.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Box Container */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              height: '350px'
            }}>
              {/* Messages Viewport */}
              <div style={{
                flex: 1,
                padding: '1.25rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: m.sender === 'user' ? '#16A34A' : '#F1F5F9',
                      color: m.sender === 'user' ? '#FFFFFF' : '#0F172A',
                      padding: '0.75rem 1.1rem',
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      maxWidth: '80%',
                      lineHeight: 1.4
                    }}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              {/* Chat Input Bar at Bottom */}
              <div style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t('sahayakPage.typeMessage')}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />

                <button
                  onClick={() => alert(t('sahayakPage.micActivated'))}
                  title={t('sahayakPage.voiceInput')}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mic</span>
                </button>

                <button
                  onClick={() => handleSendMessage()}
                  title={t('sahayakPage.sendMessage')}
                  style={{
                    background: '#16A34A',
                    border: 'none',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Human Sahayak Directory */
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0' }}>
              {t('sahayakPage.localSahayaks')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Sukhwinder Singh', area: 'Sector 4, Haldia', phone: '+91 98765 43210' },
                { name: 'Rajesh Kumar', area: 'Burdwan East', phone: '+91 98123 45678' }
              ].map((s, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{s.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{s.area}</span>
                  </div>

                  <button
                    onClick={() => alert(t('sahayakPage.callingSahayak', { name: s.name, phone: s.phone }))}
                    style={{
                      background: '#16A34A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.55rem 1.1rem',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t('sahayakPage.callSahayak')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Access Channels Section — Mobile Friendly Small Cards Grid */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              {t('sahayakPage.alternativeChannelsTitle') || 'Low-Literacy & Direct Access Channels'}
            </h3>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
              {t('sahayakPage.alternativeChannelsSubtitle') || 'Access BharatFarm agricultural intelligence without complex app navigation.'}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            alignItems: 'stretch'
          }}>
            {/* Small Card 1: WhatsApp Cloud Access Layer */}
            <div style={{
              background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
              borderRadius: '18px',
              padding: '1.25rem',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 20px -4px rgba(6, 78, 59, 0.3)',
              border: '1px solid rgba(52, 211, 153, 0.25)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(255,255,255,0.15)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#A7F3D0'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#34D399' }}>chat</span>
                    WhatsApp Cloud Layer
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 700 }}>24/7 AI Service</span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#FFFFFF' }}>
                  WhatsApp Sahayak AI
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#D1FAE5', margin: '0 0 0.85rem 0', lineHeight: 1.45 }}>
                  Chat naturally, send leaf photos for disease diagnostics, get live Mandi rates and flood alerts via WhatsApp.
                </p>

                {/* Compact Tags / Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.1rem' }}>
                  {[
                    { label: '🌦️ Rain Alerts' },
                    { label: '🌾 Live Mandi' },
                    { label: '🔬 Leaf Diagnostic' },
                    { label: '🗣️ Hi · Bn · En' }
                  ].map((chip, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#E6FFFA'
                      }}
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  style={{
                    flex: '1 1 140px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>smartphone</span>
                  Launch Demo UI
                </button>

                <a
                  href="https://wa.me/919876543210?text=Namaste%20Sahayak"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>sms</span>
                  wa.me Link
                </a>
              </div>
            </div>

            {/* Small Card 2: AI Voice Call Sahayak Line */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              borderRadius: '18px',
              padding: '1.25rem',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.4)',
              border: '1px solid #334155'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>support_agent</span>
                    Voice Helpline Layer
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>Toll-Free 1800</span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#FFFFFF' }}>
                  AI Call Sahayak Helpline
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '0 0 0.85rem 0', lineHeight: 1.45 }}>
                  Low-literacy telephony assistant. Dual modality with DTMF keypad (1-6) and natural spoken speech in your language.
                </p>

                {/* Compact Tags / Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.1rem' }}>
                  {[
                    { label: '⌨️ Keypad 1–6' },
                    { label: '🎙️ Spoken Intent' },
                    { label: '🗣️ Hindi·Bengali·English' },
                    { label: '🚜 Zero Tech Skills' }
                  ].map((chip, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#94A3B8'
                      }}
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsCallModalOpen(true)}
                  style={{
                    flex: '1 1 140px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dialpad</span>
                  Start Call Demo
                </button>

                <a
                  href="tel:1800242728"
                  style={{
                    background: '#1E293B',
                    color: '#E2E8F0',
                    textDecoration: 'none',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    border: '1px solid #475569'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#10B981' }}>call</span>
                  1800-242-728
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Realistic WhatsApp Smartphone Interface Modal */}
        <WhatsAppSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
        />

        {/* Realistic AI Call Assistant Telephony Modal */}
        <CallSimulatorModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
        />

      </div>
    </SihLayout>
  );
};
