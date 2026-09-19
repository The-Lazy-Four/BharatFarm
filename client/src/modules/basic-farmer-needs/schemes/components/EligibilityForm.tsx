import React, { useState } from 'react';
import { Input } from '@core/ui/Input';
import { Button } from '@core/ui/Button';
import { EligibilityCheckInput } from '../types/schemes.types';
import { INDIAN_STATES } from '../constants/schemes.constants';
import { useLanguage } from '../../../../context/LanguageContext';

/**
 * Adapted from the OLD project's 3-step scheme wizard (js/schemes.js:
 * land size → state → crop). Flattened into a single form here since the
 * new architecture doesn't have step/wizard scaffolding, but the same
 * three inputs and validation (land size required and >= 0, state
 * required) are preserved.
 */
export const EligibilityForm: React.FC<{ onSubmit: (input: EligibilityCheckInput) => void; isSubmitting?: boolean }> = ({
  onSubmit,
  isSubmitting
}) => {
  const { t } = useLanguage();
  const [landSizeAcres, setLandSizeAcres] = useState('');
  const [state, setState] = useState('');
  const [cropCategory, setCropCategory] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const land = parseFloat(landSizeAcres);

    if (landSizeAcres === '' || Number.isNaN(land) || land < 0) {
      setError(t('schemes.errLandSize'));
      return;
    }
    if (!state) {
      setError(t('schemes.errState'));
      return;
    }

    setError(null);
    onSubmit({
      landSizeAcres: land,
      state,
      cropCategory: cropCategory.trim(),
      annualIncome: annualIncome ? Number(annualIncome) : undefined
    });
  };

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }} onSubmit={handleSubmit}>
      <Input
        label={t('loan.landSizeLabel')}
        type="number"
        step="0.1"
        placeholder={t('schemes.landSizePlaceholder')}
        value={landSizeAcres}
        onChange={e => setLandSizeAcres(e.target.value)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>{t('auth.state')}</label>
        <select
          value={state}
          onChange={e => setState(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '0.66rem 1rem',
            color: 'var(--text-main)',
            fontSize: '0.95rem'
          }}
        >
          <option value="" disabled>
            {t('auth.selectState')}
          </option>
          {INDIAN_STATES.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Input
        label={t('schemes.primaryCropOptional')}
        placeholder={t('schemes.cropPlaceholder')}
        value={cropCategory}
        onChange={e => setCropCategory(e.target.value)}
      />

      <Input
        label={t('schemes.annualIncomeLabel')}
        type="number"
        placeholder={t('schemes.incomePlaceholder')}
        value={annualIncome}
        onChange={e => setAnnualIncome(e.target.value)}
      />

      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

      <Button type="submit" isLoading={isSubmitting}>
        {t('basicNeeds.verifyEligibility')}
      </Button>
    </form>
  );
};

