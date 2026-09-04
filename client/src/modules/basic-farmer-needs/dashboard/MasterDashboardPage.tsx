import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../../core/ui';
import { useAuth } from '../../../context/AuthContext';
import { useWeatherContext } from '../../../context/WeatherContext';
import { useDataSaver } from '../../../context/DataSaverContext';
import { CentralAiApi } from '../../../services/centralAiApi';
import { roadmapApi } from '../roadmap/api';
import { CropRoadmapItem } from '../roadmap/types';
import { scannerApi } from '../scanner/services/scannerApi';
import { ScanResult } from '../scanner/types/scanner.types';
import { SchemesApi } from '../schemes/services/schemesApi';
import { Scheme } from '../schemes/types/schemes.types';
import { MarketplaceApi } from '../marketplace/services/marketplaceApi';
import { ProductListing } from '../marketplace/types/marketplace.types';

import { FEATURE_IMAGES } from '../../../constants/featureImages';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { MobileBasicFarmerHome } from '../../../components/mobile/MobileBasicFarmerHome';

export const MasterDashboardPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { weather, visual, isLoading: isWeatherLoading } = useWeatherContext();
  const { dataSaverMode } = useDataSaver();
  const navigate = useNavigate();

  if (isMobile) {
    return <MobileBasicFarmerHome />;
  }

  const isOffline = weather.source === 'OFFLINE' || Boolean(typeof navigator !== 'undefined' && !navigator.onLine);
  const isCached = weather.source === 'CACHED' || weather.source === 'OFFLINE';

  // Dashboard module states
  const [roadmap, setRoadmap] = useState<CropRoadmapItem | null>(null);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState<boolean>(true);

  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [isScanLoading, setIsScanLoading] = useState<boolean>(true);

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isSchemesLoading, setIsSchemesLoading] = useState<boolean>(true);

  const [products, setProducts] = useState<ProductListing[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);



  const [aiAdvice, setAiAdvice] = useState<string>('Analyzing local field telemetry and weather conditions...');
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

  // Quick Access Services configuration (Strict 6 daily-use services)
  const quickAccessServices = [
    {
      id: 'shayak',
      title: 'Shayak AI',
      category: 'AI ASSISTANT',
      description: 'Voice & text farming companion',
      image: FEATURE_IMAGES.krishibot.url,
      fallbackImage: FEATURE_IMAGES.krishibot.fallbackUrl,
      alt: FEATURE_IMAGES.krishibot.alt,
      path: '/krishibot',
      badge: '24/7 Voice'
    },
    {
      id: 'scanner',
      title: 'Leaf Scanner',
      category: 'VISION DIAGNOSTICS',
      description: 'Instant AI crop disease check',
      image: FEATURE_IMAGES.scanner.url,
      fallbackImage: FEATURE_IMAGES.scanner.fallbackUrl,
      alt: FEATURE_IMAGES.scanner.alt,
      path: '/scanner',
      badge: lastScan ? `${lastScan.cropName} Scanned` : 'AI Vision'
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      category: 'MANDI INPUTS',
      description: 'Seeds, fertilizers & equipment',
      image: FEATURE_IMAGES.marketplace.url,
      fallbackImage: FEATURE_IMAGES.marketplace.fallbackUrl,
      alt: FEATURE_IMAGES.marketplace.alt,
      path: '/marketplace',
      badge: 'Direct Prices'
    },
    {
      id: 'roadmap',
      title: 'Crop Roadmap',
      category: 'FIELD TRACKER',
      description: 'Stage-by-stage crop timeline',
      image: FEATURE_IMAGES.roadmap.url,
      fallbackImage: FEATURE_IMAGES.roadmap.fallbackUrl,
      alt: FEATURE_IMAGES.roadmap.alt,
      path: '/roadmap',
      badge: roadmap ? `${roadmap.crop} Stage` : 'Yield Plan'
    }
  ];

  // 1. Fetch module data gracefully on mount
  useEffect(() => {
    // Fetch Roadmap
    roadmapApi.listRoadmaps()
      .then((res: any) => {
        if (res.success && res.data && res.data.length > 0) {
          setRoadmap(res.data[0]);
        }
      })
      .catch(() => setRoadmap(null))
      .finally(() => setIsRoadmapLoading(false));

    // Fetch Scan History
    scannerApi.getHistory()
      .then((history: any) => {
        if (history && history.length > 0) {
          setLastScan(history[0]);
        }
      })
      .catch(() => setLastScan(null))
      .finally(() => setIsScanLoading(false));

    // Fetch Relevant Schemes (deterministic)
    SchemesApi.getSchemes({ state: farmerState })
      .then((res: any) => setSchemes(res.slice(0, 3)))
      .catch(() => setSchemes([]))
      .finally(() => setIsSchemesLoading(false));

    // Fetch Marketplace Products (deterministic)
    MarketplaceApi.getListings()
      .then((res: any) => setProducts(res.slice(0, 3)))
      .catch(() => setProducts([]))
      .finally(() => setIsProductsLoading(false));


  }, [farmerState]);

  // 2. Fetch AI Advisory (controlled, non-blocking)
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
      setAiAdvice(`Weather conditions are stable in ${farmerDistrict}. Continue scheduled field irrigation for ${primaryCrop}.`);
      setIsAiGenerated(false);
    }).finally(() => setIsAdviceLoading(false));
  };

  useEffect(() => {
    if (dataSaverMode) {
      setAiAdvice('Data Saver active. Tap "Generate AI Advisory" to fetch contextual daily crop guidance.');
      setIsAiGenerated(false);
      return;
    }

    if (!hasFetchedAdvice) {
      fetchAiAdvisory();
    }
  }, [dataSaverMode, primaryCrop, farmerState, farmerDistrict, landSize]);

  // Quick prompt handler for Shayak
  const handleShayakPrompt = (prompt: string) => {
    navigate(`/krishibot?initialPrompt=${encodeURIComponent(prompt)}`);
  };

  // Determine Daily Action Priorities (Deterministic based on real data)
  const priorities: { id: string; icon: string; text: string; actionText: string; actionUrl: string; tag: 'weather' | 'roadmap' | 'scheme' | 'scan' }[] = [];

  if (weather.rainfallProbability > 40 || (weather.daily?.[0]?.precipitationSum && weather.daily[0].precipitationSum > 2)) {
    priorities.push({
      id: 'p-rain',
      icon: 'cloud_sync',
      text: `Rain probability is ${weather.rainfallProbability}% today — postpone pesticide spraying & heavy irrigation.`,
      actionText: 'Check Radar',
      actionUrl: '/weather',
      tag: 'weather'
    });
  }

  if (roadmap) {
    const totalActivities = roadmap.activities?.length || 1;
    const completedCount = roadmap.completedDays?.length || 0;
    const todayIndex = Math.min(completedCount, totalActivities - 1);
    const todayTask = roadmap.activities?.[todayIndex];
    if (todayTask) {
      priorities.push({
        id: 'p-roadmap',
        icon: 'event_available',
        text: `${roadmap.crop} (${todayTask.stage}): "${todayTask.title}" scheduled for today.`,
        actionText: 'View Task',
        actionUrl: '/roadmap',
        tag: 'roadmap'
      });
    }
  }



  if (schemes.length > 0) {
    priorities.push({
      id: 'p-scheme',
      icon: 'policy',
      text: `Government Scheme available: "${schemes[0].title}" for ${farmerState} farmers.`,
      actionText: 'Apply Now',
      actionUrl: `/schemes/${schemes[0].id}`,
      tag: 'scheme'
    });
  }

  if (lastScan && lastScan.severity !== 'none') {
    priorities.push({
      id: 'p-scan',
      icon: 'biotech',
      text: `Last Scan (${lastScan.cropName}): ${lastScan.disease} detected (${lastScan.severity} risk).`,
      actionText: 'Scan History',
      actionUrl: '/scanner',
      tag: 'scan'
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* 1. TOP FARMER CONTEXT HEADER */}
      <div className="page-header-banner" style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ background: 'var(--signal-lime)', color: '#062c12', fontWeight: 800 }}>
                FARM COMMAND CENTER
              </span>
              {dataSaverMode && (
                <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>⚡ Data Saver Active</span>
              )}
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
              Namaste, {user?.fullName || 'Farmer Partner'} 👋
            </h1>

            {isProfileComplete ? (
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.85rem', marginTop: '0.25rem', margin: 0 }}>
                🌱 <strong>{primaryCrop}</strong> • 📍 {farmerDistrict}, {farmerState} • 📐 <strong>{landSize} Acres</strong>
              </p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#fef08a', fontWeight: 600 }}>
                  ⚠️ Profile incomplete: Add your crop details & land size
                </span>
                <Link to="/profile" style={{ fontSize: '0.78rem', color: '#FFFFFF', textDecoration: 'underline', fontWeight: 700 }}>
                  Complete Profile →
                </Link>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/scanner">
              <Button variant="primary" size="sm" style={{ background: '#22c55e', border: 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '4px' }}>biotech</span> Scan Leaf
              </Button>
            </Link>
            <Link to="/krishibot">
              <Button variant="outline" size="sm" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '4px' }}>smart_toy</span> Ask Shayak
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACCESS VISUAL CARDS (FARMER COMPANION SERVICES) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div className="image-section-header">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🌾</span> Farmer Companion Services
            </h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
              Quick access to daily intelligent farming tools
            </p>
          </div>
          <Link to="/schemes" style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--signal-lime)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.10)', border: '1px solid var(--border-subtle)' }}>
            Explore All <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          </Link>
        </div>


        {/* Responsive Grid: 2-column on mobile, 3-column on desktop */}
        <div className="mobile-feature-grid">
          {quickAccessServices.map((service) => (
            <Link
              key={service.id}
              to={service.path}
              className="card-feature-backed"
              style={{
                borderRadius: 'var(--radius)',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none',
                outline: 'none'
              }}
            >
              <img
                src={service.image}
                alt={service.alt}
                className="card-feature-bg"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = service.fallbackImage;
                }}
              />
              <div className="card-feature-overlay" />
              <div className="card-feature-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.15rem' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--signal-lime)', textTransform: 'uppercase', background: 'rgba(0,0,0,0.5)', padding: '0.15rem 0.4rem', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
                    {service.category}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FFFFFF', background: 'rgba(22, 163, 74, 0.85)', padding: '0.15rem 0.45rem', borderRadius: '999px' }}>
                    {service.badge}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.15rem' }}>
                  <div>
                    <h3 className="text-embossed" style={{ fontSize: '1.08rem', fontWeight: 850, margin: 0 }}>
                      {service.title}
                    </h3>
                    <p style={{ fontSize: '0.74rem', color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.85)', margin: 0, lineHeight: 1.25 }}>
                      {service.description}
                    </p>
                  </div>

                  <div className="card-feature-action" aria-label={`Open ${service.title}`}>
                    ➔
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. TODAY'S DAILY ACTION PRIORITIES & AI ADVISORY BANNER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {/* Left Column: Today's Priorities */}
        <Card title="📌 Today's Priority Action Plan" subtitle="Data-driven field tasks & weather advisories for your farm.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            {priorities.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ✅ All clear on your farm today! No emergency weather or task alerts.
              </p>
            ) : (
              priorities.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius)',
                    background: idx === 0 ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-card-hover)',
                    border: `1px solid ${idx === 0 ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-subtle)'}`,
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.text}
                    </span>
                  </div>
                  <Link to={item.actionUrl} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <Button variant="outline" size="sm" style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}>
                      {item.actionText}
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Column: Central AI Advisory */}
        <Card
          title="🧠 Agronomist Daily Advisory"
          subtitle={`Customized for ${primaryCrop} in ${farmerDistrict}`}
          action={
            dataSaverMode ? (
              <Button onClick={fetchAiAdvisory} disabled={isAdviceLoading} size="sm" variant="outline">
                {isAdviceLoading ? 'Generating...' : '⚡ Generate Advisory'}
              </Button>
            ) : (
              isAiGenerated && <Badge variant="primary">AI Generated</Badge>
            )
          }
        >
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              color: 'var(--text-main)',
              marginTop: '0.5rem',
              minHeight: '80px'
            }}
          >
            {isAdviceLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined spin">sync</span>
                <span>Fetching agronomist advisory from Central AI Gateway...</span>
              </div>
            ) : (
              aiAdvice
            )}
          </div>
        </Card>
      </div>

      {/* 3. WEATHER TELEMETRY CARD */}
      <Card
        title="🌦️ Local Weather Telemetry"
        subtitle={`Live observation for ${weather.location || farmerDistrict}`}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant={isOffline ? 'warning' : isCached ? 'secondary' : 'primary'}>
              {isOffline ? 'OFFLINE' : isCached ? 'CACHED' : 'LIVE'}
            </Badge>
            <Link to="/weather" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
              Full Radar →
            </Link>
          </div>
        }
      >
        {isWeatherLoading ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading live weather telemetry...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
            {/* Visual Weather Header */}
            <div
              className="card-feature-backed"
              style={{
                minHeight: '100px',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                position: 'relative'
              }}
            >
              <img src={visual.url} alt={visual.label} className="card-feature-bg" style={{ filter: 'brightness(0.95)' }} />
              <div className="card-feature-overlay" style={{ background: visual.overlayGradient }} />
              <div className="card-feature-content" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{visual.icon}</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                      {weather.temperatureCelsius}°C
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.95)', marginTop: '0.2rem', fontWeight: 600 }}>
                    {weather.condition} • Humidity: {weather.humidityPercent}%
                  </p>
                </div>
                <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.78rem', opacity: 0.9, display: 'block' }}>Rain Chance</span>
                  <strong style={{ fontSize: '1.2rem', color: '#38bdf8' }}>☔ {weather.rainfallProbability}%</strong>
                </div>
              </div>
            </div>

            {/* Weather Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>WIND SPEED</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>💨 {weather.windSpeedKmh} km/h</strong>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>HUMIDITY</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>💧 {weather.humidityPercent}%</strong>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>EXPECTED RAIN</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>🌧️ {weather.daily?.[0]?.precipitationSum || 0} mm</strong>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>LAST UPDATED</span>
                <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>🕒 {new Date(weather.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 4. TWO-COLUMN CORE MODULES (ROADMAP & SCANNER) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        
        {/* ROADMAP STATUS */}
        <Card
          title="📅 Active Crop Roadmap"
          subtitle={roadmap ? `${roadmap.crop} Lifecycle Tracker` : 'Plan your seasonal crop tasks'}
          action={
            <Link to="/roadmap">
              <Button size="sm" variant={roadmap ? 'outline' : 'primary'}>
                {roadmap ? 'Open Roadmap →' : '+ Create Roadmap'}
              </Button>
            </Link>
          }
        >
          {isRoadmapLoading ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Checking crop roadmap...</p>
          ) : roadmap ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {roadmap.crop}
                </span>
                <Badge variant="primary">
                  Stage: {roadmap.activities?.[Math.min((roadmap.completedDays?.length || 0), (roadmap.activities?.length || 1) - 1)]?.stage || 'Sowing'}
                </Badge>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  <span>Progress</span>
                  <span>{Math.round(((roadmap.completedDays?.length || 0) / (roadmap.activities?.length || 1)) * 100)}%</span>
                </div>
                <div style={{ height: '6px', width: '100%', background: 'var(--bg-card-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round(((roadmap.completedDays?.length || 0) / (roadmap.activities?.length || 1)) * 100)}%`,
                      background: 'var(--primary)'
                    }}
                  />
                </div>
              </div>

              <div style={{ background: 'var(--bg-card-hover)', padding: '0.65rem', borderRadius: '6px', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  TODAY'S SCHEDULED TASK
                </span>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.15rem', margin: 0 }}>
                  {roadmap.activities?.[Math.min((roadmap.completedDays?.length || 0), (roadmap.activities?.length || 1) - 1)]?.title || 'Inspect field for moisture'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-card-hover)', borderRadius: '6px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                No active roadmap found for {primaryCrop}. Create a stage-by-stage guide to boost yield.
              </p>
              <Link to="/roadmap">
                <Button size="sm" variant="primary">Create Crop Roadmap</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* SCANNER RECENT DIAGNOSIS */}
        <Card
          title="🔬 Recent Leaf Scan Diagnosis"
          subtitle="AI vision health audit history"
          action={
            <Link to="/scanner">
              <Button size="sm" variant="outline">
                {lastScan ? 'Scan History →' : 'Scan Leaf'}
              </Button>
            </Link>
          }
        >
          {isScanLoading ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading scan history...</p>
          ) : lastScan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {lastScan.cropName} Sample
                </span>
                <Badge variant={lastScan.severity === 'none' ? 'primary' : 'warning'}>
                  {lastScan.severity === 'none' ? 'Healthy' : `${lastScan.severity.toUpperCase()} RISK`}
                </Badge>
              </div>

              <div style={{ background: 'var(--bg-card-hover)', padding: '0.65rem', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {lastScan.disease}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 }}>
                  Confidence: {Math.round(lastScan.confidence * 100)}% • Scanned: {new Date(lastScan.scannedAt).toLocaleDateString()}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/scanner" style={{ flex: 1 }}>
                  <Button size="sm" variant="primary" style={{ width: '100%', fontSize: '0.78rem' }}>
                    📷 New Leaf Scan
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-card-hover)', borderRadius: '6px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                No crop leaf scans performed yet. Take a picture of your crop leaf for instant diagnosis.
              </p>
              <Link to="/scanner">
                <Button size="sm" variant="primary">Scan a Crop</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* 5. GOVERNMENT SCHEMES & MARKETPLACE SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        
        {/* SCHEMES */}
        <Card
          title="🏛️ Govt Subsidies & Schemes"
          subtitle={`Filtered for ${farmerState} farmers`}
          action={
            <Link to="/schemes" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
              View All Schemes →
            </Link>
          }
        >
          {isSchemesLoading ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Filtering relevant schemes...</p>
          ) : schemes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              {schemes.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--bg-card-hover)', borderRadius: '6px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{s.title}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.department || s.category} • {s.state}</span>
                  </div>
                  <Link to={`/schemes/${s.id}`}>
                    <Button size="sm" variant="outline" style={{ fontSize: '0.72rem', padding: '0.15rem 0.4rem' }}>Details</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No state schemes found.</p>
          )}
        </Card>

        {/* MARKETPLACE PREVIEW */}
        <Card
          title="🛒 Farm Inputs Marketplace"
          subtitle="Top rated seeds, fertilizers & machinery"
          action={
            <Link to="/marketplace" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
              Open Marketplace →
            </Link>
          }
        >
          {isProductsLoading ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading marketplace products...</p>
          ) : products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '0.25rem' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-card-hover)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                  <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.3rem' }} />
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginTop: '0.1rem' }}>₹{p.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No products listed.</p>
          )}
        </Card>
      </div>

      {/* 6. SHAYAK QUICK ASSISTANT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>

        {/* SHAYAK QUICK ASSISTANT PROMPTS */}
        <Card
          title="🤖 Ask Shayak AI Assistant"
          subtitle="Tap a quick question to open instant voice & text assistant"
          action={
            <Link to="/krishibot" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
              Open Shayak Chat →
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.25rem' }}>
            {[
              "What farming activities should I do on my field today?",
              `Is heavy rain expected in ${farmerDistrict} this week?`,
              "Which government fertilizer subsidy am I eligible for?",
              "Are there any bulk seed group buy deals near me?"
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleShayakPrompt(prompt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>chat_bubble_outline</span>
                <span>"{prompt}"</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
};
