import React from 'react';
import { CreditAssessmentResult } from '../types/schemes.types';
import { Card } from '@core/ui/Card';
import { Badge } from '@core/ui/Badge';
import { formatLoanAmount } from '../utils/schemes.utils';
import { useLanguage } from '../../../../context/LanguageContext';

export const LoanEligibilityCard: React.FC<{ assessment: CreditAssessmentResult }> = ({ assessment }) => {
  const { t } = useLanguage();

  return (
    <Card title={t('schemes.loanAssessmentTitle')} action={<Badge variant="primary">{t('schemes.tierLabel', { tier: assessment.eligibilityTier })}</Badge>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{assessment.assessmentScore}</div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('schemes.estimatedCreditLimit')}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatLoanAmount(assessment.maxEstimatedLoanAmount)}</p>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{assessment.assessmentSummary}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
          ⚠️ {assessment.disclaimer}
        </p>
      </div>
    </Card>
  );
};

