import { getSupabaseAdminClient } from '../../../config/supabase.js';
import { logger } from '../../../utils/logger.js';
import { SEEDED_DEMO_PRODUCTS } from './marketplace.seed.data.js';

/**
 * Idempotent seed function for public.marketplace_products table.
 * Ensures the marketplace is populated with realistic demo agricultural listings
 * without inserting duplicate records on repeated server restarts.
 */
export const seedMarketplaceProducts = async (): Promise<void> => {
  try {
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      logger.warn('[MARKETPLACE SEED] Supabase Admin client unavailable. Skipping DB seed.');
      return;
    }

    // 1. Check existing products in Supabase
    const { data: existing, error: countError } = await adminClient
      .from('marketplace_products')
      .select('id, title');

    if (countError) {
      logger.error('[MARKETPLACE SEED] Failed to query existing marketplace_products:', countError);
      return;
    }

    // If database already contains 15+ products, consider it seeded
    if (existing && existing.length >= 15) {
      logger.info(`[MARKETPLACE SEED] Database already contains ${existing.length} listings. Skipping seed.`);
      return;
    }

    // 2. Fetch a valid profile ID from public.profiles to link products to
    const { data: profiles, error: profileError } = await adminClient
      .from('profiles')
      .select('id')
      .limit(1);

    if (profileError || !profiles || profiles.length === 0) {
      logger.warn('[MARKETPLACE SEED] No user profile found in database to attach seed listings to. Skipping seed.');
      return;
    }

    const validSellerId = profiles[0].id;
    logger.info(`[MARKETPLACE SEED] Attaching seeded listings to valid profile ID: ${validSellerId}`);

    // Create a title lookup set of existing items to prevent duplicates
    const existingTitles = new Set((existing || []).map((item) => item.title.toLowerCase().trim()));

    const itemsToInsert = SEEDED_DEMO_PRODUCTS
      .filter((p) => !existingTitles.has(p.title.toLowerCase().trim()))
      .map((p) => ({
        title: p.title,
        category: p.category,
        price: p.price,
        unit: p.unit,
        quantity_available: p.quantityAvailable,
        location: p.location,
        seller_id: validSellerId, // Attach to real FK
        seller_name: p.sellerName,
        seller_rating: p.sellerRating,
        seller_phone: p.sellerPhone,
        seller_whatsapp: p.sellerWhatsapp,
        verified: p.verified,
        image_url: p.imageUrl
      }));

    if (itemsToInsert.length === 0) {
      logger.info('[MARKETPLACE SEED] All 42 demo products already exist in database. No new items inserted.');
      return;
    }

    // 3. Perform bulk insert via Supabase Admin client (bypasses RLS for system seed)
    const { data: inserted, error: insertError } = await adminClient
      .from('marketplace_products')
      .insert(itemsToInsert)
      .select('id');

    if (insertError) {
      logger.error('[MARKETPLACE SEED] Error seeding marketplace products:', insertError);
    } else {
      logger.info(`[MARKETPLACE SEED] Successfully seeded ${inserted?.length || 0} agricultural listings into Supabase.`);
    }
  } catch (err) {
    logger.error('[MARKETPLACE SEED] Unexpected failure during marketplace seed execution:', err);
  }
};
