import React from 'react';
import { ClimateAssessmentResult } from '../types';
import { useLanguage } from '../../../../context/LanguageContext';

interface Props {
  assessment: ClimateAssessmentResult;
}

export const RiskSummaryCards: React.FC<Props> = ({ assessment }) => {
  const { t } = useLanguage();

  const getBadge = (level: string) => {
    switch (level) {
      case 'SEVERE':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      case 'HIGH':
        return { bg: '#ffedd5', color: '#c2410c', border: '#fdba74' };
      case 'MODERATE':
        return { bg: '#fef9c3', color: '#854d0e', border: '#fde047' };
      default:
        return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
    }
  };

  const getHarvestBadge = (code: string) => {
    if (code.includes('EARLY') || code.includes('PREPARE')) {
      return { bg: '#ffedd5', color: '#c2410c', border: '#fdba74' };
    }
    if (code.includes('DELAY') || code.includes('PROTECT')) {
      return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
    }
    return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
  };

  const overall = getBadge(assessment.overallRiskLevel);
  const flood = getBadge(assessment.floodRisk.riskLevel);
  const crop = getBadge(assessment.cropRisk.cropRiskLevel);
  const harvest = getHarvestBadge(assessment.harvestAdvisory.actionCode);

  const formatRiskLevel = (lvl: string) => {
    if (!lvl) return '';
    const lower = lvl.toLowerCase().trim();
    if (lower.includes('severe') || lower.includes('critical')) return t('risk.severe');
    if (lower.includes('high')) return t('risk.high');
    if (lower.includes('moderate') || lower.includes('elevated') || lower.includes('caution')) return t('risk.moderate');
    if (lower.includes('low') || lower.includes('minimal')) return t('risk.low');
    if (lower.includes('safe') || lower.includes('normal')) return t('risk.safe');
    if (lower.includes('protect') || lower.includes('drainage')) return t('risk.protectDrainage');
    if (lower.includes('early') || lower.includes('harvest')) return t('risk.harvestNow');
    if (lower.includes('delay')) return t('risk.delayHarvest');
    return t(`risk.${lower}` as any) || lvl;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '0.75rem'
    }}>
      {/* 1. OVERALL RISK */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        border: `1px solid ${overall.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
            {t('risk.overallRisk')}
          </span>
          <span style={{
            background: overall.bg,
            color: overall.color,
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.15rem 0.45rem',
            borderRadius: '4px'
          }}>
            {formatRiskLevel(assessment.overallRiskLevel)}
          </span>
        </div>
        <div style={{ marginTop: '0.4rem' }}>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
            {assessment.overallRiskScore}
            <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 600 }}> / 100</span>
          </div>
          <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px', marginTop: '0.45rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, assessment.overallRiskScore))}%`,
              background: overall.color,
              borderRadius: '2px'
            }} />
          </div>
        </div>
      </div>

      {/* 2. FLOOD RISK */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        border: `1px solid ${flood.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
            {t('risk.floodRisk')}
          </span>
          <span style={{
            background: flood.bg,
            color: flood.color,
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.15rem 0.45rem',
            borderRadius: '4px'
          }}>
            {formatRiskLevel(assessment.floodRisk.riskLevel)}
          </span>
        </div>
        <div style={{ marginTop: '0.4rem' }}>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
            {assessment.floodRisk.floodScore}
            <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 600 }}> / 100</span>
          </div>
          <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px', marginTop: '0.45rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, assessment.floodRisk.floodScore))}%`,
              background: flood.color,
              borderRadius: '2px'
            }} />
          </div>
        </div>
      </div>

      {/* 3. CROP RISK */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        border: `1px solid ${crop.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
            {t('risk.cropRisk')} ({assessment.cropRisk.cropName.toUpperCase()})
          </span>
          <span style={{
            background: crop.bg,
            color: crop.color,
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.15rem 0.45rem',
            borderRadius: '4px'
          }}>
            {formatRiskLevel(assessment.cropRisk.cropRiskLevel)}
          </span>
        </div>
        <div style={{ marginTop: '0.4rem' }}>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
            {assessment.cropRisk.cropRiskScore}
            <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 600 }}> / 100</span>
          </div>
          <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px', marginTop: '0.45rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, assessment.cropRisk.cropRiskScore))}%`,
              background: crop.color,
              borderRadius: '2px'
            }} />
          </div>
        </div>
      </div>

      {/* 4. HARVEST DECISION */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        border: `1px solid ${harvest.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
            {t('risk.harvestDecision')}
          </span>
          <span style={{
            background: harvest.bg,
            color: harvest.color,
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.15rem 0.45rem',
            borderRadius: '4px'
          }}>
            {formatRiskLevel(assessment.harvestAdvisory.actionCode.replace('HARVEST', '').trim() || 'NORMAL')}
          </span>
        </div>
        <div style={{ marginTop: '0.4rem' }}>
          <div style={{
            fontSize: '1.05rem',
            fontWeight: 900,
            color: harvest.color,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {assessment.harvestAdvisory.headline}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.3rem', fontWeight: 600 }}>
            {assessment.cropRisk.cropName} • {assessment.cropRisk.cropStage}
          </div>
        </div>
      </div>
    </div>
  );
};
