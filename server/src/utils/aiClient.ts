import { config } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Thin wrapper around OpenRouter AI provider (Gemini-2.0-flash-lite endpoint).
 * Centralized here so all modules (scanner, krishibot, weather advisory, schemes, etc.)
 * reuse the exact same request/response handling.
 */

const AI_PROVIDER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 45000;

export interface AiChatOptions {
  model?: string;
  maxTokens?: number;
  timeoutMs?: number;
  /** Ask OpenRouter for a JSON object when the caller needs structured output. */
  responseFormat?: 'json_object';
}

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

  static async chat(messages: AiMessage[], options?: AiChatOptions | string): Promise<string> {
    const apiKey = config.openRouterApiKey;
    if (!apiKey) {
      logger.error('[AiClient] OPENROUTER_API_KEY is not configured in server environment (.env)');
      throw new Error('OPENROUTER_API_KEY is not configured on server');
    }

    // Keep support for the previous `chat(messages, model)` signature so other
    // AI-backed features retain their existing behaviour.
    const normalizedOptions: AiChatOptions = typeof options === 'string'
      ? { model: options }
      : options || {};
    const model = normalizedOptions.model || config.geminiModel;
    const maxTokens = normalizedOptions.maxTokens || 1000;
    const timeoutMs = normalizedOptions.timeoutMs || REQUEST_TIMEOUT_MS;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      logger.info(`[AiClient] Sending request to OpenRouter (Model: ${model})`);
      const requestBody: Record<string, unknown> = {
        model,
        messages,
        max_tokens: maxTokens
      };

      if (normalizedOptions.responseFormat === 'json_object') {
        requestBody.response_format = { type: 'json_object' };
      }

      const response = await fetch(AI_PROVIDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://bharatfarm.app',
          'X-Title': 'BharatFarm'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      const raw = await response.text();
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        logger.error(`[AiClient] OpenRouter API Error - HTTP Status ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          model,
          responseBodyLength: raw.length
        });
        throw new Error(`OpenRouter API error (Status ${response.status})`);
      }

      if (!raw.trim()) {
        logger.error('[AiClient] OpenRouter returned an empty success response', { model });
        throw new Error('AI provider returned an empty response');
      }

      if (!contentType.toLowerCase().includes('application/json')) {
        logger.error('[AiClient] OpenRouter returned a non-JSON success response', {
          model,
          contentType,
          responseBodyLength: raw.length
        });
        throw new Error('AI provider returned an invalid response format');
      }

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        logger.error('[AiClient] OpenRouter returned malformed JSON', {
          model,
          responseBodyLength: raw.length
        });
        throw new Error('AI provider returned malformed JSON');
      }

      const choice = data?.choices?.[0];
      if (!choice) {
        logger.error('[AiClient] OpenRouter response does not contain a completion choice', { model });
        throw new Error('AI provider returned an incomplete response');
      }

      if (choice.finish_reason === 'length') {
        logger.warn('[AiClient] OpenRouter completion was truncated by its token limit', { model, maxTokens });
        throw new Error('AI provider response was truncated before completion');
      }

      const content = choice.message?.content;
      if (typeof content !== 'string' || !content.trim()) {
        logger.warn('[AiClient] OpenRouter returned an empty completion message', { model });
        throw new Error('AI provider returned an empty completion');
      }
      return content;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        logger.error(`[AiClient] OpenRouter request timed out after ${timeoutMs}ms`);
        throw new Error(`AI request timed out after ${timeoutMs / 1000}s`);
      }
      logger.error('[AiClient] AI request exception:', { message: err.message });
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Parses the first complete JSON value from a model response. The model may
   * still include a Markdown fence or a short explanation despite the prompt.
   */
  static parseJsonResponse<T>(raw: string): T {
    const candidate = raw.replace(/^\uFEFF/, '').trim();
    if (!candidate) {
      throw new Error('AI returned an empty JSON response');
    }

    try {
      // Prefer the content in a fenced JSON block, if one was supplied.
      const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      const source = fenced?.[1]?.trim() || candidate;

      try {
        return JSON.parse(source) as T;
      } catch {
        const extracted = this.extractCompleteJsonValue(source);
        if (!extracted) {
          throw new Error('No complete JSON object or array was found');
        }
        return JSON.parse(extracted) as T;
      }
    } catch {
      logger.error('[AiClient] Failed to parse JSON response', { rawSubstring: candidate.slice(0, 160) });
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  private static extractCompleteJsonValue(source: string): string | null {
    for (let start = 0; start < source.length; start += 1) {
      if (source[start] !== '{' && source[start] !== '[') continue;

      const opening = source[start];
      const closing = opening === '{' ? '}' : ']';
      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let index = start; index < source.length; index += 1) {
        const character = source[index];

        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (character === '\\') {
            escaped = true;
          } else if (character === '"') {
            inString = false;
          }
          continue;
        }

        if (character === '"') {
          inString = true;
        } else if (character === opening) {
          depth += 1;
        } else if (character === closing) {
          depth -= 1;
          if (depth === 0) {
            const candidate = source.slice(start, index + 1);
            try {
              JSON.parse(candidate);
              return candidate;
            } catch {
              break;
            }
          }
        }
      }
    }

    return null;
  }
}
