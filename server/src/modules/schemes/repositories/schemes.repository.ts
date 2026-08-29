import { Scheme, EligibilityCheckRequest, CreditAssessmentResult, SchemeFilterParams } from '../types/schemes.types.js';
import { MOCK_SCHEMES } from '../mock/schemes.mock.js';
import { SCHEMES_CONSTANTS } from '../constants/schemes.constants.js';
import { AiClient } from '../../../utils/aiClient.js';
import { logger } from '../../../utils/logger.js';
import { config } from '../../../config/env.js';
import { getSupabaseClient } from '../../../config/supabase.js';

export class SchemesRepository {
  private mockSchemes: Scheme[] = [...MOCK_SCHEMES];

  /** Helper to map Supabase public.schemes row to domain Scheme model */
  private mapRowToDomain(row: any): Scheme {
    return {
      id: row.id,
      title: row.title,
      department: row.department,
      category: row.category,
      state: row.state,
      description: row.description,
      eligibilityCriteria: row.eligibility_criteria ?? row.eligibilityCriteria ?? [],
      requiredDocuments: row.required_documents ?? row.requiredDocuments ?? [],
      officialUrl: row.official_url ?? row.officialUrl ?? undefined,
      eligibility: {
        minLandSize: Number(row.eligibility_min_land ?? row.eligibility?.minLandSize ?? 0),
        maxLandSize: Number(row.eligibility_max_land ?? row.eligibility?.maxLandSize ?? 9999),
        states: row.eligibility_states ?? row.eligibility?.states ?? ['All'],
        crops: row.eligibility_crops ?? row.eligibility?.crops ?? ['All']
      },
      applySteps: row.apply_steps ?? row.applySteps ?? []
    };
  }

  async findAll(filters?: SchemeFilterParams): Promise<Scheme[]> {
    if (config.useMockData) {
      let result = [...this.mockSchemes];
      if (filters?.category && filters.category !== 'all') {
        result = result.filter(s => s.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters?.state && filters.state !== 'all') {
        const stateLower = filters.state.toLowerCase();
        result = result.filter(s => s.state.toLowerCase() === stateLower || s.state.toLowerCase() === 'central');
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      }
      return result;
    }

    try {
      const client = getSupabaseClient();
      let query = client.from('schemes').select('*').eq('active', true);

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.state && filters.state !== 'all') {
        query = query.or(`state.eq.${filters.state},state.eq.Central`);
      }

      if (filters?.search) {
        const term = `%${filters.search.trim()}%`;
        query = query.or(`title.ilike.${term},department.ilike.${term},description.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) {
        logger.error('[Schemes Repository] Supabase query failed:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(row => this.mapRowToDomain(row));
    } catch (err) {
      logger.error('[Schemes Repository] Supabase fetch failed. Falling back to mock data if permitted:', err);
      if (!config.useMockData) {
        throw new Error('Failed to fetch government schemes from database');
      }
      return this.mockSchemes;
    }
  }

  async findById(id: string): Promise<Scheme | null> {
    if (config.useMockData) {
      return this.mockSchemes.find(s => s.id === id) || null;
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client.from('schemes').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        logger.error(`[Schemes Repository] Error fetching scheme by id ${id}:`, error);
        throw error;
      }
      return data ? this.mapRowToDomain(data) : null;
    } catch (err) {
      logger.error(`[Schemes Repository] Supabase findById failed for ${id}:`, err);
      if (!config.useMockData) {
        throw new Error(`Failed to fetch government scheme details for ${id}`);
      }
      return this.mockSchemes.find(s => s.id === id) || null;
    }
  }

  async checkEligibility(request: EligibilityCheckRequest): Promise<Scheme[]> {
    // Hardcoded landless/sharecropper override for West Bengal
    if (request.state === 'West Bengal' && Number(request.landSizeAcres) === 0) {
      const all = await this.findAll();
      return all.filter(s => s.id === 'bhumihin-krishak-bandhu' || s.id === 'krishak-bandhu');
    }

    if (!AiClient.isConfigured()) {
      if (!config.useMockData) {
        logger.error('[Schemes] OPENROUTER_API_KEY missing while Mock Mode is false.');
        throw new Error('OPENROUTER_API_KEY is not configured on server');
      }
      return this.filterStaticSchemes(await this.findAll(), request);
    }

    try {
      return await this.matchWithAi(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[Schemes] AI matching failed', { error: message });
      if (!config.useMockData) {
        throw new Error(`Government Schemes AI error: ${message}`);
      }
      return this.filterStaticSchemes(await this.findAll(), request);
    }
  }

  private filterStaticSchemes(schemesList: Scheme[], request: EligibilityCheckRequest): Scheme[] {
    const crop = (request.cropCategory || '').trim().toLowerCase();

    return schemesList.filter(scheme => {
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
