import { ScanRequest, ScanAnalysisResult } from '../types/scanner.types.js';
import { MOCK_SCAN_RESULT } from '../mock/scanner.mock.js';
import { SCANNER_CONSTANTS } from '../constants/scanner.constants.js';
import { AiClient } from '../../../utils/aiClient.js';
import { logger } from '../../../utils/logger.js';

/**
 * Adapted from the OLD project's `POST /api/analyze-leaf` route (server.js),
 * which sent the leaf photo to a Gemini-compatible vision model via
 * OpenRouter and asked it to identify disease/health status. That logic is
 * reproduced here behind the repository boundary so the controller/service
 * layers stay transport-agnostic.
 */

interface RawLeafAnalysis {
  status: 'healthy' | 'diseased' | 'not_a_plant';
  name: string;
  description: string;
  fertilizers: string[];
  treatments: string[];
}

const VISION_PROMPT = `You are an expert plant pathologist. Analyze the provided image.
First, determine if the image contains a plant leaf. If it does NOT contain a plant leaf (e.g. an animal, person, object, landscape, screenshot, etc.), return status "not_a_plant".
If it IS a plant leaf, identify any diseases, deficiencies, or pests present. If the leaf is healthy, state that it is healthy.

Respond strictly in JSON matching this structure:
{
  "status": "healthy" | "diseased" | "not_a_plant",
  "name": "Name of the disease, 'Healthy Plant', or 'Not a Plant'",
  "description": "Short description of the issue, or what the image actually contains if not a plant.",
  "fertilizers": ["Fertilizer/nutrition recommendation 1", "..."],
  "treatments": ["Actionable treatment tip 1", "..."]
}

If the image is NOT a plant leaf, set status to "not_a_plant", name to "Not a Plant", and leave fertilizers and treatments as empty arrays.
Do not include markdown formatting like \`\`\`json in your response. Return only the raw JSON object.`;

export class ScannerRepository {
  async saveAndAnalyzeScan(scanReq: ScanRequest): Promise<ScanAnalysisResult> {
    if (!scanReq.imageBase64 && !scanReq.imageUrl) {
      throw new Error('No plant image data provided');
    }

    if (!AiClient.isConfigured()) {
      logger.info('[Scanner] AI provider not configured, returning mock analysis');
      return this.buildMockResult();
    }

    try {
      return await this.analyzeWithAiProvider(scanReq);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[Scanner] AI analysis failed, falling back to mock result', { error: message });
      return this.buildMockResult();
    }
  }

  private buildMockResult(): ScanAnalysisResult {
    return {
      ...MOCK_SCAN_RESULT,
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

    const raw = await AiClient.chat([
      {
        role: 'user',
        content: [
          { type: 'text', text: VISION_PROMPT },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ]);

    const parsed = AiClient.parseJsonResponse<RawLeafAnalysis>(raw);
    const isNotPlant = parsed.status === 'not_a_plant';
    const isHealthy = parsed.status === 'healthy';

    return {
      scanId: `scan-${Date.now()}`,
      status: 'success',
      disease: isNotPlant ? 'Not a Plant' : parsed.name || SCANNER_CONSTANTS.MOCK_DISEASE_NAME,
      confidence: isNotPlant ? 0 : isHealthy ? 0.98 : 0.85,
      cropName: scanReq.cropHint || 'Unknown',
      severity: isNotPlant || isHealthy ? 'none' : 'medium',
      recommendations: parsed.treatments ?? [],
      preventativeMeasures: parsed.fertilizers ?? [],
      scannedAt: new Date().toISOString()
    };
  }
}
