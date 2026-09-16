import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext.js';
import { useLanguage } from '../../../../context/LanguageContext.js';
import { SihLayout } from '../../shared/SihLayout.js';
import {
  PriceRiskService,
  KNOWN_DISTRICTS,
  AVAILABLE_CROPS
} from '../priceRisk.service.js';
import type {
  CropRiskAnalysis,
  Season,
  RiskLevel,
  FarmerFieldRegistration,
  WhatIfSimulationResult
} from '@bharatfarm/shared';

const CROP_ICONS: Record<string, string> = {
  Paddy: '🌾', Wheat: '🌿', Cotton: '☁️', Sugarcane: '🎋', Maize: '🌽',
  Potato: '🥔', Mustard: '🌻', Soybean: '🫘', Tomato: '🍅',
  Chilli: '🌶️', Onion: '🧅', Garlic: '🧄', Brinjal: '🍆',
  Cucumber: '🥒', 'Bitter Gourd': '🥬', 'Bottle Gourd': '🥦',
  'Ridge Gourd': '🌿', Peas: '🟢', Coriander: '🌿', Watermelon: '🍉',
  Muskmelon: '🍈', Banana: '🍌', Papaya: '🍈'
};

export const BeforeYouSowPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Registration state
  const [registration, setRegistration] = useState<FarmerFieldRegistration | null>(null);
  const [hasCheckedReg, setHasCheckedReg] = useState(false);

  // Form Inputs
  const [district, setDistrict] = useState('Purba Medinipur');
  const [state, setState] = useState('West Bengal');
  const [crop, setCrop] = useState('Tomato');
  const [season, setSeason] = useState<Season>('Kharif');
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Analysis State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<CropRiskAnalysis | null>(null);

  // UI tabs & toggles
  const [showWhyDrawer, setShowWhyDrawer] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // What-If Simulator State
  const [whatIfPercent, setWhatIfPercent] = useState<number>(20);
  const [whatIfResult, setWhatIfResult] = useState<WhatIfSimulationResult | null>(null);

  // 1. Check registration on mount
  useEffect(() => {
    const userId = user?.id || 'demo_farmer';
    const reg = PriceRiskService.getFieldRegistration(userId);
    setRegistration(reg);
    if (reg) {
      if (reg.crop) setCrop(reg.crop);
      if (reg.district) setDistrict(reg.district);
      if (reg.state) setState(reg.state);
    }
    setHasCheckedReg(true);
  }, [user]);

  // Handle GPS location
  const handleUseGps = async () => {
    setGpsLoading(true);
    setGpsError('');
    try {
      const coords = await PriceRiskService.getCurrentLocation();
      const geo = await PriceRiskService.reverseGeocode(coords.latitude, coords.longitude);
      setDistrict(geo.district);
      setState(geo.state);
    } catch (err: any) {
      setGpsError(err.message || 'Unable to retrieve location.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Perform Analysis
  const handleAnalyze = async () => {
    if (!district || !state || !crop || !season) {
      setError('Please select district, crop and season.');
      return;
    }

    setLoading(true);
    setError('');
    setShowWhyDrawer(false);

    try {
      const data = await PriceRiskService.analyzeCropRisk(
        { district, state },
        crop,
        season
      );
      setAnalysis(data);

      // Initialize simulator with 20%
      const sim = PriceRiskService.simulateWhatIf(data, 20);
      setWhatIfResult(sim);
      setWhatIfPercent(20);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle What-If slider change
  const handleSliderChange = (percent: number) => {
    setWhatIfPercent(percent);
    if (analysis) {
      const sim = PriceRiskService.simulateWhatIf(analysis, percent);
      setWhatIfResult(sim);
    }
  };

  // Helpers for styling risk level
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'LOW': return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC', dot: '#22C55E' };
      case 'MODERATE': return { bg: '#FEF9C3', text: '#A16207', border: '#FDE047', dot: '#EAB308' };
      case 'HIGH': return { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74', dot: '#F97316' };
      case 'VERY_HIGH': return { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5', dot: '#EF4444' };
    }
  };

  const filteredDistricts = KNOWN_DISTRICTS.filter(d =>
    d.district.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.state.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <SihLayout
      activeModuleId="price-risk"
      moduleTitle={t('sih.priceRiskTitle')}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>

        {/* ── Registration Status Banner ──────────────────────────── */}
        {hasCheckedReg && !registration ? (
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '1px solid #F59E0B',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.75rem' }}>📋</span>
              <div>
                <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.95rem' }}>
                  {t('farmerRegistration.headerBadge')}
                </div>
                <div style={{ color: '#B45309', fontSize: '0.82rem' }}>
                  {t('farmerRegistration.pageSubtitle')}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/sih/field-mapping')}
              style={{
                background: '#D97706',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.2rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{t('farmerRegistration.registerFarm')}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </div>
        ) : registration ? (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            padding: '0.65rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#166534' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16A34A' }}>check_circle</span>
              <span><strong>{t('fieldMapping.savedFields')}:</strong> {registration.fieldName} ({registration.crop}, {registration.landSizeAcres} {t('common.acres')}) in {registration.district}, {registration.state}</span>
            </div>
            <button
              onClick={() => navigate('/sih/field-mapping')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#15803D',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {t('fieldMapping.editField')}
            </button>
          </div>
        ) : null}

        {/* ── Page Header / Hero ───────────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '2rem' }}>🌾</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {t('beforeYouSow.pageTitle')}
              </h1>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', color: '#64748B' }}>
                {t('beforeYouSow.pageSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Input Panel ──────────────────────────────────────────── */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

            {/* Location Selector */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                📍 {t('beforeYouSow.yourLocation')}
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  value={showDistrictDropdown ? districtSearch : `${district}, ${state}`}
                  onChange={(e) => {
                    setDistrictSearch(e.target.value);
                    setShowDistrictDropdown(true);
                  }}
                  onFocus={() => {
                    setDistrictSearch(district);
                    setShowDistrictDropdown(true);
                  }}
                  placeholder={t('beforeYouSow.searchDistrictPlaceholder')}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#F8FAFC'
                  }}
                />
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={gpsLoading}
                  title={t('beforeYouSow.gpsTooltip')}
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#2563EB',
                    borderRadius: '8px',
                    padding: '0 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {gpsLoading ? 'sync' : 'my_location'}
                  </span>
                </button>
              </div>

              {gpsError && (
                <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>{gpsError}</div>
              )}

              {/* District Autocomplete dropdown */}
              {showDistrictDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 40,
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  marginTop: '4px'
                }}>
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map(item => (
                      <div
                        key={item.district}
                        onClick={() => {
                          setDistrict(item.district);
                          setState(item.state);
                          setShowDistrictDropdown(false);
                        }}
                        style={{
                          padding: '0.55rem 0.85rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          borderBottom: '1px solid #F1F5F9',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                      >
                        <span style={{ fontWeight: 600, color: '#1E293B' }}>{item.district}</span>
                        <span style={{ color: '#64748B', fontSize: '0.78rem' }}>{item.state}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '0.75rem', fontSize: '0.82rem', color: '#94A3B8' }}>
                      {t('beforeYouSow.noMatchingDistrict')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming Season */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                🌦 {t('beforeYouSow.upcomingSeason')}
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as Season)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#F8FAFC'
                }}
              >
                <option value="Kharif">{t('beforeYouSow.kharifOption')}</option>
                <option value="Rabi">{t('beforeYouSow.rabiOption')}</option>
                <option value="Zaid">{t('beforeYouSow.zaidOption')}</option>
                <option value="Perennial">{t('beforeYouSow.perennialOption')}</option>
              </select>
            </div>

            {/* Crop Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                🌱 {t('beforeYouSow.plannedCrop')}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#F8FAFC'
                }}
              >
                {AVAILABLE_CROPS.map(c => (
                  <option key={c} value={c}>
                    {CROP_ICONS[c] || '🌱'} {c}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
              💡 {t('beforeYouSow.evaluatesNotice')}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                background: loading ? '#94A3B8' : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1.75rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
              }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>sync</span>
                  <span>{t('beforeYouSow.analyzingLocalRisk')}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>query_stats</span>
                  <span>{t('beforeYouSow.analyzeCropRisk')}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* ── ANALYSIS RESULTS SECTION ─────────────────────────────── */}
        {analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* 1. Main Risk Card (Mobile-First) */}
            <div style={{
              background: '#FFFFFF',
              border: `2px solid ${getRiskColor(analysis.risk.level).border}`,
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 6px 18px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('sih.priceRiskTitle')}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                    {CROP_ICONS[analysis.crop] || '🌱'} {analysis.crop} · {analysis.season} {t('beforeYouSow.season')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.1rem' }}>
                    📍 {analysis.location.district}, {analysis.location.state}
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: getRiskColor(analysis.risk.level).bg,
                  border: `1px solid ${getRiskColor(analysis.risk.level).border}`,
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: getRiskColor(analysis.risk.level).dot
                  }} />
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: getRiskColor(analysis.risk.level).text, lineHeight: 1 }}>
                      {String(analysis.risk.level).includes('HIGH') ? t('risk.high') : String(analysis.risk.level).includes('SEVERE') ? t('risk.severe') : String(analysis.risk.level).includes('MODERATE') ? t('risk.moderate') : t('risk.low')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: getRiskColor(analysis.risk.level).text, fontWeight: 600 }}>
                      {analysis.risk.probability}% {t('sih.priceForecastTitle')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meaning & Decision Banner */}
              <div style={{
                background: '#F8FAFC',
                borderLeft: `4px solid ${getRiskColor(analysis.risk.level).dot}`,
                padding: '0.85rem 1rem',
                borderRadius: '0 8px 8px 0',
                marginBottom: '1rem'
              }}>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>
                  {analysis.risk.meaning}
                </div>
                <div style={{ color: '#475569', fontSize: '0.84rem', marginTop: '0.25rem' }}>
                  <strong>{t('risk.primaryAction')}</strong> {analysis.decisionExplanation}
                </div>
              </div>

              {/* Progress visual indicator */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.35rem' }}>
                  <span>{t('risk.low')} (0-35%)</span>
                  <span>{t('risk.moderate')} (36-55%)</span>
                  <span>{t('risk.high')} (56-75%)</span>
                  <span>{t('risk.severe')} (76-100%)</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${analysis.risk.probability}%`,
                    height: '100%',
                    background: analysis.risk.level === 'LOW' ? '#22C55E' : analysis.risk.level === 'MODERATE' ? '#EAB308' : analysis.risk.level === 'HIGH' ? '#F97316' : '#EF4444',
                    borderRadius: '5px',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>

              {/* Action Buttons: "Why?" & "Compare Crops" */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowWhyDrawer(!showWhyDrawer)}
                  style={{
                    background: showWhyDrawer ? '#0F172A' : '#F1F5F9',
                    color: showWhyDrawer ? '#FFFFFF' : '#1E293B',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0.55rem 1rem',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
                  <span>{showWhyDrawer ? t('common.close') : t('risk.why')}</span>
                </button>

                <button
                  onClick={() => setShowComparison(!showComparison)}
                  style={{
                    background: showComparison ? '#0F172A' : '#F1F5F9',
                    color: showComparison ? '#FFFFFF' : '#1E293B',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0.55rem 1rem',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>compare_arrows</span>
                  <span>{showComparison ? t('common.close') : t('beforeYouSow.sideBySideComparison')}</span>
                </button>
              </div>

              {/* Expandable "Why?" LLM Drawer */}
              {showWhyDrawer && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1.25rem',
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '20px' }}>smart_toy</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{t('beforeYouSow.aiEvidenceTitle')}</span>
                  </div>
                  <p style={{ margin: '0 0 0.85rem', fontSize: '0.86rem', color: '#334155', lineHeight: 1.5 }}>
                    {analysis.llmExplanation}
                  </p>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    {t('beforeYouSow.keyRiskFactorsTitle')}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.84rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {analysis.riskFactors.map((rf, idx) => (
                      <li key={idx}>{rf}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 2. Supply Evidence Grid (Deterministic Numbers) */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    📊 {t('beforeYouSow.localSupplyEvidenceTitle')}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {t('beforeYouSow.localSupplyEvidenceSub')}
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>
                  🔒 {t('beforeYouSow.anonymizedAggregations')}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem'
              }}>
                {/* Farmer Count */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{t('beforeYouSow.activeFarmerIntentions')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                    {analysis.farmerIntention.farmerCount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                    Avg: {analysis.farmerIntention.averageAreaHectares} ha / farmer
                  </div>
                </div>

                {/* Intended Area vs Baseline */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{t('beforeYouSow.intendedArea')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                    {analysis.supply.currentIntendedAreaHectares.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>ha</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: analysis.supply.areaChangePercent > 0 ? '#C2410C' : '#15803D', fontWeight: 700, marginTop: '0.2rem' }}>
                    {analysis.supply.areaChangePercent > 0 ? `+${analysis.supply.areaChangePercent}%` : `${analysis.supply.areaChangePercent}%`} {t('beforeYouSow.vsBaseline')} ({analysis.supply.historicalAverageAreaHectares} ha)
                  </div>
                </div>

                {/* Estimated Supply */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{t('beforeYouSow.estimatedSupply')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                    {analysis.supply.estimatedSupplyTonnes.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>tonnes</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                    {t('beforeYouSow.yieldBenchmark')}: {analysis.supply.yieldBenchmarkTonnesPerHectare} t/ha
                  </div>
                </div>

                {/* Historical Market Absorption */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{t('beforeYouSow.marketAbsorption')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                    {analysis.supply.historicalRequirementTonnes.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>tonnes</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                    {t('beforeYouSow.historicalRegionalCapacity')}
                  </div>
                </div>

                {/* Potential Surplus */}
                <div style={{
                  background: analysis.supply.surplusPercent > 10 ? '#FFF7ED' : '#F8FAFC',
                  border: `1px solid ${analysis.supply.surplusPercent > 10 ? '#FDBA74' : '#E2E8F0'}`,
                  borderRadius: '10px',
                  padding: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{t('beforeYouSow.potentialSurplus')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: analysis.supply.surplusPercent > 10 ? '#C2410C' : '#0F172A', marginTop: '0.2rem' }}>
                    +{analysis.supply.surplusPercent}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                    {analysis.supply.surplusTonnes.toLocaleString()} {t('beforeYouSow.tonnesExcess')}
                  </div>
                </div>

                {/* Supply Pressure Ratio */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{t('beforeYouSow.supplyPressureRatio')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: analysis.supply.supplyPressureRatio > 1.15 ? '#C2410C' : '#0F172A', marginTop: '0.2rem' }}>
                    {analysis.supply.supplyPressureRatio}x
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                    {t('beforeYouSow.supplyAbsorptionRatio')}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Historical Pattern & Signals */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                📈 {t('beforeYouSow.arrivalTrend')}
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748B' }}>
                {t('beforeYouSow.pageSubtitle')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {analysis.historicalPattern.historicalData.map(item => (
                  <div key={item.year} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem' }}>
                    <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.9rem' }}>{item.year} {t('beforeYouSow.season')}</div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                      Arrivals: <strong>{item.arrivalsTonnes.toLocaleString()} tonnes</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      Avg Price: <strong>₹{item.averagePricePerQtl.toLocaleString()} / qtl</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.84rem',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
                <span>
                  <strong>Historical Signal:</strong> High arrivals have historically been associated with weaker mandi prices ({analysis.historicalPattern.priceDecrementFrequencyPercent}% decrement frequency).
                </span>
              </div>
            </div>

            {/* 4. "What If?" Scenario Simulator */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    🧪 {t('beforeYouSow.whatIfTitle')}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {t('beforeYouSow.whatIfSub', { crop: analysis.crop })}
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#64748B', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                  {t('beforeYouSow.scenarioCalculationOnly')}
                </span>
              </div>

              {/* Slider Control */}
              <div style={{ margin: '1rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.35rem' }}>
                  <span>{t('beforeYouSow.simulateAdditional')}</span>
                  <span style={{ color: '#2563EB', fontSize: '0.95rem' }}>+{whatIfPercent}% {t('beforeYouSow.moreCultivation')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={whatIfPercent}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8' }}>
                  <span>{t('beforeYouSow.currentZero')}</span>
                  <span>+25%</span>
                  <span>+50%</span>
                  <span>+75%</span>
                  <span>{t('beforeYouSow.doubleCultivation')}</span>
                </div>
              </div>

              {/* Simulated Outcome */}
              {whatIfResult && (
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '0.85rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{t('beforeYouSow.simulatedArea')}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                      {whatIfResult.newIntendedAreaHectares.toLocaleString()} ha
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{t('beforeYouSow.simulatedSupply')}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                      {whatIfResult.newEstimatedSupplyTonnes.toLocaleString()} t
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{t('beforeYouSow.simulatedSurplus')}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: whatIfResult.newSurplusPercent > 20 ? '#DC2626' : '#0F172A' }}>
                      +{whatIfResult.newSurplusPercent}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{t('beforeYouSow.simulatedRiskScore')}</div>
                    <div style={{
                      fontSize: '1.15rem',
                      fontWeight: 900,
                      color: getRiskColor(whatIfResult.newRiskLevel).text
                    }}>
                      {whatIfResult.newRiskProbability}% ({whatIfResult.newRiskLevel.replace('_', ' ')})
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Recommended Safer Alternative Crops */}
            {analysis.alternativeCrops.length > 0 && (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                      🌱 {t('beforeYouSow.saferAlternativeCrops', { season: analysis.season })}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {t('beforeYouSow.alternativeCropsSub')}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, background: '#DCFCE7', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                    {t('beforeYouSow.diversificationRecommended')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  {analysis.alternativeCrops.map(alt => (
                    <div
                      key={alt.crop}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>
                            {CROP_ICONS[alt.crop] || '🌱'} {alt.crop}
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            background: getRiskColor(alt.riskLevel).bg,
                            color: getRiskColor(alt.riskLevel).text
                          }}>
                            {alt.riskLevel} ({alt.riskProbability}%)
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.4rem' }}>
                          <strong>{t('beforeYouSow.seasonSuitabilityTh')}:</strong> {alt.seasonFit}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                          {alt.reasoning}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCrop(alt.crop);
                          handleAnalyze();
                        }}
                        style={{
                          marginTop: '0.85rem',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#2563EB',
                          padding: '0.4rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {t('beforeYouSow.analyzeInstead', { crop: alt.crop })}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Crop Comparison Table (Expandable) */}
            {showComparison && (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                overflowX: 'auto'
              }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  ⚖️ {t('beforeYouSow.sideBySideComparison')}
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>{t('beforeYouSow.cropTh')}</th>
                      <th style={{ padding: '0.75rem' }}>{t('beforeYouSow.supplyPressureTh')}</th>
                      <th style={{ padding: '0.75rem' }}>{t('beforeYouSow.riskScoreTh')}</th>
                      <th style={{ padding: '0.75rem' }}>{t('beforeYouSow.seasonSuitabilityTh')}</th>
                      <th style={{ padding: '0.75rem' }}>{t('beforeYouSow.recommendationTh')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Current Crop */}
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#FEF3C7' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 800 }}>
                        {CROP_ICONS[analysis.crop] || '🌱'} {analysis.crop} {t('beforeYouSow.selectedBadge')}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: getRiskColor(analysis.risk.level).text }}>
                          {analysis.risk.level}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 800 }}>{analysis.risk.probability}%</td>
                      <td style={{ padding: '0.75rem' }}>HIGH</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{analysis.decision.replace('_', ' ')}</td>
                    </tr>
                    {/* Alternatives */}
                    {analysis.alternativeCrops.map(alt => (
                      <tr key={alt.crop} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                          {CROP_ICONS[alt.crop] || '🌱'} {alt.crop}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ fontWeight: 700, color: getRiskColor(alt.riskLevel).text }}>
                            {alt.supplyPressure}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 700 }}>{alt.riskProbability}%</td>
                        <td style={{ padding: '0.75rem' }}>{alt.seasonFit}</td>
                        <td style={{ padding: '0.75rem', color: '#16A34A', fontWeight: 600 }}>{t('beforeYouSow.saferOptionBadge')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. Nearby Mandi Conditions */}
            {analysis.nearbyMandis.length > 0 && (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  🏪 {t('beforeYouSow.nearbyMandisTitle')}
                </h3>
                <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748B' }}>
                  {t('beforeYouSow.nearbyMandisSub')}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {analysis.nearbyMandis.map(mandi => (
                    <div key={mandi.mandiName} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.88rem' }}>{mandi.mandiName}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{mandi.distanceKm} km</span>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem' }}>
                        {mandi.currentPricePerQtl ? `₹${mandi.currentPricePerQtl}/qtl` : 'N/A'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginTop: '0.25rem' }}>
                        <span>{t('beforeYouSow.trendLabel')} <strong>{mandi.priceTrend || 'STABLE'}</strong></span>
                        <span>{t('beforeYouSow.asOfLabel')} {mandi.dataFreshness}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Data Sources & Confidence Footer */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  <strong>{t('beforeYouSow.dataConfidenceLabel')}</strong> <span style={{
                    fontWeight: 800,
                    color: analysis.dataConfidence === 'HIGH' ? '#15803D' : analysis.dataConfidence === 'MEDIUM' ? '#B45309' : '#DC2626'
                  }}>{analysis.dataConfidence}</span> — {t('beforeYouSow.basedOnRecords', { farmers: analysis.farmerIntention.farmerCount, years: analysis.historicalPattern.yearsAnalyzed })}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  {t('beforeYouSow.analyzedAt')} {new Date(analysis.analysisTimestamp).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.72rem', color: '#64748B' }}>
                <span style={{ fontWeight: 600 }}>{t('beforeYouSow.sourcesLabel')}</span>
                {analysis.dataSources.map(ds => (
                  <span key={ds.name} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    ✓ {ds.name} ({ds.dataType})
                  </span>
                ))}
              </div>

              <div style={{ fontSize: '0.74rem', color: '#94A3B8', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', fontStyle: 'italic' }}>
                ⚠️ <strong>{t('common.warning')}:</strong> {t('beforeYouSow.disclaimerNotice')}
              </div>
            </div>

          </div>
        )}

      </div>
    </SihLayout>
  );
};
