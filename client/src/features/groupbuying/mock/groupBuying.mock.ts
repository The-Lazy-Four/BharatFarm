import { GroupBuyPool } from '../types/groupBuying.types.js';

/**
 * NOTE: Group Buying has no equivalent feature in the OLD BharatFarm
 * project (verified — no matching files, routes, or UI anywhere in the
 * old repo). This dataset is fresh, built directly from the Stitch
 * `group_buying_skeleton` reference (product card with category,
 * participants/target, time remaining, standard vs bulk price, "Join
 * Group" CTA) rather than adapted from old app logic.
 */
export const MOCK_GROUP_BUYS: GroupBuyPool[] = [
  {
    id: 'group-201',
    itemTitle: 'IFFCO NPK Fertilizer 50kg Bags',
    category: 'fertilizer',
    originalPricePerUnit: 1475,
    discountedPricePerUnit: 1200,
    targetQuantity: 100,
    currentQuantity: 65,
    participantCount: 12,
    status: 'OPEN',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    location: 'Ambala Region, Haryana'
  },
  {
    id: 'group-202',
    itemTitle: 'Certified Hybrid Paddy Seeds (25kg)',
    category: 'seeds',
    originalPricePerUnit: 3200,
    discountedPricePerUnit: 2650,
    targetQuantity: 40,
    currentQuantity: 38,
    participantCount: 9,
    status: 'OPEN',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    location: 'Krishna Region, Andhra Pradesh'
  },
  {
    id: 'group-203',
    itemTitle: 'Power Weeder (4-Stroke) — Shared Purchase',
    category: 'machinery',
    originalPricePerUnit: 42000,
    discountedPricePerUnit: 34500,
    targetQuantity: 10,
    currentQuantity: 10,
    participantCount: 10,
    status: 'THRESHOLD_REACHED',
    deadline: new Date(Date.now() + 86400000 * 1).toISOString(),
    location: 'Ludhiana Region, Punjab'
  },
  {
    id: 'group-204',
    itemTitle: 'DAP Fertilizer 50kg Bags',
    category: 'fertilizer',
    originalPricePerUnit: 1350,
    discountedPricePerUnit: 1150,
    targetQuantity: 80,
    currentQuantity: 22,
    participantCount: 5,
    status: 'OPEN',
    deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    location: 'Hooghly Region, West Bengal'
  }
];
