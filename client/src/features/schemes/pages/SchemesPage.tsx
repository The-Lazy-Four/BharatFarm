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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="Government Scheme & Loan Eligibility Wizard" subtitle="Enter your farm profile to see the Central & State schemes you qualify for.">
        <EligibilityForm onSubmit={checkEligibility} isSubmitting={isChecking} />
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
      </Card>

      {matchedSchemes !== null ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Schemes You're Eligible For</h3>
            <Button variant="secondary" size="sm" onClick={reset}>
              Check Again
            </Button>
          </div>

          {assessment && <LoanEligibilityCard assessment={assessment} />}

          {matchedSchemes.length === 0 ? (
            <EmptyState message="No matching schemes found for this profile. Try adjusting your land size or crop." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {matchedSchemes.map(sch => (
                <SchemeCard key={sch.id} scheme={sch} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Browse All Central & State Schemes</h3>
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
  );
};
