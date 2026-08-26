import { CropRoadmapRequest } from '../types/roadmap.types.js';

export function buildRoadmapSystemPrompt(): string {
  return [
    'You are BharatFarm crop planner for Indian agriculture.',
    'Return ONLY compact JSON. No markdown, no comments, no extra text.',
    'Generate 12-14 activities covering the full crop cycle.',
    'Stages to cover: land preparation, sowing/transplanting, irrigation, fertilization, weed management, pest/disease monitoring, growth stages, harvesting.',
    'Rules:',
    '- title: max 6 words',
    '- task: exactly 1 short sentence, farmer-friendly',
    '- inputs: array of strings, only when genuinely needed, else empty array []',
    '- No dosage field. No long explanations. No "why" text.',
    '- Never invent chemical names.',
    '- Dates: YYYY-MM-DD, computed as startDate + (day - 1)',
    'JSON shape: {"roadmap":[{"day":1,"date":"YYYY-MM-DD","stage":"Land Preparation","title":"Field Preparation","task":"Plough and level the field.","inputs":["Tractor"]}]}'
  ].join('\n');
}

export function buildRoadmapUserPrompt(request: CropRoadmapRequest): string {
  const details = [
    `Crop: ${request.crop}`,
    `Location: ${request.district}, ${request.state}, India`,
    `Land: ${request.landSize} ${request.landUnit}`,
    `startDate: ${request.startDate}`
  ];

  if (request.soilType) details.push(`Soil: ${request.soilType}`);
  if (request.irrigation) details.push(`Irrigation: ${request.irrigation}`);

  return details.join('\n');
}
