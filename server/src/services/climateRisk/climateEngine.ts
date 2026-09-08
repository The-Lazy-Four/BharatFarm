import { WeatherData } from './weatherProvider.js';
import { FloodRiskAssessment } from './floodProvider.js';

export type HarvestRecommendationCode =
  | 'NORMAL HARVEST'
  | 'MONITOR CONDITIONS'
  | 'PREPARE FOR HARVEST'
  | 'CONSIDER EARLY HARVEST'
  | 'DELAY HARVEST'
  | 'PROTECT FIELD / IMPROVE DRAINAGE';

export interface ClimateAlert {
  id: string;
  title: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  reason: string;
  recommendedAction: string;
  expectedTimeWindow: string;
}

export interface ClimateAssessmentResult {
  overallRiskScore: number;
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  floodRisk: FloodRiskAssessment;
  cropRisk: {
    cropName: string;
    cropStage: string;
    cropRiskScore: number;
    cropRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    factors: string[];
    potentialExposure: string;
  };
  harvestAdvisory: {
    actionCode: HarvestRecommendationCode;
    headline: string;
    primaryReason: string;
    actionSteps: string[];
  };
  farmerActionPlan: {
    today: string[];
    next24h: string[];
    next48h: string[];
    postEvent: string[];
  };
  operationalAdvisories: {
    spraying: { status: 'SAFE' | 'CAUTION' | 'NOT RECOMMENDED'; guidance: string };
    irrigation: { status: 'NORMAL' | 'REDUCE' | 'STOP'; guidance: string };
    fertilizer: { status: 'PROCEED' | 'POSTPONE'; guidance: string };
    fieldWork: { status: 'PERMITTED' | 'AVOID'; guidance: string };
    drying: { status: 'RECOMMENDED' | 'NOT RECOMMENDED'; guidance: string };
  };
  procurementAdvisory: {
    riskLevel: 'LOW' | 'CAUTION' | 'HIGH RISK';
    recommendedWindow: string;
    guidance: string;
  };
  storageAdvisory: {
    riskLevel: 'MINIMAL' | 'ELEVATED' | 'HIGH RISK';
    guidance: string;
  };
  alerts: ClimateAlert[];
  rainfallAnalysis: {
    todayMm: number;
    tomorrowMm: number;
    next3DaysMm: number;
    next7DaysMm: number;
    total7DayMm: number;
    maxExpectedMm: number;
    highestRainfallDay: string;
    rainfallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    consecutiveRainyDays: number;
    explanation: string;
  };
}

