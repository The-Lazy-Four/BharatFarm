import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  GeminiDecisionPlan,
  GeminiActionItem,
  WhatChangedDiff
} from '../types';

interface Props {
  decisionPlan: GeminiDecisionPlan | null;
  location: string;
  crop: string;
  cropStage: string;
  isAnalyzing: boolean;
  onRefresh: () => void;
  actionStatuses: Record<string, 'not_started' | 'in_progress' | 'done'>;
  onUpdateActionStatus: (actionId: string, status: 'not_started' | 'in_progress' | 'done') => void;
  whatChanged: WhatChangedDiff | null;
}

export const FarmerActionPage: React.FC<Props> = ({
  decisionPlan,
  location,
  crop,
  cropStage,
  isAnalyzing,
  onRefresh,
  actionStatuses,
  onUpdateActionStatus,
  whatChanged
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showReasoning, setShowReasoning] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const tLabels = {
    en: {
      analyzingTitle: 'Analyzing Farm Conditions with Gemini...',
      step1: '🌦 1. Checking Weather',
      step2: '🌾 2. Checking Crop Stage',
      step3: '⚠️ 3. Checking Flood Risk',
      step4: '🤖 4. Action Plan Ready',
      planTitle: 'GEMINI FARM ACTION PLAN',
      planBadge: '✨ Personalized for Your Farm',
      planSubtitle: `Personalized for ${crop} at ${cropStage} stage based on today's risk`,
      doBy: 'DO BY:',
      statusLabel: 'Status:',
      notStarted: 'Not started',
      inProgress: 'In progress',
      done: 'Done',
      whyTitle: 'Why these actions?',
      viewReasoning: 'View AI reasoning ↓',
      hideReasoning: 'Hide AI reasoning ↑',
      decisionFactors: 'DECISION FACTORS CONSIDERED:',
      buyRain: 'BUY BEFORE THE RAIN',
      buyNormal: 'RECOMMENDED FARM PURCHASES',
      smartMandi: 'Explore Smart Mandi',
      viewInMandi: 'View in Mandi',
      urgent: 'URGENT',
      recommended: 'RECOMMENDED',
      noBuy: 'No urgent purchases recommended. Farm supplies are currently sufficient for normal operations.',
      whatChangedTitle: '🔄 WHAT CHANGED SINCE LAST UPDATE?',
      rainRisk: 'Rain risk',
      riskLevelLabel: 'Risk level',
      contextLabel: 'Context',
      completedLabel: 'completed',
      warningTitle: 'WARNING',
      refreshBtn: 'Refresh AI Analysis'
    },
    bn: {
      analyzingTitle: 'Gemini দিয়ে খামারের পরিস্থিতি বিশ্লেষণ করা হচ্ছে...',
      step1: '🌦 ১. আবহাওয়া পরীক্ষা',
      step2: '🌾 ২. ফসলের বৃদ্ধি পরীক্ষা',
      step3: '⚠️ ৩. বন্যা ঝুঁকি মূল্যায়ন',
      step4: '🤖 ৪. কর্মপরিকল্পনা প্রস্তুত',
      planTitle: 'AI কৃষি কর্মপরিকল্পনা',
      planBadge: '✨ আপনার খামারের জন্য বিশেষায়িত',
      planSubtitle: `আজকের ঝুঁকি অনুযায়ী ${cropStage} অবস্থায় ${crop} ফসলের জন্য তৈরি`,
      doBy: 'সময়সীমা:',
      statusLabel: 'অবস্থা:',
      notStarted: 'শুরু হয়নি',
      inProgress: 'চলছে',
      done: 'সম্পন্ন',
      whyTitle: 'কেন এই পদক্ষেপগুলি?',
      viewReasoning: 'AI কারণ দেখুন ↓',
      hideReasoning: 'AI কারণ লুকান ↑',
      decisionFactors: 'বিবেচিত সিদ্ধান্ত উপাদানসমূহ:',
      buyRain: 'বৃষ্টির আগে প্রয়োজনীয় জিনিস কিনুন',
      buyNormal: 'প্রয়োজনীয় কৃষি কেনাকাটা',
      smartMandi: 'স্মার্ট মান্ডি দেখুন',
      viewInMandi: 'মান্ডিতে দেখুন',
      urgent: 'জরুরি',
      recommended: 'প্রস্তাবিত',
      noBuy: 'এই মুহূর্তে জরুরি কিছু কেনার প্রয়োজন নেই। সাধারণ কাজের জন্য উপকরণ যথেষ্ট।',
      whatChangedTitle: '🔄 গত আপডেটের পর কী পরিবর্তন হয়েছে?',
      rainRisk: 'বৃষ্টির সম্ভাবনা',
      riskLevelLabel: 'ঝুঁকির মাত্রা',
      contextLabel: 'পরিস্থিতি',
      completedLabel: 'সম্পন্ন হয়েছে',
      warningTitle: 'সতর্কবার্তা',
      refreshBtn: 'AI বিশ্লেষণ রিফ্রেশ করুন'
    },
    hi: {
      analyzingTitle: 'Gemini द्वारा खेत की स्थिति का विश्लेषण किया जा रहा है...',
      step1: '🌦 १. मौसम की जांच',
      step2: '🌾 २. फसल अवस्था जांच',
      step3: '⚠️ ३. बाढ़ जोखिम जांच',
      step4: '🤖 ४. कार्य योजना तैयार',
      planTitle: 'AI कृषि कार्य योजना',
      planBadge: '✨ आपके खेत के लिए विशेष',
      planSubtitle: `आज के जोखिम के अनुसार ${cropStage} अवस्था में ${crop} फसल के लिए तैयार`,
      doBy: 'समय सीमा:',
      statusLabel: 'स्थिति:',
      notStarted: 'शुरू नहीं',
      inProgress: 'प्रगति पर',
      done: 'पूर्ण',
      whyTitle: 'ये कदम क्यों?',
      viewReasoning: 'AI कारण देखें ↓',
      hideReasoning: 'AI कारण छुपाएं ↑',
      decisionFactors: 'विचार किए गए मुख्य कारण:',
      buyRain: 'बारिश से पहले जरूरी सामान खरीदें',
      buyNormal: 'अनुशंसित कृषि खरीद',
      smartMandi: 'स्मार्ट मंडी देखें',
      viewInMandi: 'मंडी में देखें',
      urgent: 'जरूरी',
      recommended: 'अनुशंसित',
      noBuy: 'वर्तमान में तत्काल खरीद की आवश्यकता नहीं है। कृषि इनपुट पर्याप्त हैं।',
      whatChangedTitle: '🔄 पिछले अपडेट के बाद क्या बदलाव हुआ?',
      rainRisk: 'बारिश जोखिम',
      riskLevelLabel: 'जोखिम स्तर',
      contextLabel: 'स्थिति',
      completedLabel: 'पूर्ण हुआ',
      warningTitle: 'चेतावनी',
      refreshBtn: 'AI विश्लेषण रीफ्रेश करें'
    }
  };

  const currentLang = language === 'bn' ? 'bn' : language === 'hi' ? 'hi' : 'en';
  const L = tLabels[currentLang];

  // Loading animation sequence
  useEffect(() => {
    if (isAnalyzing) {
      setLoadingStep(0);
      const s1 = setTimeout(() => setLoadingStep(1), 350);
      const s2 = setTimeout(() => setLoadingStep(2), 750);
      const s3 = setTimeout(() => setLoadingStep(3), 1150);
      return () => {
        clearTimeout(s1);
        clearTimeout(s2);
        clearTimeout(s3);
      };
    } else {
      setLoadingStep(0);
    }
  }, [isAnalyzing]);

  const handleMandiNav = (category?: string) => {
    if (category) {
      navigate(`/sih/smart-mandi?category=${encodeURIComponent(category.toLowerCase())}`);
    } else {
      navigate('/sih/smart-mandi');
    }
  };

  const riskLevel = decisionPlan?.riskLevel || 'LOW';
  const isHighRisk = riskLevel === 'SEVERE' || riskLevel === 'HIGH';
  const isModerateRisk = riskLevel === 'MODERATE';

  const alertBg = isHighRisk ? '#fff1f2' : isModerateRisk ? '#fffbeb' : '#f0fdf4';
  const alertBorder = isHighRisk ? '#fecdd3' : isModerateRisk ? '#fef08a' : '#bbf7d0';
  const badgeBg = isHighRisk ? '#dc2626' : isModerateRisk ? '#d97706' : '#16a34a';

  // SVG Icons helper
  const renderIcon = (iconName: string) => {
    const name = (iconName || '').toLowerCase();
    if (name.includes('drain') || name.includes('shovel')) {
      return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <path d="M22 4L28 10L14 24L8 18L22 4Z" fill="#64748b"/>
          <path d="M6 20L12 26L4 28L6 20Z" fill="#78350f"/>
          <path d="M2 28C6 26 10 30 14 28" stroke="#a16207" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      );
    }
    if (name.includes('harvest') || name.includes('sickle')) {
      return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <path d="M20 4C13.3726 4 8 9.37258 8 16C8 19.866 9.83226 23.3039 12.6841 25.5L8 30" stroke="#d97706" strokeWidth="3" strokeLinecap="round"/>
          <path d="M18 10C14.6863 10 12 12.6863 12 16" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    }
    if (name.includes('spray') || name.includes('pesticide')) {
      return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect x="10" y="10" width="12" height="18" rx="4" fill="#3b82f6"/>
          <path d="M16 4V10M12 6H20" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="22" cy="7" r="1.5" fill="#60a5fa"/>
          <circle cx="25" cy="5" r="1" fill="#60a5fa"/>
          <circle cx="26" cy="9" r="1" fill="#60a5fa"/>
        </svg>
      );
    }
    if (name.includes('cart') || name.includes('buy')) {
      return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <path d="M4 6H8L11 20H26L29 10H10" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="13" cy="25" r="2.5" fill="#16a34a"/>
          <circle cx="24" cy="25" r="2.5" fill="#16a34a"/>
        </svg>
      );
    }
    if (name.includes('seed')) {
      return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <path d="M8 26C8 18 14 10 24 8C24 18 18 26 8 26Z" fill="#22c55e"/>
          <path d="M6 28C10 24 14 20 18 18" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    }
    if (name.includes('fertilizer')) {
      return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect x="8" y="6" width="16" height="22" rx="3" fill="#854d0e"/>
          <path d="M12 12H20M12 17H20M12 22H16" stroke="#fef08a" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (name.includes('protect') || name.includes('shield') || name.includes('storage')) {
      return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="14" width="24" height="14" rx="3" fill="#3b82f6"/>
          <path d="M10 14V10C10 6 14 4 16 4C18 4 22 6 22 10V14" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    }
    // Default leaf / check
    return (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" fill="#22c55e"/>
        <path d="M10 16L14 20L22 12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const isHigh = priority === 'HIGH' || priority === 'জরুরি' || priority === 'जरूरी';
    const isImportant = priority === 'IMPORTANT' || priority === 'গুরুত্বপূর্ণ' || priority === 'महत्वपूर्ण';

    if (isHigh) {
      return (
        <span style={{
          background: '#fee2e2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '0.15rem 0.5rem',
          borderRadius: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          🔴 {language === 'bn' ? 'জরুরি' : language === 'hi' ? 'जरूरी' : 'HIGH'}
        </span>
      );
    }
    if (isImportant) {
      return (
        <span style={{
          background: '#fef3c7',
          color: '#b45309',
          border: '1px solid #fde68a',
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '0.15rem 0.5rem',
          borderRadius: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          🟠 {language === 'bn' ? 'গুরুত্বপূর্ণ' : language === 'hi' ? 'महत्वपूर्ण' : 'IMPORTANT'}
        </span>
      );
    }
    return (
      <span style={{
        background: '#dcfce7',
        color: '#15803d',
        border: '1px solid #bbf7d0',
        fontSize: '0.72rem',
        fontWeight: 800,
        padding: '0.15rem 0.5rem',
        borderRadius: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        🟢 {language === 'bn' ? 'স্বাভাবিক' : language === 'hi' ? 'सामान्य' : 'NORMAL'}
      </span>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#0f172a'
    }}>

      {/* ── STEP-BY-STEP LIVE AI ANALYSIS ANIMATION BANNER ── */}
      {isAnalyzing && (
        <div style={{
          background: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.2rem 1.4rem',
          boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          border: '1.5px solid #22c55e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{L.analyzingTitle}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 700 }}>
              {location.split(',')[0]} • {crop} ({cropStage})
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            <div style={{
              background: loadingStep >= 0 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${loadingStep >= 0 ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              padding: '0.45rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: loadingStep >= 0 ? '#86efac' : '#94a3b8'
            }}>
              {L.step1}
            </div>
            <div style={{
              background: loadingStep >= 1 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${loadingStep >= 1 ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              padding: '0.45rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: loadingStep >= 1 ? '#86efac' : '#94a3b8'
            }}>
              {L.step2}
            </div>
            <div style={{
              background: loadingStep >= 2 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${loadingStep >= 2 ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              padding: '0.45rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: loadingStep >= 2 ? '#86efac' : '#94a3b8'
            }}>
              {L.step3}
            </div>
            <div style={{
              background: loadingStep >= 3 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${loadingStep >= 3 ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              padding: '0.45rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: loadingStep >= 3 ? '#86efac' : '#94a3b8'
            }}>
              {L.step4}
            </div>
          </div>
        </div>
      )}

      {/* ── 1. AI-GENERATED RISK SUMMARY CARD ── */}
      {decisionPlan && (
        <div style={{
          background: alertBg,
          border: `1.5px solid ${alertBorder}`,
          borderRadius: '16px',
          padding: '1.25rem 1.4rem',
          position: 'relative',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            {/* Weather / Risk Icon Visual */}
            <div style={{ flexShrink: 0, marginTop: '0.15rem' }}>
              {isHighRisk ? (
                <svg width="56" height="50" viewBox="0 0 64 56" fill="none">
                  <path d="M18 36C12.4772 36 8 31.5228 8 26C8 21.0503 11.595 16.9405 16.3533 16.1432C17.708 9.77443 23.3444 5 30 5C37.8931 5 44.3855 11.1645 44.9657 18.949C49.5298 19.866 53 23.8653 53 28.6667C53 34.19 48.5228 38.6667 43 38.6667" fill="#3b82f6"/>
                  <path d="M18 34C12.4772 34 8 29.5228 8 24C8 19.0503 11.595 14.9405 16.3533 14.1432C17.708 7.77443 23.3444 3 30 3C37.8931 3 44.3855 9.16453 44.9657 16.949C49.5298 17.866 53 21.8653 53 26.6667C53 32.19 48.5228 36.6667 43 36.6667" fill="#60a5fa"/>
                  <path d="M18 42L15 48" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M26 44L23 50" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M34 42L31 48" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M42 44L39 50" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : isModerateRisk ? (
                <svg width="54" height="48" viewBox="0 0 54 48" fill="none">
                  <circle cx="20" cy="20" r="12" fill="#fbbf24"/>
                  <path d="M18 34C12.4772 34 8 29.5228 8 24C8 19.0503 11.595 14.9405 16.3533 14.1432C17.708 7.77443 23.3444 3 30 3C37.8931 3 44.3855 9.16453 44.9657 16.949C49.5298 17.866 53 21.8653 53 26.6667C53 32.19 48.5228 36.6667 43 36.6667" fill="#94a3b8"/>
                  <path d="M20 40L18 45M28 40L26 45" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="52" height="46" viewBox="0 0 52 46" fill="none">
                  <circle cx="26" cy="22" r="14" fill="#fbbf24"/>
                  <path d="M26 4V8M26 36V40M4 22H8M44 22H48M9.4 9.4l2.8 2.8M39.8 39.8l2.8 2.8M9.4 34.6l2.8-2.8M39.8 9.4l2.8-2.8" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>

            {/* Risk Title & Timeline */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span style={{
                  background: badgeBg,
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  padding: '0.22rem 0.75rem',
                  borderRadius: '14px',
                  letterSpacing: '0.03em'
                }}>
                  {isHighRisk ? '🌧️ ' : isModerateRisk ? '🌦️ ' : '☀️ '}
                  {decisionPlan.riskTitle.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b' }}>
                  {decisionPlan.riskTimeline}
                </span>
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                {decisionPlan.riskSummary}
              </div>

              {/* Dynamic 1–2 sentence AI explanation */}
              {decisionPlan.aiExplanation && (
                <div style={{
                  marginTop: '0.65rem',
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  lineHeight: 1.45,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.45rem'
                }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
                  <span>{decisionPlan.aiExplanation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 2. "WHAT CHANGED?" DYNAMIC COMPARISON SECTION ── */}
      {whatChanged && whatChanged.changed && (
        <div style={{
          background: '#f8fafc',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '14px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 900, color: '#475569', letterSpacing: '0.04em' }}>
            <span>{L.whatChangedTitle}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', fontSize: '0.82rem', color: '#334155' }}>
            {whatChanged.rainDiff && (
              <span style={{ background: '#e2e8f0', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700 }}>
                🌧 {L.rainRisk}: {whatChanged.rainDiff.from}% → {whatChanged.rainDiff.to}%
              </span>
            )}
            {whatChanged.riskDiff && (
              <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800 }}>
                ⚠️ {L.riskLevelLabel}: {whatChanged.riskDiff.from} → {whatChanged.riskDiff.to}
              </span>
            )}
            {whatChanged.cropDiff && (
              <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700 }}>
                🌾 {L.contextLabel}: {whatChanged.cropDiff.crop} ({whatChanged.cropDiff.stage})
              </span>
            )}
            {whatChanged.completedDiff && (
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800 }}>
                ✓ {whatChanged.completedDiff.actionTitle} {L.completedLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── 3. MAIN FEATURE: GEMINI FARM ACTION PLAN ── */}
      {decisionPlan && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #dcfce7',
          borderRadius: '18px',
          padding: '1.3rem 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 4px 16px rgba(22, 163, 74, 0.06)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803d', letterSpacing: '0.02em' }}>
                  {L.planTitle}
                </span>
                <span style={{
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                  color: '#14532d',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  border: '1px solid #86efac'
                }}>
                  {L.planBadge}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginTop: '0.15rem' }}>
                {L.planSubtitle}
              </div>
            </div>
          </div>

          {/* Action Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {decisionPlan.actions.map((act: GeminiActionItem, idx: number) => {
              const status = actionStatuses[act.id] || (actionStatuses[act.title] ? actionStatuses[act.title] : 'not_started');
              const isDone = status === 'done';
              const isInProgress = status === 'in_progress';

              return (
                <div
                  key={act.id || idx}
                  style={{
                    background: isDone ? '#f8fafc' : '#ffffff',
                    borderRadius: '14px',
                    border: `1.5px solid ${isDone ? '#cbd5e1' : isInProgress ? '#93c5fd' : '#e2e8f0'}`,
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    boxShadow: isDone ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    opacity: isDone ? 0.78 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* Priority number badge */}
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: '#0f172a',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        flexShrink: 0
                      }}>
                        {language === 'bn'
                          ? (idx === 0 ? '০১' : idx === 1 ? '০২' : idx === 2 ? '০৩' : '০৪')
                          : String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Icon */}
                      <div style={{ flexShrink: 0 }}>
                        {renderIcon(act.icon)}
                      </div>

                      {/* Title and Priority */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: isDone ? '#64748b' : '#0f172a',
                            textDecoration: isDone ? 'line-through' : 'none'
                          }}>
                            {act.title}
                          </span>
                          {getPriorityBadge(act.priority)}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginTop: '0.2rem', lineHeight: 1.35 }}>
                          {act.description}
                        </div>
                      </div>
                    </div>

                    {/* Timing badge */}
                    {act.timing && (
                      <div style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.25rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        alignSelf: 'flex-start'
                      }}>
                        {L.doBy} <span style={{ color: '#0f172a' }}>{act.timing}</span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Status Selector */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.6rem',
                    marginTop: '0.2rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                      {L.statusLabel}
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => onUpdateActionStatus(act.id || act.title, 'not_started')}
                        style={{
                          padding: '0.22rem 0.6rem',
                          borderRadius: '6px',
                          border: status === 'not_started' ? '1.5px solid #94a3b8' : '1px solid #e2e8f0',
                          background: status === 'not_started' ? '#f1f5f9' : '#ffffff',
                          color: status === 'not_started' ? '#0f172a' : '#94a3b8',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ○ {L.notStarted}
                      </button>

                      <button
                        onClick={() => onUpdateActionStatus(act.id || act.title, 'in_progress')}
                        style={{
                          padding: '0.22rem 0.6rem',
                          borderRadius: '6px',
                          border: status === 'in_progress' ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                          background: status === 'in_progress' ? '#eff6ff' : '#ffffff',
                          color: status === 'in_progress' ? '#1d4ed8' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        → {L.inProgress}
                      </button>

                      <button
                        onClick={() => onUpdateActionStatus(act.id || act.title, 'done')}
                        style={{
                          padding: '0.22rem 0.6rem',
                          borderRadius: '6px',
                          border: isDone ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                          background: isDone ? '#dcfce7' : '#ffffff',
                          color: isDone ? '#15803d' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        ✓ {L.done}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 4. "WHY THIS?" AI REASONING COLLAPSIBLE SECTION ── */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginTop: '0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                {L.whyTitle}
              </div>
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#15803d',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>{showReasoning ? L.hideReasoning : L.viewReasoning}</span>
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', lineHeight: 1.4 }}>
              {decisionPlan.whyReasoningSummary || `Gemini recommends these actions based on current weather and the ${cropStage.toLowerCase()} stage of your ${crop} crop.`}
            </div>

            {showReasoning && decisionPlan.decisionFactors && decisionPlan.decisionFactors.length > 0 && (
              <div style={{
                marginTop: '0.5rem',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '0.6rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {L.decisionFactors}
                </div>
                {decisionPlan.decisionFactors.map((factor: string, fIdx: number) => (
                  <div key={fIdx} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: '#16a34a' }}>•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. SMART BUY LIST ("BUY BEFORE THE RAIN") ── */}
      {decisionPlan && (
        <div style={{
          background: '#f0f9ff',
          border: '1.5px solid #e0f2fe',
          borderRadius: '16px',
          padding: '1.25rem 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0284c7', letterSpacing: '0.03em' }}>
                {isHighRisk ? L.buyRain : L.buyNormal}
              </span>
            </div>
            <button
              onClick={() => handleMandiNav()}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#0284c7',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>{L.smartMandi}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>

          {decisionPlan.buyItems && decisionPlan.buyItems.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
              {decisionPlan.buyItems.map((item, bIdx) => (
                <div
                  key={bIdx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #bae6fd',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{item.name}</span>
                      {item.urgency === 'HIGH' ? (
                        <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.68rem', fontWeight: 800, padding: '0.12rem 0.4rem', borderRadius: '4px' }}>
                          {L.urgent}
                        </span>
                      ) : (
                        <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.68rem', fontWeight: 800, padding: '0.12rem 0.4rem', borderRadius: '4px' }}>
                          {L.recommended}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                      {item.reason}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMandiNav(item.category)}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      marginTop: '0.2rem'
                    }}
                  >
                    <span>{L.viewInMandi}</span>
                    <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '0.85rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#64748b',
              textAlign: 'center'
            }}>
              {L.noBuy}
            </div>
          )}

          {/* Why Buy Now AI rationale */}
          {decisionPlan.whyBuyNow && (
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', textAlign: 'center', marginTop: '0.2rem' }}>
              💡 {decisionPlan.whyBuyNow}
            </div>
          )}
        </div>
      )}

      {/* ── 6. SIMPLE DYNAMIC WARNING CARD ── */}
      {decisionPlan?.warning && decisionPlan.warning.show && (
        <div style={{
          background: '#fffbe6',
          border: '1.5px solid #fef08a',
          borderRadius: '16px',
          padding: '1.1rem 1.3rem',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
            <div style={{ flexShrink: 0, marginTop: '0.15rem' }}>
              <svg width="34" height="32" viewBox="0 0 36 32" fill="none">
                <path d="M18 2L34 30H2L18 2Z" fill="#ea580c"/>
                <rect x="16.5" y="11" width="3" height="10" rx="1.5" fill="#ffffff"/>
                <circle cx="18" cy="25" r="1.75" fill="#ffffff"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ea580c', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>
                ⚠️ {decisionPlan.warning.title || L.warningTitle}
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                {decisionPlan.warning.headline}
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
                {decisionPlan.warning.subtext}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. QUICK REFRESH ACTION BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          style={{
            background: '#ffffff',
            border: '1.5px solid #22c55e',
            color: '#15803d',
            padding: '0.65rem 1.4rem',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.12)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>↻ {L.refreshBtn}</span>
        </button>
      </div>

    </div>
  );
};

