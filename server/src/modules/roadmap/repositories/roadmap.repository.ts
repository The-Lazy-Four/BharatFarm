// ============================================================
// Crop Roadmap — Repository (AI Integration Layer)
// Uses direct Google Gemini API via GEMINI_API_KEY.
// ============================================================

import { CropRoadmapRequest, CropRoadmapResponse } from '../types/roadmap.types.js';
import { AiClient } from '../../../utils/aiClient.js';
import { logger } from '../../../utils/logger.js';
import { buildRoadmapSystemPrompt, buildRoadmapUserPrompt } from '../utils/roadmapPrompt.js';
import { ROADMAP_MAX_TOKENS, ROADMAP_AI_TIMEOUT_MS } from '../constants/roadmap.constants.js';

const GEMINI_GENERATE_CONTENT_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Model for roadmap generation — must be available for the GEMINI_API_KEY. */
const GEMINI_ROADMAP_MODEL = 'gemini-3.6-flash';

export class RoadmapRepository {
  /**
   * Generates a crop roadmap by calling the Google Gemini API directly.
   * Uses GEMINI_API_KEY from .env — no OpenRouter for this feature.
   */
  async generateRoadmap(request: CropRoadmapRequest): Promise<CropRoadmapResponse> {
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

    if (!geminiApiKey) {
      logger.error('[Roadmap] GEMINI_API_KEY is not configured. Cannot generate roadmap.');
      throw new RoadmapConfigError('AI service is not configured. Please add GEMINI_API_KEY to the backend .env file.');
    }

    const systemPrompt = buildRoadmapSystemPrompt();
    const userPrompt = buildRoadmapUserPrompt(request);

    try {
      logger.info(`[Roadmap] Generating roadmap for ${request.crop} in ${request.district}, ${request.state} (model: ${GEMINI_ROADMAP_MODEL})`);

      const rawResponse = await this.generateWithGoogleGemini(systemPrompt, userPrompt, geminiApiKey);

      if (!rawResponse || rawResponse.trim() === '') {
        throw new Error('AI returned an empty response');
      }

      // Parse the JSON from the response
      const parsed = AiClient.parseJsonResponse<CropRoadmapResponse>(rawResponse);

      // Validate the parsed response
      this.validateRoadmapResponse(parsed);

      logger.info(`[Roadmap] Successfully generated roadmap with ${parsed.roadmap.length} activities`);
      return parsed;
    } catch (err) {
      if (err instanceof RoadmapConfigError) throw err;

      const message = err instanceof Error ? err.message : 'Unknown AI error';
      logger.error('[Roadmap] AI generation failed:', { error: message });

      // Detect specific error types
      if (message.includes('Status 401') || message.includes('Status 403')) {
        throw new RoadmapApiError('Invalid AI API configuration. Please check the OpenRouter API key.', 'INVALID_API_KEY');
      }
      if (message.includes('Status 429')) {
        throw new RoadmapApiError('AI service is temporarily busy. Please try again shortly.', 'RATE_LIMIT');
      }
      if (/Status 5\d{2}/.test(message)) {
        throw new RoadmapApiError('AI service is currently unavailable. Please try again later.', 'AI_UNAVAILABLE');
      }
      if (message.includes('timed out')) {
        throw new RoadmapApiError('The AI service took too long to respond. Please try again.', 'TIMEOUT');
      }
      if (this.isNetworkError(message)) {
        throw new RoadmapApiError('Unable to connect to the AI service.', 'NETWORK_ERROR');
      }

      // JSON parse errors → invalid AI response
      if (
        message.includes('JSON') ||
        message.includes('Unexpected token') ||
        message.includes('parse') ||
        message.includes('truncated') ||
        message.includes('incomplete response')
      ) {
        throw new RoadmapApiError('The roadmap could not be generated correctly. Please try again.', 'INVALID_RESPONSE');
      }

      throw new RoadmapApiError('AI service is currently unavailable. Please try again later.', 'AI_ERROR');
    }
  }

  /** Calls the Google Gemini generateContent API directly. */
  private async generateWithGoogleGemini(
    systemInstruction: string,
    prompt: string,
    apiKey: string
  ): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ROADMAP_AI_TIMEOUT_MS);
    const model = GEMINI_ROADMAP_MODEL;

    try {
      const response = await fetch(
        `${GEMINI_GENERATE_CONTENT_URL}/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.15,
              maxOutputTokens: ROADMAP_MAX_TOKENS
            }
          }),
          signal: controller.signal
        }
      );

      const raw = await response.text();
      if (!response.ok) {
        logger.error(`[Roadmap] Gemini API Error - HTTP Status ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          model,
          responseBody: raw.slice(0, 500)
        });
        throw new Error(`Gemini API error (Status ${response.status}): ${raw.slice(0, 200)}`);
      }

      let data: { candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }> };
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        throw new Error('Gemini API returned malformed JSON');
      }

      const candidate = data.candidates?.[0];
      if (candidate?.finishReason === 'MAX_TOKENS') {
        throw new Error('Gemini API response was truncated before completion');
      }

      const content = candidate?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim();

      if (!content) {
        throw new Error('Gemini API returned an empty completion');
      }

      return content;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`AI request timed out after ${ROADMAP_AI_TIMEOUT_MS / 1000}s`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private validateRoadmapResponse(data: CropRoadmapResponse): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid roadmap response structure');
    }

    if (!Array.isArray(data.roadmap) || data.roadmap.length === 0) {
      throw new Error('Roadmap activities are missing or empty in AI response');
    }

    // Validate every field used by the client before returning a successful API response.
    for (const activity of data.roadmap) {
      if (
        typeof activity.day !== 'number' || activity.day < 1 ||
        typeof activity.date !== 'string' || Number.isNaN(Date.parse(activity.date)) ||
        typeof activity.stage !== 'string' ||
        typeof activity.title !== 'string' ||
        typeof activity.task !== 'string' ||
        !Array.isArray(activity.inputs) || !activity.inputs.every(input => typeof input === 'string')
      ) {
        throw new Error('One or more roadmap activities have invalid fields');
      }
    }
  }

  private isNetworkError(message: string): boolean {
    return /fetch failed|network|econnrefused|enotfound|econnreset|socket hang up/i.test(message);
  }
}

// ── Custom Error Classes ───────────────────────────────────

export class RoadmapConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoadmapConfigError';
  }
}

export class RoadmapApiError extends Error {
  public code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'RoadmapApiError';
    this.code = code;
  }
}
