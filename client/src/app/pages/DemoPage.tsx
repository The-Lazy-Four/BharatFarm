import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { MobileBottomNav } from '../../components/mobile/MobileBottomNav';

interface VideoOption {
    id: string;
    lang: string;
    nativeLang: string;
    title: string;
    description: string;
    duration: string;
    videoUrl: string;
    poster: string;
    topics: string[];
}

const DEMO_VIDEOS: VideoOption[] = [
    {
        id: 'en',
        lang: 'English',
        nativeLang: 'English',
        title: 'BharatFarm Complete Walkthrough & SIH Platform Demo',
        description: 'Learn how to navigate SIH Innovations (Climate Risk, Aggregation Optimizer, Smart Mandi, Sahayak AI) and Basic Farmer Needs.',
        duration: '3m 45s',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        poster: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
        topics: [
            '🌦️ Climate Risk & Rain Warnings',
            '🤝 Small-Farm Aggregation Pools',
            '📍 Smart Mandi Price Comparison',
            '💬 Sahayak WhatsApp AI Assistant',
            '📲 PWA Installation & Android Notifications'
        ]
    },
    {
        id: 'hi',
        lang: 'Hindi',
        nativeLang: 'हिंदी',
        title: 'भारतफॉर्म ऐप का उपयोग कैसे करें - संपूर्ण गाइड',
        description: 'जलवायु जोखिम, डिजिटल मंडी भाव, समूह बिक्री और सहायक AI वॉइस बॉट का उपयोग करने का आसान तरीका सीखें।',
        duration: '4m 10s',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        poster: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
        topics: [
            '🌦️ मौसम व जलवायु अलर्ट',
            '🤝 किसान समूह बिक्री (Aggregator)',
            '📍 मंडी भाव एवं सही बाजार',
            '💬 सहायक व्हाट्सएप सहायता',
            '📲 मोबाइल ऐप डाउनलोड व इंस्टॉलेशन'
        ]
    },
    {
        id: 'bn',
        lang: 'Bengali',
        nativeLang: 'বাংলা',
        title: 'ভারতফর্ম অ্যাপ ব্যবহার নির্দেশিকা - সম্পূর্ণ ডেমো',
        description: 'আবহাওয়া পূর্বাভাস, ডিজিটাল মান্ডি দর, ক্ষুদ্র কৃষক সঙ্ঘ এবং সহায়ক AI চ্যাটবট ব্যবহারের সহজ নির্দেশিকা।',
        duration: '3m 50s',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        poster: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
        topics: [
            '🌦️ আবহাওয়া ও বৃষ্টিপাতের পূর্বাভাস',
            '🤝 দলবদ্ধ ফসল বিক্রয় সুবিধা',
            '📍 স্মার্ট মান্ডি ও বাজার দর',
            '💬 সহায়ক হোয়াটসঅ্যাপ এআই বট',
            '📲 অ্যাপ ইনস্টলেশন নির্দেশিকা'
        ]
    }
];

export const DemoPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedLang, setSelectedLang] = useState<string>('en');

    const currentVideo = DEMO_VIDEOS.find(v => v.id === selectedLang) || DEMO_VIDEOS[0];

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            background: '#F8FAFC',
            paddingBottom: '80px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            boxSizing: 'border-box',
            overflowX: 'hidden'
        }}>
            {/* Top Bar Header */}
            <header style={{
                padding: '1rem 1.25rem',
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={() => navigate('/home')}
                        style={{
                            background: '#F1F5F9',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0F172A',
                            cursor: 'pointer',
                            padding: 0
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                    </button>

                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                            App Demo & Video Guide 🎥
                        </h1>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.1rem 0 0 0', fontWeight: 500 }}>
                            Learn how to use BharatFarm in 3 languages
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/profile')}
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                    }}
                >
                    {user?.fullName ? user.fullName[0].toUpperCase() : '👨‍🌾'}
                </button>
            </header>

            {/* Main Content Area */}
            <main style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Language Selection Bar */}
                <section style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '0.85rem 1rem',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16A34A' }}>translate</span>
                        <span>Select Demo Video Language:</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {DEMO_VIDEOS.map(v => {
                            const active = selectedLang === v.id;
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedLang(v.id)}
                                    style={{
                                        padding: '0.6rem 0.5rem',
                                        borderRadius: '12px',
                                        border: active ? '2px solid #16A34A' : '1px solid #E2E8F0',
                                        background: active ? '#F0FDF4' : '#F8FAFC',
                                        color: active ? '#15803D' : '#475569',
                                        fontWeight: active ? 800 : 600,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '2px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span>{v.nativeLang}</span>
                                    <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({v.lang})</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Video Player Container */}
                <section style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#0F172A' }}>
                        <video
                            key={currentVideo.id}
                            controls
                            poster={currentVideo.poster}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        >
                            <source src={currentVideo.videoUrl} type="video/mp4" />
                            Your browser does not support video playback.
                        </video>
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(0,0,0,0.75)',
                            color: '#FFFFFF',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700
                        }}>
                            {currentVideo.duration} &middot; {currentVideo.nativeLang}
                        </div>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span className="badge badge-primary" style={{ background: '#DCFCE7', color: '#15803D', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                                Official Demonstration
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>SIH Judge Demo Ready</span>
                        </div>

                        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                            {currentVideo.title}
                        </h2>

                        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                            {currentVideo.description}
                        </p>

                        <div style={{
                            background: '#F8FAFC',
                            borderRadius: '14px',
                            padding: '1rem',
                            border: '1px solid #E2E8F0'
                        }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.6rem 0' }}>
                                Key Topics Covered in this Video:
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {currentVideo.topics.map((topic, i) => (
                                    <li key={i} style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                                        {topic}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Quick Navigation Shortcuts */}
                <section style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)'
                }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: '0 0 0.3rem 0' }}>
                        Ready to explore BharatFarm?
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
                        Jump straight into SIH Innovations or Sahayak AI Assistant to test real features.
                    </p>

                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <button
                            onClick={() => navigate('/home')}
                            style={{
                                flex: 1,
                                background: '#FFFFFF',
                                color: '#15803D',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '0.6rem',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            Go to Home
                        </button>
                        <button
                            onClick={() => navigate('/sih/sahayak')}
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.18)',
                                color: '#FFFFFF',
                                border: '1px solid rgba(255,255,255,0.4)',
                                borderRadius: '10px',
                                padding: '0.6rem',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            Open Sahayak
                        </button>
                    </div>
                </section>

            </main>

            {/* Bottom Nav */}
            <MobileBottomNav type="main" />
        </div>
    );
};
