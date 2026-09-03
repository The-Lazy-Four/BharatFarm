import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ScannerPage } from '../scanner/index.js';
import { LoanEligibilityPage } from '../../app/pages/LoanEligibilityPage.js';
import { SihLayout } from '../../components/layout/SihLayout.js';

export const CropInsuranceVerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'scanner' | 'credit'>('audit');
  const [policyId, setPolicyId] = useState<string>('PMFBY-2026-88219');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<{
    ndviIndex: number;
    healthStatus: string;
    damagePercentage: number;
    claimStatus: string;
    eligiblePayout: number;
  } | null>(null);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setAuditResult({
        ndviIndex: 0.34,
        healthStatus: 'MODERATE STRESS (DRY SPELL)',
        damagePercentage: 38,
        claimStatus: 'AUTOMATICALLY APPROVED',
        eligiblePayout: 28500
      });
      setIsAuditing(false);
    }, 1200);
  };

  return (
    <SihLayout
      activeModuleId="crop-risk-insurance"
      moduleTitle="Crop Risk & Insurance"
      moduleIcon="🛰️"
      moduleBadge="Audit & Health"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem 2.5rem' }}>
        
        {/* Module Header Banner */}
        <div className="page-header-banner" style={{ background: 'linear-gradient(135deg, #032311 0%, #15803d 100%)', borderRadius: '16px', padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary" style={{ background: '#22c55e', color: '#04210e', fontWeight: 900 }}>
                SIH INNOVATION MODULE #3
              </span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>• Satellite & Vision Crop Risk Audit</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
              Satellite-Based Crop Risk & Insurance Verification
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.88rem', marginTop: '0.25rem', maxWidth: '820px' }}>
              Multi-spectral satellite imagery and AI vision health audit for instant PMFBY crop damage claim verification, eliminating human bias and months of paperwork delay.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button
              variant={activeTab === 'audit' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('audit')}
              style={activeTab === 'audit' ? { background: '#22c55e', border: 'none', color: '#04210e' } : { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Satellite Audit Demo
            </Button>
            <Button
              variant={activeTab === 'scanner' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('scanner')}
              style={activeTab === 'scanner' ? { background: '#22c55e', border: 'none', color: '#04210e' } : { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Leaf Scanner Diagnostic
            </Button>
            <Button
              variant={activeTab === 'credit' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('credit')}
              style={activeTab === 'credit' ? { background: '#22c55e', border: 'none', color: '#04210e' } : { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Credit Score Matrix
            </Button>
          </div>
        </div>

        {activeTab === 'audit' ? (
          <>
            {/* Problem / Solution Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <Card title="⚠️ Problem Being Solved" subtitle="Delayed PMFBY claim settlements">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
                  Farmers waiting for disaster compensation after drought or unseasonal rain suffer 3 to 6 months of delay while insurance surveyors perform manual site visits.
                </p>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.25)', marginTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>Why Existing Systems Are Insufficient:</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.35, margin: 0 }}>
                    Manual surveys are error-prone, subjective, open to corruption, and lack high-resolution historical telemetry to prove true loss.
                  </p>
                </div>
              </Card>

              <Card title="💡 Our Satellite Verification Engine" subtitle="Automated NDVI & Field Audit">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
                  By integrating satellite NDVI telemetry with our Leaf Scanner AI, BharatFarm creates an audit-ready digital evidence file for instant claim verification.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                    <strong>📡 Settlement:</strong> 48 Hours vs 90 Days
                  </div>
                  <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                    <strong>🔍 Bias Risk:</strong> 0% Automated Audit
                  </div>
                </div>
              </Card>
            </div>

            {/* Interactive Satellite Audit Demo */}
            <Card title="🛰️ PMFBY Automated Satellite Claim Audit Verification" subtitle="Enter insurance policy ID to execute satellite NDVI telemetry audit">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                    placeholder="Enter PMFBY Policy ID"
                    style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', width: '280px' }}
                  />
                  <Button variant="primary" size="md" onClick={handleRunAudit} disabled={isAuditing}>
                    {isAuditing ? 'Executing Satellite Scan...' : 'Run Satellite Audit'}
                  </Button>
                </div>

                {auditResult && (
                  <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--surface-1)', border: '1px solid var(--signal-lime)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span className="badge badge-success">{auditResult.claimStatus}</span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                          Policy: {policyId}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ELIGIBLE CLAIM PAYOUT</span>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--signal-lime)', margin: 0 }}>
                          ₹{auditResult.eligiblePayout.toLocaleString()}
                        </h3>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      <div className="inset-stat">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SATELLITE NDVI INDEX</span>
                        <strong style={{ fontSize: '1.1rem', color: '#d97706', display: 'block', marginTop: '0.15rem' }}>
                          {auditResult.ndviIndex} (Stressed)
                        </strong>
                      </div>
                      <div className="inset-stat">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HEALTH DIAGNOSIS</span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block', marginTop: '0.15rem' }}>
                          {auditResult.healthStatus}
                        </strong>
                      </div>
                      <div className="inset-stat">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESTIMATED LOSS</span>
                        <strong style={{ fontSize: '1.1rem', color: '#dc2626', display: 'block', marginTop: '0.15rem' }}>
                          {auditResult.damagePercentage}% Area Affected
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Integrated Leaf Scanner Component */}
            <div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Integrated Field Diagnostic Leaf Scanner Component
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--signal-lime)', fontWeight: 700 }}>
                  ✓ Core Shared Vision Diagnostic Tool
                </span>
              </div>
              <ScannerPage />
            </div>
          </>
        ) : activeTab === 'scanner' ? (
          <ScannerPage />
        ) : (
          <LoanEligibilityPage />
        )}
      </div>
    </SihLayout>
  );
};
