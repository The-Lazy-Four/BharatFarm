import React from 'react';
import { Card } from '@core/ui/Card';
import { Button } from '@core/ui/Button';
import { Link } from 'react-router-dom';
import { FEATURE_IMAGES } from '@core/constants/featureImages';
import { useLanguage } from '@core/context/LanguageContext';

/* Loan eligibility assessment page — shows credit scoring, evaluation factors, and document checklist */
export const LoanEligibilityPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>{t('loanEligibility.headerBadge')}</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            {t('loanEligibility.pageTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {t('loanEligibility.pageSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid-dashboard">
        {/* Left Column: Credit Assessment Metrics & Score Breakdown */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Assessment Output Card */}
          <Card title={t('loanEligibility.assessmentTitle')} subtitle={t('loanEligibility.assessmentSubtitle')}>
            <div className="alert-success" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-primary">{t('loanEligibility.highEligibility')}</span>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0.25rem 0' }}>
                    {t('loanEligibility.estCreditLimit')}
                  </h2>
                  <p style={{ fontSize: '0.85rem', opacity: 0.88 }}>
                    {t('loanEligibility.basedOnAcres')}
                  </p>
                </div>
                <Link to="/schemes">
                  <Button variant="primary" size="md">{t('loanEligibility.applyViaKCC')}</Button>
                </Link>
              </div>
            </div>

            {/* Key Assessment Factors Grid */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>{t('loanEligibility.keyFactors')}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('loanEligibility.landOwnership')}</span>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{t('loanEligibility.clearTitle')}</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>{t('loanEligibility.verifiedKhatauni')}</span>
              </div>

              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('loanEligibility.ndviHealth')}</span>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{t('loanEligibility.ndviValue')}</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>{t('loanEligibility.lowCropFailure')}</span>
              </div>

              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('loanEligibility.collateralExemption')}</span>
                <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{t('loanEligibility.collateralLimit')}</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>{t('loanEligibility.zeroCollateral')}</span>
              </div>
            </div>
          </Card>

          {/* Recommended Financial Offerings Panel */}
          <Card title={t('loanEligibility.recommendedProducts')} subtitle={t('loanEligibility.recommendedProductsSub')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem' }}>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('loanEligibility.kccTitle')}</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {t('loanEligibility.kccDesc')}
                  </p>
                </div>
                <Link to="/schemes">
                  <Button variant="outline" size="sm">{t('loanEligibility.exploreScheme')}</Button>
                </Link>
              </div>

              <div className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem' }}>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('loanEligibility.solarTitle')}</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {t('loanEligibility.solarDesc')}
                  </p>
                </div>
                <Link to="/schemes">
                  <Button variant="outline" size="sm">{t('loanEligibility.viewPartners')}</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Hero Card & Document Checklist */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Financial Credit Image Hero Card */}
          <div className="card-feature-backed" style={{ minHeight: '150px' }}>
            <img src={FEATURE_IMAGES.schemes.url} alt="Kisan Credit Card" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <span className="badge badge-primary">{t('loanEligibility.nabardBenchmark')}</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>{t('loanEligibility.institutionalCredit')}</h4>
              <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>{t('loanEligibility.fastTrackDesc')}</p>
            </div>
          </div>

          <Card title={t('loanEligibility.docChecklist')} subtitle={t('loanEligibility.docChecklistSub')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="alert-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t('loanEligibility.docAadhaar')}</span>
              </div>
              <div className="alert-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t('loanEligibility.docLandRegistry')}</span>
              </div>
              <div className="alert-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t('loanEligibility.docMandiReceipts')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
