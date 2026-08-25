import { config } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Thin wrapper around the external AI provider (OpenRouter, Gemini-compatible
 * chat/vision endpoint). Centralized here so any module (scanner, krishibot,
 * schemes eligibility copilot, etc.) can reuse the same request/response
 * handling instead of duplicating fetch/parsing logic.
 */

const AI_PROVIDER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_PROVIDER_MODEL = 'google/gemini-2.0-flash-lite-001';
const REQUEST_TIMEOUT_MS = 30000;

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
  /** True when the app is configured to make real AI provider calls. */
  static isConfigured(): boolean {
    return !config.useMockData && !!config.aiProviderApiKey;
  }

  static async chat(messages: AiMessage[]): Promise<string> {
    if (!config.aiProviderApiKey) {
      throw new Error('AI_PROVIDER_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(AI_PROVIDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.aiProviderApiKey}`,
          'X-Title': 'BharatFarm'
        },
        body: JSON.stringify({ model: AI_PROVIDER_MODEL, messages }),
        signal: controller.signal
      });

      const raw = await response.text();

      if (!response.ok) {
        logger.error('AI provider returned a non-OK status', { status: response.status, raw });
        throw new Error(`AI provider returned status ${response.status}`);
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
