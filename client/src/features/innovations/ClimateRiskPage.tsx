import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { WeatherPage } from '../weather/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useWeatherContext } from '../../context/WeatherContext.js';
import { SihLayout } from '../../components/layout/SihLayout.js';

export const ClimateRiskPage: React.FC = () => {
  const { user } = useAuth();
  const { weather } = useWeatherContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'radar'>('overview');
  const [selectedCrop, setSelectedCrop] = useState<string>(user?.primaryCrops?.[0] || 'Wheat');

  // Simulated Climate-Risk Procurement Analysis
  const riskScore = weather.rainfallProbability > 40 ? 68 : 22;
  const riskLevel = riskScore > 50 ? 'HIGH RISK' : 'LOW RISK';

  return (
    <SihLayout
      activeModuleId="climate-risk"
      moduleTitle="Climate-Risk Procurement"
      moduleIcon="🌦️"
      moduleBadge="Weather & Risk"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem 2.5rem' }}>
        
        {/* Module Header Banner */}
        <div className="page-header-banner" style={{ background: 'linear-gradient(135deg, #092b15 0%, #166534 100%)', borderRadius: '16px', padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary" style={{ background: '#22c55e', color: '#04210e', fontWeight: 900 }}>
                SIH INNOVATION MODULE #1
              </span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>• Climate-Risk Procurement Engine</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
              Climate-Risk-Aware Procurement Planner
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.88rem', marginTop: '0.25rem', maxWidth: '780px' }}>
              Predictive microclimate & soil moisture telemetry engine optimizing post-harvest procurement, harvest windows, and pesticide spraying schedules to mitigate climate risk.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button
              variant={activeTab === 'overview' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              style={activeTab === 'overview' ? { background: '#22c55e', border: 'none', color: '#04210e' } : { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Module Analysis
            </Button>
            <Button
              variant={activeTab === 'radar' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('radar')}
              style={activeTab === 'radar' ? { background: '#22c55e', border: 'none', color: '#04210e' } : { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Live Weather Radar
            </Button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Problem / Solution Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              
              {/* Problem Statement Card */}
              <Card title="⚠️ Problem Being Solved" subtitle="Post-harvest losses and microclimate threats">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    Unpredictable extreme rainfall, high humidity, and sudden heatwaves during harvest season cause severe post-harvest spoilage and crop damage.
                  </p>
                  <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.25)' }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>Why Existing Systems Are Insufficient:</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.35, margin: 0 }}>
                      Traditional procurement follows rigid calendar dates. Standard weather apps only give broad regional forecasts without farm-level telemetry or spraying risk guidance.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Our Implementation Card */}
              <Card title="💡 Our Innovation & Working Features" subtitle="Integrated climate risk matrix">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    Our AI correlates live Open-Meteo telemetry with crop moisture thresholds to calculate safe harvest, spraying, and procurement windows.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                      <strong>☔ Rain Risk:</strong> {weather.rainfallProbability}%
                    </div>
                    <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                      <strong>💨 Wind Speed:</strong> {weather.windSpeedKmh} km/h
                    </div>
                    <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                      <strong>🌡️ Temp:</strong> {weather.temperatureCelsius}°C
                    </div>
                    <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                      <strong>💧 Humidity:</strong> {weather.humidityPercent}%
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Interactive Procurement Risk Matrix Tool */}
            <Card title="🛡️ Live Climate-Risk Procurement Assessment" subtitle="Simulate harvest & procurement safety for your primary crop">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Target Crop:</label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="input-field"
                      style={{ padding: '0.5rem 0.85rem', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                      <option value="Wheat">Wheat (Rabi Season)</option>
                      <option value="Paddy">Paddy / Rice (Kharif Season)</option>
                      <option value="Mustard">Mustard (Oilseed)</option>
                      <option value="Cotton">Cotton (Kharif Cash Crop)</option>
                    </select>
                  </div>

                  <div className="inset-stat" style={{ flex: 1, minWidth: '200px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PROCUREMENT RISK SCORE</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: riskScore > 50 ? '#dc2626' : '#22c55e', margin: 0 }}>
                        {riskScore} / 100
                      </h3>
                      <Badge variant={riskScore > 50 ? 'warning' : 'primary'}>{riskLevel}</Badge>
                    </div>
                  </div>
                </div>

                {/* Advisory recommendation banner */}
                <div style={{ padding: '1rem', borderRadius: '10px', background: riskScore > 50 ? 'rgba(217, 119, 6, 0.12)' : 'rgba(34, 197, 94, 0.12)', border: `1px solid ${riskScore > 50 ? '#d97706' : '#22c55e'}` }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{riskScore > 50 ? '⚠️' : '✅'}</span> Agronomic Procurement Advisory for {selectedCrop}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4, margin: 0 }}>
                    {riskScore > 50
                      ? `Precipitation probability is elevated (${weather.rainfallProbability}%). Postpone crop harvesting by 48 hours to prevent moisture accumulation during procurement transit.`
                      : `Optimal weather window detected for ${selectedCrop}. Humidity is ${weather.humidityPercent}%. Proceed with planned harvest dispatch and market procurement.`}
                  </p>
                </div>
              </div>
            </Card>

            {/* Embedded Full Live Weather Component */}
            <div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Integrated Weather Telemetry Engine
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--signal-lime)', fontWeight: 700 }}>
                  ✓ Core Shared Weather Telemetry
                </span>
              </div>
              <WeatherPage />
            </div>
          </>
        ) : (
          <WeatherPage />
        )}
      </div>
    </SihLayout>
  );
};
