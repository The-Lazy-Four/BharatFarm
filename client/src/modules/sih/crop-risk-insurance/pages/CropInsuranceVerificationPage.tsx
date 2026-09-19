import React, { useState, useEffect } from 'react';
import { SihLayout } from '../../shared/SihLayout';
import { useLanguage } from '@core/context/LanguageContext';
import { CropRiskService } from '../cropRisk.service';

export const CropInsuranceVerificationPage: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [activeClaimId, setActiveClaimId] = useState<string>('BF-INS-2026-00402');
  const [claimData, setClaimData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  // Government Decision Modal state
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [pendingDecisionType, setPendingDecisionType] = useState<'approved' | 'additional_verification' | 'rejected'>('approved');
  const [decisionRemarks, setDecisionRemarks] = useState('');

  // Initial load: Fetch pre-seeded demo claim or initialize backend connection
  useEffect(() => {
    let isMounted = true;
    async function loadInitialClaim() {
      try {
        const res = await CropRiskService.getClaim('BF-INS-2026-00402');
        if (res.success && res.claim) {
          if (isMounted) setClaimData(res.claim);
        } else {
          // Initialize demo claim FARM-402 on backend
          const createRes = await CropRiskService.createClaim({
            farmId: 'FARM-402',
            crop: 'Paddy',
            disasterType: 'Flood / Inundation',
            eventDate: '2026-09-12',
            reportedAffectedArea: 3.7,
            description: 'Submerged paddy crop following flash flood in Haldia sector.'
          });
          if (createRes.success && createRes.claimId) {
            if (isMounted) setActiveClaimId(createRes.claimId);
            await CropRiskService.analyzeClaim(createRes.claimId);
            const fullRes = await CropRiskService.getClaim(createRes.claimId);
            if (fullRes.success && isMounted) {
              setClaimData(fullRes.claim);
            }
          }
        }
      } catch (err) {
        console.warn('Initial insurance claim load error:', err);
      }
    }
    loadInitialClaim();
    return () => { isMounted = false; };
  }, []);

  // Core Workflow Trigger: Submit New Claim & Execute OpenRouter Vision AI Analysis
  const handleInitiateClaim = async () => {
    try {
      setLoading(true);
      setStatusMessage('Creating claim & retrieving satellite telemetry for FARM-402...');

      // 1. Submit claim to backend
      const createRes = await CropRiskService.createClaim({
        farmId: 'FARM-402',
        crop: 'Paddy',
        disasterType: 'Flood / Waterlogging',
        eventDate: '2026-09-12',
        reportedAffectedArea: 3.7,
        description: 'Automated satellite verification claim for Field #402.'
      });

      if (!createRes.success || !createRes.claimId) {
        alert('Failed to register claim: ' + (createRes.message || 'Unknown error'));
        return;
      }

      const claimId = createRes.claimId;
      setActiveClaimId(claimId);
      setStatusMessage(`Claim ${claimId} registered. Dispatching satellite image to OpenRouter Gemini Vision...`);

      // 2. Run Gemini Vision AI verification via OpenRouter
      const analyzeRes = await CropRiskService.analyzeClaim(claimId);

      if (analyzeRes.success && analyzeRes.assessment) {
        const fullClaimRes = await CropRiskService.getClaim(claimId);
        if (fullClaimRes.success && fullClaimRes.claim) {
          setClaimData(fullClaimRes.claim);
        }
        setStatusMessage(`AI Verification Complete: ${analyzeRes.assessment.affectedPercentage}% damage detected (${analyzeRes.assessment.severity} severity).`);
      } else {
        setStatusMessage('AI Analysis completed with fallback: ' + (analyzeRes.message || 'Ready for government review'));
        const fullClaimRes = await CropRiskService.getClaim(claimId);
        if (fullClaimRes.success && fullClaimRes.claim) {
          setClaimData(fullClaimRes.claim);
        }
      }
    } catch (err: any) {
      alert('Backend workflow error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Status check button handler
  const handleCheckStatus = async () => {
    try {
      const res = await CropRiskService.getClaimStatus(activeClaimId);
      if (res.success) {
        alert(`Claim ${res.claimId}\nCurrent Status: ${res.status.toUpperCase().replace(/_/g, ' ')}`);
      } else {
        alert('Status check failed: ' + res.message);
      }
    } catch (err: any) {
      alert('Status check error: ' + err.message);
    }
  };

  // Open Government Decision Modal
  const openGovernmentDecision = (decision: 'approved' | 'additional_verification' | 'rejected') => {
    setPendingDecisionType(decision);
    setDecisionRemarks(
      decision === 'approved'
        ? 'Satellite evidence reviewed and NDVI decline verified. Claim approved.'
        : (decision === 'additional_verification' ? 'Ground verification requested for Sector B plot perimeter.' : 'Claim rejected due to mismatch in crop boundary.')
    );
    setDecisionModalOpen(true);
  };

  // Submit Government Officer Decision to Backend
  const handleConfirmDecision = async () => {
    if (!activeClaimId) return;
    try {
      setLoading(true);
      const res = await CropRiskService.submitGovernmentDecision(activeClaimId, pendingDecisionType, decisionRemarks);
      if (res.success) {
        // Refresh claim data
        const fullRes = await CropRiskService.getClaim(activeClaimId);
        if (fullRes.success) setClaimData(fullRes.claim);
        alert(`Government Decision Recorded: ${pendingDecisionType.toUpperCase()}`);
        setDecisionModalOpen(false);
      } else {
        alert('Decision submission failed: ' + res.message);
      }
    } catch (err: any) {
      alert('Decision submission error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // View Detailed Report Dossier Modal
  const handleViewReport = async () => {
    if (activeClaimId) {
      const res = await CropRiskService.getClaimReport(activeClaimId);
      if (res.success && res.report) {
        setClaimData(res.report);
      }
    }
    setReportModalOpen(true);
  };

  const currentStatus = claimData?.status || 'under_government_verification';
  const aiAssessment = claimData?.aiAssessment;
  const economicLoss = claimData?.economicLoss;
  const satEvidence = claimData?.satelliteEvidence;
  const govtDecision = claimData?.governmentDecision;

  return (
    <SihLayout activeModuleId="crop-insurance" moduleTitle={t('sihDashboard.cropInsuranceTitle')} moduleIcon="verified_user">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Heading */}
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            {t('cropInsurance.pageTitle')}
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.35rem', margin: 0 }}>
            {t('cropInsurance.pageSubtitle')}
          </p>
        </div>

        {/* Hero Satellite / Farm Image Panel */}
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          height: '260px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0'
        }}>
          <img
            src={satEvidence?.satelliteImage || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"}
            alt="Satellite farm view"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '1.5rem',
            color: '#FFFFFF'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86EFAC' }}>
              {t('cropInsurance.headerBadge').toUpperCase()}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>
              {t('cropInsurance.fieldId')} #402 - Sector B (FARM-402)
            </h3>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.2rem' }}>
              Purba Medinipur, West Bengal • Paddy Field (5.2 Acres)
            </div>
          </div>
        </div>

        {/* 1. SATELLITE EVIDENCE & FIELD BOUNDARY SECTION */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#2563EB' }}>satellite_alt</span>
              Satellite Evidence & Field Boundary
            </h3>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
              Telemetry: {satEvidence?.satelliteId || 'SENTINEL-2B / ISRO-EOS-04'}
            </span>
          </div>

          {/* Farm metadata pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>REGISTERED FARM ID</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>FARM-402</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>CROP & TOTAL AREA</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>Paddy (5.2 Acres)</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>REPORTED DISASTER</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#DC2626', marginTop: '0.15rem' }}>Flood (12 Sep 2026)</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>FARMER REPORTED LOSS</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>72% (3.7 Acres)</div>
            </div>
          </div>

          {/* Boundary Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 700, background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#15803D' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E', border: '2px solid #15803D' }}></span>
              Registered Farm Boundary (GREEN)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#B91C1C' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444', border: '2px solid #B91C1C' }}></span>
              AI-Indicated Affected Area (RED / 68%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#B45309' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B', border: '2px solid #B45309' }}></span>
              Unaffected / Lower Indication (LIGHT)
            </div>
          </div>
        </div>

        {/* 2. BEFORE / AFTER SATELLITE COMPARISON SECTION */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#0284C7' }}>compare</span>
            Historical Satellite Observations Comparison
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Before Observation */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '16px', overflow: 'hidden', background: '#F8FAFC' }}>
              <div style={{ background: '#1E293B', color: '#FFFFFF', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                <span>BEFORE EVENT (05 Sep 2026)</span>
                <span style={{ color: '#86EFAC' }}>NDVI: 0.74</span>
              </div>
              <div style={{ height: '140px', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80" alt="Pre-disaster satellite view" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(22, 163, 74, 0.9)', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  HEALTHY CANOPY
                </div>
              </div>
              <div style={{ padding: '0.9rem', fontSize: '0.82rem', color: '#334155' }}>
                <strong>Condition:</strong> Dense healthy crop vegetation<br />
                <strong>Waterlogging:</strong> None detected<br />
                <strong>Telemetry:</strong> Sentinel-2B Pass #142
              </div>
            </div>

            {/* After Observation */}
            <div style={{ border: '1px solid #FCA5A5', borderRadius: '16px', overflow: 'hidden', background: '#FEF2F2' }}>
              <div style={{ background: '#991B1B', color: '#FFFFFF', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                <span>AFTER EVENT (14 Sep 2026)</span>
                <span style={{ color: '#FCA5A5' }}>NDVI: 0.28</span>
              </div>
              <div style={{ height: '140px', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80" alt="Post-disaster satellite view" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(40%) hue-rotate(180deg) saturate(140%)' }} />
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(220, 38, 38, 0.9)', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  SEVERE DECLINE
                </div>
              </div>
              <div style={{ padding: '0.9rem', fontSize: '0.82rem', color: '#7F1D1D' }}>
                <strong>Condition:</strong> Significant crop submergence & inundation<br />
                <strong>Waterlogging:</strong> Visible on 68% of plot<br />
                <strong>Telemetry:</strong> Sentinel-2B Pass #145
              </div>
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC STATUS & STEP TIMELINE */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                {t('cropInsurance.damageAssessment')} STATUS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span className="material-symbols-outlined" style={{ color: currentStatus === 'approved' ? '#16A34A' : (currentStatus === 'rejected' ? '#DC2626' : '#2563EB'), fontSize: '24px' }}>
                  {currentStatus === 'approved' ? 'check_circle' : (currentStatus === 'rejected' ? 'cancel' : 'published_with_changes')}
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: currentStatus === 'approved' ? '#16A34A' : (currentStatus === 'rejected' ? '#DC2626' : '#2563EB'), textTransform: 'uppercase' }}>
                  {currentStatus.replace(/_/g, ' ')}
                </span>
              </div>
              {statusMessage && (
                <div style={{ fontSize: '0.85rem', color: '#0284C7', marginTop: '0.35rem', fontWeight: 600 }}>
                  {statusMessage}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                {t('cropInsurance.ndviScore')}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                NDVI: {satEvidence?.ndviScore || '0.72'}
              </div>
            </div>
          </div>

          {/* Workflow Step Timeline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', overflowX: 'auto' }}>
            {[
              { label: '1. Claim Submitted', done: true },
              { label: '2. Satellite Evidence', done: true },
              { label: '3. AI Assessment', done: !!aiAssessment },
              { label: '4. Govt Review', done: currentStatus === 'under_government_verification' || currentStatus === 'approved' || currentStatus === 'rejected' },
              { label: '5. Verification Final', done: currentStatus === 'approved' || currentStatus === 'rejected' }
            ].map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: step.done ? '#16A34A' : '#94A3B8', whiteSpace: 'nowrap' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{step.done ? 'check_circle' : 'radio_button_unchecked'}</span>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. AI-ASSISTED SATELLITE ASSESSMENT CARD */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#7C3AED' }}>auto_awesome</span>
              AI-Assisted Satellite Assessment (OpenRouter Gemini Vision)
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#F3E8FF', color: '#6B21A8', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
              POWERED BY GEMINI VISION
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#F8FAFC', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>DAMAGE DETECTED</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: aiAssessment?.damageDetected ? '#DC2626' : '#16A34A', marginTop: '0.15rem' }}>
                {aiAssessment ? (aiAssessment.damageDetected ? 'YES' : 'NO') : 'YES'}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>DAMAGE TYPE</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem', textTransform: 'capitalize' }}>
                {aiAssessment?.damageType?.replace(/_/g, ' ') || 'Flood / Waterlogging'}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>ESTIMATED AFFECTED AREA</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#B45309', marginTop: '0.15rem' }}>
                {aiAssessment?.affectedPercentage || 68}% (3.5 Acres)
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>VEGETATION CONDITION</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem', textTransform: 'capitalize' }}>
                {aiAssessment?.vegetationCondition?.replace(/_/g, ' ') || 'Significant Decline'}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>EVENT CONSISTENCY</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563EB', marginTop: '0.15rem', textTransform: 'capitalize' }}>
                {aiAssessment?.eventConsistency?.replace(/_/g, ' ') || 'Potentially Consistent'}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>AI CONFIDENCE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem', textTransform: 'uppercase' }}>
                {aiAssessment?.confidence || 'Moderate'}
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '1rem 1.25rem', borderRadius: '12px', color: '#4C1D95', fontSize: '0.88rem', lineHeight: '1.5' }}>
            <strong>AI Summary:</strong> {aiAssessment?.summary || "Satellite evidence indicates visible waterlogging and crop vegetation decline within portions of registered farm consistent with reported flood event."}
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.75rem', fontStyle: 'italic' }}>
            Disclaimer: AI analysis provides supporting evidence. Final insurance verification is performed by the authorized government authority.
          </div>
        </div>

        {/* 5. MARKET PRICE + ECONOMIC LOSS CARD */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#D97706' }}>payments</span>
              Market-Linked Economic Loss Estimation
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#FEF3C7', color: '#92400E', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
              PRELIMINARY ESTIMATE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ background: '#FEFCE8', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #FEF08A' }}>
              <div style={{ fontSize: '0.75rem', color: '#854D0E', fontWeight: 700 }}>CROP & FARM AREA</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                {economicLoss?.crop || 'Paddy'} (5.2 Acres)
              </div>
            </div>

            <div style={{ background: '#FEFCE8', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #FEF08A' }}>
              <div style={{ fontSize: '0.75rem', color: '#854D0E', fontWeight: 700 }}>MANDI MARKET PRICE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                ₹{economicLoss?.marketPrice || 2400} / quintal
              </div>
            </div>

            <div style={{ background: '#FEFCE8', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #FEF08A' }}>
              <div style={{ fontSize: '0.75rem', color: '#854D0E', fontWeight: 700 }}>ESTIMATED PRODUCTION</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                {economicLoss?.estimatedProduction || 30} quintals
              </div>
            </div>

            <div style={{ background: '#FEFCE8', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #FEF08A' }}>
              <div style={{ fontSize: '0.75rem', color: '#854D0E', fontWeight: 700 }}>ESTIMATED LOST PRODUCTION</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#DC2626', marginTop: '0.15rem' }}>
                {economicLoss?.estimatedLostProduction || 20.4} quintals
              </div>
            </div>
          </div>

          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#B45309' }}>PRELIMINARY ESTIMATED ECONOMIC LOSS</div>
              <div style={{ fontSize: '0.78rem', color: '#92400E', marginTop: '0.1rem' }}>Farm Area × Damage % × Yield Benchmark × Market Price</div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#B45309' }}>
              ₹{(economicLoss?.estimatedEconomicLoss || 48960).toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '0.5rem', fontStyle: 'italic' }}>
            Note: This figure is a preliminary loss estimate and does not represent a legally guaranteed insurance payout.
          </div>
        </div>

        {/* 6. GOVERNMENT OFFICER VERIFICATION REVIEW PANEL */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#16A34A' }}>gavel</span>
              Government Authority Verification Review
            </h3>
            {govtDecision?.status && govtDecision.status !== 'pending' && (
              <span style={{ fontSize: '0.8rem', fontWeight: 800, background: govtDecision.status === 'approved' ? '#DCFCE7' : '#FEE2E2', color: govtDecision.status === 'approved' ? '#15803D' : '#991B1B', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                DECISION RECORDED: {govtDecision.status.toUpperCase()} ({govtDecision.officerId})
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 1rem 0' }}>
            Authorized government officers review satellite evidence, NDVI comparison, and AI damage analysis to issue the final PMFBY verification decision.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <button
              onClick={() => openGovernmentDecision('approved')}
              disabled={loading}
              style={{
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1.2rem',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>task_alt</span>
              APPROVE CLAIM
            </button>

            <button
              onClick={() => openGovernmentDecision('additional_verification')}
              disabled={loading}
              style={{
                background: '#D97706',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1.2rem',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>find_in_page</span>
              REQUEST ADDITIONAL VERIFICATION
            </button>

            <button
              onClick={() => openGovernmentDecision('rejected')}
              disabled={loading}
              style={{
                background: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1.2rem',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
              REJECT CLAIM
            </button>
          </div>
        </div>

        {/* EXISTING BOTTOM ACTION BUTTONS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={handleInitiateClaim}
            disabled={loading}
            style={{
              background: loading ? '#94A3B8' : '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {loading ? 'sync' : 'description'}
            </span>
            <span>{loading ? 'Processing AI...' : t('cropInsurance.submitClaim')}</span>
          </button>

          <button
            onClick={handleCheckStatus}
            style={{
              background: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>pending_actions</span>
            <span>{t('cropInsurance.claimStatus')}</span>
          </button>

          <button
            onClick={handleViewReport}
            style={{
              background: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help_outline</span>
            <span>{t('cropInsurance.viewReport')}</span>
          </button>
        </div>

        {/* GOVERNMENT DECISION MODAL */}
        {decisionModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.75rem', maxWidth: '500px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.75rem 0' }}>
                Confirm Decision: {pendingDecisionType.toUpperCase().replace(/_/g, ' ')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 1rem 0' }}>
                Provide verification remarks for Claim ID <strong>{activeClaimId}</strong>:
              </p>
              <textarea
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                rows={4}
                style={{ width: '100%', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0.75rem', fontSize: '0.9rem', marginBottom: '1.25rem', fontFamily: 'inherit' }}
                placeholder="Enter verification remarks..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => setDecisionModalOpen(false)}
                  style={{ background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', padding: '0.65rem 1.1rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDecision}
                  disabled={loading}
                  style={{ background: pendingDecisionType === 'approved' ? '#16A34A' : (pendingDecisionType === 'rejected' ? '#DC2626' : '#D97706'), color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  {loading ? 'Submitting...' : 'Submit Decision'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VERIFICATION REPORT DOSSIER MODAL */}
        {reportModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.75rem', maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Verification Dossier - {activeClaimId}
                </h2>
                <button onClick={() => setReportModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {claimData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#334155' }}>
                  <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>1. Registered Farm & Claim Summary</div>
                    <div><strong>Claim ID:</strong> {activeClaimId}</div>
                    <div><strong>Farm ID:</strong> {claimData.farmId || 'FARM-402'}</div>
                    <div><strong>Crop:</strong> Paddy (5.2 Acres)</div>
                    <div><strong>Disaster Event:</strong> Flood (12 Sept 2026)</div>
                    <div><strong>Verification Status:</strong> <span style={{ textTransform: 'uppercase', color: '#2563EB', fontWeight: 700 }}>{currentStatus.replace(/_/g, ' ')}</span></div>
                  </div>

                  {aiAssessment && (
                    <div style={{ background: '#F5F3FF', padding: '1rem', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
                      <div style={{ fontWeight: 700, color: '#5B21B6', marginBottom: '0.4rem' }}>2. OpenRouter Gemini Vision AI Assessment</div>
                      <div><strong>Damage Detected:</strong> {aiAssessment.damageDetected ? 'YES' : 'NO'}</div>
                      <div><strong>Damage Type:</strong> {aiAssessment.damageType}</div>
                      <div><strong>Severity:</strong> <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{aiAssessment.severity}</span></div>
                      <div><strong>Estimated Affected Area:</strong> {aiAssessment.affectedPercentage}% (3.5 Acres)</div>
                      <div><strong>AI Summary:</strong> {aiAssessment.summary}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B21A8', marginTop: '0.4rem' }}><em>Limitations: {aiAssessment.limitations}</em></div>
                    </div>
                  )}

                  {economicLoss && (
                    <div style={{ background: '#FEFCE8', padding: '1rem', borderRadius: '12px', border: '1px solid #FEF08A' }}>
                      <div style={{ fontWeight: 700, color: '#854D0E', marginBottom: '0.4rem' }}>3. Market Price Economic Loss Estimation</div>
                      <div><strong>Mandi Market Price:</strong> ₹{economicLoss.marketPrice} / quintal</div>
                      <div><strong>Estimated Lost Production:</strong> {economicLoss.estimatedLostProduction} quintals</div>
                      <div><strong>Preliminary Economic Loss:</strong> <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#B45309' }}>₹{economicLoss.estimatedEconomicLoss?.toLocaleString('en-IN')}</span></div>
                    </div>
                  )}

                  {govtDecision && (
                    <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontWeight: 700, color: '#166534', marginBottom: '0.4rem' }}>4. Government Officer Final Decision</div>
                      <div><strong>Decision:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 800 }}>{govtDecision.status}</span></div>
                      <div><strong>Officer ID:</strong> {govtDecision.officerId || 'OFFICER_PURBA_01'}</div>
                      <div><strong>Remarks:</strong> {govtDecision.remarks || 'None'}</div>
                    </div>
                  )}

                  {claimData.auditLog && (
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>5. System Audit Trail Timeline</div>
                      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                        {claimData.auditLog.map((log: any, idx: number) => (
                          <li key={idx} style={{ marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                            <strong>[{log.actor}]</strong> {log.action}: {log.details}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div>Loading verification dossier...</div>
              )}
            </div>
          </div>
        )}

      </div>
    </SihLayout>
  );
};