export class ClimateEngine {
  static analyze(
    weather: WeatherData,
    floodRisk: FloodRiskAssessment,
    cropName: string = 'Paddy',
    cropStage: string = 'Flowering'
  ): ClimateAssessmentResult {
    // 1. Rainfall Analysis
    const todayMm = weather.daily?.[0]?.precipitation || 18;
    const tomorrowMm = weather.daily?.[1]?.precipitation || 46;
    const next3DaysMm = (weather.daily?.slice(0, 3) || []).reduce((acc, d) => acc + d.precipitation, 0);
    const next7DaysMm = (weather.daily || []).reduce((acc, d) => acc + d.precipitation, 0);

    let maxExpectedMm = 0;
    let highestRainfallDay = 'Today';
    let consecutiveRainyDays = 0;

    (weather.daily || []).forEach((d) => {
      if (d.precipitation > maxExpectedMm) {
        maxExpectedMm = d.precipitation;
        highestRainfallDay = `${d.dayName} (${d.precipitation} mm)`;
      }
      if (d.precipitation > 5 || d.rainProb > 50) {
        consecutiveRainyDays++;
      }
    });

    let rainfallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
    if (next7DaysMm > 100 || maxExpectedMm > 50) rainfallRiskLevel = 'SEVERE';
    else if (next7DaysMm > 50 || maxExpectedMm > 25) rainfallRiskLevel = 'HIGH';
    else if (next7DaysMm > 20) rainfallRiskLevel = 'MODERATE';

    const rainfallExplanation = maxExpectedMm > 35
      ? `Heavy rainfall is expected within the next 48 hours (${maxExpectedMm} mm peak).`
      : next7DaysMm > 30
      ? `Moderate to heavy rain expected across ${consecutiveRainyDays} consecutive days.`
      : `Light rainfall expected over the upcoming 7 days.`;

    // 2. Crop Risk Analysis
    const isMaturityStage = cropStage.toLowerCase().includes('maturity') || cropStage.toLowerCase().includes('ready');
    const isFloweringStage = cropStage.toLowerCase().includes('flowering');

    let cropRiskScore = Math.min(100, Math.round(
      (floodRisk.floodScore * 0.45) +
      (weather.rainfallProbability * 0.3) +
      (weather.windSpeedKmh > 20 ? 15 : 5) +
      (isFloweringStage ? 15 : isMaturityStage ? 20 : 5)
    ));

    let cropRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
    if (cropRiskScore >= 75) cropRiskLevel = 'SEVERE';
    else if (cropRiskScore >= 55) cropRiskLevel = 'HIGH';
    else if (cropRiskScore >= 30) cropRiskLevel = 'MODERATE';

    const cropFactors: string[] = [];
    if (next3DaysMm > 30) cropFactors.push('Excess rainfall threat during active crop stage');
    if (floodRisk.floodScore > 50) cropFactors.push('High exposure to flood conditions and water stagnation');
    if (weather.humidityPercent > 75) cropFactors.push('Fungal disease-conducive microclimate (high humidity)');
    if (weather.windSpeedKmh > 20) cropFactors.push('Wind lodging risk for standing crop');
    if (cropFactors.length === 0) cropFactors.push('Favorable weather conditions for crop growth');

    const potentialExposure = cropRiskScore > 60
      ? 'High estimated potential exposure to moisture stress and waterlogging'
      : 'Moderate potential exposure under current weather forecast';

    // 3. Harvest Recommendation Engine (HarvestActionRecommendationEngine)
    let actionCode: HarvestRecommendationCode = 'NORMAL HARVEST';
    let headline = 'Normal Harvest Schedule';
    let primaryReason = 'Weather conditions are stable and clear for field operations.';
    let actionSteps: string[] = [
      'Maintain standard harvest timeline according to maturity calendar.',
      'Prepare storage and transport equipment.'
    ];

    if (isMaturityStage) {
      if (maxExpectedMm > 30 || floodRisk.floodScore > 60) {
        actionCode = 'CONSIDER EARLY HARVEST';
        headline = '⚠️ CONSIDER EARLY HARVEST';
        primaryReason = `Heavy rainfall (${maxExpectedMm} mm) expected within the next 48 hours and crop is estimated to be near maturity.`;
        actionSteps = [
          'Prepare harvesting equipment immediately.',
          'Inspect crop maturity across field sections.',
          'Harvest mature portion before severe rainfall begins.',
          'Move harvested grain to covered, elevated storage.',
          'Avoid leaving harvested produce exposed in field.'
        ];
      } else if (next3DaysMm > 15) {
        actionCode = 'PREPARE FOR HARVEST';
        headline = '🌾 PREPARE FOR HARVEST';
        primaryReason = 'Upcoming rainfall window may disrupt field access. Complete harvest of ready crops.';
        actionSteps = [
          'Accelerate harvest readiness.',
          'Check grain moisture content.',
          'Secure tarpaulins for post-harvest protection.'
        ];
      }
    } else {
      // Immature crop
      if (floodRisk.floodScore > 50 || maxExpectedMm > 30) {
        actionCode = 'PROTECT FIELD / IMPROVE DRAINAGE';
        headline = '🛡️ PROTECT FIELD & IMPROVE DRAINAGE';
        primaryReason = 'Crop maturity is insufficient for early harvest. Prioritize drainage and field protection to minimize waterlogging damage.';
        actionSteps = [
          'Clear field drainage channels to accelerate runoff.',
          'Do NOT attempt premature harvest of immature grain.',
          'Apply bunding and soil support to prevent lodging.',
          'Monitor field water levels after heavy downpours.'
        ];
      } else if (next3DaysMm > 20) {
        actionCode = 'DELAY HARVEST';
        headline = '⏸️ DELAY HARVEST & WAIT FOR DRYING';
        primaryReason = 'Rainfall will elevate grain moisture content. Delay harvest until field dries.';
        actionSteps = [
          'Postpone harvesting operations until humidity and soil moisture decrease.',
          'Avoid operating heavy machinery on saturated soil.'
        ];
      } else if (next3DaysMm > 5) {
        actionCode = 'MONITOR CONDITIONS';
        headline = '👀 MONITOR CONDITIONS';
        primaryReason = 'Light rain expected. Monitor field conditions before scheduling field work.';
        actionSteps = [
          'Track daily local forecast updates.',
          'Inspect field daily for pest or disease signs.'
        ];
      }
    }

    // 4. Overall Climate Risk Score
    const overallRiskScore = Math.min(100, Math.round((floodRisk.floodScore * 0.5) + (cropRiskScore * 0.5)));
    let overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
    if (overallRiskScore >= 75) overallRiskLevel = 'SEVERE';
    else if (overallRiskScore >= 55) overallRiskLevel = 'HIGH';
    else if (overallRiskScore >= 30) overallRiskLevel = 'MODERATE';

    // 5. Operational Advisories
    const sprayingStatus = weather.rainfallProbability > 40 || weather.windSpeedKmh > 18 ? 'NOT RECOMMENDED' : 'SAFE';
    const sprayingGuidance = sprayingStatus === 'NOT RECOMMENDED'
      ? 'Not recommended — rain probability is high and wind may cause chemical drift.'
      : 'Favorable conditions for pesticide/fungicide application.';

    const irrigationStatus = next3DaysMm > 15 ? 'STOP' : next3DaysMm > 5 ? 'REDUCE' : 'NORMAL';
    const irrigationGuidance = irrigationStatus === 'STOP'
      ? 'Stop irrigation immediately — heavy rainfall expected will meet moisture needs.'
      : irrigationStatus === 'REDUCE'
      ? 'Reduce irrigation volume — sufficient precipitation expected.'
      : 'Maintain standard irrigation schedule.';

    const fertilizerStatus = next3DaysMm > 15 ? 'POSTPONE' : 'PROCEED';
    const fertilizerGuidance = fertilizerStatus === 'POSTPONE'
      ? 'Consider postponing fertilizer application due to risk of rain leaching.'
      : 'Safe window for fertilizer application.';

    const fieldWorkStatus = floodRisk.floodScore > 60 || maxExpectedMm > 30 ? 'AVOID' : 'PERMITTED';
    const fieldWorkGuidance = fieldWorkStatus === 'AVOID'
      ? 'Avoid heavy machinery operation during saturated soil conditions to prevent compaction.'
      : 'Field conditions allow machinery operation.';

    const dryingStatus = weather.humidityPercent > 70 || weather.rainfallProbability > 40 ? 'NOT RECOMMENDED' : 'RECOMMENDED';
    const dryingGuidance = dryingStatus === 'NOT RECOMMENDED'
      ? 'Outdoor drying is not recommended for the next 24–48 hours due to high humidity and rain.'
      : 'Favorable solar radiation for outdoor grain drying.';

    // 6. Procurement & Storage Advisory
    const procurementRisk = overallRiskScore > 55 ? 'HIGH RISK' : overallRiskScore > 35 ? 'CAUTION' : 'LOW';
    const procurementGuidance = procurementRisk === 'HIGH RISK'
      ? 'Heavy rainfall may disrupt transport routes and elevate moisture rejection at purchase centers. Prioritize procurement from lower-risk zones.'
      : 'Standard procurement schedule recommended.';

    const storageRisk = weather.humidityPercent > 75 || next3DaysMm > 20 ? 'HIGH RISK' : 'MINIMAL';
    const storageGuidance = storageRisk === 'HIGH RISK'
      ? 'Move harvested produce to covered, elevated storage immediately. High atmospheric humidity increases mold/spoilage risk.'
      : 'Normal storage conditions.';

    // 7. Climate Alerts
    const alerts: ClimateAlert[] = [];
    if (next3DaysMm > 30) {
      alerts.push({
        id: 'alert-rain',
        title: '🌧️ Heavy Rain Alert',
        severity: 'CRITICAL',
        reason: `Cumulative rainfall of ${next3DaysMm} mm forecast over next 72 hours.`,
        recommendedAction: 'Inspect field drainage channels and secure tarpaulins for harvested grain.',
        expectedTimeWindow: 'Next 24–48 Hours'
      });
    }
    if (floodRisk.floodScore > 50) {
      alerts.push({
        id: 'alert-flood',
        title: '🌊 Flood Risk Alert',
        severity: 'CRITICAL',
        reason: `Flood risk index is elevated (${floodRisk.floodScore}/100).`,
        recommendedAction: 'Clear field outlets and move equipment/produce to high ground.',
        expectedTimeWindow: 'Next 48–72 Hours'
      });
    }
    if (weather.windSpeedKmh > 22) {
      alerts.push({
        id: 'alert-wind',
        title: '🌬️ High Wind Alert',
        severity: 'WARNING',
        reason: `Wind gusts up to ${weather.windSpeedKmh} km/h recorded.`,
        recommendedAction: 'Postpone aerial/spray operations and stake tall crops where applicable.',
        expectedTimeWindow: 'Next 24 Hours'
      });
    }
    if (weather.humidityPercent > 78 && weather.temperatureCelsius > 26) {
      alerts.push({
        id: 'alert-disease',
        title: '🦠 Disease-Conducive Weather Alert',
        severity: 'WARNING',
        reason: 'Warm, humid atmosphere creates optimal conditions for blast/blight fungal growth.',
        recommendedAction: 'Monitor leaves for early spot symptoms and prepare bio-fungicide control.',
        expectedTimeWindow: 'Next 3 Days'
      });
    }
    if (alerts.length === 0) {
      alerts.push({
        id: 'alert-info',
        title: '☀️ Stable Weather Alert',
        severity: 'INFO',
        reason: 'No severe weather hazards detected in current 7-day forecast window.',
        recommendedAction: 'Proceed with normal farm management routines.',
        expectedTimeWindow: 'Next 7 Days'
      });
    }

    return {
      overallRiskScore,
      overallRiskLevel,
      floodRisk,
      cropRisk: {
        cropName,
        cropStage,
        cropRiskScore,
        cropRiskLevel,
        factors: cropFactors,
        potentialExposure
      },
      harvestAdvisory: {
        actionCode,
        headline,
        primaryReason,
        actionSteps
      },
      farmerActionPlan: {
        today: [
          'Inspect field drainage outlets and bunds.',
          'Monitor rain forecast updates.',
          'Avoid applying liquid pesticides or fertilizers before rain.'
        ],
        next24h: [
          'Prepare harvesting equipment and tarpaulins.',
          'Secure dry covered storage space.',
          'Check grain moisture level if crop is mature.'
        ],
        next48h: [
          'Harvest mature crop sections if weather permits.',
          'Transport harvested yield to protected storage.',
          'Do NOT leave harvested produce exposed in open fields.'
        ],
        postEvent: [
          'Inspect field for standing water accumulation.',
          'Drain trapped water from crop roots.',
          'Record crop damage for insurance verification if required.'
        ]
      },
      operationalAdvisories: {
        spraying: { status: sprayingStatus, guidance: sprayingGuidance },
        irrigation: { status: irrigationStatus, guidance: irrigationGuidance },
        fertilizer: { status: fertilizerStatus, guidance: fertilizerGuidance },
        fieldWork: { status: fieldWorkStatus, guidance: fieldWorkGuidance },
        drying: { status: dryingStatus, guidance: dryingGuidance }
      },
      procurementAdvisory: {
        riskLevel: procurementRisk,
        recommendedWindow: overallRiskScore > 50 ? 'Delay dispatch by 48 Hours' : 'Next 24-36 Hours (Optimal Window)',
        guidance: procurementGuidance
      },
      storageAdvisory: {
        riskLevel: storageRisk,
        guidance: storageGuidance
      },
      alerts,
      rainfallAnalysis: {
        todayMm,
        tomorrowMm,
        next3DaysMm,
        next7DaysMm,
        total7DayMm: next7DaysMm,
        maxExpectedMm,
        highestRainfallDay,
        rainfallRiskLevel,
        consecutiveRainyDays,
        explanation: rainfallExplanation
      }
    };
  }
}
