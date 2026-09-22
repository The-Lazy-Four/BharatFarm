import React, { useState, useEffect, useRef } from 'react';
import { SihLayout } from '../../shared/SihLayout';
import { useLanguage } from '../../../../context/LanguageContext';
import { ClimateRiskService } from '../climateRisk.service';
import {
  WeatherData,
  FloodRiskAssessment,
  ClimateAssessmentResult,
  AssessmentHistoryItem,
  FoodSecuritySnapshot,
  DistrictRiskItem,
  ScenarioSimulationResult,
  GeminiDecisionPlan,
  WhatChangedDiff
} from '../types';

// Subcomponents
import { TopSelectorHeader } from '../components/TopSelectorHeader';
import { FarmerActionPage } from '../components/FarmerActionPage';
import { FoodSecurityDashboard } from '../components/FoodSecurityDashboard';
import { HistoricalRiskSection } from '../components/HistoricalRiskSection';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import { MobileClimateRiskView } from '../components/MobileClimateRiskView';

const STORAGE_KEY_ACTIONS = 'bharatfarm_farmer_action_statuses';

export const ClimateRiskPage: React.FC = () => {
  const { language, t } = useLanguage();
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'farmer' | 'government'>('farmer');

  // Location and coordinate state (default: Haldia, West Bengal)
  const [location, setLocation] = useState<string>('Haldia, West Bengal');
  const [latitude, setLatitude] = useState<number>(22.0667);
  const [longitude, setLongitude] = useState<number>(88.0667);

  // Crop & Stage state
  const [crop, setCrop] = useState<string>('Paddy');
  const [cropStage, setCropStage] = useState<string>('Flowering');

  // Live Gemini Decision Plan state
  const [decisionPlan, setDecisionPlan] = useState<GeminiDecisionPlan | null>(null);
  const previousPlanRef = useRef<GeminiDecisionPlan | null>(null);
  const [whatChanged, setWhatChanged] = useState<WhatChangedDiff | null>(null);

  // Loading & data state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [floodData, setFloodData] = useState<FloodRiskAssessment | null>(null);
  const [assessmentData, setAssessmentData] = useState<ClimateAssessmentResult | null>(null);

  // Action status state (persisted to localStorage)
  const [actionStatuses, setActionStatuses] = useState<Record<string, 'not_started' | 'in_progress' | 'done'>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIONS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Collapsible past history state
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Government data state
  const [foodSnapshot, setFoodSnapshot] = useState<FoodSecuritySnapshot | null>(null);
  const [districtRisks, setDistrictRisks] = useState<DistrictRiskItem[]>([]);
  const [historyLogs, setHistoryLogs] = useState<AssessmentHistoryItem[]>([]);

  // Update action status and persist
  const handleUpdateActionStatus = (actionId: string, status: 'not_started' | 'in_progress' | 'done') => {
    setActionStatuses((prev) => {
      const next = { ...prev, [actionId]: status };
      try {
        localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save action status to localStorage:', err);
      }
      return next;
    });

    if (status === 'done') {
      setWhatChanged({
        changed: true,
        completedDiff: { actionTitle: actionId }
      });
    }
  };

  // Main loader: resolves coordinates and fetches all dependent data
  const loadAllData = async (
    loc: string,
    c: string,
    st: string,
    lat?: number,
    lon?: number,
    currentCompletedActions?: string[],
    currentLang?: string
  ) => {
    setIsLoading(true);
    try {
      // Determine completed actions
      const completedList = currentCompletedActions || Object.entries(actionStatuses)
        .filter(([_, s]) => s === 'done')
        .map(([id]) => id);

      // 1. Fetch Gemini Decision Plan in active language
      const newDecision = await ClimateRiskService.fetchGeminiDecision({
        location: loc,
        crop: c,
        cropStage: st,
        language: currentLang || language,
        lat,
        lon,
        completedActions: completedList,
        previousRisk: decisionPlan
      });

      // Compute What Changed diff if previous plan exists
      if (previousPlanRef.current) {
        const prev = previousPlanRef.current;
        const rainProbPrev = prev.weatherSummary?.rainfallProbability || 0;
        const rainProbNew = newDecision.weatherSummary?.rainfallProbability || 0;
        const isRainDiff = Math.abs(rainProbPrev - rainProbNew) >= 5;
        const isRiskDiff = prev.riskLevel !== newDecision.riskLevel;
        const isCropDiff = prev.aiExplanation !== newDecision.aiExplanation;

        if (isRainDiff || isRiskDiff || isCropDiff) {
          setWhatChanged({
            changed: true,
            rainDiff: isRainDiff ? { from: rainProbPrev, to: rainProbNew } : undefined,
            riskDiff: isRiskDiff ? { from: prev.riskLevel, to: newDecision.riskLevel } : undefined,
            cropDiff: isCropDiff ? { crop: c, stage: st } : undefined
          });
        }
      }

      previousPlanRef.current = newDecision;
      setDecisionPlan(newDecision);

      // 2. Fetch full telemetry for government tabs & background validation
      const { weather, flood, assessment } = await ClimateRiskService.fetchFullAssessment(loc, c, st, lat, lon);
      setWeatherData(weather);
      setFloodData(flood);
      setAssessmentData(assessment);

      // 3. Food security and history data for government view
      const foodSnap = await ClimateRiskService.fetchFoodSecurityOverview('West Bengal', c);
      setFoodSnapshot(foodSnap);

      const districts = await ClimateRiskService.fetchDistrictRisks('West Bengal');
      setDistrictRisks(districts);

      const history = await ClimateRiskService.fetchHistory();
      setHistoryLogs(history);
    } catch (err) {
      console.error('Failed to load climate decision telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-select and fetch on initial load and whenever language changes
  useEffect(() => {
    loadAllData(location, crop, cropStage, latitude, longitude, undefined, language);
  }, [language]);

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

  const isMobile = useIsMobile();

  return (
    <SihLayout activeModuleId="climate-risk" moduleTitle="Climate Risk Planner" moduleIcon="partly_cloudy_day">
      {isMobile ? (
        <MobileClimateRiskView
          location={location}
          crop={crop}
          cropStage={cropStage}
          weatherData={weatherData}
          decisionPlan={decisionPlan}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onLocationSelect={handleLocationSelect}
          onCropChange={handleCropChange}
          onStageChange={handleStageChange}
          actionStatuses={actionStatuses}
          onUpdateActionStatus={handleUpdateActionStatus}
          whatChanged={whatChanged}
          foodSnapshot={foodSnapshot}
          districtRisks={districtRisks}
          onSimulateScenario={handleSimulateScenario}
        />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          maxWidth: '1100px',
          margin: '0 auto',
          paddingBottom: '2.5rem'
        }}>

        {/* 1. TOP FARM CONTEXT BAR */}
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
            {t('sih.farmerDecisionHub')}
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
            {t('sih.govtFoodSecurityTab')}
          </button>
        </div>

        {/* 3. TAB CONTENT */}
        {activeTab === 'farmer' ? (
          /* ============================================================ */
          /* FARMER ACTION PAGE — LIVE GEMINI DECISION SYSTEM             */
          /* ============================================================ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <FarmerActionPage
              decisionPlan={decisionPlan}
              location={location}
              crop={crop}
              cropStage={cropStage}
              isAnalyzing={isLoading}
              onRefresh={handleRefresh}
              actionStatuses={actionStatuses}
              onUpdateActionStatus={handleUpdateActionStatus}
              whatChanged={whatChanged}
            />

            {/* Collapsible Past Assessment Section */}
            <div style={{
              marginTop: '1rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '0.85rem'
            }}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>{showHistory ? 'HIDE PAST ASSESSMENTS ↑' : 'VIEW PAST ASSESSMENTS →'}</span>
              </button>

              {showHistory && (
                <div style={{ marginTop: '0.85rem' }}>
                  <HistoricalRiskSection history={historyLogs} />
                </div>
              )}
            </div>

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
      )}
    </SihLayout>
  );
};
