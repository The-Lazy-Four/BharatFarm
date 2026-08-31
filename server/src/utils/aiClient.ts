import { config } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Reusable Central AI Gateway for BharatFarm.
 * Wraps OpenRouter / Gemini API requests with:
 * - Robust error handling & logging (secret keys hidden)
 * - Response validation & JSON parsing with fence cleanup
 * - Timeout handling
 * - Feature-agnostic structure
 * - Graceful fallback support for downstream modules
 */

const AI_PROVIDER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_TIMEOUT_MS = 45000;

export interface AiChatOptions {
  model?: string;
  maxTokens?: number;
  timeoutMs?: number;
  /** Ask OpenRouter for a JSON object when structured output is required. */
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
  private static inFlightRequests = new Map<string, Promise<string>>();

  /** Check if server has an OpenRouter API key configured. */
  static isConfigured(): boolean {
    return !!config.openRouterApiKey && config.openRouterApiKey.trim().length > 0;
  }

  /**
   * Main completion method for OpenRouter API requests.
   */
  static async chat(messages: AiMessage[], options?: AiChatOptions | string): Promise<string> {
    const apiKey = config.openRouterApiKey;
    if (!apiKey) {
      logger.error('[AiClient] OPENROUTER_API_KEY is not configured in server environment');
      throw new Error('OPENROUTER_API_KEY is not configured on server');
    }

    const normalizedOptions: AiChatOptions = typeof options === 'string'
      ? { model: options }
      : options || {};

    const model = normalizedOptions.model || config.geminiModel;
    const maxTokens = Math.min(normalizedOptions.maxTokens || 250, 300); // Enforce concise responses & fit OpenRouter credit limits
    const timeoutMs = normalizedOptions.timeoutMs || DEFAULT_TIMEOUT_MS;

    const reqKey = JSON.stringify({ model, messages, maxTokens, responseFormat: normalizedOptions.responseFormat });
    if (this.inFlightRequests.has(reqKey)) {
      logger.info(`[AiGateway] Request deduplication - reusing in-flight request for model ${model}`);
      return this.inFlightRequests.get(reqKey)!;
    }

    const requestPromise = (async () => {
      let attempts = 0;
      const maxRetries = 2; // Up to 2 retries only for transient network errors

      while (attempts <= maxRetries) {
        attempts++;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        const startTime = Date.now();

        try {
          logger.info(`[AiGateway] Dispatching AI completion request (Model: ${model}, Messages: ${messages.length}, Attempt: ${attempts})`);
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
              'X-Title': 'BharatFarm Agriculture System'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });

          const latencyMs = Date.now() - startTime;
          const raw = await response.text();
          const contentType = response.headers.get('content-type') || '';

          if (!response.ok) {
            // If 402 due to max_tokens exceeding credit budget, retry with smaller max_tokens
            if (response.status === 402 && raw.includes('max_tokens') && requestBody.max_tokens !== 150) {
              logger.warn(`[AiGateway] HTTP 402 credit limit hit for max_tokens ${requestBody.max_tokens}. Retrying with reduced max_tokens 150...`);
              requestBody.max_tokens = 150;
              attempts++;
              const fallbackRes = await fetch(AI_PROVIDER_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
                  'HTTP-Referer': 'https://bharatfarm.app',
                  'X-Title': 'BharatFarm Agriculture System'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
              });
              if (fallbackRes.ok) {
                const fallbackRaw = await fallbackRes.text();
                const data = JSON.parse(fallbackRaw);
                const choice = data?.choices?.[0];
                if (choice?.message?.content) {
                  return choice.message.content;
                }
              }
            }

            const isTransient = response.status >= 500 && response.status < 600;
            logger.error(`[AiGateway] OpenRouter HTTP ${response.status} Error`, {
              status: response.status,
              statusText: response.statusText,
              model,
              latencyMs,
              bodySnippet: raw.slice(0, 300)
            });
            
            if (isTransient && attempts <= maxRetries) {
              await new Promise(r => setTimeout(r, attempts * 1000));
              continue;
            }
            throw new Error(`OpenRouter API error (Status ${response.status})`);
          }

          if (!raw.trim()) {
            logger.error('[AiGateway] OpenRouter returned empty response', { model, latencyMs });
            throw new Error('AI provider returned an empty response');
          }

          if (!contentType.toLowerCase().includes('application/json')) {
            logger.error('[AiGateway] OpenRouter returned non-JSON response content-type', { model, contentType });
            throw new Error('AI provider returned an invalid response format');
          }

          let data: any;
          try {
            data = JSON.parse(raw);
          } catch {
            logger.error('[AiGateway] OpenRouter returned malformed response JSON', { model });
            throw new Error('AI provider returned malformed JSON');
          }

          const choice = data?.choices?.[0];
          if (!choice) {
            logger.error('[AiGateway] OpenRouter response has no choice array item', { model });
            throw new Error('AI provider returned an incomplete response');
          }

          if (choice.finish_reason === 'length') {
            logger.warn('[AiGateway] OpenRouter completion was truncated by token limit', { model, maxTokens });
          }

          const content = choice.message?.content;
          if (typeof content !== 'string' || !content.trim()) {
            logger.warn('[AiGateway] OpenRouter message content empty', { model });
            throw new Error('AI provider returned an empty completion');
          }

          logger.info(`[AiGateway] Completion succeeded in ${latencyMs}ms (Length: ${content.length} chars)`);
          return content;
        } catch (err: any) {
          const latencyMs = Date.now() - startTime;
          if (err.name === 'AbortError') {
            logger.error(`[AiGateway] Request timed out after ${timeoutMs}ms`);
            throw new Error(`AI request timed out after ${timeoutMs / 1000}s`);
          }
          if (attempts <= maxRetries && err.message?.includes('fetch failed')) {
            await new Promise(r => setTimeout(r, attempts * 1000));
            continue;
          }
          logger.error('[AiGateway] AI Gateway Exception:', { message: err.message, latencyMs });
          throw err;
        } finally {
          clearTimeout(timeout);
        }
      }
      throw new Error('AI request failed after retries');
    })();

    this.inFlightRequests.set(reqKey, requestPromise);
    try {
      return await requestPromise;
    } finally {
      this.inFlightRequests.delete(reqKey);
    }
  }

  /**
   * Helper to parse JSON from AI model response (handles Markdown code fences).
   */
  static parseJsonResponse<T>(raw: string): T {
    const candidate = raw.replace(/^\uFEFF/, '').trim();
    if (!candidate) {
      throw new Error('AI returned an empty JSON response');
    }

    try {
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
      logger.error('[AiGateway] Failed to parse JSON response', { snippet: candidate.slice(0, 160) });
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
