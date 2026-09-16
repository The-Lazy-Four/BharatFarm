import React from 'react';
import { ClimateAssessmentResult } from '../types';
import { useLanguage } from '../../../../context/LanguageContext';

interface Props {
  plan: ClimateAssessmentResult['farmerActionPlan'];
}

export const FarmerActionPlanSection: React.FC<Props> = ({ plan }) => {
  const { t } = useLanguage();

  return (
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
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('climateComponents.timeSeriesGuidance')}
        </span>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
          {t('climateComponents.actionTimelineTitle')}
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* TODAY */}
        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#16A34A', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>today</span>
            <span>{t('climateComponents.today')}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {plan.today.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>

        {/* NEXT 24 HOURS */}
        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
            <span>{t('climateComponents.next24Hours')}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {plan.next24h.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>

        {/* NEXT 48 HOURS */}
        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D97706', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>event_repeat</span>
            <span>{t('climateComponents.next48Hours')}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {plan.next48h.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>

        {/* AFTER WEATHER EVENT */}
        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#7C3AED', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>published_with_changes</span>
            <span>{t('climateComponents.afterWeatherEvent')}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {plan.postEvent.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};
