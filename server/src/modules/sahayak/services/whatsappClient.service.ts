import { config } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import { OutgoingWhatsAppMessage } from '../types/whatsapp.types.js';

/**
 * Meta WhatsApp Cloud API Client
 * Wraps official Graph API operations:
 * - Sending text messages
 * - Sending interactive messages / buttons
 * - Fetching media metadata & media binary stream
 * - Graceful fallback & logging without leaking tokens
 */
export class WhatsAppClientService {
  private static get baseUrl(): string {
    const version = config.whatsapp?.apiVersion || 'v19.0';
    return `https://graph.facebook.com/${version}`;
  }

  private static get token(): string {
    return config.whatsapp?.accessToken || '';
  }

  private static get phoneNumberId(): string {
    return config.whatsapp?.phoneNumberId || '';
  }

  /**
   * Check if real Meta WhatsApp Cloud API credentials are configured in server environment.
   */
  static isConfigured(): boolean {
    return Boolean(this.token && this.phoneNumberId);
  }

  /**
   * Send a text message to a WhatsApp user via Meta Cloud API.
   */
  static async sendTextMessage(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      logger.info(`[WhatsAppClient] Meta credentials not configured. Outgoing message to ${to} logged (length: ${text.length} chars)`);
      return { success: true, messageId: `mock-wa-msg-${Date.now()}` };
    }

    const cleanPhone = to.replace(/[^0-9]/g, '');
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;

    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: false, body: text }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        logger.error(`[WhatsAppClient] Meta API error (Status ${res.status}): ${errText.slice(0, 300)}`);
        return { success: false, error: `Meta API HTTP ${res.status}` };
      }

      const data: any = await res.json();
      const messageId = data?.messages?.[0]?.id;
      logger.info(`[WhatsAppClient] Message sent successfully to ${cleanPhone} (ID: ${messageId})`);
      return { success: true, messageId };
    } catch (err: any) {
      logger.error(`[WhatsAppClient] Exception sending message to ${cleanPhone}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send quick reply buttons or interactive list to WhatsApp user
   */
  static async sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<{ success: boolean; messageId?: string }> {
    if (!this.isConfigured()) {
      logger.info(`[WhatsAppClient] Meta credentials not configured. Interactive buttons logged for ${to}`);
      return { success: true, messageId: `mock-wa-btn-${Date.now()}` };
    }

    const cleanPhone = to.replace(/[^0-9]/g, '');
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;

    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: {
            buttons: buttons.slice(0, 3).map(b => ({
              type: 'reply',
              reply: { id: b.id, title: b.title.slice(0, 20) }
            }))
          }
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Fallback to sending as plain text if interactive button format fails
        return this.sendTextMessage(to, `${bodyText}\n\nOptions:\n${buttons.map(b => `• ${b.title}`).join('\n')}`);
      }

      const data: any = await res.json();
      return { success: true, messageId: data?.messages?.[0]?.id };
    } catch (err: any) {
      logger.error(`[WhatsAppClient] Exception in sendInteractiveButtons:`, err.message);
      return this.sendTextMessage(to, bodyText);
    }
  }

  /**
   * Fetch media information and securely download binary media from Meta Cloud API
   */
  static async downloadMediaAsBase64(mediaId: string): Promise<{ base64: string; mimeType: string } | null> {
    if (!this.isConfigured()) {
      logger.warn(`[WhatsAppClient] Cannot download media ${mediaId}: Meta credentials not configured`);
      return null;
    }

    try {
      // Step 1: Retrieve media URL
      const metaUrl = `${this.baseUrl}/${mediaId}`;
      const metaRes = await fetch(metaUrl, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (!metaRes.ok) {
        logger.error(`[WhatsAppClient] Failed to get media metadata for ID ${mediaId} (HTTP ${metaRes.status})`);
        return null;
      }

      const metaData: any = await metaRes.json();
      const downloadUrl = metaData?.url;
      const mimeType = metaData?.mime_type || 'image/jpeg';

      if (!downloadUrl) {
        logger.error(`[WhatsAppClient] Media metadata returned empty URL for ${mediaId}`);
        return null;
      }

      // Step 2: Download binary data securely using the Bearer token
      const binaryRes = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (!binaryRes.ok) {
        logger.error(`[WhatsAppClient] Failed to download media binary from Meta (HTTP ${binaryRes.status})`);
        return null;
      }

      const arrayBuffer = await binaryRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;

      return { base64, mimeType };
    } catch (err: any) {
      logger.error(`[WhatsAppClient] Exception downloading media ${mediaId}:`, err.message);
      return null;
    }
  }
}
