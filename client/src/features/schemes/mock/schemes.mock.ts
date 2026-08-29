import { Scheme } from '../types/schemes.types.js';
import { SEEDED_DEMO_SCHEMES } from '../../../../../server/src/modules/schemes/seed/schemes.seed.data.js';

/**
 * Curated dataset containing 27 central and state government agricultural schemes.
 * Used for client-side offline mock fallback and initial state before backend fetch completes.
 */
export const MOCK_SCHEMES: Scheme[] = [...SEEDED_DEMO_SCHEMES];
