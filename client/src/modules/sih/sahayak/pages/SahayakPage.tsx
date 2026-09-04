import React, { useState } from 'react';
import { SihLayout } from '../../shared/SihLayout';

export const SahayakPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'human'>('ai');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Namaste! How can I help you today with your farming needs?' }
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
        { sender: 'ai', text: 'I recommend checking local mandi rates or scanning your leaf for disease diagnostic.' }
      ]);
    }, 600);
  };

  return (
    <SihLayout activeModuleId="sahayak" moduleTitle="Sahayak" moduleIcon="eco">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Title */}
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Sahayak
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.35rem', margin: 0 }}>
            Your Farming Companion
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
            AI Assistant
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
            Human Sahayak
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
                How can I help you today?
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.85rem'
              }}>
                {[
                  { icon: 'help_outline', text: 'Ask a Question', prompt: 'How do I boost Wheat crop yield?' },
                  { icon: 'mic', text: 'Voice Support', prompt: 'Listening... (Speak now)' },
                  { icon: 'photo_camera', text: 'Send a Photo', prompt: 'Opening Leaf Camera Diagnosis...' },
                  { icon: 'support_agent', text: 'Talk to Human Sahayak', prompt: 'Connecting to local village Sahayak representative...' }
                ].map((qa, idx) => (
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
                  placeholder="Type your message..."
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
                  onClick={() => alert('Microphone recording activated...')}
                  title="Voice Input"
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
                  title="Send Message"
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
              Local Human Sahayaks Near You
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
                    onClick={() => alert(`Calling ${s.name} at ${s.phone}`)}
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
                    Call Sahayak
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </SihLayout>
  );
};
