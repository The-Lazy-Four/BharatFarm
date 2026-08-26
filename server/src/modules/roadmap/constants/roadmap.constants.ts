// ============================================================
// Crop Roadmap — Constants
// ============================================================

/** Timeout for roadmap AI generation (60s — allows for complete response). */
export const ROADMAP_AI_TIMEOUT_MS = 60_000;

/** Max tokens for roadmap JSON (4096 ensures 12-14 activities are never truncated). */
export const ROADMAP_MAX_TOKENS = 4096;

/** Category icon mapping for the frontend */
export const ROADMAP_CATEGORY_ICONS: Record<string, string> = {
  land_preparation: '🚜',
  sowing: '🌱',
  irrigation: '💧',
  fertilization: '🌿',
  nutrient_management: '🧪',
  pest_monitoring: '🐛',
  disease_monitoring: '🦠',
  weed_management: '🌾',
  pruning_thinning: '✂️',
  flowering: '🌸',
  fruiting: '🍅',
  harvesting: '🌾',
  post_harvest: '📦',
  general: '📋'
};
