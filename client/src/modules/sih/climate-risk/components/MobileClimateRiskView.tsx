import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  WeatherData,
  GeminiDecisionPlan,
  GeminiActionItem,
  WhatChangedDiff,
  FoodSecuritySnapshot,
  DistrictRiskItem,
  ScenarioSimulationResult
} from '../types';
import { FoodSecurityDashboard } from './FoodSecurityDashboard';

interface MobileClimateRiskViewProps {
  location: string;
  crop: string;
  cropStage: string;
  weatherData: WeatherData | null;
  decisionPlan: GeminiDecisionPlan | null;
  isLoading: boolean;
  onRefresh: () => void;
  onLocationSelect: (loc: { displayName: string; lat: number; lon: number }) => void;
  onCropChange: (crop: string) => void;
  onStageChange: (stage: string) => void;
  actionStatuses: Record<string, 'not_started' | 'in_progress' | 'done'>;
  onUpdateActionStatus: (actionId: string, status: 'not_started' | 'in_progress' | 'done') => void;
  whatChanged: WhatChangedDiff | null;
  foodSnapshot: FoodSecuritySnapshot | null;
  districtRisks: DistrictRiskItem[];
  onSimulateScenario: (lossPct: number) => Promise<ScenarioSimulationResult>;
}

export const MobileClimateRiskView: React.FC<MobileClimateRiskViewProps> = ({
  location,
  crop,
  cropStage,
  weatherData,
  decisionPlan,
  isLoading,
  onRefresh,
  onCropChange,
  onStageChange,
  actionStatuses,
  onUpdateActionStatus,
  whatChanged,
  foodSnapshot,
  districtRisks,
  onSimulateScenario
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'farmer' | 'forecast' | 'govt'>('farmer');
  const [showCropModal, setShowCropModal] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const CROPS = ['Paddy', 'Wheat', 'Tomato', 'Potato', 'Mustard', 'Chilli', 'Maize', 'Soybean'];
  const STAGES = ['Sowing / Germination', 'Vegetative', 'Flowering', 'Grain Filling', 'Harvest Ready'];

  const riskLevel = decisionPlan?.riskLevel || 'LOW';
  const isHighRisk = riskLevel === 'SEVERE' || riskLevel === 'HIGH';
  const isModerateRisk = riskLevel === 'MODERATE';

  const riskBg = isHighRisk ? '#FEF2F2' : isModerateRisk ? '#FFFBEB' : '#F0FDF4';
  const riskBorder = isHighRisk ? '#FECDD3' : isModerateRisk ? '#FDE68A' : '#BBF7D0';
  const riskBadgeBg = isHighRisk ? '#DC2626' : isModerateRisk ? '#D97706' : '#16A34A';

  const weatherTemp = weatherData?.temperatureCelsius ?? decisionPlan?.weatherSummary?.temperature ?? 29;
  const weatherRainProb = weatherData?.rainfallProbability ?? decisionPlan?.weatherSummary?.rainfallProbability ?? 35;
  const weatherCond = weatherData?.condition || decisionPlan?.weatherSummary?.condition || 'Partly Cloudy';
  const weatherRainMm = weatherData?.expectedRainfallMm ?? decisionPlan?.weatherSummary?.expectedRainfallMm ?? 14;

  const actions = decisionPlan?.actions || [];
  const buyItems = decisionPlan?.buyItems || [];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>

      {/* 1. COMPACT FARM CONTEXT BAR & QUICK CROP PICKER */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '0.85rem 1rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A', fontSize: '0.72rem', fontWeight: 800 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>location_on</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>
              {crop}
            </span>
            <span style={{
              background: '#F1F5F9',
              color: '#475569',
              padding: '0.15rem 0.45rem',
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: 700
            }}>
              {cropStage}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => setShowCropModal(true)}
            style={{
              background: '#DCFCE7',
              color: '#15803D',
              border: 'none',
              borderRadius: '8px',
              padding: '0.35rem 0.6rem',
              fontWeight: 800,
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            Change
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              background: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0
            }}
            title="Refresh AI Analysis"
          >
            <span className={`material-symbols-outlined ${isLoading ? 'spin' : ''}`} style={{ fontSize: '17px' }}>
              sync
            </span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT RISK & TELEMETRY SUMMARY HERO CARD */}
      <div style={{
        background: riskBg,
        border: `1.5px solid ${riskBorder}`,
        borderRadius: '16px',
        padding: '0.9rem 1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{
                background: riskBadgeBg,
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 900,
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                letterSpacing: '0.04em'
              }}>
                {riskLevel} CLIMATE RISK
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                {decisionPlan?.riskTimeline || 'Next 48 Hours'}
              </span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '0.3rem', lineHeight: 1.25 }}>
              {decisionPlan?.riskTitle || `${crop} Advisory for ${location}`}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
              {Math.round(weatherTemp)}°C
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, marginTop: '2px' }}>
              {weatherCond}
            </div>
          </div>
        </div>

        {/* Rain Probability / Telemetry pill bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.4rem',
          marginTop: '0.75rem',
          background: '#FFFFFF',
          padding: '0.5rem 0.65rem',
          borderRadius: '10px',
          border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 700 }}>RAIN CHANCE</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 900, color: weatherRainProb > 60 ? '#DC2626' : '#2563EB' }}>
              {weatherRainProb}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 700 }}>EST. RAINFALL</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A' }}>
              {weatherRainMm} mm
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 700 }}>SURVEY STATUS</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#16A34A' }}>
              Live Telemetry
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEGMENTED NAVIGATION TABS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        background: '#E2E8F0',
        padding: '0.25rem',
        borderRadius: '12px',
        gap: '0.25rem'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('farmer')}
          style={{
            height: '34px',
            borderRadius: '9px',
            border: 'none',
            background: activeTab === 'farmer' ? '#16A34A' : 'transparent',
            color: activeTab === 'farmer' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>checklist</span>
          <span>Actions ({actions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('forecast')}
          style={{
            height: '34px',
            borderRadius: '9px',
            border: 'none',
            background: activeTab === 'forecast' ? '#16A34A' : 'transparent',
            color: activeTab === 'forecast' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_month</span>
          <span>7-Day Rain</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('govt')}
          style={{
            height: '34px',
            borderRadius: '9px',
            border: 'none',
            background: activeTab === 'govt' ? '#16A34A' : 'transparent',
            color: activeTab === 'govt' ? '#FFFFFF' : '#475569',
            fontWeight: 800,
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>policy</span>
          <span>Food Security</span>
        </button>
      </div>

      {/* 4. TAB 1: FARMER PRIORITIZED ACTION ITEMS */}
      {activeTab === 'farmer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          
          {/* Change diff alert if any */}
          {whatChanged?.changed && (
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '10px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.72rem',
              color: '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>tips_and_updates</span>
              <span>Updated based on recent task completion and updated forecast.</span>
            </div>
          )}

          {/* Action Cards List */}
          {actions.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              color: '#64748B'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#16A34A' }}>check_circle</span>
              <p style={{ fontSize: '0.84rem', marginTop: '0.5rem', fontWeight: 600 }}>
                No critical emergency actions needed today. Continue standard field management.
              </p>
            </div>
          ) : (
            actions.map((act) => {
              const status = actionStatuses[act.id] || 'not_started';
              const isDone = status === 'done';
              const isInProgress = status === 'in_progress';
              const isHigh = act.priority === 'HIGH';

              return (
                <div
                  key={act.id}
                  style={{
                    background: isDone ? '#F8FAFC' : '#FFFFFF',
                    borderRadius: '14px',
                    padding: '0.85rem',
                    border: `1.5px solid ${isDone ? '#CBD5E1' : isHigh ? '#FECDD3' : '#E2E8F0'}`,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    opacity: isDone ? 0.75 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{
                        background: isHigh ? '#FEE2E2' : '#F1F5F9',
                        color: isHigh ? '#DC2626' : '#475569',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.62rem',
                        fontWeight: 800
                      }}>
                        {act.priority}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#D97706', fontWeight: 700 }}>
                        ⏳ {act.timing}
                      </span>
                    </div>

                    {/* Status Pill Indicator */}
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: isDone ? '#15803D' : isInProgress ? '#D97706' : '#64748B'
                    }}>
                      {isDone ? '✓ DONE' : isInProgress ? '● IN PROGRESS' : '○ PENDING'}
                    </div>
                  </div>

                  <div>
                    <h4 style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: isDone ? '#64748B' : '#0F172A',
                      margin: 0,
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                      {act.title}
                    </h4>
                    <p style={{ fontSize: '0.74rem', color: '#475569', margin: '0.2rem 0 0 0', lineHeight: 1.35 }}>
                      {act.description}
                    </p>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '0.35rem',
                    marginTop: '0.2rem',
                    paddingTop: '0.45rem',
                    borderTop: '1px solid #F1F5F9'
                  }}>
                    <button
                      type="button"
                      onClick={() => onUpdateActionStatus(act.id, isDone ? 'not_started' : 'done')}
                      style={{
                        flex: 1,
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isDone ? '#E2E8F0' : '#16A34A',
                        color: isDone ? '#475569' : '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        {isDone ? 'undo' : 'check'}
                      </span>
                      <span>{isDone ? 'Mark Pending' : 'Mark as Done'}</span>
                    </button>

                    {!isDone && (
                      <button
                        type="button"
                        onClick={() => onUpdateActionStatus(act.id, isInProgress ? 'not_started' : 'in_progress')}
                        style={{
                          height: '32px',
                          padding: '0 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          background: isInProgress ? '#FEF3C7' : '#FFFFFF',
                          color: isInProgress ? '#92400E' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          cursor: 'pointer'
                        }}
                      >
                        {isInProgress ? 'Pause' : 'Start'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Recommended Purchases Before Rain */}
          {buyItems.length > 0 && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '0.85rem 1rem',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🛒</span> Supplies to Secure Before Rain
                </span>
                <span style={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/sih/smart-mandi')}>
                  Shop Mandi →
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {buyItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/sih/smart-mandi?category=${encodeURIComponent(item.category || 'fertilizer')}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.65rem',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #F1F5F9',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>{item.name}</div>
                      <div style={{ fontSize: '0.66rem', color: '#64748B' }}>{item.reason}</div>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16A34A' }}>
                      chevron_right
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning Disclosure */}
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <button
              type="button"
              onClick={() => setShowReasoning(!showReasoning)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>{showReasoning ? 'Hide AI Reasoning' : 'Why these actions? (Gemini Reasoning)'}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {showReasoning ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showReasoning && (
              <div style={{
                marginTop: '0.5rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '0.75rem',
                textAlign: 'left',
                border: '1px solid #E2E8F0',
                fontSize: '0.75rem',
                color: '#334155',
                lineHeight: 1.45
              }}>
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.3rem' }}>
                  Telemetry Factors Analyzed:
                </div>
                <div>• Current stage: <strong>{cropStage}</strong> ({crop})</div>
                <div>• Predicted 48h rainfall: <strong>{weatherRainMm} mm</strong> ({weatherRainProb}% prob)</div>
                <div>• Flood/Inundation hazard index: <strong>{riskLevel}</strong></div>
                <div style={{ marginTop: '0.4rem', fontStyle: 'italic', color: '#64748B' }}>
                  {decisionPlan?.aiExplanation || decisionPlan?.whyReasoningSummary || 'Actions calibrated for local soil saturation and crop lifecycle vulnerability.'}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 5. TAB 2: 7-DAY RAINFALL FORECAST */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '0.9rem',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.65rem' }}>
              7-Day Harvest & Rain Outlook
            </div>

            {weatherData?.daily && weatherData.daily.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {weatherData.daily.slice(0, 7).map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      background: day.rainProb > 60 ? '#FEF2F2' : '#F8FAFC',
                      border: `1px solid ${day.rainProb > 60 ? '#FECDD3' : '#F1F5F9'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', width: '70px' }}>
                        {day.dayName}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {day.condition}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.74rem', color: day.rainProb > 60 ? '#DC2626' : '#2563EB', fontWeight: 800 }}>
                        {day.rainProb}% rain ({day.precipitation}mm)
                      </span>
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A' }}>
                        {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Telemetry data loading or standard seasonal forecast applicable.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 3: FOOD SECURITY & GOVERNMENT ADVISORY */}
      {activeTab === 'govt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {foodSnapshot ? (
            <FoodSecurityDashboard
              snapshot={foodSnapshot}
              districts={districtRisks}
              onSimulateScenario={onSimulateScenario}
            />
          ) : (
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', textAlign: 'center', color: '#64748B' }}>
              Loading food security snapshot...
            </div>
          )}
        </div>
      )}

      {/* CROP & STAGE PICKER MODAL */}
      {showCropModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.25rem',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Select Crop & Growth Stage
              </h3>
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>
                PRIMARY CROP:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                {CROPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { onCropChange(c); }}
                    style={{
                      padding: '0.45rem 0.25rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: crop === c ? '#16A34A' : '#E2E8F0',
                      background: crop === c ? '#DCFCE7' : '#F8FAFC',
                      color: crop === c ? '#15803D' : '#0F172A',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>
                CROP GROWTH STAGE:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {STAGES.map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => { onStageChange(stg); }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: cropStage === stg ? '#16A34A' : '#E2E8F0',
                      background: cropStage === stg ? '#DCFCE7' : '#F8FAFC',
                      color: cropStage === stg ? '#15803D' : '#0F172A',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCropModal(false)}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '10px',
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
