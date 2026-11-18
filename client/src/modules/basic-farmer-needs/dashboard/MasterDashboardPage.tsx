import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../../core/ui';
import { useAuth } from '../../../context/AuthContext';
import { useDataSaver } from '../../../context/DataSaverContext';
import { useLanguage } from '../../../context/LanguageContext';
import { CentralAiApi } from '../../../services/centralAiApi';
import { roadmapApi } from '../roadmap/api';
import { CropRoadmapItem } from '../roadmap/types';
import { scannerApi } from '../scanner/services/scannerApi';
import { ScanResult } from '../scanner/types/scanner.types';
import { SchemesApi } from '../schemes/services/schemesApi';
import { Scheme } from '../schemes/types/schemes.types';
import { MarketplaceApi } from '../marketplace/services/marketplaceApi';
import { ProductListing } from '../marketplace/types/marketplace.types';

import { useIsMobile } from '../../../hooks/useIsMobile';
import { MobileBasicFarmerHome } from '../../../components/mobile/MobileBasicFarmerHome';

export const MasterDashboardPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { dataSaverMode } = useDataSaver();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isMobile) {
    return <MobileBasicFarmerHome />;
  }

  // Dashboard module states
  const [roadmap, setRoadmap] = useState<CropRoadmapItem | null>(null);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState<boolean>(true);

  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [isScanLoading, setIsScanLoading] = useState<boolean>(true);

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isSchemesLoading, setIsSchemesLoading] = useState<boolean>(true);

  const [products, setProducts] = useState<ProductListing[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);

  const [aiAdvice, setAiAdvice] = useState<string>(t('dashboard.analyzingTelemetry'));
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState<boolean>(false);
  const [hasFetchedAdvice, setHasFetchedAdvice] = useState<boolean>(false);

  // Profile check
  const isProfileComplete = Boolean(
    user?.fullName &&
    user?.state &&
    user?.district &&
    user?.landSizeAcres &&
    user?.primaryCrops &&
    user.primaryCrops.length > 0
  );

  const primaryCrop = user?.primaryCrops?.[0] || 'Wheat';
  const farmerState = user?.state || 'Punjab';
  const farmerDistrict = user?.district || 'Ludhiana';
  const landSize = user?.landSizeAcres || 5.0;

  // Fetch module data gracefully on mount
  useEffect(() => {
    let isMounted = true;

    roadmapApi.listRoadmaps()
      .then((res: any) => {
        if (isMounted && res.success && res.data && res.data.length > 0) {
          setRoadmap(res.data[0]);
        }
      })
      .catch(() => { if (isMounted) setRoadmap(null); })
      .finally(() => { if (isMounted) setIsRoadmapLoading(false); });

    scannerApi.getHistory()
      .then((history: any) => {
        if (isMounted && history && history.length > 0) {
          setLastScan(history[0]);
        }
      })
      .catch(() => { if (isMounted) setLastScan(null); })
      .finally(() => { if (isMounted) setIsScanLoading(false); });

    SchemesApi.getSchemes({ state: farmerState })
      .then((res: any) => { if (isMounted) setSchemes(res.slice(0, 3)); })
      .catch(() => { if (isMounted) setSchemes([]); })
      .finally(() => { if (isMounted) setIsSchemesLoading(false); });

    MarketplaceApi.getListings()
      .then((res: any) => { if (isMounted) setProducts(res.slice(0, 3)); })
      .catch(() => { if (isMounted) setProducts([]); })
      .finally(() => { if (isMounted) setIsProductsLoading(false); });

    return () => { isMounted = false; };
  }, [farmerState]);

  // Fetch AI Advisory
  const fetchAiAdvisory = () => {
    setIsAdviceLoading(true);
    CentralAiApi.getFarmAdvice({
      crop: primaryCrop,
      state: farmerState,
      location: `${farmerDistrict}, ${farmerState}`,
      landSize: landSize
    }).then((res: any) => {
      setAiAdvice(res.advice);
      setIsAiGenerated(res.isAiGenerated);
      setHasFetchedAdvice(true);
    }).catch(() => {
      setAiAdvice(t('dashboard.fallbackAdvice', { district: farmerDistrict, crop: primaryCrop }));
      setIsAiGenerated(false);
    }).finally(() => setIsAdviceLoading(false));
  };

  useEffect(() => {
    if (dataSaverMode) {
      setAiAdvice(t('dashboard.dataSaverAdviceMsg'));
      setIsAiGenerated(false);
      return;
    }

    if (!hasFetchedAdvice) {
      fetchAiAdvisory();
    }
  }, [dataSaverMode, primaryCrop, farmerState, farmerDistrict, landSize]);

  // Quick prompt handler for Shayak
  const handleShayakPrompt = (prompt: string) => {
    navigate(`/sih/sahayak?initialPrompt=${encodeURIComponent(prompt)}`);
  };

  // Daily Action Priorities
  const priorities: { id: string; icon: string; text: string; actionText: string; actionUrl: string }[] = [];

  priorities.push({
    id: 'p-climate',
    icon: 'partly_cloudy_day',
    text: t('dashboard.priorityClimateText', { district: farmerDistrict }),
    actionText: t('dashboard.actionClimatePlanner'),
    actionUrl: '/sih/climate-risk'
  });

  if (roadmap) {
    const totalActivities = roadmap.activities?.length || 1;
    const completedCount = roadmap.completedDays?.length || 0;
    const todayIndex = Math.min(completedCount, totalActivities - 1);
    const todayTask = roadmap.activities?.[todayIndex];
    if (todayTask) {
      priorities.push({
        id: 'p-roadmap',
        icon: 'event_available',
        text: t('dashboard.priorityRoadmapText', { crop: roadmap.crop, stage: todayTask.stage, title: todayTask.title }),
        actionText: t('dashboard.actionViewTask'),
        actionUrl: '/crop-roadmap'
      });
    }
  }

  if (schemes.length > 0) {
    priorities.push({
      id: 'p-scheme',
      icon: 'policy',
      text: t('dashboard.prioritySchemeText', { title: schemes[0].title, state: farmerState }),
      actionText: t('dashboard.actionApplyNow'),
      actionUrl: `/schemes/${schemes[0].id}`
    });
  }

  if (lastScan && lastScan.severity !== 'none') {
    priorities.push({
      id: 'p-scan',
      icon: 'biotech',
      text: t('dashboard.priorityScanText', { crop: lastScan.cropName, disease: lastScan.disease, severity: lastScan.severity }),
      actionText: t('dashboard.actionScanHistory'),
      actionUrl: '/scanner'
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
      
      {/* ── 1. INSTITUTIONAL FARMER WORKSPACE BANNER ─────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #DCE2E8',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#12345A' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ background: '#12345A', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                Farmer Operating Workspace
              </span>
              <span style={{ background: '#E8F5E9', color: '#168447', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(22, 132, 71, 0.2)' }}>
                Integrated Public Record
              </span>
              {dataSaverMode && (
                <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  ⚡ Data Saver Active
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#12345A', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
              {t('moduleHome.welcomeFarmer', { name: user?.fullName || 'Registered Farmer' })}
            </h1>

            {isProfileComplete ? (
              <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
                Cultivating <strong>{primaryCrop}</strong> • Jurisdiction: <strong>{farmerDistrict}, {farmerState}</strong> • Holding: <strong>{landSize} Acres</strong>
              </p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#B45309', fontWeight: 600 }}>
                  Profile details pending verification.
                </span>
                <Link to="/profile" style={{ fontSize: '0.78rem', color: '#12345A', textDecoration: 'underline', fontWeight: 700 }}>
                  Complete Farmer Profile
                </Link>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/scanner" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: '#168447',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.55rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>biotech</span>
                <span>AI Leaf Scanner</span>
              </button>
            </Link>

            <Link to="/sih/sahayak" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: '#FFFFFF',
                  color: '#12345A',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.55rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#12345A' }}>chat</span>
                <span>Consult Sahayak AI</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. ESSENTIAL FARMER SERVICE SHORTCUTS (Government Service Panels) ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
            Everyday Farm Operations & Diagnostics
          </h2>
          <Link to="/schemes" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#12345A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span>Explore All Schemes</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {[
            {
              title: 'AI Leaf Health Scanner',
              category: 'Crop Pathology Diagnostic',
              desc: 'Instant visual leaf disease classification with organic treatment regimens.',
              icon: 'biotech',
              path: '/scanner',
              status: lastScan ? `Last Scan: ${lastScan.cropName}` : 'Camera Ready'
            },
            {
              title: 'Crop Growth Roadmap',
              category: 'Field Schedule Tracker',
              desc: 'Stage-by-stage crop monitoring from sowing to post-harvest storage.',
              icon: 'route',
              path: '/crop-roadmap',
              status: roadmap ? `${roadmap.crop} Stage Active` : 'Schedule Available'
            },
            {
              title: 'Smart Mandi & Logistics',
              category: 'Market Intelligence',
              desc: 'Check live modal prices across regional mandis and pool transportation.',
              icon: 'bar_chart',
              path: '/sih/smart-mandi',
              status: 'APMC Rates Live'
            },
            {
              title: 'Sahayak AI Assistant',
              category: 'Citizen Virtual Advisory',
              desc: '24/7 AI conversational guidance in Hindi, Bengali, and English.',
              icon: 'chat',
              path: '/sih/sahayak',
              status: 'Voice & WhatsApp Ready'
            }
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              style={{
                background: '#FFFFFF',
                border: '1px solid #DCE2E8',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: '#F1F5F9', color: '#12345A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{item.icon}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#168447', background: '#E8F5E9', padding: '0.15rem 0.45rem', borderRadius: '3px' }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.category}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#12345A', margin: '0.2rem 0 0.4rem 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#12345A' }}>
                <span>Access Service</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 3. TODAY'S DAILY PRIORITIES & AGRONOMIST ADVISORY ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Left: Operational Priority Checklist */}
        <div style={{ background: '#FFFFFF', border: '1px solid #DCE2E8', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#E99A32' }}>checklist</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
              {t('moduleHome.todayPriorities') || "Today's Action Priorities"}
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 1rem 0' }}>
            Verified operational recommendations for your specific field and district.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {priorities.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: idx === 0 ? '#EBF3FB' : '#F8FAFC',
                  border: `1px solid ${idx === 0 ? '#BFDBFE' : '#E2E8F0'}`,
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="material-symbols-outlined" style={{ color: '#12345A', fontSize: '18px' }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#172B45', lineHeight: 1.3 }}>
                    {item.text}
                  </span>
                </div>
                <Link to={item.actionUrl} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <button
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#12345A',
                      cursor: 'pointer'
                    }}
                  >
                    {item.actionText}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Central Agronomist AI Advisory */}
        <div style={{ background: '#FFFFFF', border: '1px solid #DCE2E8', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#168447' }}>psychology</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
                Agronomist Advisory Dispatch
              </h3>
            </div>
            {isAiGenerated && (
              <span style={{ background: '#E8F5E9', color: '#168447', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(22, 132, 71, 0.2)' }}>
                Automated Synthesis
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 1rem 0' }}>
            Calibrated for {primaryCrop} cultivation in {farmerDistrict}, {farmerState}.
          </p>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: '#334155',
              flex: 1
            }}
          >
            {isAdviceLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B' }}>
                <span className="material-symbols-outlined spin">sync</span>
                <span>Synthesizing agricultural guidance from meteorological and soil telemetry...</span>
              </div>
            ) : (
              aiAdvice
            )}
          </div>

          <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={fetchAiAdvisory}
              disabled={isAdviceLoading}
              style={{
                background: '#F1F5F9',
                color: '#12345A',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Refresh Agronomist Advisory
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. TWO-COLUMN OPERATIONAL SUMMARY: ROADMAP & DISEASE AUDIT ─────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Roadmap Progress Panel */}
        <div style={{ background: '#FFFFFF', border: '1px solid #DCE2E8', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
              {t('moduleHome.activeRoadmap') || "Active Crop Roadmap"}
            </h3>
            <Link to="/crop-roadmap">
              <button style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, color: '#12345A', cursor: 'pointer' }}>
                {roadmap ? 'View Full Plan' : 'Create Plan'}
              </button>
            </Link>
          </div>

          {isRoadmapLoading ? (
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Retrieving roadmap schedule...</p>
          ) : roadmap ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#12345A' }}>
                  {roadmap.crop} Cultivation Schedule
                </span>
                <span style={{ background: '#E8F5E9', color: '#168447', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  Active Lifecycle
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginBottom: '0.25rem' }}>
                  <span>Completion Rate</span>
                  <span>{Math.round(((roadmap.completedDays?.length || 0) / (roadmap.activities?.length || 1)) * 100)}%</span>
                </div>
                <div style={{ height: '6px', width: '100%', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round(((roadmap.completedDays?.length || 0) / (roadmap.activities?.length || 1)) * 100)}%`,
                      background: '#168447'
                    }}
                  />
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.68rem', color: '#168447', fontWeight: 800, textTransform: 'uppercase' }}>
                  Scheduled Activity Today
                </span>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#172B45', marginTop: '0.2rem', margin: 0 }}>
                  {roadmap.activities?.[Math.min((roadmap.completedDays?.length || 0), (roadmap.activities?.length || 1) - 1)]?.title || 'Inspect field for moisture'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 0.65rem 0' }}>
                No active cultivation schedule mapped for {primaryCrop}.
              </p>
              <Link to="/crop-roadmap">
                <button style={{ background: '#12345A', color: '#FFFFFF', border: 'none', borderRadius: '4px', padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                  Initialize Crop Roadmap
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Disease Audit Panel */}
        <div style={{ background: '#FFFFFF', border: '1px solid #DCE2E8', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
              Recent Diagnostic Leaf Scan
            </h3>
            <Link to="/scanner">
              <button style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, color: '#12345A', cursor: 'pointer' }}>
                {lastScan ? 'Scan History' : 'New Scan'}
              </button>
            </Link>
          </div>

          {isScanLoading ? (
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Loading diagnostic records...</p>
          ) : lastScan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#172B45' }}>
                  {lastScan.cropName} Leaf Sample
                </span>
                <span style={{
                  background: lastScan.severity === 'none' ? '#E8F5E9' : '#FEF3C7',
                  color: lastScan.severity === 'none' ? '#168447' : '#B45309',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {lastScan.severity === 'none' ? 'Healthy Foliage' : `Risk: ${lastScan.severity.toUpperCase()}`}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#12345A' }}>
                  {lastScan.disease}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Confidence: {Math.round(lastScan.confidence * 100)}% • Audited on {new Date(lastScan.scannedAt).toLocaleDateString()}
                </div>
              </div>

              <Link to="/scanner" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', background: '#168447', color: '#FFFFFF', border: 'none', borderRadius: '4px', padding: '0.5rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                  Perform New Diagnostic Leaf Scan
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 0.65rem 0' }}>
                No recent leaf scans recorded in your logbook.
              </p>
              <Link to="/scanner">
                <button style={{ background: '#168447', color: '#FFFFFF', border: 'none', borderRadius: '4px', padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                  Scan Leaf Now
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. APPLICABLE GOVERNMENT SCHEMES DIRECTORY ─────────────────────── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #DCE2E8', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
              Relevant Central & State Agricultural Schemes
            </h3>
            <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
              Subsidies, credit facilitation, and insurance policies matching {farmerState} farmers.
            </p>
          </div>
          <Link to="/schemes" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#12345A', textDecoration: 'none' }}>
            View All ({schemes.length}) →
          </Link>
        </div>

        {isSchemesLoading ? (
          <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Filtering schemes by state jurisdiction...</p>
        ) : schemes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {schemes.map(s => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: '#F8FAFC',
                  borderRadius: '4px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#172B45', margin: 0 }}>
                    {s.title}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    {s.department || s.category} • Jurisdiction: {s.state}
                  </span>
                </div>
                <Link to={`/schemes/${s.id}`}>
                  <button
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#12345A',
                      cursor: 'pointer'
                    }}
                  >
                    View Guidelines
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.8rem', color: '#64748B' }}>No schemes currently listed for your region.</p>
        )}
      </div>

      {/* ── 6. CITIZEN ADVISORY PROMPT HELPDESK ───────────────────────────── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #DCE2E8', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
              Sahayak Virtual Helpdesk — Frequent Inquiries
            </h3>
            <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
              Click any question to open conversational voice or text guidance.
            </p>
          </div>
          <Link to="/sih/sahayak" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#12345A', textDecoration: 'none' }}>
            Launch Helpdesk →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
          {[
            'What is the modal mandi price for Paddy in my district today?',
            'How do I file a satellite-backed PM Fasal Bima insurance claim?',
            'What organic fungicide is recommended for leaf rust in Wheat?',
            'How do I create or join a group transport pool for my village?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleShayakPrompt(prompt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                color: '#172B45',
                fontSize: '0.78rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#12345A' }}>help_outline</span>
              <span>"{prompt}"</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
