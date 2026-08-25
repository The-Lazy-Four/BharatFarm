import { config } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Thin wrapper around OpenRouter AI provider (Gemini-2.0-flash-lite endpoint).
 * Centralized here so all modules (scanner, krishibot, weather advisory, schemes, etc.)
 * reuse the exact same request/response handling.
 */

const AI_PROVIDER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_PROVIDER_MODEL = 'google/gemini-2.0-flash-lite-001';
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

  static async chat(messages: AiMessage[]): Promise<string> {
    const apiKey = config.openRouterApiKey;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(AI_PROVIDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://bharatfarm.app',
          'X-Title': 'BharatFarm'
        },
        body: JSON.stringify({ model: AI_PROVIDER_MODEL, messages }),
        signal: controller.signal
      });

      const raw = await response.text();

      if (!response.ok) {
        logger.error('OpenRouter AI provider returned a non-OK status', { status: response.status, raw });
        throw new Error(`OpenRouter AI provider returned status ${response.status}: ${raw}`);
      }

      const data = JSON.parse(raw);
      return data.choices?.[0]?.message?.content ?? '';
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
