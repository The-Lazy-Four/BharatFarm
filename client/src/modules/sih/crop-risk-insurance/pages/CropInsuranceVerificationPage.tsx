import React, { useState } from 'react';
import { SihLayout } from '../../shared/SihLayout';
import { CropRiskService, SatelliteTelemetry } from '../cropRisk.service';
import { ScannerPage } from '../../../basic-farmer-needs/scanner/index';

export const CropInsuranceVerificationPage: React.FC = () => {
  const [policyId, setPolicyId] = useState<string>('PMFBY-2026-9928');
  const [telemetry, setTelemetry] = useState<SatelliteTelemetry | null>(
    CropRiskService.getSatelliteTelemetry('PMFBY-2026-9928')
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);

  const handleRunSatelliteScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setTelemetry(CropRiskService.getSatelliteTelemetry(policyId));
      setIsScanning(false);
    }, 1000);
  };

  return (
    <SihLayout
      activeModuleId="crop-risk-insurance"
      moduleTitle="Crop Risk & Insurance"
      moduleIcon="🛰️"
      moduleBadge="Satellite Audit"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>
        
        {/* Module Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #032311 0%, #15803d 100%)',
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
                SIH MODULE 3
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>• PMFBY Satellite Verification Engine</span>
            </div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              Satellite Crop Risk & Insurance Claim Verification
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.3rem', maxWidth: '780px', lineHeight: 1.4 }}>
              Multispectral Sentinel-2 NDVI satellite monitoring paired with AI leaf vision diagnostics for instant 48-hour PMFBY insurance claim settlement.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>DATA PROVIDER SERVICE</span>
            <strong style={{ color: '#22c55e' }}>ISRO EOS-04 / Sentinel-2 Telemetry (Demo)</strong>
          </div>
        </div>

        {/* Policy Search & Telemetry Controls */}
        <div style={{
          background: 'var(--surface-1, #0d2818)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
          borderRadius: '18px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Enter PMFBY Insurance Policy / Khasra Survey Number:
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              placeholder="e.g. PMFBY-2026-9928"
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'var(--surface-0, #041209)',
                border: '1px solid var(--border-default, rgba(255,255,255,0.2))',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            />

            <button
              onClick={handleRunSatelliteScan}
              disabled={isScanning}
              style={{
                background: 'var(--signal-lime, #22c55e)',
                color: '#04210e',
                border: 'none',
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span className={`material-symbols-outlined ${isScanning ? 'spin' : ''}`} style={{ fontSize: '20px' }}>satellite_alt</span>
              <span>{isScanning ? 'Querying Orbit Satellites...' : 'Run Satellite Audit'}</span>
            </button>
          </div>
        </div>

        {/* Satellite Telemetry Dashboard Card */}
        {telemetry && (
          <div style={{
            background: 'var(--surface-1, #0d2818)',
            border: `2px solid ${telemetry.vegetationStress === 'SEVERE DAMAGE' ? '#dc2626' : '#22c55e'}`,
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{
                  background: telemetry.vegetationStress === 'SEVERE DAMAGE' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  color: telemetry.vegetationStress === 'SEVERE DAMAGE' ? '#dc2626' : '#22c55e',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '20px',
                  textTransform: 'uppercase'
                }}>
                  {telemetry.insuranceClaimStatus}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '0.4rem 0 0 0' }}>
                  Policy Claim Audit Results ({policyId})
                </h2>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>LAST SATELLITE PASS</span>
                <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700, marginTop: '0.1rem' }}>
                  {telemetry.lastPassTimestamp}
                </div>
              </div>
            </div>

            {/* 3 Metric Gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--surface-0, #041209)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>NDVI VEGETATION INDEX</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: telemetry.ndviIndex < 0.4 ? '#dc2626' : '#22c55e', margin: '0.2rem 0 0 0' }}>
                  {telemetry.ndviIndex}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {telemetry.vegetationStress}
                </span>
              </div>

              <div style={{ background: 'var(--surface-0, #041209)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>AFFECTED FIELD AREA</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: telemetry.floodInundationAreaAcres > 0 ? '#dc2626' : '#ffffff', margin: '0.2rem 0 0 0' }}>
                  {telemetry.floodInundationAreaAcres} Acres
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Inundated / Stressed
                </span>
              </div>

              <div style={{ background: 'var(--surface-0, #041209)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>ESTIMATED CLAIM PAYOUT</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#22c55e', margin: '0.2rem 0 0 0' }}>
                  ₹{(telemetry.recommendedPayoutPerAcre * 3.5).toLocaleString()}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Direct Bank Transfer Eligible
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Supporting Evidence — Leaf Scanner Action Card */}
        <div style={{
          background: 'var(--surface-1, #0d2818)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
          borderRadius: '18px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 800, textTransform: 'uppercase' }}>
              SUPPORTING EVIDENCE TOOL
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0 0 0' }}>
              Attach Field Photo Leaf Scan to Claim Dossier
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Capture a leaf photo to provide ground-level AI disease diagnosis proof alongside satellite imagery.
            </p>
          </div>

          <button
            onClick={() => setShowScannerModal(!showScannerModal)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '0.65rem 1.2rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>photo_camera</span>
            <span>{showScannerModal ? 'Hide Leaf Scanner' : 'Launch Leaf Scanner'}</span>
          </button>
        </div>

        {/* Optional Embedded Leaf Scanner Component */}
        {showScannerModal && (
          <div style={{ marginTop: '0.5rem' }}>
            <ScannerPage />
          </div>
        )}

      </div>
    </SihLayout>
  );
};
