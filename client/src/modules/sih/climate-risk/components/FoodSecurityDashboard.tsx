import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { ClimateRiskService } from '../climateRisk.service';
import {
  FoodSecuritySnapshot,
  DistrictRiskItem,
  ScenarioSimulationResult,
  GovtGeminiDecisionPlan,
  GeminiActionItem
} from '../types';

interface Props {
  snapshot: FoodSecuritySnapshot;
  districts: DistrictRiskItem[];
  onSimulateScenario: (lossPct: number) => Promise<ScenarioSimulationResult>;
}

export const FoodSecurityDashboard: React.FC<Props> = ({
  snapshot,
  districts,
  onSimulateScenario
}) => {
  const { language } = useLanguage();
  const [selectedState, setSelectedState] = useState('West Bengal');
  const [selectedDistrict, setSelectedDistrict] = useState('Haldia');
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [selectedCropStage, setSelectedCropStage] = useState('Maturity / Ready to Harvest');
  const [showFormula, setShowFormula] = useState(false);

  // Government Gemini AI Plan State
  const [govtPlan, setGovtPlan] = useState<GovtGeminiDecisionPlan | null>(null);
  const [isGovtAiLoading, setIsGovtAiLoading] = useState<boolean>(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  // What-If Scenario State
  const [scenarioLossPct, setScenarioLossPct] = useState<number>(30);
  const [simulationResult, setSimulationResult] = useState<ScenarioSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Translation Dictionary
  const tGovt = {
    en: {
      hubBadge: 'GOVERNMENT & AUTHORITY HUB',
      hubRole: '🔒 Role-Protected Policy View',
      hubTitle: 'Food Security & Procurement Planner',
      hubSubtitle: 'Live AI decision-support for crop procurement, transport logistics, and district storage balances',
      plannerTitle: 'GOVERNMENT PROCUREMENT PLANNER',
      plannerSubtitle: 'AI-generated procurement and transport plan',
      geminiBadge: '🤖 Gemini AI',
      refreshBtn: '↻ Refresh AI Plan',
      updatingMsg: '🤖 Updating procurement plan...',
      updatedMsg: '✓ Plan updated',
      procurementHeading: 'PROCUREMENT NEEDS',
      doBy: 'DO BY:',
      priorityHigh: 'HIGH',
      priorityImp: 'IMPORTANT',
      priorityNormal: 'NORMAL',
      noUrgentTitle: 'No urgent procurement action.',
      noUrgentSub: 'Continue regular monitoring.',
      transportAlertTitle: '⚠️ TRANSPORT ALERT',
      storageAlertTitle: '🏠 STORAGE',
      stateAvailability: 'State Domestic Availability Profile',
      stateProdSub: 'STATE PRODUCTION & INVENTORY BALANCES',
      explainCalc: 'Explain Calculation',
      hideCalc: 'Hide Formula',
      simTitle: 'What-If Climate Disaster Scenario Simulator',
      simSub: 'INTERACTIVE DISASTER SIMULATION ENGINE',
      simHelp: 'Drag slider to simulate regional crop loss % and dynamically calculate domestic availability gap & trade advisories.',
      lossLabel: 'Simulated Estimated Crop Loss:',
      matrixTitle: 'District-Wise Climate & Flood Vulnerability Matrix',
      matrixSub: 'DISTRICT-LEVEL CROP EXPOSURE',
      demoDataBadge: '🧪 Demonstration / simulated data'
    },
    bn: {
      hubBadge: 'সরকারি ও খাদ্য দপ্তর হাব',
      hubRole: '🔒 সুরক্ষিত নীতি ব্যবস্থাপনা',
      hubTitle: 'খাদ্য নিরাপত্তা ও সরকারি সংগ্রহ পরিকল্পনা',
      hubSubtitle: 'ফসল সংগ্রহ, পরিবহন লজিস্টিকস এবং জেলা গুদামের ভারসাম্যের জন্য লাইভ AI সিদ্ধান্ত সহায়তা',
      plannerTitle: 'সরকারি সংগ্রহ পরিকল্পনা',
      plannerSubtitle: 'AI-সংগৃহীত ফসল সংগ্রহ ও পরিবহন পরিকল্পনা',
      geminiBadge: '🤖 Gemini AI',
      refreshBtn: '↻ AI পরিকল্পনা রিফ্রেশ করুন',
      updatingMsg: '🤖 সংগ্রহ পরিকল্পনা আপডেট হচ্ছে...',
      updatedMsg: '✓ পরিকল্পনা আপডেট সম্পন্ন',
      procurementHeading: 'সরকারি সংগ্রহ প্রয়োজন',
      doBy: 'সময়সীমা:',
      priorityHigh: 'জরুরি',
      priorityImp: 'গুরুত্বপূর্ণ',
      priorityNormal: 'স্বাভাবিক',
      noUrgentTitle: 'জরুরি কোনো সংগ্রহের প্রয়োজন নেই।',
      noUrgentSub: 'নিয়মিত পর্যবেক্ষণ চালিয়ে যান।',
      transportAlertTitle: '⚠️ পরিবহন সতর্কতা',
      storageAlertTitle: '🏠 গুদাম / সংরক্ষণ',
      stateAvailability: 'ঘরোয়া খাদ্য প্রাপ্যতা বিশ্লেষণ',
      stateProdSub: 'রাজ্য উৎপাদন ও মজুদ ভারসাম্য',
      explainCalc: 'হিসাব বুঝিয়ে দিন',
      hideCalc: 'হিসাব লুকান',
      simTitle: 'দুর্যোগ পরিস্থিতি সিমুলেটর',
      simSub: 'ইন্টারেক্টিভ দুর্যোগ সিমুলেশন ইঞ্জিন',
      simHelp: 'ফসল ক্ষতির শতাংশ পরিবর্তন করে খাদ্য ঘাটতি ও বাণিজ্য নির্দেশিকা দেখুন।',
      lossLabel: 'আনুমানিক ফসল ক্ষতি:',
      matrixTitle: 'জেলাভিত্তিক জলবায়ু ও বন্যা ঝুঁকি তালিকা',
      matrixSub: 'জেলা স্তরের ফসলের ঝুঁকি',
      demoDataBadge: '🧪 সিমুলেটেড ডেমো ডেটা'
    },
    hi: {
      hubBadge: 'सरकारी एवं खाद्य प्राधिकरण हब',
      hubRole: '🔒 सुरक्षित नीति प्रबंधन',
      hubTitle: 'खाद्य सुरक्षा एवं सरकारी खरीद योजना',
      hubSubtitle: 'फसल खरीद, परिवहन लॉजिस्टिक्स और जिला भंडारण प्रबंधन के लिए लाइव AI निर्णय सहायता',
      plannerTitle: 'सरकारी खरीद योजना',
      plannerSubtitle: 'AI-जनित खरीद और परिवहन योजना',
      geminiBadge: '🤖 Gemini AI',
      refreshBtn: '↻ AI योजना रिफ्रेश करें',
      updatingMsg: '🤖 खरीद योजना अपडेट हो रही है...',
      updatedMsg: '✓ योजना अपडेट हो गई',
      procurementHeading: 'खरीद आवश्यकताएं',
      doBy: 'समय सीमा:',
      priorityHigh: 'जरूरी',
      priorityImp: 'महत्वपूर्ण',
      priorityNormal: 'सामान्य',
      noUrgentTitle: 'कोई जरूरी खरीद कार्रवाई नहीं।',
      noUrgentSub: 'नियमित निगरानी जारी रखें।',
      transportAlertTitle: '⚠️ परिवहन चेतावनी',
      storageAlertTitle: '🏠 भंडारण',
      stateAvailability: 'घरेलू खाद्य उपलब्धता विश्लेषण',
      stateProdSub: 'राज्य उत्पादन एवं भंडार संतुलन',
      explainCalc: 'गणना समझें',
      hideCalc: 'गणना छुपाएं',
      simTitle: 'आपदा परिदृश्य सिम्युलेटर',
      simSub: 'इंटरैक्टिव आपदा सिमुलेशन इंजन',
      simHelp: 'फसल नुकसान का प्रतिशत बदलकर उपलब्धता अंतर और व्यापार सलाह देखें।',
      lossLabel: 'अनुमानित फसल नुकसान:',
      matrixTitle: 'जिलेवार जलवायु एवं बाढ़ जोखिम तालिका',
      matrixSub: 'जिला स्तरीय फसल जोखिम',
      demoDataBadge: '🧪 सिम्युलेटेड डेमो डेटा'
    }
  };

  const currentT = language === 'bn' ? tGovt.bn : language === 'hi' ? tGovt.hi : tGovt.en;

  // Load Govt Gemini Decision Plan
  const loadGovtDecision = useCallback(async (isUserRefresh: boolean = false) => {
    setIsGovtAiLoading(true);
    if (isUserRefresh) {
      setRefreshToast(currentT.updatingMsg);
    }
    try {
      const plan = await ClimateRiskService.fetchGovtGeminiDecision({
        state: selectedState,
        district: selectedDistrict,
        location: `${selectedDistrict}, ${selectedState}`,
        crop: selectedCrop,
        cropStage: selectedCropStage,
        language,
        rainfallMm: scenarioLossPct >= 30 ? 55 : 20,
        floodRisk: scenarioLossPct >= 30 ? 'HIGH' : 'LOW',
        lossPercentage: scenarioLossPct,
        transportAccessibility: scenarioLossPct >= 30 ? 'Vulnerable' : 'Good',
        storageAvailability: scenarioLossPct >= 25 ? 'Needed' : 'Adequate'
      });
      setGovtPlan(plan);
      if (isUserRefresh) {
        setRefreshToast(currentT.updatedMsg);
        setTimeout(() => setRefreshToast(null), 3000);
      }
    } catch (e) {
      console.warn('Failed to load govt plan:', e);
      if (isUserRefresh) {
        setRefreshToast(null);
      }
    } finally {
      setIsGovtAiLoading(false);
    }
  }, [selectedState, selectedDistrict, selectedCrop, selectedCropStage, language, scenarioLossPct, currentT]);

  useEffect(() => {
    loadGovtDecision(false);
  }, [loadGovtDecision]);

  const handleSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setScenarioLossPct(val);
    setIsSimulating(true);
    try {
      const res = await onSimulateScenario(val);
      setSimulationResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  const getRiskBadgeStyle = (riskLevel: string) => {
    if (riskLevel === 'CRITICAL') return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
    if (riskLevel === 'CAUTION') return { bg: '#fef9c3', color: '#854d0e', border: '#fde047' };
    return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
  };

  const activeResult = simulationResult || {
    cropLossPercentage: 30,
    currentStock: snapshot.currentStockLakhTonnes,
    baselineProduction: snapshot.expectedProductionLakhTonnes,
    estimatedClimateLoss: Number(((snapshot.expectedProductionLakhTonnes * 30) / 100).toFixed(2)),
    effectiveProduction: Number((snapshot.expectedProductionLakhTonnes * 0.7).toFixed(2)),
    committedOutwardSupply: snapshot.committedOutwardSupplyLakhTonnes,
    projectedDomesticAvailability: Number((snapshot.currentStockLakhTonnes + (snapshot.expectedProductionLakhTonnes * 0.7) - snapshot.committedOutwardSupplyLakhTonnes).toFixed(2)),
    safetyStockThreshold: snapshot.safetyStockThresholdLakhTonnes,
    safetyGap: Number(((snapshot.currentStockLakhTonnes + (snapshot.expectedProductionLakhTonnes * 0.7) - snapshot.committedOutwardSupplyLakhTonnes) - snapshot.safetyStockThresholdLakhTonnes).toFixed(2)),
    riskLevel: (snapshot.currentStockLakhTonnes + (snapshot.expectedProductionLakhTonnes * 0.7) - snapshot.committedOutwardSupplyLakhTonnes) < snapshot.safetyStockThresholdLakhTonnes ? 'CRITICAL' : 'CAUTION',
    advisoryHeadline: 'CRITICAL SUPPLY DEFICIT (-0.34 LAKH TONNES BELOW SAFETY THRESHOLD)',
    tradeAdvisory: 'Review outward movement and export commitments under applicable policy frameworks.',
    recommendedActions: [
      'Review outward movement/export commitments under applicable policy frameworks.',
      'Prioritize domestic food-security requirements and public distribution system reserves.',
      'Assess grain redistribution from regional surplus districts.',
      'Increase monitoring frequency of flood/drought affected agricultural zones.'
    ]
  };

  const snapBadge = getRiskBadgeStyle(snapshot.riskLevel);
  const simBadge = getRiskBadgeStyle(activeResult.riskLevel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. GOVERNMENT INTELLIGENCE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '16px',
        padding: '1.5rem',
        color: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 900, fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '999px', letterSpacing: '0.05em' }}>
                {currentT.hubBadge}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                {currentT.hubRole}
              </span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              {currentT.hubTitle}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
              {currentT.hubSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#334155', color: '#FFF', fontWeight: 700, border: '1px solid #475569', fontSize: '0.85rem' }}
            >
              <option value="West Bengal">West Bengal</option>
              <option value="Punjab">Punjab</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#334155', color: '#FFF', fontWeight: 700, border: '1px solid #475569', fontSize: '0.85rem' }}
            >
              <option value="Haldia">Haldia</option>
              <option value="Murshidabad">Murshidabad</option>
              <option value="Burdwan">Burdwan</option>
              <option value="Kharagpur">Kharagpur</option>
            </select>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#334155', color: '#FFF', fontWeight: 700, border: '1px solid #475569', fontSize: '0.85rem' }}
            >
              <option value="Paddy">Paddy / Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize</option>
              <option value="Mustard">Mustard</option>
            </select>

            <select
              value={selectedCropStage}
              onChange={(e) => setSelectedCropStage(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#334155', color: '#FFF', fontWeight: 700, border: '1px solid #475569', fontSize: '0.85rem' }}
            >
              <option value="Maturity / Ready to Harvest">Maturity / Harvest</option>
              <option value="Flowering">Flowering</option>
              <option value="Vegetative / Growth">Vegetative</option>
              <option value="Sowing / Seedling">Sowing / Seedling</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 2. GOVERNMENT PROCUREMENT PLANNER (GEMINI AI DECISION ENGINE) ── */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #bae6fd',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 4px 18px rgba(2, 132, 199, 0.08)'
      }}>
        {/* Planner Header & Dynamic Refresh */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                border: '1px solid #7dd3fc',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                {currentT.geminiBadge}
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0369a1', margin: 0, letterSpacing: '0.01em' }}>
                {govtPlan?.planTitle || currentT.plannerTitle}
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
              {govtPlan?.subtitle || currentT.plannerSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {refreshToast && (
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: refreshToast.includes('✓') ? '#dcfce7' : '#e0f2fe',
                color: refreshToast.includes('✓') ? '#15803d' : '#0369a1',
                border: `1px solid ${refreshToast.includes('✓') ? '#86efac' : '#7dd3fc'}`
              }}>
                {refreshToast}
              </span>
            )}

            <button
              onClick={() => loadGovtDecision(true)}
              disabled={isGovtAiLoading}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: isGovtAiLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s ease',
                opacity: isGovtAiLoading ? 0.7 : 1
              }}
            >
              {currentT.refreshBtn}
            </button>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {isGovtAiLoading && !govtPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                background: '#f1f5f9',
                borderRadius: '10px',
                height: i === 1 ? '52px' : '90px',
                animation: 'pulse 1.5s ease-in-out infinite',
                opacity: 0.7
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:.7} 50%{opacity:.35} }`}</style>
          </div>
        )}

        {/* AI PROCUREMENT SUMMARY (1–2 short lines) */}
        {govtPlan?.riskSummary && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '0.9rem 1.1rem',
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.45,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🤖 {govtPlan.riskSummary}
          </div>
        )}

        {/* EMPTY / LOW-RISK STATE */}
        {govtPlan && govtPlan.hasUrgentAction === false && (!govtPlan.actions || govtPlan.actions.length === 0) && (
          <div style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>
              ✓ {currentT.noUrgentTitle}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {currentT.noUrgentSub}
            </div>
          </div>
        )}

        {/* AI ACTION PLAN (3–4 Compact Government Action Cards) */}
        {govtPlan && govtPlan.actions && govtPlan.actions.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {govtPlan.actions.map((act: GeminiActionItem, idx: number) => {
              const pStr = (act.priority || '').toUpperCase();
              const isHigh = pStr === 'HIGH' || (act.priority as string) === 'জরুরি' || (act.priority as string) === 'जरूरी';
              const isImp = pStr === 'IMPORTANT' || (act.priority as string) === 'গুরুত্বপূর্ণ' || (act.priority as string) === 'महत्वपूर्ण';

              return (
                <div
                  key={act.id || idx}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.65rem',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#0369a1',
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
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginTop: '0.25rem', lineHeight: 1.35 }}>
                        {act.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{
                      background: isHigh ? '#fee2e2' : isImp ? '#fef3c7' : '#dcfce7',
                      color: isHigh ? '#b91c1c' : isImp ? '#b45309' : '#15803d',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {isHigh ? currentT.priorityHigh : isImp ? currentT.priorityImp : currentT.priorityNormal}
                    </span>

                    {act.timing && (
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                        {currentT.doBy} <strong style={{ color: '#0f172a' }}>{act.timing}</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PROCUREMENT NEEDS (Compact Section) */}
        {govtPlan?.procurementNeeds && govtPlan.procurementNeeds.length > 0 && (
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📦 {currentT.procurementHeading}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              {govtPlan.procurementNeeds.map((item, pIdx) => (
                <div key={pIdx} style={{
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  padding: '0.6rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>{item.item}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>{item.need}</div>
                  </div>
                  {item.urgency === 'HIGH' && (
                    <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.68rem', fontWeight: 800, padding: '0.12rem 0.4rem', borderRadius: '4px' }}>
                      {currentT.priorityHigh}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSPORT ALERT (Dynamic Warning - only when risk exists) */}
        {govtPlan?.transportAlert && govtPlan.transportAlert.show && (
          <div style={{
            background: '#fffbe6',
            border: '1.5px solid #fef08a',
            borderRadius: '12px',
            padding: '0.85rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            <span style={{ fontSize: '1.35rem' }}>⚠️</span>
            <div style={{ fontSize: '0.86rem', color: '#78350f', lineHeight: 1.4 }}>
              <strong style={{ display: 'block', marginBottom: '0.15rem' }}>
                {govtPlan.transportAlert.title || currentT.transportAlertTitle}
              </strong>
              {govtPlan.transportAlert.text}
            </div>
          </div>
        )}

        {/* STORAGE ALERT (Dynamic Warning - only when storage is relevant) */}
        {govtPlan?.storageAlert && govtPlan.storageAlert.show && (
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            borderRadius: '12px',
            padding: '0.85rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            <span style={{ fontSize: '1.35rem' }}>🏠</span>
            <div style={{ fontSize: '0.86rem', color: '#166534', lineHeight: 1.4 }}>
              <strong style={{ display: 'block', marginBottom: '0.15rem' }}>
                {govtPlan.storageAlert.title || currentT.storageAlertTitle}
              </strong>
              {govtPlan.storageAlert.text}
            </div>
          </div>
        )}
      </div>

      {/* 3. REGIONAL FOOD SECURITY METRICS & FORMULA */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {currentT.stateProdSub}
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
              {selectedState} — {selectedCrop} {currentT.stateAvailability}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setShowFormula(!showFormula)}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              {showFormula ? currentT.hideCalc : currentT.explainCalc}
            </button>

            <span style={{
              background: snapBadge.bg,
              color: snapBadge.color,
              border: `1px solid ${snapBadge.border}`,
              padding: '0.4rem 0.85rem',
              borderRadius: '999px',
              fontWeight: 900,
              fontSize: '0.85rem'
            }}>
              FOOD SECURITY RISK: {snapshot.riskLevel}
            </span>
          </div>
        </div>

        {/* 6 Key Formula Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.85rem'
        }}>
          <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>CURRENT STOCK</span>
            <strong style={{ fontSize: '1.25rem', color: '#0F172A', fontWeight: 900 }}>{snapshot.currentStockLakhTonnes}</strong>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>lakh tonnes</span>
          </div>

          <div style={{ background: '#F0FDF4', padding: '0.85rem', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', display: 'block', textTransform: 'uppercase' }}>+ EXPECTED PROD.</span>
            <strong style={{ fontSize: '1.25rem', color: '#15803D', fontWeight: 900 }}>+ {snapshot.expectedProductionLakhTonnes}</strong>
            <span style={{ fontSize: '0.7rem', color: '#86efac', display: 'block' }}>lakh tonnes</span>
          </div>

          <div style={{ background: '#FEF2F2', padding: '0.85rem', borderRadius: '10px', border: '1px solid #FECACA' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991B1B', display: 'block', textTransform: 'uppercase' }}>- ESTIMATED LOSS</span>
            <strong style={{ fontSize: '1.25rem', color: '#DC2626', fontWeight: 900 }}>- {snapshot.estimatedClimateLossLakhTonnes}</strong>
            <span style={{ fontSize: '0.7rem', color: '#fca5a5', display: 'block' }}>lakh tonnes</span>
          </div>

          <div style={{ background: '#FFFBEB', padding: '0.85rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400E', display: 'block', textTransform: 'uppercase' }}>- OUTWARD SUPPLY</span>
            <strong style={{ fontSize: '1.25rem', color: '#D97706', fontWeight: 900 }}>- {snapshot.committedOutwardSupplyLakhTonnes}</strong>
            <span style={{ fontSize: '0.7rem', color: '#fde047', display: 'block' }}>lakh tonnes</span>
          </div>

          <div style={{ background: '#F0F9FF', padding: '0.85rem', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369A1', display: 'block', textTransform: 'uppercase' }}>= PROJECTED AVAIL.</span>
            <strong style={{ fontSize: '1.25rem', color: '#0284C7', fontWeight: 900 }}>= {snapshot.projectedDomesticAvailabilityLakhTonnes}</strong>
            <span style={{ fontSize: '0.7rem', color: '#7dd3fc', display: 'block' }}>lakh tonnes</span>
          </div>

          <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', textTransform: 'uppercase' }}>SAFETY THRESHOLD</span>
            <strong style={{ fontSize: '1.25rem', color: '#334155', fontWeight: 900 }}>{snapshot.safetyStockThresholdLakhTonnes}</strong>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block' }}>lakh tonnes</span>
          </div>
        </div>

        {/* Explain Calculation Panel */}
        {showFormula && (
          <div style={{
            background: '#F1F5F9',
            borderRadius: '10px',
            padding: '1rem',
            border: '1px solid #CBD5E1',
            fontSize: '0.85rem',
            color: '#1E293B',
            fontFamily: 'monospace'
          }}>
            <div style={{ fontWeight: 800, marginBottom: '0.35rem', color: '#0F172A' }}>
              📐 FORMULA EXPLANATION:
            </div>
            <div>
              Projected Domestic Availability = Current Stock + Expected Production - Estimated Climate Loss - Committed Outward Supply
            </div>
            <div style={{ marginTop: '0.35rem', fontWeight: 700, color: '#0284C7' }}>
              {snapshot.currentStockLakhTonnes} + {snapshot.expectedProductionLakhTonnes} - {snapshot.estimatedClimateLossLakhTonnes} - {snapshot.committedOutwardSupplyLakhTonnes} = {snapshot.projectedDomesticAvailabilityLakhTonnes} lakh tonnes
            </div>
          </div>
        )}
      </div>

      {/* 4. WHAT-IF CLIMATE DISASTER SCENARIO SIMULATOR */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.5rem',
        border: `1px solid ${simBadge.border}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {currentT.simSub}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
              {currentT.simTitle}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              {currentT.simHelp}
            </p>
          </div>

          <span style={{
            background: simBadge.bg,
            color: simBadge.color,
            padding: '0.4rem 0.85rem',
            borderRadius: '999px',
            fontWeight: 900,
            fontSize: '0.85rem'
          }}>
            SIMULATION RISK: {activeResult.riskLevel}
          </span>
        </div>

        {/* Slider Controls */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
              {currentT.lossLabel} <span style={{ color: '#DC2626', fontSize: '1.2rem', fontWeight: 900 }}>{scenarioLossPct}%</span>
            </label>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              {isSimulating ? 'Recalculating...' : 'Realtime Dynamic Calculation'}
            </span>
          </div>

          {/* Range Input Slider */}
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={scenarioLossPct}
            onChange={handleSliderChange}
            style={{ width: '100%', cursor: 'pointer', height: '8px', accentColor: '#7C3AED' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
            <span>0% (No Loss)</span>
            <span>10%</span>
            <span>20%</span>
            <span>30% (Severe Storm)</span>
            <span>40%</span>
            <span>50% (Catastrophic)</span>
          </div>
        </div>

        {/* Dynamic Simulation Results Card */}
        <div style={{
          background: activeResult.riskLevel === 'CRITICAL' ? '#FEF2F2' : activeResult.riskLevel === 'CAUTION' ? '#FFFBEB' : '#F0FDF4',
          border: `1px solid ${activeResult.riskLevel === 'CRITICAL' ? '#FECACA' : activeResult.riskLevel === 'CAUTION' ? '#FDE68A' : '#BBF7D0'}`,
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', display: 'block' }}>SIMULATED CROP LOSS</span>
              <strong style={{ fontSize: '1.2rem', color: '#DC2626' }}>{activeResult.estimatedClimateLoss} lakh tonnes</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', display: 'block' }}>EFFECTIVE PRODUCTION</span>
              <strong style={{ fontSize: '1.2rem', color: '#0F172A' }}>{activeResult.effectiveProduction} lakh tonnes</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', display: 'block' }}>PROJECTED AVAILABILITY</span>
              <strong style={{ fontSize: '1.2rem', color: '#0284C7' }}>{activeResult.projectedDomesticAvailability} lakh tonnes</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', display: 'block' }}>SAFETY THRESHOLD GAP</span>
              <strong style={{ fontSize: '1.2rem', color: activeResult.safetyGap < 0 ? '#DC2626' : '#16A34A' }}>
                {activeResult.safetyGap >= 0 ? `+${activeResult.safetyGap}` : activeResult.safetyGap} lakh tonnes
              </strong>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: activeResult.riskLevel === 'CRITICAL' ? '#991B1B' : '#0F172A', margin: '0 0 0.3rem 0' }}>
              TRADE ADVISORY: {activeResult.advisoryHeadline}
            </h4>
            <p style={{ fontSize: '0.83rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
              {activeResult.tradeAdvisory}
            </p>
          </div>
        </div>
      </div>

      {/* 5. DISTRICT-WISE RISK BREAKDOWN TABLE */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {currentT.matrixSub}
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
              {currentT.matrixTitle}
            </h3>
          </div>

          <span style={{ fontSize: '0.72rem', background: '#FFFBEB', color: '#92400E', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid #FDE68A', fontWeight: 700 }}>
            {currentT.demoDataBadge}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                <th style={{ padding: '0.75rem', fontWeight: 800 }}>DISTRICT</th>
                <th style={{ padding: '0.75rem', fontWeight: 800 }}>CROP</th>
                <th style={{ padding: '0.75rem', fontWeight: 800 }}>CROP RISK</th>
                <th style={{ padding: '0.75rem', fontWeight: 800 }}>FLOOD RISK</th>
                <th style={{ padding: '0.75rem', fontWeight: 800 }}>ESTIMATED LOSS %</th>
                <th style={{ padding: '0.75rem', fontWeight: 800 }}>DATA SOURCE</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0F172A' }}>📍 {d.district}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: '#16A34A' }}>🌾 {d.crop}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      background: d.cropRiskLevel === 'HIGH' ? '#ffedd5' : '#dcfce7',
                      color: d.cropRiskLevel === 'HIGH' ? '#c2410c' : '#166534',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px'
                    }}>
                      {d.cropRiskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      background: d.floodRiskLevel === 'SEVERE' ? '#fee2e2' : d.floodRiskLevel === 'HIGH' ? '#ffedd5' : '#dcfce7',
                      color: d.floodRiskLevel === 'SEVERE' ? '#991b1b' : d.floodRiskLevel === 'HIGH' ? '#c2410c' : '#166534',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px'
                    }}>
                      {d.floodRiskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 800, color: d.estimatedLossPercentage > 25 ? '#DC2626' : '#0F172A' }}>
                    {d.estimatedLossPercentage}%
                  </td>
                  <td style={{ padding: '0.75rem', color: '#64748B', fontSize: '0.75rem' }}>{d.dataSource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
