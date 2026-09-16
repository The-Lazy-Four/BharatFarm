import React from 'react';
import { ClimateAssessmentResult } from '../types';
import { useLanguage } from '../../../../context/LanguageContext';

interface Props {
  procurement: ClimateAssessmentResult['procurementAdvisory'];
  storage: ClimateAssessmentResult['storageAdvisory'];
}

export const PostHarvestSection: React.FC<Props> = ({ procurement, storage }) => {
  const { t } = useLanguage();
  const isProcRisk = procurement.riskLevel.includes('HIGH');
  const isStorRisk = storage.riskLevel.includes('HIGH');

  const formatRiskLevel = (lvl: string) => {
    if (!lvl) return '';
    const lower = lvl.toLowerCase().trim();
    if (lower.includes('severe') || lower.includes('critical')) return t('risk.severe');
    if (lower.includes('high')) return t('risk.high');
    if (lower.includes('moderate') || lower.includes('elevated') || lower.includes('caution')) return t('risk.moderate');
    if (lower.includes('low') || lower.includes('minimal')) return t('risk.low');
    if (lower.includes('safe') || lower.includes('normal')) return t('risk.safe');
    return t(`risk.${lower}` as any) || lvl;
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
        {t('climateComponents.postHarvestTitle').toUpperCase()}
      </span>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
        {/* Procurement */}
        <div style={{
          background: isProcRisk ? '#fffbeb' : '#f8fafc',
          border: `1px solid ${isProcRisk ? '#fde68a' : '#e2e8f0'}`,
          borderRadius: '6px',
          padding: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a' }}>{t('climateComponents.procurementTitle').toUpperCase()}</span>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: isProcRisk ? '#b45309' : '#166534' }}>
              {formatRiskLevel(procurement.riskLevel)}
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#475569', margin: '0.25rem 0 0 0', lineHeight: 1.3 }}>
            {procurement.recommendedWindow || t('climateComponents.bestSellingTime')}
          </p>
        </div>

        {/* Storage */}
        <div style={{
          background: isStorRisk ? '#fee2e2' : '#f8fafc',
          border: `1px solid ${isStorRisk ? '#fca5a5' : '#e2e8f0'}`,
          borderRadius: '6px',
          padding: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a' }}>{t('climateComponents.storageCapacity').toUpperCase()}</span>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: isStorRisk ? '#991b1b' : '#166534' }}>
              {formatRiskLevel(storage.riskLevel)}
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#475569', margin: '0.25rem 0 0 0', lineHeight: 1.3 }}>
            {storage.guidance || t('climateComponents.qualityTips')}
          </p>
        </div>
      </div>
    </div>
  );
};

