import { useState, useEffect, useCallback } from 'react';
import { Scheme, CreditAssessmentResult, EligibilityCheckInput } from '../types/schemes.types.js';
import { SchemesApi } from '../services/schemesApi.js';
import { MOCK_SCHEMES } from '../mock/schemes.mock.js';

export const useSchemes = () => {
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[] | null>(null);
  const [assessment, setAssessment] = useState<CreditAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    SchemesApi.getSchemes()
      .then(data => setAllSchemes(data.length > 0 ? data : MOCK_SCHEMES))
      .catch(() => setAllSchemes(MOCK_SCHEMES))
      .finally(() => setIsLoading(false));
  }, []);

  const checkEligibility = useCallback(async (input: EligibilityCheckInput) => {
    setIsChecking(true);
    setError(null);
    try {
      const [eligible, creditAssessment] = await Promise.all([
        SchemesApi.checkEligibility(input),
        SchemesApi.getLoanAssessment(input.landSizeAcres, input.annualIncome)
      ]);
      setMatchedSchemes(eligible);
      setAssessment(creditAssessment);
    } catch {
      setError('Could not check eligibility right now. Please try again.');
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMatchedSchemes(null);
    setAssessment(null);
    setError(null);
  }, []);

  return { allSchemes, matchedSchemes, assessment, isLoading, isChecking, error, checkEligibility, reset };
};

export const useSchemeDetails = (id: string | undefined) => {
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    SchemesApi.getSchemes()
      .then(data => {
        const all = data.length > 0 ? data : MOCK_SCHEMES;
        setScheme(all.find(s => s.id === id) ?? MOCK_SCHEMES.find(s => s.id === id) ?? null);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  return { scheme, isLoading };
};
