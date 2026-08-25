import React from 'react';
import { Card } from '../../../components/ui/Card.js';
import { Button } from '../../../components/ui/Button.js';
import { EligibilityForm } from '../components/EligibilityForm.js';
import { SchemeCard } from '../components/SchemeCard.js';
import { LoanEligibilityCard } from '../components/LoanEligibilityCard.js';
import { useSchemes } from '../hooks/useSchemes.js';
import { Spinner } from '../../../components/ui/Spinner.js';
import { EmptyState } from '../../../components/ui/EmptyState.js';
import { FEATURE_IMAGES } from '../../../constants/featureImages.js';

export const SchemesPage: React.FC = () => {
  const { allSchemes, matchedSchemes, assessment, isLoading, isChecking, error, checkEligibility, reset } = useSchemes();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Government DB Sync • Verified</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Government Schemes & Direct Subsidies
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Discover and apply for verified government support programs tailored to your farm profile.
          </p>
        </div>
      </div>

      {/* Main Grid Layout matching Stitch */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Scheme Catalog & Eligibility Wizard */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Eligibility Wizard" subtitle="Enter your landholding details to filter eligible government programs.">
            <EligibilityForm onSubmit={checkEligibility} isSubmitting={isChecking} />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
          </Card>

          {matchedSchemes !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Matched Schemes ({matchedSchemes.length})</h3>
                <Button variant="secondary" size="sm" onClick={reset}>
                  Reset Filter
                </Button>
              </div>

              {assessment && <LoanEligibilityCard assessment={assessment} />}

              {matchedSchemes.length === 0 ? (
                <EmptyState message="No matching schemes found for this profile. Try adjusting your land size or crop parameters." />
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Available Central & State Schemes</h3>
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
              <span className="badge badge-primary">Direct Benefit Transfer</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>PM-KISAN & Subsidies</h4>
              <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>Instant DBT credit tracking & simple online application portal.</p>
            </div>
          </div>

          {/* Scheme Criteria Preview Panel */}
          <Card title="Featured Scheme Preview" subtitle="PM-KISAN Samman Nidhi Scheme">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="alert-success">
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span> Target Demographic & Eligibility
                </h5>
                <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.25rem', lineHeight: '1.4' }}>
                  Small and marginal landholder farmer families with cultivable landholding up to 2 hectares.
                </p>
              </div>

              <div className="alert-info">
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span> Benefit Structure
                </h5>
                <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.25rem', lineHeight: '1.4' }}>
                  Financial benefit of ₹6,000/- per year per family payable in three equal four-monthly installments.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
