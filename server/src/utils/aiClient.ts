import { config } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Thin wrapper around OpenRouter AI provider (Gemini-2.0-flash-lite endpoint).
 * Centralized here so all modules (scanner, krishibot, weather advisory, schemes, etc.)
 * reuse the exact same request/response handling.
 */

const AI_PROVIDER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_TEXT_MODEL = 'google/gemini-2.0-flash-001';
const REQUEST_TIMEOUT_MS = 45000;

export interface AiMessageContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface AiMessage {
  role: 'user' | 'system' | 'assistant';
  content: string | AiMessageContentPart[];
}

export class AiClient {
  /** True when the app is configured with an OpenRouter / AI API key. */
  static isConfigured(): boolean {
    return !!config.openRouterApiKey;
  }

  static async chat(messages: AiMessage[], modelOverride?: string): Promise<string> {
    const apiKey = config.openRouterApiKey;
    if (!apiKey) {
      logger.error('[AiClient] OPENROUTER_API_KEY is not configured in server environment (.env)');
      throw new Error('OPENROUTER_API_KEY is not configured on server');
    }

    const model = modelOverride || DEFAULT_TEXT_MODEL;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      logger.info(`[AiClient] Sending request to OpenRouter (Model: ${model})`);
      const response = await fetch(AI_PROVIDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://bharatfarm.app',
          'X-Title': 'BharatFarm'
        },
        body: JSON.stringify({ model, messages, max_tokens: 1000 }),
        signal: controller.signal
      });

      const raw = await response.text();

      if (!response.ok) {
        logger.error(`[AiClient] OpenRouter API Error - HTTP Status ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          model,
          responseBody: raw
        });
        throw new Error(`OpenRouter API error (Status ${response.status}): ${raw}`);
      }

      const data = JSON.parse(raw);
      const content = data.choices?.[0]?.message?.content ?? '';
      if (!content) {
        logger.warn('[AiClient] OpenRouter returned empty response choices', { data });
      }
      return content;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        logger.error(`[AiClient] OpenRouter request timed out after ${REQUEST_TIMEOUT_MS}ms`);
        throw new Error(`AI request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
      }
      logger.error('[AiClient] AI request exception:', { message: err.message });
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Parses a JSON object out of a model response that may be wrapped in ```json fences. */
  static parseJsonResponse<T>(raw: string): T {
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as T;
  }
}
