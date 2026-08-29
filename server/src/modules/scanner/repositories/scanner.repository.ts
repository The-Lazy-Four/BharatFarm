import { ScanRequest, ScanAnalysisResult } from '../types/scanner.types.js';
import { MOCK_SCAN_RESULT } from '../mock/scanner.mock.js';
import { SCANNER_CONSTANTS } from '../constants/scanner.constants.js';
import { AiClient } from '../../../utils/aiClient.js';
import { AiCache } from '../../../utils/aiCache.js';
import { logger } from '../../../utils/logger.js';
import { config } from '../../../config/env.js';
import { getSupabaseAdminClient } from '../../../config/supabase.js';
import { WeatherRepository } from '../../weather/repositories/weather.repository.js';
import { RoadmapRepository } from '../../roadmap/repositories/roadmap.repository.js';

interface RawLeafAnalysis {
  status: 'healthy' | 'diseased' | 'not_a_plant';
  name: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'none';
  symptoms: string[];
  immediateActions: string[];
  prevention: string[];
  disclaimer: string;
}

const VISION_PROMPT = `
You are an expert, safety-conscious agricultural pathologist assisting Indian smallholder farmers.
Analyze the provided crop/leaf image along with the contextual metadata (crop, location, growth stage, weather).

First, check if the image contains a plant, crop, or leaf.
If it does NOT contain a plant leaf (e.g. human, animal, furniture, screenshot), set status to "not_a_plant", name to "Not a Plant Leaf", severity "none", confidence 0, empty symptoms/actions/prevention, and state that the image is invalid.

If it IS a plant/leaf, diagnose probable diseases, deficiencies, or pest infestations. If healthy, set status "healthy", name "Healthy Plant", severity "none", confidence 0.95+.

IMPORTANT SAFETY AND CHEMICAL ADVISORY RULES:
1. Always present findings as ADVISORY ("Possible issue detected based on uploaded image").
2. NEVER prescribe exact hazardous chemical dosages. Tell the farmer to consult product label directions and local extension officers.
3. Recommend non-chemical / cultural / organic practices alongside safe chemical guidance.

Respond ONLY with raw valid JSON matching this exact structure:
{
  "status": "healthy" | "diseased" | "not_a_plant",
  "name": "Name of disease or 'Healthy Plant' or 'Not a Plant Leaf'",
  "confidence": 0.85,
  "severity": "low" | "medium" | "high" | "none",
  "symptoms": ["Symptom 1", "Symptom 2"],
  "immediateActions": ["Action 1", "Action 2"],
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "disclaimer": "Based on uploaded image. Diagnosis is advisory. Please consult local agricultural extension officers for severe symptoms."
}
`;

export class ScannerRepository {
  private weatherRepo = new WeatherRepository();
  private roadmapRepo = new RoadmapRepository();

  /** Map Supabase public.scan_results row to domain ScanAnalysisResult */
  private mapDbToDomain(row: any): ScanAnalysisResult {
    return {
      scanId: row.id,
      status: row.status as ScanAnalysisResult['status'],
      disease: row.disease,
      confidence: Number(row.confidence || 0),
      cropName: row.crop_name || 'Unknown',
      severity: (row.severity || 'none') as ScanAnalysisResult['severity'],
      symptoms: row.symptoms || [],
      recommendations: row.recommendations || [],
      preventativeMeasures: row.preventative_measures || [],
      disclaimer: 'Based on uploaded image. Diagnosis is advisory. Please consult local agricultural extension officers for severe symptoms.',
      scannedAt: row.scanned_at || new Date().toISOString(),
      imageStoragePath: row.image_storage_path || undefined
    };
  }

