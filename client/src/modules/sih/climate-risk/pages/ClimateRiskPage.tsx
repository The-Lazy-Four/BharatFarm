import React, { useState, useEffect } from 'react';
import { SihLayout } from '../../shared/SihLayout';
import { ClimateRiskService } from '../climateRisk.service';
import {
  WeatherData,
  FloodRiskAssessment,
  ClimateAssessmentResult,
  AssessmentHistoryItem,
  FoodSecuritySnapshot,
  DistrictRiskItem,
  ScenarioSimulationResult,
  AiInsightResult
} from '../types';

// Subcomponents
import { TopSelectorHeader } from '../components/TopSelectorHeader';
import { RiskSummaryCards } from '../components/RiskSummaryCards';
import { WhatToDoNowHero } from '../components/WhatToDoNowHero';
import { BestWorkWindowSection } from '../components/BestWorkWindowSection';
import { CurrentWeatherSection } from '../components/CurrentWeatherSection';
import { SevenDayForecastSection } from '../components/SevenDayForecastSection';
import { RainfallAnalysisSection } from '../components/RainfallAnalysisSection';
import { FloodRiskSection } from '../components/FloodRiskSection';
import { CropRiskSection } from '../components/CropRiskSection';
import { HarvestDecisionSection } from '../components/HarvestDecisionSection';
import { FieldOperationsTable } from '../components/FieldOperationsTable';
import { PostHarvestSection } from '../components/PostHarvestSection';
import { ClimateAlertsSection } from '../components/ClimateAlertsSection';
import { LocationRiskViewSection } from '../components/LocationRiskViewSection';
import { FarmerActionTimelineSection } from '../components/FarmerActionTimelineSection';
import { HistoricalRiskSection } from '../components/HistoricalRiskSection';
import { FoodSecurityDashboard } from '../components/FoodSecurityDashboard';

