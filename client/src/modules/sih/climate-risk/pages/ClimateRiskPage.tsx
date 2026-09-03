import React, { useState, useEffect } from 'react';
import { SihLayout } from '../../shared/SihLayout';
import { useWeatherContext } from '@core/context/WeatherContext';
import { useAuth } from '@core/context/AuthContext';
import { ClimateRiskService, ProcurementAdvice } from '../climateRisk.service';

export const ClimateRiskPage: React.FC = () => {
  const { user } = useAuth();
  const { weather, refreshWeather, isLoading } = useWeatherContext();
  const [selectedCrop, setSelectedCrop] = useState<string>(user?.primaryCrops?.[0] || 'Wheat');
  const [advice, setAdvice] = useState<ProcurementAdvice | null>(null);
  const [simulatedRain, setSimulatedRain] = useState<number | null>(null);

  useEffect(() => {
    // Clone weather context and apply simulation if active
    const activeWeather = { ...weather };
    if (simulatedRain !== null) {
      activeWeather.rainfallProbability = simulatedRain;
      activeWeather.humidityPercent = simulatedRain > 50 ? 88 : 52;
    }
    const res = ClimateRiskService.analyzeClimateRisk(activeWeather, selectedCrop);
    setAdvice(res);
  }, [weather, selectedCrop, simulatedRain]);

  return (
    <SihLayout
      activeModuleId="climate-risk"
      moduleTitle="Climate-Risk Procurement"
      moduleIcon="🌦️"
      moduleBadge="Decision Engine"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>
        
        {/* Module Header / Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #072714 0%, #15803d 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ background: '#22c55e', color: '#04210e', fontWeight: 900, fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                SIH MODULE 1
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>• Microclimate Procurement Planner</span>
            </div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              Climate-Risk-Aware Procurement Engine
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.3rem', maxWidth: '750px', lineHeight: 1.4 }}>
              Predictive climate telemetry decision engine for optimal crop harvest timing, pesticide spraying windows, and grain moisture risk mitigation.
            </p>
          </div>

          <button
            onClick={refreshWeather}
            disabled={isLoading}
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '0.65rem 1.2rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backdropFilter: 'blur(8px)'
            }}
          >
            <span className={`material-symbols-outlined ${isLoading ? 'spin' : ''}`} style={{ fontSize: '20px' }}>sync</span>
            <span>{isLoading ? 'Syncing Radar...' : 'Refresh Telemetry'}</span>
          </button>
        </div>

        {/* Crop Selector & Climate Risk Index Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Risk Gauge Card */}
          <div style={{
            background: 'var(--surface-1, #0d2818)',
            border: `2px solid ${advice?.riskScore && advice.riskScore > 50 ? '#dc2626' : '#22c55e'}`,
            borderRadius: '18px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                OVERALL PROCUREMENT RISK SCORE
              </span>
              <span style={{
                background: advice?.riskScore && advice.riskScore > 50 ? 'rgba(220, 38, 38, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                color: advice?.riskScore && advice.riskScore > 50 ? '#dc2626' : '#22c55e',
                fontWeight: 900,
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '20px'
              }}>
                {advice?.riskLevel}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.8rem 0' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: advice?.riskScore && advice.riskScore > 50 ? '#dc2626' : '#22c55e', lineHeight: 1 }}>
                {advice?.riskScore}
              </h2>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 700 }}>/ 100 Risk Index</span>
            </div>

            <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${advice?.riskScore || 0}%`, background: advice?.riskScore && advice.riskScore > 50 ? '#dc2626' : '#22c55e', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Target Crop Selector & Quick Controls */}
          <div style={{
            background: 'var(--surface-1, #0d2818)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
            borderRadius: '18px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Select Crop & Microclimate Target:
            </label>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'var(--surface-0, #041209)',
                border: '1px solid var(--border-default, rgba(255,255,255,0.2))',
                color: 'var(--text-primary, #ffffff)',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              <option value="Wheat">Wheat (Rabi Grain)</option>
              <option value="Paddy">Paddy / Rice (Kharif Crop)</option>
              <option value="Mustard">Mustard (Oilseed)</option>
              <option value="Cotton">Cotton (Cash Crop)</option>
              <option value="Sugarcane">Sugarcane</option>
            </select>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
              <button
                onClick={() => setSimulatedRain(15)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: simulatedRain === 15 ? 'var(--signal-lime)' : 'transparent', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                ☀️ Fair Weather
              </button>
              <button
                onClick={() => setSimulatedRain(75)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: simulatedRain === 75 ? '#dc2626' : 'transparent', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🌧️ Monsoon Threat
              </button>
              {simulatedRain !== null && (
                <button
                  onClick={() => setSimulatedRain(null)}
                  style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Decision Indicator Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {/* Card 1 */}
          <div style={{ background: 'var(--surface-1, #0d2818)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>HARVEST SAFETY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{advice?.harvestSafety === 'OPTIMAL' ? '✅' : advice?.harvestSafety === 'CAUTION' ? '⚠️' : '⛔'}</span>
              <strong style={{ fontSize: '1.1rem', color: advice?.harvestSafety === 'OPTIMAL' ? '#22c55e' : advice?.harvestSafety === 'CAUTION' ? '#d97706' : '#dc2626' }}>
                {advice?.harvestSafety}
              </strong>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ background: 'var(--surface-1, #0d2818)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>SPRAYING ADVISORY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{advice?.sprayingSafety === 'SAFE' ? '🚜' : '💨'}</span>
              <strong style={{ fontSize: '1.05rem', color: advice?.sprayingSafety === 'SAFE' ? '#22c55e' : '#dc2626' }}>
                {advice?.sprayingSafety}
              </strong>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ background: 'var(--surface-1, #0d2818)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>RAIN PROBABILITY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>☔</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {simulatedRain !== null ? simulatedRain : weather.rainfallProbability || 0}% Chance
              </strong>
            </div>
          </div>

          {/* Card 4 */}
          <div style={{ background: 'var(--surface-1, #0d2818)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>GRAIN SPOILAGE RISK</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🌾</span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {advice?.spoilageRisk}
              </strong>
            </div>
          </div>
        </div>

        {/* Actionable Recommendation Card */}
        <div style={{
          background: advice?.riskScore && advice.riskScore > 50 ? 'rgba(220, 38, 38, 0.08)' : 'rgba(34, 197, 94, 0.08)',
          border: `1.5px solid ${advice?.riskScore && advice.riskScore > 50 ? '#dc2626' : '#22c55e'}`,
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Procurement & Harvest Timing Decision
            </h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600, lineHeight: 1.45 }}>
            {advice?.procurementTiming}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            {advice?.recommendedAction}
          </p>
        </div>

        {/* 5-Day Weather & Risk Timeline */}
        <div style={{
          background: 'var(--surface-1, #0d2818)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
          borderRadius: '18px',
          padding: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
            📅 5-Day Microclimate & Harvesting Window Timeline
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem'
          }}>
            {advice?.timeline.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--surface-0, #041209)',
                  border: `1px solid ${item.riskStatus === 'RISK' ? '#dc2626' : item.riskStatus === 'CAUTION' ? '#d97706' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '14px',
                  padding: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.day}</strong>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    background: item.riskStatus === 'RISK' ? 'rgba(220,38,38,0.2)' : item.riskStatus === 'CAUTION' ? 'rgba(217,119,6,0.2)' : 'rgba(34,197,94,0.2)',
                    color: item.riskStatus === 'RISK' ? '#dc2626' : item.riskStatus === 'CAUTION' ? '#d97706' : '#22c55e'
                  }}>
                    {item.riskStatus}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {item.condition}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  <span>Temp: <strong>{item.temp}°C</strong></span>
                  <span>Rain: <strong style={{ color: item.rainProb > 40 ? '#dc2626' : 'var(--text-primary)' }}>{item.rainProb}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </SihLayout>
  );
};
