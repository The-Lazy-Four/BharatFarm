import React from 'react';
import { Card } from '@core/ui/Card';
import { Button } from '@core/ui/Button';
import { EligibilityForm } from '../components/EligibilityForm';
import { SchemeCard } from '../components/SchemeCard';
import { LoanEligibilityCard } from '../components/LoanEligibilityCard';
import { useSchemes } from '../hooks/useSchemes';
import { Spinner } from '@core/ui/Spinner';
import { EmptyState } from '@core/ui/EmptyState';
import { FEATURE_IMAGES } from '@core/constants/featureImages';
import { useLanguage } from '../../../../context/LanguageContext';

export const SchemesPage: React.FC = () => {
  const { allSchemes, matchedSchemes, assessment, isLoading, isChecking, error, checkEligibility, reset } = useSchemes();
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>{t('schemes.dbtSyncVerified')}</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            {t('basicNeeds.schemesTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {t('moduleHome.subsidiesTitle')}
          </p>
        </div>
      </div>

      {/* Main Grid Layout matching Stitch */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Scheme Catalog & Eligibility Wizard */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title={t('schemes.eligibilityWizardTitle')} subtitle={t('schemes.eligibilityWizardSub')}>
            <EligibilityForm onSubmit={checkEligibility} isSubmitting={isChecking} />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
          </Card>

          {matchedSchemes !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('schemes.matchedSchemesCount', { count: matchedSchemes.length })}</h3>
                <Button variant="secondary" size="sm" onClick={reset}>
                  {t('schemes.resetFilter')}
                </Button>
              </div>

              {assessment && <LoanEligibilityCard assessment={assessment} />}

              {matchedSchemes.length === 0 ? (
                <EmptyState message={t('schemes.noMatchingSchemes')} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {matchedSchemes.map(sch => (
                    <SchemeCard key={sch.id} scheme={sch} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('schemes.availableSchemesTitle')}</h3>
              {isLoading ? (
                <Spinner />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {allSchemes.map(sch => (
                    <SchemeCard key={sch.id} scheme={sch} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (Span 4): Government Welfare Hero Card & Scheme Criteria Preview */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Government Welfare Hero Card */}
          <div className="card-feature-backed" style={{ minHeight: '140px' }}>
            <img src={FEATURE_IMAGES.schemes.url} alt="Government Schemes" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <span className="badge badge-primary">{t('schemes.dbtBadge')}</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>{t('schemes.pmKisanTitle')}</h4>
              <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>{t('schemes.pmKisanDesc')}</p>
            </div>
          </div>

          {/* Scheme Criteria Preview Panel */}
          <Card title={t('schemes.featuredPreviewTitle')} subtitle={t('schemes.pmKisanSub')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="alert-success">
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span> {t('schemes.targetDemographicTitle')}
                </h5>
                <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.25rem', lineHeight: '1.4' }}>
                  {t('schemes.targetDemographicDesc')}
                </p>
              </div>

              <div className="alert-info">
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span> {t('schemes.benefitStructureTitle')}
                </h5>
                <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.25rem', lineHeight: '1.4' }}>
                  {t('schemes.benefitStructureDesc')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

