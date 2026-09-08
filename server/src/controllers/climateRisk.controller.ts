import { Request, Response, NextFunction } from 'express';
import { fetchWeatherData } from '../services/climateRisk/weatherProvider.js';
import { fetchFloodRisk } from '../services/climateRisk/floodProvider.js';
import { ClimateEngine } from '../services/climateRisk/climateEngine.js';
import { AiClient } from '../utils/aiClient.js';

export const getForecast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.query.location as string) || 'Haldia, West Bengal';
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

    const weather = await fetchWeatherData(location, lat, lon);
    res.json({ success: true, data: weather });
  } catch (error) {
    next(error);
  }
};

export const getFloodRisk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.query.location as string) || 'Haldia, West Bengal';
    const weather = await fetchWeatherData(location);
    const flood = await fetchFloodRisk(weather, location);
    res.json({ success: true, data: flood });
  } catch (error) {
    next(error);
  }
};

export const getAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.body.location as string) || (req.query.location as string) || 'Haldia, West Bengal';
    const crop = (req.body.crop as string) || 'Paddy';
    const cropStage = (req.body.cropStage as string) || 'Flowering';
    const lat = req.body.lat ? parseFloat(req.body.lat) : undefined;
    const lon = req.body.lon ? parseFloat(req.body.lon) : undefined;

    const weather = await fetchWeatherData(location, lat, lon);
    const flood = await fetchFloodRisk(weather, location);
    const assessment = ClimateEngine.analyze(weather, flood, crop, cropStage);

    res.json({
      success: true,
      data: {
        weather,
        flood,
        assessment
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHarvestAdvisory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.body.location as string) || 'Haldia, West Bengal';
    const crop = (req.body.crop as string) || 'Paddy';
    const cropStage = (req.body.cropStage as string) || 'Flowering';

    const weather = await fetchWeatherData(location);
    const flood = await fetchFloodRisk(weather, location);
    const assessment = ClimateEngine.analyze(weather, flood, crop, cropStage);

    res.json({
      success: true,
      data: {
        harvestAdvisory: assessment.harvestAdvisory,
        farmerActionPlan: assessment.farmerActionPlan,
        operationalAdvisories: assessment.operationalAdvisories
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const historyLogs = [
      { id: 'h-1', date: '08 Sep 2026', location: 'Haldia, West Bengal', crop: 'Paddy', climateRisk: 'HIGH', floodRisk: 'SEVERE', recommendation: 'Consider early harvest of mature crop' },
      { id: 'h-2', date: '05 Sep 2026', location: 'Haldia, West Bengal', crop: 'Paddy', climateRisk: 'LOW', floodRisk: 'MODERATE', recommendation: 'Normal harvest operations permitted' },
      { id: 'h-3', date: '01 Sep 2026', location: 'Ludhiana, Punjab', crop: 'Wheat', climateRisk: 'LOW', floodRisk: 'LOW', recommendation: 'Standard irrigation & field management' },
      { id: 'h-4', date: '25 Aug 2026', location: 'Murshidabad, WB', crop: 'Jute', climateRisk: 'HIGH', floodRisk: 'HIGH', recommendation: 'Clear field drainage channels immediately' }
    ];

    res.json({ success: true, data: historyLogs });
  } catch (error) {
    next(error);
  }
};

export const geocodeLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.json({ success: true, data: [] });
    }

    const result = await response.json();
    const locations = (result.results || []).map((item: any) => ({
      name: item.name,
      admin1: item.admin1 || '',
      country: item.country || 'India',
      displayName: `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}${item.country ? ', ' + item.country : ''}`,
      latitude: Number(item.latitude.toFixed(4)),
      longitude: Number(item.longitude.toFixed(4))
    }));

    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
};

export const getAiInsight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      location = 'Haldia, West Bengal',
      crop = 'Paddy',
      cropStage = 'Flowering',
      overallRiskScore = 60,
      floodScore = 50,
      cropRiskScore = 50,
      harvestCode = 'MONITOR',
      rainfallMm = 20,
      mainThreat = 'Rain'
    } = req.body;

    const fallbackInsight = {
      headline: overallRiskScore >= 70
        ? `${mainThreat || 'Heavy rainfall'} is the dominant near-term agricultural risk.`
        : `Weather conditions remain manageable for ${crop} at ${cropStage} stage.`,
      severity: overallRiskScore >= 70 ? 'SEVERE' : overallRiskScore >= 45 ? 'MODERATE' : 'LOW',
      actions: overallRiskScore >= 70
        ? ['Protect field drainage channels immediately', 'Avoid spray/fertilizer applications before rainfall', 'Inspect low-lying plots & prepare harvest gear']
        : ['Continue regular crop monitoring', 'Maintain optimal irrigation schedules', 'Ensure field drainage exits are cleared'],
      timing: 'Next 24–48 hours',
      source: 'RULE_BASED'
    };

    if (!AiClient.isConfigured()) {
      return res.json({ success: true, data: fallbackInsight });
    }

    const prompt = `You are the BharatFarm Agricultural Climate Intelligence Engine.
Context:
- Location: ${location}
- Crop: ${crop} (Stage: ${cropStage})
- Overall Climate Risk: ${overallRiskScore}/100
- Flood Assessment: ${floodScore}/100
- Crop Risk: ${cropRiskScore}/100
- Harvest Recommendation: ${harvestCode}
- 48h Rain: ${rainfallMm} mm
- Dominant Threat: ${mainThreat}

Instructions:
1. Provide a crisp, 1-sentence decision-first headline for the farmer/evaluator.
2. Provide EXACTLY 3 highest-priority, actionable field steps (max 8 words each).
3. Specify a concise timeframe (e.g. "Next 24–48h").
4. Return pure JSON matching this schema:
{
  "headline": "string",
  "severity": "LOW" | "MODERATE" | "HIGH" | "SEVERE",
  "actions": ["string", "string", "string"],
  "timing": "string"
}`;

    try {
      const aiResponse = await AiClient.chat([
        { role: 'system', content: 'You are an agricultural risk assessment AI. Respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ], {
        maxTokens: 300,
        responseFormat: 'json_object',
        timeoutMs: 12000
      });

      const parsed = JSON.parse(aiResponse);
      const cleanedActions = Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : fallbackInsight.actions;

      res.json({
        success: true,
        data: {
          headline: parsed.headline || fallbackInsight.headline,
          severity: parsed.severity || fallbackInsight.severity,
          actions: cleanedActions,
          timing: parsed.timing || fallbackInsight.timing,
          source: 'OPENROUTER_AI'
        }
      });
    } catch (aiErr) {
      res.json({ success: true, data: fallbackInsight });
    }
  } catch (error) {
    next(error);
  }
};