export const ClimateRiskPage: React.FC = () => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'farmer' | 'government'>('farmer');

  // Location and coordinate state (default: Haldia, West Bengal)
  const [location, setLocation] = useState<string>('Haldia, West Bengal');
  const [latitude, setLatitude] = useState<number>(22.0667);
  const [longitude, setLongitude] = useState<number>(88.0667);

  // Crop & Stage state
  const [crop, setCrop] = useState<string>('Paddy');
  const [cropStage, setCropStage] = useState<string>('Flowering');

  // Loading & data state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [floodData, setFloodData] = useState<FloodRiskAssessment | null>(null);
  const [assessmentData, setAssessmentData] = useState<ClimateAssessmentResult | null>(null);
  const [aiInsight, setAiInsight] = useState<AiInsightResult | null>(null);

  // Government data state
  const [foodSnapshot, setFoodSnapshot] = useState<FoodSecuritySnapshot | null>(null);
  const [districtRisks, setDistrictRisks] = useState<DistrictRiskItem[]>([]);
  const [historyLogs, setHistoryLogs] = useState<AssessmentHistoryItem[]>([]);

  // Main loader: resolves coordinates and fetches all dependent data
  const loadAllData = async (loc: string, c: string, st: string, lat?: number, lon?: number) => {
    setIsLoading(true);
    try {
      const { weather, flood, assessment } = await ClimateRiskService.fetchFullAssessment(loc, c, st, lat, lon);
      setWeatherData(weather);
      setFloodData(flood);
      setAssessmentData(assessment);

      // Fetch AI insight using real data
      const insight = await ClimateRiskService.fetchAiInsight({
        location: loc,
        crop: c,
        cropStage: st,
        overallRiskScore: assessment.overallRiskScore,
        floodScore: flood.floodScore,
        cropRiskScore: assessment.cropRisk.cropRiskScore,
        harvestCode: assessment.harvestAdvisory.actionCode,
        rainfallMm: assessment.rainfallAnalysis.total7DayMm,
        mainThreat: flood.reasons[0] || 'Rainfall'
      });
      setAiInsight(insight);

      // Food security and history data
      const foodSnap = await ClimateRiskService.fetchFoodSecurityOverview('West Bengal', c);
      setFoodSnapshot(foodSnap);

      const districts = await ClimateRiskService.fetchDistrictRisks('West Bengal');
      setDistrictRisks(districts);

      const history = await ClimateRiskService.fetchHistory();
      setHistoryLogs(history);
    } catch (err) {
      console.error('Failed to load climate telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Auto-select and fetch Haldia on first load
  useEffect(() => {
    loadAllData(location, crop, cropStage, latitude, longitude);
  }, []);

  // Handle location selection from geocoding autocomplete
  const handleLocationSelect = (locObj: { displayName: string; lat: number; lon: number }) => {
    setLocation(locObj.displayName);
    setLatitude(locObj.lat);
    setLongitude(locObj.lon);
    loadAllData(locObj.displayName, crop, cropStage, locObj.lat, locObj.lon);
  };

  // Handle crop change
  const handleCropChange = (newCrop: string) => {
    setCrop(newCrop);
    loadAllData(location, newCrop, cropStage, latitude, longitude);
  };

  // Handle crop stage change
  const handleStageChange = (newStage: string) => {
    setCropStage(newStage);
    loadAllData(location, crop, newStage, latitude, longitude);
  };

  // Manual refresh button
  const handleRefresh = () => {
    loadAllData(location, crop, cropStage, latitude, longitude);
  };

  const handleSimulateScenario = async (lossPct: number): Promise<ScenarioSimulationResult> => {
    return await ClimateRiskService.runScenarioSimulation(lossPct, 'West Bengal', crop);
  };

  return (
    <SihLayout activeModuleId="climate-risk" moduleTitle="Climate Risk Planner" moduleIcon="partly_cloudy_day">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingBottom: '2.5rem'
      }}>

        {/* 1. COMPACT TOP SELECTOR & HEADER */}
        <TopSelectorHeader
          selectedLocation={location}
          selectedCrop={crop}
          selectedStage={cropStage}
          onLocationSelect={handleLocationSelect}
          onCropChange={handleCropChange}
          onStageChange={handleStageChange}
          onRefresh={handleRefresh}
          isAnalyzing={isLoading}
          dataSource={weatherData?.source || 'LIVE_OPEN_METEO'}
        />

        {/* 2. COMPACT TAB SWITCHER */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          background: '#e2e8f0',
          padding: '0.25rem',
          borderRadius: '8px',
          width: 'fit-content'
        }}>
          <button
            onClick={() => setActiveTab('farmer')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'farmer' ? '#ffffff' : 'transparent',
              color: activeTab === 'farmer' ? '#0f172a' : '#64748b',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'farmer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            👨‍🌾 Farmer Decision Hub
          </button>

          <button
            onClick={() => setActiveTab('government')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'government' ? '#0f172a' : 'transparent',
              color: activeTab === 'government' ? '#ffffff' : '#64748b',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'government' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            🏛️ Govt Food Security Tab
          </button>
        </div>

        {/* LOADING INDICATOR */}
        {isLoading && !assessmentData ? (
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Fetching real-time weather & calculating agricultural risk...
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>
              Resolving coordinates for {location} • Querying Open-Meteo
            </div>
          </div>
        ) : activeTab === 'farmer' ? (
          /* ============================================================ */
          /* FARMER DECISION DASHBOARD (STRICT DECISION-FIRST ORDER)       */
          /* ============================================================ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* 1. RISK SUMMARY (4-CARD COMPACT STRIP) */}
            {assessmentData && <RiskSummaryCards assessment={assessmentData} />}

            {/* 2. WHAT TO DO NOW (HERO ACTION PANEL) */}
            <WhatToDoNowHero
              insight={aiInsight}
              dominantThreat={floodData?.reasons[0] || 'Heavy rainfall'}
            />

            {/* 3. BEST WORK WINDOW */}
            {weatherData && <BestWorkWindowSection hourly={weatherData.hourly} />}

            {/* 4. CURRENT WEATHER + 7-DAY FORECAST (2-COLUMN GRID) */}
            {weatherData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                <CurrentWeatherSection weather={weatherData} />
                <SevenDayForecastSection daily={weatherData.daily} />
              </div>
            )}

            {/* 5. RAINFALL + FLOOD RISK (2-COLUMN GRID) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
              {assessmentData && <RainfallAnalysisSection rainfall={assessmentData.rainfallAnalysis} />}
              {floodData && <FloodRiskSection flood={floodData} />}
            </div>

            {/* 6. HARVEST DECISION + FIELD OPERATIONS (2-COLUMN GRID) */}
            {assessmentData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                <HarvestDecisionSection
                  harvestAdvisory={assessmentData.harvestAdvisory}
                  cropRisk={assessmentData.cropRisk}
                />
                <FieldOperationsTable advisories={assessmentData.operationalAdvisories} />
              </div>
            )}

            {/* 7. CROP RISK + POST-HARVEST (2-COLUMN GRID) */}
            {assessmentData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                <CropRiskSection cropRisk={assessmentData.cropRisk} />
                <PostHarvestSection
                  procurement={assessmentData.procurementAdvisory}
                  storage={assessmentData.storageAdvisory}
                />
              </div>
            )}

            {/* 8. ALERTS + FIELD LOCATION (2-COLUMN GRID) */}
            {assessmentData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                <ClimateAlertsSection alerts={assessmentData.alerts} />
                <LocationRiskViewSection
                  location={location}
                  latitude={latitude}
                  longitude={longitude}
                  assessment={assessmentData}
                />
              </div>
            )}

            {/* 9. FARMER ACTION TIMELINE */}
            {assessmentData && (
              <FarmerActionTimelineSection plan={assessmentData.farmerActionPlan} />
            )}

            {/* 10. HISTORICAL LOG (COMPACT COLLAPSIBLE) */}
            <HistoricalRiskSection history={historyLogs} />

          </div>
        ) : (
          /* ============================================================ */
          /* GOVERNMENT FOOD SECURITY & TRADE ADVISORY                   */
          /* ============================================================ */
          foodSnapshot && (
            <FoodSecurityDashboard
              snapshot={foodSnapshot}
              districts={districtRisks}
              onSimulateScenario={handleSimulateScenario}
            />
          )
        )}

      </div>
    </SihLayout>
  );
};
