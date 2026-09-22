import React, { useState } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { WhatsAppSimulatorModal } from './WhatsAppSimulatorModal';
import { CallSimulatorModal } from './CallSimulatorModal';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const MobileSahayakView: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chat' | 'channels' | 'experts'>('chat');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getInitialGreeting = () => {
    if (language === 'hi') return 'नमस्ते किसान भाई! 🙏 मैं भारतफ़ार्म सहायक हूँ। आज मैं आपकी फसल, मंडी भाव या मौसम में कैसे मदद करूँ?';
    if (language === 'bn') return 'নমস্কার কৃষক ভাই! 🙏 আমি ভারতফার্ম সহায়ক। আজ আপনার ফসল, মান্ডি দর বা আবহাওয়ায় কীভাবে সাহায্য করতে পারি?';
    return 'Namaste Farmer! 🙏 I am BharatFarm Sahayak. How can I assist you today with crops, mandi prices, or weather?';
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: getInitialGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSend = (textOverride?: string) => {
    const query = (textOverride || inputText).trim();
    if (!query) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = t('sahayakPage.aiRecommendation');
      const lower = query.toLowerCase();

      if (lower.includes('wheat') || lower.includes('गेहूं') || lower.includes('গম') || lower.includes('yield') || lower.includes('उपज') || lower.includes('ফলন')) {
        replyText = language === 'hi'
          ? '🌾 गेहूं की उपज बढ़ाने के लिए: बोने से पहले बीज को थीरम/कार्बेन्डाजिम से उपचारित करें। पहली सिंचाई बुवाई के 21-25 दिन बाद (CRI स्टेज) करें और नैनो यूरिया का पर्णीय छिड़काव करें।'
          : language === 'bn'
          ? '🌾 গমের ফলন বৃদ্ধির জন্য: বীজ বপনের আগে থিরাম দিয়ে শোধন করুন। ২১-২৫ দিনের মাথায় প্রথম সেচ দিন এবং প্রয়োজনীয় নাইট্রোজেন ও জিঙ্ক স্প্রে করুন।'
          : '🌾 For high Wheat yield: Treat seeds with Carbendazim before sowing. Apply first irrigation at Crown Root Initiation (21-25 days) and spray balanced micronutrients with Nano Urea.';
      } else if (lower.includes('mandi') || lower.includes('rate') || lower.includes('price') || lower.includes('भाव') || lower.includes('দাম')) {
        replyText = language === 'hi'
          ? '📊 आपके नजदीकी हल्दिया/तमलुक मंडी में आज आलू ₹22-26/kg, धान ₹2,320/क्विंटल और टमाटर ₹18-22/kg का रुझान है। बेचने के लिए "Where to Sell" मॉड्यूल देखें!'
          : language === 'bn'
          ? '📊 আপনার নিকটবর্তী তমলুক/হলদিয়া মণ্ডিতে আলুর দাম ₹২২-২৬/কেজি এবং ধানের দর ₹২৩২০/কুইন্টাল। সেরা লাভের জন্য "Where to Sell" ট্যাব দেখুন।'
          : '📊 Live Mandi Pulse: Purba Medinipur Mandi currently trading Potato at ₹22-26/kg and Paddy at ₹2,320/Qtl. Check "Where to Sell" for best transport margins!';
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('मौसम') || lower.includes('বৃষ্টি')) {
        replyText = language === 'hi'
          ? '🌦️ मौसम अलर्ट: अगले 48 घंटों में 12-18mm हल्की से मध्यम बारिश की संभावना है। कीटनाशक छिड़काव 2 दिन टालें और जल निकासी का प्रबंध रखें।'
          : language === 'bn'
          ? '🌦️ আবহাওয়া সতর্কবার্তা: আগামী ৪৮ ঘণ্টায় হালকা থেকে মাঝারি বৃষ্টির পূর্বাভাস রয়েছে। জমিতে কীটনাশক স্প্রে স্থগিত রাখুন।'
          : '🌦️ Weather Advisory: 12-18mm light to moderate rainfall expected within 48h. Postpone foliar pesticide sprays and maintain field drainage.';
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const quickPrompts = [
    { label: language === 'hi' ? '🌾 गेहूं की उपज' : language === 'bn' ? '🌾 গমের ফলন' : '🌾 Boost Wheat', query: t('sahayakPage.askQuestionPrompt') },
    { label: language === 'hi' ? '📊 मंडी भाव' : language === 'bn' ? '📊 মান্ডি দর' : '📊 Mandi Rates', query: 'What are today mandi rates for potato and paddy?' },
    { label: language === 'hi' ? '🌦️ बारिश अलर्ट' : language === 'bn' ? '🌦️ বৃষ্টির খবর' : '🌦️ Rain Forecast', query: 'Is there rain predicted in my area this week?' },
    { label: language === 'hi' ? '🛡️ फसल सुरक्षा' : language === 'bn' ? '🛡️ ফসল সুরক্ষা' : '🛡️ Leaf Disease', query: 'How do I detect blight fungal disease on leaves?' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* 1. Header Banner & Status Strip */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A24 0%, #2D5A38 100%)',
        borderRadius: '16px',
        padding: '0.85rem 1rem',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 14px rgba(30, 58, 36, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem'
          }}>
            👨‍🌾
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 800 }}>{t('sahayakPage.title')} AI</span>
              <span style={{
                background: '#22C55E',
                color: '#FFFFFF',
                fontSize: '0.6rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFFFFF' }} />
                LIVE
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#D1FAE5', marginTop: '1px' }}>
              {t('sahayakPage.subtitle')}
            </div>
          </div>
        </div>

        {/* Quick Dial Action */}
        <button
          onClick={() => setIsCallModalOpen(true)}
          style={{
            background: '#22C55E',
            border: 'none',
            borderRadius: '10px',
            color: '#FFFFFF',
            padding: '0.45rem 0.75rem',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.35)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>call</span>
          1800 Free
        </button>
      </div>

      {/* 2. Compact Segmented Control (Tabs) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        background: '#EAE5D9',
        padding: '3px',
        borderRadius: '12px',
        gap: '3px'
      }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            background: activeTab === 'chat' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'chat' ? '#1E3A24' : '#64748B',
            border: 'none',
            borderRadius: '10px',
            padding: '0.45rem 0.2rem',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: activeTab === 'chat' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>smart_toy</span>
          {t('sahayakPage.aiAssistant')}
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          style={{
            background: activeTab === 'channels' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'channels' ? '#1E3A24' : '#64748B',
            border: 'none',
            borderRadius: '10px',
            padding: '0.45rem 0.2rem',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: activeTab === 'channels' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>phone_in_talk</span>
          Helpline
        </button>

        <button
          onClick={() => setActiveTab('experts')}
          style={{
            background: activeTab === 'experts' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'experts' ? '#1E3A24' : '#64748B',
            border: 'none',
            borderRadius: '10px',
            padding: '0.45rem 0.2rem',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: activeTab === 'experts' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>groups</span>
          {t('sahayakPage.humanSahayak')}
        </button>
      </div>

      {/* 3. TAB 1: AI ASSISTANT CHAT VIEW */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          
          {/* Quick Prompts Chips Scroll */}
          <div style={{
            display: 'flex',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none'
          }}>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.query)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2DED0',
                  borderRadius: '16px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#2C3E2D',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Compact Chat Frame */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E6E2D4',
            boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            height: '380px',
            overflow: 'hidden'
          }}>
            {/* Messages Scroll Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              background: '#FAF8F3'
            }}>
              {messages.map(m => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '84%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    background: m.sender === 'user' ? '#1E3A24' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : '#1F2937',
                    padding: '0.65rem 0.85rem',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '0.82rem',
                    lineHeight: 1.35,
                    fontWeight: 500,
                    boxShadow: m.sender === 'user'
                      ? '0 2px 6px rgba(30, 58, 36, 0.2)'
                      : '0 1px 4px rgba(0, 0, 0, 0.05)',
                    border: m.sender === 'user' ? 'none' : '1px solid #EBE7DD'
                  }}>
                    {m.text}
                  </div>
                  <span style={{
                    fontSize: '0.6rem',
                    color: '#9CA3AF',
                    marginTop: '2px',
                    padding: '0 4px'
                  }}>
                    {m.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div style={{
                  alignSelf: 'flex-start',
                  background: '#FFFFFF',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '12px',
                  border: '1px solid #EBE7DD',
                  fontSize: '0.72rem',
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                  Sahayak is thinking...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div style={{
              padding: '0.55rem 0.75rem',
              background: '#FFFFFF',
              borderTop: '1px solid #E6E2D4',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              <button
                onClick={() => alert(t('sahayakPage.micActivated'))}
                title={t('sahayakPage.voiceInput')}
                style={{
                  background: '#F4F1EA',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mic</span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t('sahayakPage.typeMessage')}
                style={{
                  flex: 1,
                  background: '#F8F6F0',
                  border: '1px solid #DCD7C9',
                  borderRadius: '18px',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.82rem',
                  color: '#1F2937',
                  outline: 'none'
                }}
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                title={t('sahayakPage.sendMessage')}
                style={{
                  background: inputText.trim() ? '#1E3A24' : '#D1D5DB',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  flexShrink: 0,
                  transition: 'background 0.2s'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: ALTERNATIVE ACCESS CHANNELS (WhatsApp & Phone) */}
      {activeTab === 'channels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Card A: WhatsApp Sahayak */}
          <div style={{
            background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)',
            borderRadius: '16px',
            padding: '1rem',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(7, 94, 84, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat</span>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>WhatsApp Sahayak AI</h4>
                  <span style={{ fontSize: '0.68rem', color: '#D1FAE5' }}>Direct WhatsApp Bot & Diagnostics</span>
                </div>
              </div>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                fontSize: '0.64rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '8px'
              }}>
                24/7
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#E6FFFA', margin: '0 0 0.75rem 0', lineHeight: 1.35 }}>
              Send photos of diseased leaves, check daily local mandi rates, or chat by voice messages in your native tongue.
            </p>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              {['📸 Leaf Diagnostics', '🌾 Live Mandi', '🗣️ Hindi/Bengali/En'].map((tag, i) => (
                <span key={i} style={{
                  background: 'rgba(0,0,0,0.25)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '6px'
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <button
                onClick={() => setIsSimulatorOpen(true)}
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.55rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>smartphone</span>
                Demo App
              </button>

              <a
                href="https://wa.me/919876543210?text=Namaste%20Sahayak"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  padding: '0.55rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                Open Chat
              </a>
            </div>
          </div>

          {/* Card B: Toll-Free Voice Helpline */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderRadius: '16px',
            padding: '1rem',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{
                  background: '#3B82F6',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>support_agent</span>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>AI Voice Call Helpline</h4>
                  <span style={{ fontSize: '0.68rem', color: '#93C5FD' }}>Low-Literacy Keypad & Voice Assistant</span>
                </div>
              </div>
              <span style={{
                background: 'rgba(59,130,246,0.3)',
                color: '#60A5FA',
                fontSize: '0.64rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '8px',
                border: '1px solid rgba(59,130,246,0.5)'
              }}>
                Toll Free
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#CBD5E1', margin: '0 0 0.75rem 0', lineHeight: 1.35 }}>
              Dual modality telephony: press keypad digits 1 to 6 or speak freely in your language with zero app navigation.
            </p>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              {['📞 1800-242-728', '⌨️ DTMF Keypad', '🎙️ Spoken Intent'].map((tag, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.1)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '6px'
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <button
                onClick={() => setIsCallModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.55rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dialpad</span>
                Simulate Call
              </button>

              <a
                href="tel:1800242728"
                style={{
                  background: '#334155',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  padding: '0.55rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  border: '1px solid #475569'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>call</span>
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: HUMAN SAHAYAK DIRECTORY */}
      {activeTab === 'experts' && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '0.9rem',
          border: '1px solid #E6E2D4',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1F2937' }}>
              {t('sahayakPage.localSahayaks')}
            </h4>
            <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700 }}>2 Verified</span>
          </div>

          {[
            { name: 'Sukhwinder Singh', area: 'Sector 4, Haldia', phone: '+91 98765 43210', badge: 'Crop Specialist' },
            { name: 'Rajesh Kumar', area: 'Burdwan East', phone: '+91 98123 45678', badge: 'Mandi Facilitator' }
          ].map((s, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 0.85rem',
              borderRadius: '12px',
              background: '#F9F8F5',
              border: '1px solid #EFECE3'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1F2937' }}>{s.name}</span>
                  <span style={{
                    fontSize: '0.6rem',
                    background: '#DCFCE7',
                    color: '#15803D',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '6px'
                  }}>
                    {s.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                  📍 {s.area}
                </div>
              </div>

              <button
                onClick={() => alert(t('sahayakPage.callingSahayak', { name: s.name, phone: s.phone }))}
                style={{
                  background: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.45rem 0.85rem',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>call</span>
                Call
              </button>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Smartphone Simulator */}
      <WhatsAppSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      {/* AI Voice Call Telephony Simulator */}
      <CallSimulatorModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />
    </div>
  );
};
