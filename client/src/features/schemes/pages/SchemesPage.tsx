import React from 'react';
import { Card } from '../../../components/ui/Card.js';
import { Button } from '../../../components/ui/Button.js';
import { EligibilityForm } from '../components/EligibilityForm.js';
import { SchemeCard } from '../components/SchemeCard.js';
import { LoanEligibilityCard } from '../components/LoanEligibilityCard.js';
import { useSchemes } from '../hooks/useSchemes.js';
import { Spinner } from '../../../components/ui/Spinner.js';
import { EmptyState } from '../../../components/ui/EmptyState.js';

export const SchemesPage: React.FC = () => {
  const { allSchemes, matchedSchemes, assessment, isLoading, isChecking, error, checkEligibility, reset } = useSchemes();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Government DB Sync • Verified</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--dark-text)' }}>
            Government Schemes & Direct Subsidies
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
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
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-text)' }}>Matched Schemes ({matchedSchemes.length})</h3>
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-text)' }}>Available Central & State Schemes</h3>
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

        {/* Right Column (Span 4): Scheme Detail Preview & Official Source Proof (Stitch reference) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Scheme Criteria Preview Panel */}
          <Card title="Featured Scheme Preview" subtitle="PM-KISAN Samman Nidhi Scheme">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(215, 242, 26, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--signal-lime)' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-text)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span> Target Demographic & Eligibility
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                  Small and marginal landholder farmer families with cultivable landholding up to 2 hectares.
                </p>
              </div>

              <div style={{ padding: '0.75rem', background: '#FFFDF5', borderRadius: 'var(--radius-sm)', border: '1px solid #FCD34D' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-text)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>featured_play_list</span> Direct Benefits
                </h5>
                <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', paddingLeft: '1.2rem', lineHeight: '1.4', margin: 0 }}>
                  <li>₹6,000 per year direct income support in 3 equal installments.</li>
                  <li>Direct Benefit Transfer (DBT) into Aadhaar linked bank account.</li>
                </ul>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--card-gray)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,37,31,0.1)' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-text)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span> Required Documents
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                  Aadhaar Card, Land Record Certificate (Khatauni), Active Bank Passbook.
                </p>
              </div>
            </div>
          </Card>

          {/* Source Verification Trust Note */}
          <Card title="Official Government Verification">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Information provided is synchronized daily from official portal (<code>pmkisan.gov.in</code>). BharatFarm verifies criteria eligibility automatically.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
