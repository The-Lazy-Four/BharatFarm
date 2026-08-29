import { RoadmapItem, RoadmapActivity } from '../types/roadmap.types.js';

export function calculateActivityDates(startDate: string, days: number[]): string[] {
  const base = new Date(startDate);
  if (isNaN(base.getTime())) return days.map(() => new Date().toISOString().split('T')[0]);

  return days.map(d => {
    const next = new Date(base);
    next.setDate(base.getDate() + (d - 1));
    return next.toISOString().split('T')[0];
  });
}

export interface SeedCropRoadmap {
  crop: string;
  activities: Omit<RoadmapActivity, 'date'>[];
}

export const SEEDED_CROP_ROADMAPS: Record<string, Omit<RoadmapActivity, 'date'>[]> = {
  Rice: [
    { day: 1, stage: 'Land Preparation', title: 'Nursery Bed Preparation', task: 'Prepare a raised seedbed and apply well-rotted FYM (Farmyard Manure).', inputs: ['FYM', 'Spade'] },
    { day: 5, stage: 'Seed Preparation', title: 'Seed Treatment & Sowing', task: 'Treat rice seeds with Trichoderma viride and sow in nursery bed.', inputs: ['Rice Seeds', 'Trichoderma'] },
    { day: 21, stage: 'Land Preparation', title: 'Main Field Puddling', task: 'Flood main field and puddle soil twice with cultivator to seal water bed.', inputs: ['Tractor', 'Puddler'] },
    { day: 25, stage: 'Transplanting', title: 'Seedling Transplanting', task: 'Transplant 25-day old seedlings at 20cm x 15cm spacing, 2-3 per hill.', inputs: ['Seedlings'] },
    { day: 35, stage: 'Nutrition', title: 'Basal Fertilizer Application', task: 'Broadcast initial dose of Urea, SSP, and MOP into shallow water.', inputs: ['Urea', 'SSP', 'MOP'] },
    { day: 45, stage: 'Weed Management', title: 'Hand Weeding / Cono-weeder', task: 'Run cono-weeder between rows to aerate soil and remove broadleaf weeds.', inputs: ['Cono-weeder'] },
    { day: 60, stage: 'Nutrition', title: 'Tillering Top-Dressing', task: 'Apply second dose of Nitrogen fertilizer at maximum tillering stage.', inputs: ['Urea'] },
    { day: 75, stage: 'Pest Monitoring', title: 'Stem Borer Inspection', task: 'Inspect for dead hearts or white heads. Spray Neem-based bio-pesticide if needed.', inputs: ['Neem Oil'] },
    { day: 90, stage: 'Irrigation', title: 'Panicle Initiation Water Management', task: 'Maintain 3-5 cm standing water layer during flowering and panicle emergence.', inputs: ['Canal / Pump Water'] },
    { day: 110, stage: 'Harvesting Preparation', title: 'Field Drainage', task: 'Drain remaining field water 10 days before expected harvest date.', inputs: ['Drainage Channel'] },
    { day: 120, stage: 'Harvesting', title: 'Paddy Harvesting', task: 'Harvest grain when 80-85% of panicles turn straw yellow.', inputs: ['Sickle / Combine Harvester'] },
    { day: 125, stage: 'Post-Harvest', title: 'Threshing & Drying', task: 'Thresh paddy and sun-dry grains down to 12-14% moisture level for storage.', inputs: ['Tarpaulin Sheet'] }
  ],
  Wheat: [
    { day: 1, stage: 'Land Preparation', title: 'Pre-Sowing Irrigation', task: 'Apply heavy watering (Palewa) to ensure deep seedbed moisture.', inputs: ['Water Pump'] },
    { day: 5, stage: 'Land Preparation', title: 'Deep Ploughing', task: 'Plough field with disc harrow followed by planking to create fine tilth.', inputs: ['Tractor', 'Harrow'] },
    { day: 8, stage: 'Sowing', title: 'Seed Sowing with Ferti-Drill', task: 'Sow treated wheat seeds along with basal NPK fertilizer using seed drill.', inputs: ['Wheat Seeds', 'NPK 12:32:16', 'Ferti-Drill'] },
    { day: 21, stage: 'Irrigation', title: 'CRI Stage First Irrigation', task: 'Irrigate field critical root initiation (CRI) stage. Do not delay.', inputs: ['Canal / Borewell'] },
    { day: 25, stage: 'Nutrition', title: 'First Nitrogen Top-Dressing', task: 'Broadcast first dose of Urea immediately after CRI irrigation when soil dries slightly.', inputs: ['Urea'] },
    { day: 35, stage: 'Weed Management', title: 'Weedicide Spraying', task: 'Spray Clodinafop-propargyl for phalaris minor / grassy weed control.', inputs: ['Herbicides', 'Knapsack Sprayer'] },
    { day: 45, stage: 'Irrigation', title: 'Tillering Stage Irrigation', task: 'Apply second irrigation at active tillering phase.', inputs: ['Irrigation Pipeline'] },
    { day: 65, stage: 'Pest Monitoring', title: 'Aphid & Rust Monitoring', task: 'Check undersides of leaves for yellow rust spores or green aphids.', inputs: ['Magnifying Glass'] },
    { day: 85, stage: 'Irrigation', title: 'Heading & Flowering Water', task: 'Provide gentle irrigation during earhead emergence. Avoid high wind days.', inputs: ['Drip / Flood Water'] },
    { day: 105, stage: 'Irrigation', title: 'Milking & Dough Stage Water', task: 'Apply final light irrigation during grain filling stage to improve kernel weight.', inputs: ['Borewell'] },
    { day: 125, stage: 'Harvesting', title: 'Grain Harvesting', task: 'Harvest crop when grain becomes hard and moisture drops below 15%.', inputs: ['Combine Harvester'] },
    { day: 130, stage: 'Post-Harvest', title: 'Bagging & Storage', task: 'Clean wheat grain and store in dry gunny bags treated with neem leaves.', inputs: ['Gunny Bags'] }
  ],
  Tomato: [
    { day: 1, stage: 'Land Preparation', title: 'Bed Formation & FYM', task: 'Make raised beds 90cm wide and mix 10 tonnes FYM per acre.', inputs: ['FYM', 'Bed Maker'] },
    { day: 3, stage: 'Irrigation', title: 'Drip System Setup & Mulching', task: 'Lay drip lateral lines and cover beds with 25-micron silver-black plastic mulch.', inputs: ['Drip Pipe', 'Plastic Mulch'] },
    { day: 10, stage: 'Transplanting', title: 'Healthy Seedling Planting', task: 'Transplant 25-day healthy tomato seedlings into mulch holes at 45cm spacing.', inputs: ['Tomato Seedlings'] },
    { day: 20, stage: 'Nutrition', title: 'Fertigation Start', task: 'Provide Water Soluble Fertilizer 19:19:19 through drip fertigation.', inputs: ['WSF 19:19:19'] },
    { day: 30, stage: 'Staking', title: 'Trellising & Staking', task: 'Erect wooden poles and tie tomato vines with GI wire to support heavy fruiting.', inputs: ['Bamboo Poles', 'Wire'] },
    { day: 40, stage: 'Pest Monitoring', title: 'Whitefly & Leaf Miner Check', task: 'Install yellow sticky traps (15 per acre) for early sucking pest control.', inputs: ['Yellow Sticky Traps'] },
    { day: 55, stage: 'Flowering', title: 'Calcium & Boron Spray', task: 'Foliar spray Boron and Calcium to prevent blossom end rot in early fruits.', inputs: ['Chelated Calcium', 'Boron'] },
    { day: 70, stage: 'Harvesting', title: 'First Picking (Breaker Stage)', task: 'Pick tomatoes at pink/breaker stage for distant market transport.', inputs: ['Plastic Crates'] },
    { day: 85, stage: 'Harvesting', title: 'Peak Harvest Picking', task: 'Harvest ripe red tomatoes every 3-4 days.', inputs: ['Crates'] },
    { day: 110, stage: 'Post-Harvest', title: 'Sorting & Grading', task: 'Grade tomatoes by size and firmness before dispatching to local mandi.', inputs: ['Sorting Tray'] }
  ],
  Potato: [
    { day: 1, stage: 'Seed Preparation', title: 'Tuber Breaking & Sprouting', task: 'Bring certified seed tubers out of cold storage and allow chitting in shade.', inputs: ['Seed Tubers'] },
    { day: 7, stage: 'Land Preparation', title: 'Deep Tillage & Ridging', task: 'Plough field thrice and add well-decomposed FYM and single superphosphate.', inputs: ['Tractor', 'Plough', 'SSP'] },
    { day: 12, stage: 'Sowing', title: 'Tuber Planting on Ridges', task: 'Plant sprouted tubers 15cm apart on ridges spaced 50cm apart.', inputs: ['Planter Machine'] },
    { day: 25, stage: 'Irrigation', title: 'Light First Irrigation', task: 'Irrigate furrows up to two-thirds ridge height. Avoid submerging top ridge.', inputs: ['Canal Water'] },
    { day: 35, stage: 'Earthing Up', title: 'Soil Earthing & Top Dressing', task: 'Apply Urea between rows and earth up soil around plants to cover developing tubers.', inputs: ['Hoe / Ridger'] },
    { day: 50, stage: 'Disease Monitoring', title: 'Late Blight Preventive Spray', task: 'Spray Mancozeb at first sign of humid fog to protect against late blight fungus.', inputs: ['Mancozeb', 'Sprayer'] },
    { day: 70, stage: 'Irrigation', title: 'Tuber Bulking Water', task: 'Maintain optimum moisture during maximum tuber development phase.', inputs: ['Borewell Water'] },
    { day: 90, stage: 'Harvesting Preparation', title: 'Haulm Cutting (Dehaulming)', task: 'Cut top green foliage 12 days before digging to harden tuber skins.', inputs: ['Sickle'] },
    { day: 105, stage: 'Harvesting', title: 'Tuber Digging & Curing', task: 'Dig out potato tubers carefully in clear dry weather and cure in shade.', inputs: ['Potato Digger'] }
  ],
  Maize: [
    { day: 1, stage: 'Land Preparation', title: 'Ploughing & Fine Tilth', task: 'Plough field twice and level using planker to conserve soil moisture.', inputs: ['Plough', 'Planker'] },
    { day: 5, stage: 'Sowing', title: 'Hybrid Seed Sowing', task: 'Sow hybrid maize seeds at 60cm x 20cm spacing with basal NPK application.', inputs: ['Hybrid Maize Seeds', 'NPK 20:20:0'] },
    { day: 15, stage: 'Weed Management', title: 'Pre-emergence Herbicide', task: 'Spray Atrazine within 3 days of sowing to prevent early broadleaf weeds.', inputs: ['Atrazine'] },
    { day: 30, stage: 'Nutrition', title: 'Knee-High Stage Top Dressing', task: 'Apply second dose of Nitrogen around plant base and earth up ridges.', inputs: ['Urea'] },
    { day: 45, stage: 'Pest Monitoring', title: 'Fall Armyworm Monitoring', task: 'Check whorls for sawdust-like frass indicating armyworm. Apply bio-agent if found.', inputs: ['Pheromone Traps'] },
    { day: 65, stage: 'Flowering', title: 'Tasseling & Silking Water', task: 'Ensure adequate irrigation during tasseling and silking to maximize cob size.', inputs: ['Pump Water'] },
    { day: 95, stage: 'Harvesting', title: 'Cob Harvesting', task: 'Harvest cobs when outer husk turns light brown and kernels feel hard.', inputs: ['Manual Labor'] }
  ],
  Mustard: [
    { day: 1, stage: 'Land Preparation', title: 'Field Levelling & Moisture Check', task: 'Prepare fine seedbed after conserving post-monsoon soil moisture.', inputs: ['Leveler'] },
    { day: 5, stage: 'Sowing', title: 'Line Sowing with Sulphur', task: 'Sow mustard seeds with single super phosphate and Elemental Sulphur.', inputs: ['Mustard Seeds', 'Sulphur', 'SSP'] },
    { day: 25, stage: 'Irrigation', title: 'First Branching Irrigation', task: 'Apply first light irrigation 25 days after sowing at primary branching stage.', inputs: ['Borewell'] },
    { day: 40, stage: 'Thinning', title: 'Plant Thinning & Weeding', task: 'Maintain 10-15cm distance between plants by pulling out overcrowded seedlings.', inputs: ['Hoe'] },
    { day: 60, stage: 'Pest Monitoring', title: 'Mustard Aphid Control', task: 'Monitor flowering tops for aphid clusters. Spray Dimethoate if infestation exceeds threshold.', inputs: ['Bio Insecticide'] },
    { day: 100, stage: 'Harvesting', title: 'Early Morning Harvesting', task: 'Harvest pods when 75% turn golden yellow to avoid shattering losses.', inputs: ['Sickle'] }
  ],
  Cotton: [
    { day: 1, stage: 'Land Preparation', title: 'Deep Summer Tillage', task: 'Plough field deeply to destroy soil pupae and weed seeds.', inputs: ['Disc Plough'] },
    { day: 10, stage: 'Sowing', title: 'Bt Cotton Dibbling', task: 'Dibble seeds on ridges spaced 90cm x 45cm under moist soil.', inputs: ['Bt Cotton Seeds'] },
    { day: 30, stage: 'Weed Management', title: 'Intercultivation & Hoeing', task: 'Run blade harrow between cotton rows to control early weeds.', inputs: ['Blade Harrow'] },
    { day: 60, stage: 'Nutrition', title: 'Square Formation Fertigation', task: 'Apply NPK 13:0:45 top dressing at floral bud emergence.', inputs: ['KNO3'] },
    { day: 90, stage: 'Pest Monitoring', title: 'Pink Bollworm Trap Check', task: 'Install pink bollworm pheromone traps (8/acre) to monitor moth activity.', inputs: ['Pheromone Traps'] },
    { day: 140, stage: 'Harvesting', title: 'First Cotton Picking', task: 'Pick clean, fully opened cotton bolls in dry sunny afternoons.', inputs: ['Cotton Bags'] }
  ],
  Onion: [
    { day: 1, stage: 'Land Preparation', title: 'Flat Bed Preparation', task: 'Form flat beds 2m x 1m size and incorporate FYM.', inputs: ['FYM', 'Rake'] },
    { day: 15, stage: 'Transplanting', title: 'Seedling Transplanting', task: 'Transplant 45-day nursery seedlings at 15cm x 10cm spacing.', inputs: ['Onion Seedlings'] },
    { day: 35, stage: 'Nutrition', title: 'Bulb Initiation Top Dressing', task: 'Apply Urea and Potash to encourage uniform bulb initiation.', inputs: ['Urea', 'MOP'] },
    { day: 60, stage: 'Disease Monitoring', title: 'Purple Blotch Check', task: 'Inspect foliage for purple lesions. Spray Copper Oxychloride if spotted.', inputs: ['Copper Fungicide'] },
    { day: 110, stage: 'Harvesting Preparation', title: 'Neck Fall Monitoring', task: 'Stop irrigation when 50% of plant tops naturally fall over.', inputs: ['Water Control'] },
    { day: 120, stage: 'Harvesting', title: 'Bulb Uprooting & Curing', task: 'Uproot onion bulbs and cure with foliage attached in field shade for 5 days.', inputs: ['Curing Shed'] }
  ],
  Mango: [
    { day: 1, stage: 'Land Preparation', title: 'Pit Digging & Solarization', task: 'Dig 1m x 1m x 1m pits and expose to summer sunlight for 15 days.', inputs: ['Spade'] },
    { day: 15, stage: 'Planting', title: 'Grafted Sapling Planting', task: 'Fill pit with topsoil, FYM, and neem cake, then plant high-yield graft sapling.', inputs: ['Mango Sapling', 'Neem Cake'] },
    { day: 45, stage: 'Irrigation', title: 'Basin Drip Irrigation', task: 'Establish drip ring around tree canopy basin for young sapling growth.', inputs: ['Drip Ring'] },
    { day: 120, stage: 'Nutrition', title: 'Post-Monsoon Manuring', task: 'Apply organic compost and micronutrient mixture around root zone.', inputs: ['Compost', 'Micronutrients'] }
  ],
  Pulses: [
    { day: 1, stage: 'Land Preparation', title: 'Field Levelling', task: 'Plough field once to prepare a loose seedbed for pulse crop.', inputs: ['Plough'] },
    { day: 5, stage: 'Sowing', title: 'Rhizobium Seed Treatment', task: 'Treat chickpea/pigeonpea seeds with Rhizobium culture and PSB before line sowing.', inputs: ['Pulse Seeds', 'Rhizobium Culture'] },
    { day: 30, stage: 'Nutrition', title: 'Foliar DAP Spray', task: 'Spray 2% DAP solution at flowering start to boost pod setting.', inputs: ['DAP', 'Sprayer'] },
    { day: 80, stage: 'Harvesting', title: 'Pod Harvesting', task: 'Harvest pods when plants turn golden brown and pods rattle on shaking.', inputs: ['Sickle'] }
  ]
};