  async saveAndAnalyzeScan(scanReq: ScanRequest, userId?: string): Promise<ScanAnalysisResult> {
    if (!scanReq.imageBase64 && !scanReq.imageUrl) {
      throw new Error('No plant image data provided');
    }

    if (!AiClient.isConfigured()) {
      if (!config.useMockData) {
        logger.error('[Scanner] OPENROUTER_API_KEY missing while Mock Mode is false.');
        throw new Error('OPENROUTER_API_KEY is not configured on server');
      }
      logger.info('[Scanner] AI provider not configured, returning mock analysis');
      const mockResult = this.buildMockResult(scanReq.cropHint);
      if (userId) await this.persistScanResult(userId, scanReq, mockResult);
      return mockResult;
    }

    try {
      const result = await this.analyzeWithAiProvider(scanReq);
      if (userId && result.status !== 'not_a_plant') {
        const savedId = await this.persistScanResult(userId, scanReq, result);
        if (savedId) result.scanId = savedId;
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[Scanner] AI vision analysis failed:', { error: message });
      if (!config.useMockData) {
        throw new Error(`Leaf analysis error: ${message}`);
      }
      const mockResult = this.buildMockResult(scanReq.cropHint);
      if (userId) await this.persistScanResult(userId, scanReq, mockResult);
      return mockResult;
    }
  }

  async getHistory(userId: string): Promise<ScanAnalysisResult[]> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('scan_results')
          .select('*')
          .eq('user_id', userId)
          .order('scanned_at', { ascending: false });

        if (!error && data) {
          return data.map(row => this.mapDbToDomain(row));
        }
      } catch (err) {
        logger.error('[Scanner] Error fetching history from Supabase:', err);
      }
    }

    // Fallback to mock history if DB query empty or mock mode enabled
    return [
      {
        ...MOCK_SCAN_RESULT,
        scanId: 'scan-hist-001',
        cropName: 'Tomato',
        scannedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        ...MOCK_SCAN_RESULT,
        scanId: 'scan-hist-002',
        cropName: 'Rice',
        disease: 'Bacterial Leaf Blight',
        severity: 'high',
        scannedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  }

  async deleteScan(scanId: string, userId: string): Promise<boolean> {
    if (scanId.startsWith('scan-mock-') || scanId.startsWith('scan-hist-')) {
      return true;
    }

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('scan_results')
          .delete()
          .eq('id', scanId)
          .eq('user_id', userId);

        if (!error) return true;
      } catch (err) {
        logger.error(`[Scanner] Error deleting scan ${scanId}:`, err);
      }
    }
    return false;
  }

  private async persistScanResult(userId: string, req: ScanRequest, res: ScanAnalysisResult): Promise<string | null> {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('scan_results')
        .insert({
          user_id: userId,
          status: res.status === 'not_a_plant' ? 'failed' : res.status,
          disease: res.disease,
          confidence: res.confidence,
          crop_name: res.cropName,
          severity: res.severity,
          symptoms: res.symptoms || [],
          recommendations: res.recommendations,
          preventative_measures: res.preventativeMeasures,
          crop_hint: req.cropHint || null,
          scanned_at: res.scannedAt
        })
        .select('id')
        .single();

      if (!error && data) {
        return data.id;
      }
      if (error) logger.warn('[Scanner] Supabase insert warning:', error.message);
    } catch (err) {
      logger.error('[Scanner] Failed to persist scan result:', err);
    }
    return null;
  }

  private buildMockResult(cropHint?: string): ScanAnalysisResult {
    return {
      ...MOCK_SCAN_RESULT,
      cropName: cropHint || 'Tomato',
      scanId: `scan-${Date.now()}`,
      scannedAt: new Date().toISOString()
    };
  }

  private async analyzeWithAiProvider(scanReq: ScanRequest): Promise<ScanAnalysisResult> {
    const imageUrl = scanReq.imageBase64
      ? scanReq.imageBase64.startsWith('data:')
        ? scanReq.imageBase64
        : `data:image/jpeg;base64,${scanReq.imageBase64}`
      : scanReq.imageUrl!;

    // 1. Gather contextual metadata (Weather + Active Roadmap Stage)
    let weatherInfo = '';
    if (scanReq.district && scanReq.state) {
      try {
        const weather = await this.weatherRepo.getWeather({ location: `${scanReq.district}, ${scanReq.state}` });
        if (weather) {
          weatherInfo = `Local Weather: ${weather.temperatureCelsius}°C, ${weather.condition}, Humidity/Rain prob: ${weather.rainfallProbability}%.`;
        }
      } catch {
        // ignore weather failure
      }
    }

    let roadmapInfo = '';
    if (scanReq.cropHint) {
      roadmapInfo = `Target Crop: ${scanReq.cropHint}.`;
    }

    const promptText = `
${VISION_PROMPT}

CONTEXT METADATA:
${roadmapInfo}
${weatherInfo}
Farmer Note/Question: ${scanReq.question || 'None'}
`;

    // Deduplicate / Cache key based on image payload hash & metadata
    const cacheKey = AiCache.createFingerprint('scanner_vision', {
      crop: scanReq.cropHint,
      imgSnippet: imageUrl.slice(0, 100),
      question: scanReq.question
    });

    const cached = AiCache.get<ScanAnalysisResult>(cacheKey);
    if (cached) {
      logger.info('[Scanner] Returning cached vision analysis result');
      return cached;
    }

    const raw = await AiClient.chat(
      [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptText },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      { model: 'google/gemini-2.5-flash', maxTokens: 1200 }
    );

    const parsed = AiClient.parseJsonResponse<RawLeafAnalysis>(raw);
    if (!parsed) {
      throw new Error('AI returned unparseable diagnosis structure');
    }

    const isNotPlant = parsed.status === 'not_a_plant';
    const isHealthy = parsed.status === 'healthy';

    const result: ScanAnalysisResult = {
      scanId: `scan-${Date.now()}`,
      status: isNotPlant ? 'not_a_plant' : 'success',
      disease: isNotPlant ? 'Not a Plant Leaf' : (parsed.name || SCANNER_CONSTANTS.MOCK_DISEASE_NAME),
      confidence: isNotPlant ? 0 : (Number(parsed.confidence) || (isHealthy ? 0.95 : 0.85)),
      cropName: scanReq.cropHint || 'Unknown Crop',
      severity: isNotPlant || isHealthy ? 'none' : (parsed.severity || 'medium'),
      symptoms: parsed.symptoms || [],
      recommendations: parsed.immediateActions || [],
      preventativeMeasures: parsed.prevention || [],
      disclaimer: parsed.disclaimer || 'Based on uploaded image. Diagnosis is advisory. Please consult local agricultural extension officers.',
      weatherWarning: weatherInfo || undefined,
      scannedAt: new Date().toISOString()
    };

    if (result.status === 'success') {
      AiCache.set(cacheKey, result, 3600); // 1 hour cache for identical scan
    }

    return result;
  }
}
