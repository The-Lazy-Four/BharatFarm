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

        {/* Hero Satellite / Farm Image Panel (Compact Hero) */}
        <div style={{
          position: 'relative',
          borderRadius: '14px',
          overflow: 'hidden',
          height: '110px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
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
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '0.6rem',
            left: '0.85rem',
            right: '0.85rem',
            color: '#FFFFFF'
          }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#86EFAC' }}>
              {t('cropInsurance.headerBadge').toUpperCase()}
            </span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0.05rem 0 0 0', lineHeight: 1.2 }}>
              {t('cropInsurance.fieldId')} #402 - Sector B (FARM-402)
            </h3>
            <div style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: '0.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Purba Medinipur, West Bengal • Paddy Field (5.2 Acres)
            </div>
          </div>
        </div>

        {/* 1. SATELLITE EVIDENCE & FIELD BOUNDARY SECTION */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '20px' }}>satellite_alt</span>
              {t('cropInsurance.satEvidenceTitle')}
            </h3>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
              {satEvidence?.satelliteId || 'SENTINEL-2B / ISRO-EOS-04'}
            </span>
          </div>

          {/* Farm metadata pills (Compact 2x2 grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.65rem' }}>
            <div style={{ background: '#F8FAFC', padding: '0.4rem 0.55rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.registeredFarmId')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.05rem' }}>FARM-402</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.4rem 0.55rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.cropTotalArea')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.05rem' }}>Paddy (5.2 Acres)</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.4rem 0.55rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.reportedDisaster')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#DC2626', marginTop: '0.05rem' }}>Flood (12 Sep)</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.4rem 0.55rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.farmerReportedLoss')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.05rem' }}>72% (3.7 Acres)</div>
            </div>
          </div>

          {/* Boundary Legend (Single compact horizontal row) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem', fontSize: '0.68rem', fontWeight: 700, background: '#F8FAFC', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#15803D', whiteSpace: 'nowrap' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', border: '1px solid #15803D' }}></span>
              <span>Boundary</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#B91C1C', whiteSpace: 'nowrap' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', border: '1px solid #B91C1C' }}></span>
              <span>Affected (68%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#B45309', whiteSpace: 'nowrap' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', border: '1px solid #B45309' }}></span>
              <span>Unaffected</span>
            </div>
          </div>
        </div>

        {/* 2. BEFORE / AFTER SATELLITE COMPARISON SECTION */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#0284C7', fontSize: '20px' }}>compare</span>
            {t('cropInsurance.historicalObsTitle')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {/* Before Observation */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '12px', overflow: 'hidden', background: '#F8FAFC' }}>
              <div style={{ background: '#1E293B', color: '#FFFFFF', padding: '0.4rem 0.5rem', fontSize: '0.72rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{t('cropInsurance.beforeEvent')} (05 Sep)</span>
                <span style={{ color: '#86EFAC' }}>0.74</span>
              </div>
              <div style={{ height: '80px', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80" alt="Pre-disaster satellite view" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(22, 163, 74, 0.9)', color: '#FFFFFF', fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                  {t('cropInsurance.healthyCanopy')}
                </div>
              </div>
              <div style={{ padding: '0.5rem', fontSize: '0.72rem', color: '#334155', lineHeight: '1.3' }}>
                <div><strong>{t('cropInsurance.conditionLabel')}:</strong> {t('cropInsurance.beforeConditionText')}</div>
                <div><strong>{t('cropInsurance.waterloggingLabel')}:</strong> {t('cropInsurance.beforeWaterloggingText')}</div>
                <div><strong>{t('cropInsurance.telemetrySubLabel')}:</strong> Sentinel-2B #142</div>
              </div>
            </div>

            {/* After Observation */}
            <div style={{ border: '1px solid #FCA5A5', borderRadius: '12px', overflow: 'hidden', background: '#FEF2F2' }}>
              <div style={{ background: '#991B1B', color: '#FFFFFF', padding: '0.4rem 0.5rem', fontSize: '0.72rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{t('cropInsurance.afterEvent')} (14 Sep)</span>
                <span style={{ color: '#FCA5A5' }}>0.28</span>
              </div>
              <div style={{ height: '80px', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80" alt="Post-disaster satellite view" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(40%) hue-rotate(180deg) saturate(140%)' }} />
                <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(220, 38, 38, 0.9)', color: '#FFFFFF', fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                  {t('cropInsurance.severeDecline')}
                </div>
              </div>
              <div style={{ padding: '0.5rem', fontSize: '0.72rem', color: '#7F1D1D', lineHeight: '1.3' }}>
                <div><strong>{t('cropInsurance.conditionLabel')}:</strong> {t('cropInsurance.afterConditionText')}</div>
                <div><strong>{t('cropInsurance.waterloggingLabel')}:</strong> {t('cropInsurance.afterWaterloggingText')}</div>
                <div><strong>{t('cropInsurance.telemetrySubLabel')}:</strong> Sentinel-2B #145</div>
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
                {t('cropInsurance.ndviScore')}: {satEvidence?.ndviScore || '0.72'}
              </div>
            </div>
          </div>

          {/* Workflow Step Timeline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', overflowX: 'auto' }}>
            {[
              { label: t('cropInsurance.stepClaimSubmitted'), done: true },
              { label: t('cropInsurance.stepSatEvidence'), done: true },
              { label: t('cropInsurance.stepAiAssessment'), done: !!aiAssessment },
              { label: t('cropInsurance.stepGovtReview'), done: currentStatus === 'under_government_verification' || currentStatus === 'approved' || currentStatus === 'rejected' },
              { label: t('cropInsurance.stepVerificationFinal'), done: currentStatus === 'approved' || currentStatus === 'rejected' }
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
          borderRadius: '16px',
          padding: '1rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#7C3AED', fontSize: '20px' }}>auto_awesome</span>
              {t('cropInsurance.aiAssessmentTitle')}
            </h3>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#F3E8FF', color: '#6B21A8', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
              {t('cropInsurance.poweredByGemini')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.65rem' }}>
            <div style={{ background: '#F8FAFC', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.damageDetected')}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 900, color: aiAssessment?.damageDetected ? '#DC2626' : '#16A34A', marginTop: '0.05rem' }}>
                {aiAssessment ? (aiAssessment.damageDetected ? t('cropInsurance.yes') : t('cropInsurance.no')) : t('cropInsurance.yes')}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.damageType')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.05rem', textTransform: 'capitalize' }}>
                {aiAssessment?.damageType?.replace(/_/g, ' ') || 'Flood Waterlogging'}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.estimatedAffectedArea')}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#B45309', marginTop: '0.05rem' }}>
                {aiAssessment?.affectedPercentage || 68}% (3.5 Acres)
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.vegetationCondition')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.05rem', textTransform: 'capitalize' }}>
                {aiAssessment?.vegetationCondition?.replace(/_/g, ' ') || 'Significant Decline'}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.eventConsistency')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563EB', marginTop: '0.05rem', textTransform: 'capitalize' }}>
                {aiAssessment?.eventConsistency?.replace(/_/g, ' ') || 'Potentially Consistent'}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.aiConfidence')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.05rem', textTransform: 'uppercase' }}>
                {aiAssessment?.confidence || 'Moderate'}
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#4C1D95', fontSize: '0.78rem', lineHeight: '1.4' }}>
            <strong>{t('cropInsurance.aiSummary')}:</strong> {aiAssessment?.summary || "Satellite evidence indicates visible waterlogging and crop vegetation decline within portions of registered farm consistent with reported flood event."}
          </div>
        </div>

        {/* 5. MARKET PRICE + ECONOMIC LOSS CARD */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: '20px' }}>payments</span>
              {t('cropInsurance.economicLossTitle')}
            </h3>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
              {t('cropInsurance.preliminaryEstimate')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.65rem' }}>
            <div style={{ background: '#FEFCE8', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #FEF08A' }}>
              <div style={{ fontSize: '0.65rem', color: '#854D0E', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.cropFarmArea')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.05rem' }}>
                {economicLoss?.crop || 'Paddy'} (5.2 Acres)
              </div>
            </div>

            <div style={{ background: '#FEFCE8', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #FEF08A' }}>
              <div style={{ fontSize: '0.65rem', color: '#854D0E', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.mandiMarketPrice')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.05rem' }}>
                ₹{economicLoss?.marketPrice || 2400} / quintal
              </div>
            </div>

            <div style={{ background: '#FEFCE8', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #FEF08A' }}>
              <div style={{ fontSize: '0.65rem', color: '#854D0E', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.estimatedProduction')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.05rem' }}>
                {economicLoss?.estimatedProduction || 30} quintals
              </div>
            </div>

            <div style={{ background: '#FEFCE8', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #FEF08A' }}>
              <div style={{ fontSize: '0.65rem', color: '#854D0E', fontWeight: 700, textTransform: 'uppercase' }}>{t('cropInsurance.estimatedLostProduction')}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#DC2626', marginTop: '0.05rem' }}>
                {economicLoss?.estimatedLostProduction || 20.4} quintals
              </div>
            </div>
          </div>

          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.35rem' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#B45309' }}>{t('cropInsurance.preliminaryEconomicLossTitle')}</div>
              <div style={{ fontSize: '0.68rem', color: '#92400E', marginTop: '0.05rem' }}>{t('cropInsurance.economicLossFormula')}</div>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#B45309', flexShrink: 0 }}>
              ₹{(economicLoss?.estimatedEconomicLoss || 48960).toLocaleString('en-IN')}
            </div>
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
              {t('cropInsurance.govtReviewTitle')}
            </h3>
            {govtDecision?.status && govtDecision.status !== 'pending' && (
              <span style={{ fontSize: '0.8rem', fontWeight: 800, background: govtDecision.status === 'approved' ? '#DCFCE7' : '#FEE2E2', color: govtDecision.status === 'approved' ? '#15803D' : '#991B1B', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                {t('cropInsurance.decisionRecorded')}: {govtDecision.status.toUpperCase()} ({govtDecision.officerId})
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 1rem 0' }}>
            {t('cropInsurance.govtReviewDesc')}
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
              {t('cropInsurance.approveClaim')}
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
              {t('cropInsurance.requestAddlVerification')}
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
              {t('cropInsurance.rejectClaim')}
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
            <span>{loading ? t('cropInsurance.processingAi') : t('cropInsurance.submitClaim')}</span>
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
                {t('cropInsurance.confirmDecision')}: {pendingDecisionType.toUpperCase().replace(/_/g, ' ')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 1rem 0' }}>
                {t('cropInsurance.provideRemarks')} <strong>{activeClaimId}</strong>:
              </p>
              <textarea
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                rows={4}
                style={{ width: '100%', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0.75rem', fontSize: '0.9rem', marginBottom: '1.25rem', fontFamily: 'inherit' }}
                placeholder={t('cropInsurance.enterRemarksPlaceholder')}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => setDecisionModalOpen(false)}
                  style={{ background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', padding: '0.65rem 1.1rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t('cropInsurance.cancel')}
                </button>
                <button
                  onClick={handleConfirmDecision}
                  disabled={loading}
                  style={{ background: pendingDecisionType === 'approved' ? '#16A34A' : (pendingDecisionType === 'rejected' ? '#DC2626' : '#D97706'), color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  {loading ? t('cropInsurance.submitting') : t('cropInsurance.submitDecision')}
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
                  {t('cropInsurance.dossierTitle')} - {activeClaimId}
                </h2>
                <button onClick={() => setReportModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {claimData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#334155' }}>
                  <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>{t('cropInsurance.dossierSection1')}</div>
                    <div><strong>Claim ID:</strong> {activeClaimId}</div>
                    <div><strong>Farm ID:</strong> {claimData.farmId || 'FARM-402'}</div>
                    <div><strong>Crop:</strong> Paddy (5.2 Acres)</div>
                    <div><strong>Disaster Event:</strong> Flood (12 Sept 2026)</div>
                    <div><strong>Verification Status:</strong> <span style={{ textTransform: 'uppercase', color: '#2563EB', fontWeight: 700 }}>{currentStatus.replace(/_/g, ' ')}</span></div>
                  </div>

                  {aiAssessment && (
                    <div style={{ background: '#F5F3FF', padding: '1rem', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
                      <div style={{ fontWeight: 700, color: '#5B21B6', marginBottom: '0.4rem' }}>{t('cropInsurance.dossierSection2')}</div>
                      <div><strong>{t('cropInsurance.damageDetected')}:</strong> {aiAssessment.damageDetected ? t('cropInsurance.yes') : t('cropInsurance.no')}</div>
                      <div><strong>{t('cropInsurance.damageType')}:</strong> {aiAssessment.damageType}</div>
                      <div><strong>Severity:</strong> <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{aiAssessment.severity}</span></div>
                      <div><strong>{t('cropInsurance.estimatedAffectedArea')}:</strong> {aiAssessment.affectedPercentage}% (3.5 Acres)</div>
                      <div><strong>{t('cropInsurance.aiSummary')}:</strong> {aiAssessment.summary}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B21A8', marginTop: '0.4rem' }}><em>Limitations: {aiAssessment.limitations}</em></div>
                    </div>
                  )}

                  {economicLoss && (
                    <div style={{ background: '#FEFCE8', padding: '1rem', borderRadius: '12px', border: '1px solid #FEF08A' }}>
                      <div style={{ fontWeight: 700, color: '#854D0E', marginBottom: '0.4rem' }}>3. {t('cropInsurance.economicLossTitle')}</div>
                      <div><strong>{t('cropInsurance.mandiMarketPrice')}:</strong> ₹{economicLoss.marketPrice} / quintal</div>
                      <div><strong>{t('cropInsurance.estimatedLostProduction')}:</strong> {economicLoss.estimatedLostProduction} quintals</div>
                      <div><strong>{t('cropInsurance.preliminaryEconomicLossTitle')}:</strong> <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#B45309' }}>₹{economicLoss.estimatedEconomicLoss?.toLocaleString('en-IN')}</span></div>
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
