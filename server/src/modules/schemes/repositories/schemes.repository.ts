import { Scheme, EligibilityCheckRequest, CreditAssessmentResult } from '../types/schemes.types.js';
import { MOCK_SCHEMES } from '../mock/schemes.mock.js';
import { SCHEMES_CONSTANTS } from '../constants/schemes.constants.js';
import { AiClient } from '../../../utils/aiClient.js';
import { logger } from '../../../utils/logger.js';

/**
 * Adapted from the OLD project's `POST /api/schemes` route (server.js),
 * which asked an AI model for real-time, state-specific eligible schemes,
 * with a local-JSON `filterLocalSchemes()` fallback (js/schemes.js) when
 * the AI call failed. Both layers are ported here.
 */
export class SchemesRepository {
  private schemes: Scheme[] = [...MOCK_SCHEMES];

  async findAll(): Promise<Scheme[]> {
    return this.schemes;
  }

  async checkEligibility(request: EligibilityCheckRequest): Promise<Scheme[]> {
    // Ported 1:1 from the OLD app's hardcoded West Bengal landless-farmer
    // override: a landless/sharecropper profile gets ONLY these two
    // schemes, regardless of what an AI call might otherwise suggest.
    if (request.state === 'West Bengal' && Number(request.landSizeAcres) === 0) {
      return this.schemes.filter(s => s.id === 'bhumihin-krishak-bandhu' || s.id === 'krishak-bandhu');
    }

    if (AiClient.isConfigured()) {
      try {
        return await this.matchWithAi(request);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.warn('[Schemes] AI matching failed, falling back to static eligibility filter', { error: message });
      }
    }

    return this.filterStaticSchemes(request);
  }

  private filterStaticSchemes(request: EligibilityCheckRequest): Scheme[] {
    const crop = (request.cropCategory || '').trim().toLowerCase();

    return this.schemes.filter(scheme => {
      if (!scheme.eligibility) return true;
      const landMatch = request.landSizeAcres >= scheme.eligibility.minLandSize && request.landSizeAcres <= scheme.eligibility.maxLandSize;
      const stateMatch = scheme.eligibility.states.includes('All') || scheme.eligibility.states.includes(request.state);
      const cropMatch =
        !crop || scheme.eligibility.crops.includes('All') || scheme.eligibility.crops.some(c => c.toLowerCase() === crop);
      return landMatch && stateMatch && cropMatch;
    });
  }

  private async matchWithAi(request: EligibilityCheckRequest): Promise<Scheme[]> {
    const { state, landSizeAcres, cropCategory } = request;
    const prompt = `You are an expert on Indian government agricultural schemes and subsidies.
A farmer has this profile: State: ${state}, Land Size: ${landSizeAcres} acres, Primary Crop: ${cropCategory || 'General (not specified)'}.

Return a JSON array of government schemes (both Central and ${state} State-specific) this farmer is ELIGIBLE for.
For EACH scheme provide EXACTLY these fields:
{
  "id": "unique-slug",
  "title": "Full Official Scheme Name",
  "department": "Issuing ministry or department",
  "category": "subsidy" | "loan" | "insurance" | "equipment",
  "state": "Central" or "${state}",
  "description": "2-3 sentences explaining what this scheme offers.",
  "eligibilityCriteria": ["short eligibility bullet 1", "short eligibility bullet 2"],
  "requiredDocuments": ["Document 1", "Document 2"],
  "officialUrl": "https://official.gov.in/portal",
  "applySteps": ["Step 1", "Step 2"]
}
Always include PM-KISAN and PMFBY if the farmer qualifies. Return ONLY the raw JSON array, no markdown, no explanation text.`;

    const raw = await AiClient.chat([{ role: 'user', content: prompt }]);
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not parse a JSON array from the AI response');

    const parsed = JSON.parse(jsonMatch[0]) as Scheme[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('AI returned no schemes');
    return parsed;
  }

  async calculateCreditAssessment(landSizeAcres: number, annualIncome?: number): Promise<CreditAssessmentResult> {
    const landComponent = Math.min(150, Math.floor(landSizeAcres * 25));
    const incomeComponent = annualIncome ? Math.min(50, Math.floor(annualIncome / 20000)) : 0;
    const baseScore = Math.min(850, 650 + landComponent + incomeComponent);

    const tier: CreditAssessmentResult['eligibilityTier'] = baseScore > 750 ? 'High' : baseScore > 680 ? 'Moderate' : 'Low';
    const maxEstimatedLoanAmount = Math.round(landSizeAcres * 50000 + (annualIncome ? annualIncome * 0.3 : 0));

    return {
      assessmentScore: baseScore,
      eligibilityTier: tier,
      maxEstimatedLoanAmount,
      assessmentSummary: `Based on a registered farm area of ${landSizeAcres} acres${
        annualIncome ? ` and reported annual income of ₹${annualIncome.toLocaleString('en-IN')}` : ''
      }, this profile shows ${tier.toLowerCase()} credit readiness for institutional Agri-loans.`,
      disclaimer: SCHEMES_CONSTANTS.CREDIT_DISCLAIMER
    };
  }
}
