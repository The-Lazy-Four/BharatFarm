import { getSupabaseAdminClient } from '../../../config/supabase.js';
import { logger } from '../../../utils/logger.js';
import { SEEDED_DEMO_SCHEMES } from './schemes.seed.data.js';

/**
 * Idempotent seed function for public.schemes table.
 * Ensures the schemes module is populated with 27 realistic central and state
 * government agricultural schemes without inserting duplicate records on repeated server restarts.
 */
export const seedGovernmentSchemes = async (): Promise<void> => {
  try {
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      logger.warn('[SCHEMES SEED] Supabase Admin client unavailable. Skipping DB seed.');
      return;
    }

    // 1. Check existing schemes in public.schemes
    const { data: existing, error: queryError } = await adminClient
      .from('schemes')
      .select('id');

    if (queryError) {
      logger.error('[SCHEMES SEED] Failed to query existing schemes:', queryError);
      return;
    }

    // If database already has 20+ schemes, consider it fully seeded
    if (existing && existing.length >= 20) {
      logger.info(`[SCHEMES SEED] Database already contains ${existing.length} government schemes. Skipping seed.`);
      return;
    }

    const existingIds = new Set((existing || []).map(s => s.id));

    // Map domain fields to DB column layout
    const itemsToInsert = SEEDED_DEMO_SCHEMES
      .filter(s => !existingIds.has(s.id))
      .map(s => ({
        id: s.id,
        title: s.title,
        department: s.department,
        category: s.category,
        state: s.state,
        description: s.description,
        eligibility_criteria: s.eligibilityCriteria,
        required_documents: s.requiredDocuments,
        official_url: s.officialUrl || null,
        eligibility_min_land: s.eligibility?.minLandSize ?? 0,
        eligibility_max_land: s.eligibility?.maxLandSize ?? 9999,
        eligibility_states: s.eligibility?.states ?? ['All'],
        eligibility_crops: s.eligibility?.crops ?? ['All'],
        apply_steps: s.applySteps ?? [],
        active: true
      }));

    if (itemsToInsert.length === 0) {
      logger.info('[SCHEMES SEED] All seeded government schemes already exist in database. No new records inserted.');
      return;
    }

    // 2. Perform bulk upsert/insert using Supabase Admin Client (bypassing RLS for system seed)
    const { data: inserted, error: insertError } = await adminClient
      .from('schemes')
      .upsert(itemsToInsert, { onConflict: 'id' })
      .select('id');

    if (insertError) {
      logger.error('[SCHEMES SEED] Error seeding government schemes into Supabase:', insertError);
    } else {
      logger.info(`[SCHEMES SEED] Successfully seeded ${inserted?.length || 0} government schemes into Supabase.`);
    }
  } catch (err) {
    logger.error('[SCHEMES SEED] Unexpected failure during government schemes seed execution:', err);
  }
};
