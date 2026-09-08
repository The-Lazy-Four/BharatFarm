import React, { useState } from 'react';
import {
  FoodSecuritySnapshot,
  DistrictRiskItem,
  ScenarioSimulationResult
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
  const [selectedState, setSelectedState] = useState('West Bengal');
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [showFormula, setShowFormula] = useState(true);

  // What-If Scenario State
  const [scenarioLossPct, setScenarioLossPct] = useState<number>(30);
  const [simulationResult, setSimulationResult] = useState<ScenarioSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

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
                GOVERNMENT & AUTHORITY HUB
              </span>
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                🔒 Role-Protected Policy View
              </span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              Food Security & Regional Trade Advisory Engine
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
              Aggregating farm-level crop exposure → district impact → state production forecast → regional domestic availability
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
            </select>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#334155', color: '#FFF', fontWeight: 700, border: '1px solid #475569', fontSize: '0.85rem' }}
            >
              <option value="Paddy">Paddy / Rice</option>
              <option value="Wheat">Wheat</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. REGIONAL FOOD SECURITY METRICS & FORMULA */}
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
              STATE PRODUCTION & INVENTORY BALANCES
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
              {selectedState} — {selectedCrop} Domestic Availability Profile
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
              {showFormula ? 'Hide Formula' : 'Explain Calculation'}
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

      {/* 3. WHAT-IF CLIMATE DISASTER SCENARIO SIMULATOR */}
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
              INTERACTIVE DISASTER SIMULATION ENGINE
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
              What-If Climate Disaster Scenario Simulator
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Drag slider to simulate regional crop loss % and dynamically calculate domestic availability gap & trade advisories.
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
              Simulated Estimated Crop Loss: <span style={{ color: '#DC2626', fontSize: '1.2rem', fontWeight: 900 }}>{scenarioLossPct}%</span>
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

      {/* 4. GOVERNMENT POLICY & TRADE ADVISORY */}
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
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            LEGAL & POLICY DIRECTIVE
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
            Food Security & Outward Movement Advisory
          </h3>
        </div>

        <div style={{ background: '#F8FAFC', padding: '1.1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.85rem', lineHeight: 1.45, color: '#334155' }}>
          <p style={{ margin: '0 0 0.75rem 0' }}>
            {snapshot.advisoryText}
          </p>

          <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            RECOMMENDED AUTHORITY ACTIONS:
          </div>

          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {(activeResult.recommendedActions || snapshot.recommendedPolicyActions).map((act, idx) => (
              <li key={idx}><strong>•</strong> {act}</li>
            ))}
          </ul>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic', background: '#F1F5F9', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
          ⚖️ <strong>Policy Compliance Rule:</strong> Final trade and export decisions remain with authorized government authorities under applicable laws. The system provides decision-support advisories without issuing automated export bans.
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
              DISTRICT-LEVEL CROP EXPOSURE
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
              District-Wise Climate & Flood Vulnerability Matrix
            </h3>
          </div>

          <span style={{ fontSize: '0.72rem', background: '#FFFBEB', color: '#92400E', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid #FDE68A', fontWeight: 700 }}>
            🧪 Demonstration / simulated data
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
