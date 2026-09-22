import React, { useState } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';

interface MobileCropInsuranceViewProps {
  claimData: any;
  activeClaimId: string;
  loading: boolean;
  statusMessage: string | null;
  onInitiateClaim: () => void;
  onCheckStatus: () => void;
  onViewReport: () => void;
  onOpenGovernmentDecision: (decision: 'approved' | 'additional_verification' | 'rejected') => void;
}

export const MobileCropInsuranceView: React.FC<MobileCropInsuranceViewProps> = ({
  claimData,
  activeClaimId,
  loading,
  statusMessage,
  onInitiateClaim,
  onCheckStatus,
  onViewReport,
  onOpenGovernmentDecision
}) => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'claim' | 'satellite' | 'officer'>('claim');

  const currentStatus = claimData?.status || 'under_government_verification';
  const aiAssessment = claimData?.aiAssessment;
  const economicLoss = claimData?.economicLoss;
  const satEvidence = claimData?.satelliteEvidence;
  const govtDecision = claimData?.governmentDecision;

  const isApproved = currentStatus === 'approved';
  const isRejected = currentStatus === 'rejected';

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

      {/* 1. Header Banner & Quick Status */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '0.9rem 1rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#DCFCE7',
            color: '#15803D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>verified_user</span>
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
              {t('cropInsurance.headerBadge') || 'Crop Insurance Audit'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              {activeClaimId} • FARM-402
            </div>
          </div>
        </div>

        <div style={{
          padding: '0.3rem 0.55rem',
          borderRadius: '20px',
          background: isApproved ? '#DCFCE7' : isRejected ? '#FEE2E2' : '#FEF3C7',
          color: isApproved ? '#15803D' : isRejected ? '#DC2626' : '#92400E',
          fontWeight: 800,
          fontSize: '0.65rem',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          maxWidth: '130px',
          overflow: 'hidden'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '13px', flexShrink: 0 }}>
            {isApproved ? 'check_circle' : isRejected ? 'cancel' : 'hourglass_top'}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Under Verification'}
          </span>
        </div>
      </div>

      {/* 2. Hero Visual Card: Satellite Telemetry */}
      <div style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        height: '140px',
        border: '1px solid #CBD5E1',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <img
          src={satEvidence?.satelliteImage || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"}
          alt="Satellite farm view"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(15,23,42,0.82) 100%)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.85rem',
          right: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          color: '#FFFFFF'
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#86EFAC', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              ISRO / SENTINEL-2B TELEMETRY
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.2 }}>
              Paddy Field (5.2 Acres)
            </div>
            <div style={{ fontSize: '0.7rem', color: '#E2E8F0', marginTop: '2px' }}>
              Haldia, Purba Medinipur
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            padding: '0.3rem 0.55rem',
            borderRadius: '8px',
            textAlign: 'right',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>NDVI SCORE</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#F87171' }}>
              {satEvidence?.ndviScore || '0.28'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Segmented Pill Tabs */}
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
          onClick={() => setActiveSubTab('claim')}
          style={{
            height: '34px',
            borderRadius: '9px',
            border: 'none',
            background: activeSubTab === 'claim' ? '#16A34A' : 'transparent',
            color: activeSubTab === 'claim' ? '#FFFFFF' : '#475569',
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
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span>
          <span>Claim Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('satellite')}
          style={{
            height: '34px',
            borderRadius: '9px',
            border: 'none',
            background: activeSubTab === 'satellite' ? '#16A34A' : 'transparent',
            color: activeSubTab === 'satellite' ? '#FFFFFF' : '#475569',
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
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>satellite_alt</span>
          <span>AI Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('officer')}
          style={{
            height: '34px',
            borderRadius: '9px',
            border: 'none',
            background: activeSubTab === 'officer' ? '#16A34A' : 'transparent',
            color: activeSubTab === 'officer' ? '#FFFFFF' : '#475569',
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
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>gavel</span>
          <span>Govt Review</span>
        </button>
      </div>

      {/* Status banner feedback */}
      {statusMessage && (
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          color: '#1E40AF',
          fontSize: '0.74rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '10px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 4. Tab 1: Claim Info & Estimated Economic Payout */}
      {activeSubTab === 'claim' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Estimated Loss & Direct Payout Card */}
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '1.5px solid #F59E0B',
            borderRadius: '16px',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('cropInsurance.preliminaryEconomicLossTitle') || 'Calculated Claim Compensation'}
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#78350F', marginTop: '0.1rem' }}>
                  ₹{(economicLoss?.estimatedEconomicLoss || 48960).toLocaleString('en-IN')}
                </div>
              </div>

              <span style={{
                background: '#FFFFFF',
                color: '#92400E',
                padding: '0.2rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.68rem',
                fontWeight: 800,
                border: '1px solid #FCD34D'
              }}>
                PMFBY Direct
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginTop: '0.75rem',
              background: 'rgba(255,255,255,0.65)',
              padding: '0.55rem 0.75rem',
              borderRadius: '10px'
            }}>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#78350F', fontWeight: 700 }}>DAMAGED AREA</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#991B1B' }}>3.7 / 5.2 Acres</div>
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#78350F', fontWeight: 700 }}>MSP BENCHMARK</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#065F46' }}>₹2,400 / Qtl</div>
              </div>
            </div>
          </div>

          {/* Claim Parameters */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '0.85rem 1rem',
            border: '1px solid #E2E8F0',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.65rem'
          }}>
            <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 700 }}>EVENT TYPE</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>Flood / Flash Inundation</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 700 }}>EVENT DATE</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>12 Sep 2026</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 700 }}>SURVEY METHOD</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>Multi-spectral Synthetic</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '0.6rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 700 }}>EXPECTED PAYOUT</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>T+3 Bank Credit</div>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            type="button"
            onClick={onInitiateClaim}
            disabled={loading}
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '12px',
              background: '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {loading ? 'sync' : 'auto_mode'}
            </span>
            <span>{loading ? 'Running Satellite Audit...' : 'Re-run Satellite Scan & Claim'}</span>
          </button>
        </div>
      )}

      {/* 5. Tab 2: AI Satellite Audit */}
      {activeSubTab === 'satellite' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1rem',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#7C3AED', fontSize: '20px' }}>auto_awesome</span>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Gemini Vision Audit</span>
              </div>
              <span style={{
                background: '#F3E8FF',
                color: '#6B21A8',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 800
              }}>
                Confidence: {aiAssessment?.confidence || 'High (94%)'}
              </span>
            </div>

            {/* AI Indicators Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ background: '#FFF1F2', padding: '0.65rem', borderRadius: '10px', border: '1px solid #FECDD3' }}>
                <div style={{ fontSize: '0.62rem', color: '#9F1239', fontWeight: 700 }}>DAMAGE DETECTED</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#E11D48', marginTop: '2px' }}>
                  {aiAssessment?.damageDetected !== false ? 'YES (Severe)' : 'NO'}
                </div>
              </div>
              <div style={{ background: '#FEF3C7', padding: '0.65rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: '0.62rem', color: '#92400E', fontWeight: 700 }}>AFFECTED PERCENT</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#B45309', marginTop: '2px' }}>
                  {aiAssessment?.affectedPercentage || 68}% of Plot
                </div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700 }}>CROP STRESS</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {aiAssessment?.vegetationCondition?.replace(/_/g, ' ') || 'Significant Decline'}
                </div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700 }}>EVENT MATCH</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>
                  {aiAssessment?.eventConsistency?.replace(/_/g, ' ') || 'Consistent with Rain'}
                </div>
              </div>
            </div>

            {/* AI Explanation Box */}
            <div style={{
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              borderRadius: '10px',
              padding: '0.75rem',
              color: '#4C1D95',
              fontSize: '0.78rem',
              lineHeight: 1.45
            }}>
              <strong>AI Diagnostic: </strong>
              {aiAssessment?.summary || "Satellite multi-spectral reflectance confirms heavy surface waterlogging in lower terraces of FARM-402 with drop of NDVI index from 0.74 to 0.28."}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onCheckStatus}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '10px',
                background: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pending_actions</span>
              <span>Claim Status</span>
            </button>
            <button
              type="button"
              onClick={onViewReport}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '10px',
                background: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>summarize</span>
              <span>Full Dossier</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Government Officer Review & Decision */}
      {activeSubTab === 'officer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1rem',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '20px' }}>gavel</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                {t('cropInsurance.govtReviewTitle') || 'Agronomist & Officer Portal'}
              </span>
            </div>
            
            <p style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4, margin: '0 0 0.85rem 0' }}>
              Review satellite vegetation loss verified by Gemini. Issue final direct compensation approval or request on-ground survey.
            </p>

            {govtDecision?.status && govtDecision.status !== 'pending' && (
              <div style={{
                background: govtDecision.status === 'approved' ? '#DCFCE7' : '#FEE2E2',
                border: `1px solid ${govtDecision.status === 'approved' ? '#86EFAC' : '#FECDD3'}`,
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                marginBottom: '0.85rem'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: govtDecision.status === 'approved' ? '#15803D' : '#991B1B' }}>
                  DECISION: {govtDecision.status.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '2px' }}>
                  {govtDecision.remarks || 'Satellite evidence verified and accepted.'}
                </div>
              </div>
            )}

            {/* Quick Action Decision Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onOpenGovernmentDecision('approved')}
                disabled={loading}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  background: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>task_alt</span>
                <span>{t('cropInsurance.approveClaim') || 'Approve & Release ₹48,960'}</span>
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => onOpenGovernmentDecision('additional_verification')}
                  disabled={loading}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '10px',
                    background: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FCD34D',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>find_in_page</span>
                  <span>Field Survey</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenGovernmentDecision('rejected')}
                  disabled={loading}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '10px',
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FECDD3',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
