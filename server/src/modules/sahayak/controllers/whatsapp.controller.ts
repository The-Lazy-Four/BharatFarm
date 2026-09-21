import { Request, Response } from 'express';
import { config } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { WhatsAppClientService } from '../services/whatsappClient.service.js';
import { WhatsAppUserService } from '../services/whatsappUser.service.js';
import { WhatsAppStateMachineService } from '../services/whatsappStateMachine.service.js';
import { MetaWebhookPayload, DemoWhatsAppRequest, DemoWhatsAppResponse } from '../types/whatsapp.types.js';

export class WhatsAppController {
  // Deduplication cache: remembers recently processed wamids (10-minute sliding window)
  private static processedMessageIds = new Map<string, number>();

  private static isDuplicate(messageId: string): boolean {
    const now = Date.now();
    // Prune entries older than 10 minutes
    for (const [id, time] of this.processedMessageIds.entries()) {
      if (now - time > 10 * 60 * 1000) {
        this.processedMessageIds.delete(id);
      }
    }

    if (this.processedMessageIds.has(messageId)) {
      return true;
    }
    this.processedMessageIds.set(messageId, now);
    return false;
  }

  /**
   * GET /api/sahayak/whatsapp/webhook
   * Meta Webhook verification handshake
   */
  verifyWebhook = (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = config.whatsapp?.verifyToken || 'bharatfarm_verify_token_secure';

    logger.info(`[WhatsAppController] Webhook verification request received (mode: ${mode})`);

    if (mode === 'subscribe' && token === expectedToken) {
      logger.info('[WhatsAppController] Webhook verified successfully with Meta challenge.');
      res.status(200).send(challenge);
      return;
    }

    logger.warn('[WhatsAppController] Webhook verification rejected: token mismatch');
    res.status(403).json({ error: 'Verification token mismatch' });
  };

  /**
   * POST /api/sahayak/whatsapp/webhook
   * Inbound WhatsApp webhook events
   */
  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const payload: MetaWebhookPayload = req.body;

    // Immediately acknowledge HTTP 200 to Meta to prevent timeout & retries
    res.status(200).send('EVENT_RECEIVED');

    if (!payload?.entry || !Array.isArray(payload.entry)) {
      return;
    }

    // Asynchronously process messages without blocking webhook acknowledgment
    for (const entry of payload.entry) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const val = change.value;
        if (!val || val.messaging_product !== 'whatsapp') continue;

        const messages = val.messages || [];
        const contacts = val.contacts || [];
        const contactMap = new Map<string, string>();
        contacts.forEach(c => contactMap.set(c.wa_id, c.profile?.name || 'Farmer'));

        for (const msg of messages) {
          const messageId = msg.id;
          const fromPhone = msg.from;
          const senderName = contactMap.get(fromPhone) || 'Farmer';

          // Message ID deduplication
          if (WhatsAppController.isDuplicate(messageId)) {
            logger.info(`[WhatsAppController] Skipping duplicate WhatsApp message ${messageId}`);
            continue;
          }

          logger.info(`[WhatsAppController] Inbound message from ${fromPhone} (type: ${msg.type}, id: ${messageId})`);

          // Process in background using state machine
          this.processInboundMessage(msg, fromPhone, senderName).catch(err => {
            logger.error(`[WhatsAppController] Error processing message ${messageId}:`, err);
          });
        }
      }
    }
  };

  /**
   * Background processor for an individual incoming WhatsApp message
   */
  private async processInboundMessage(
    msg: any,
    phone: string,
    senderName: string
  ): Promise<void> {
    const user = await WhatsAppUserService.getOrCreateUser(phone, senderName);

    const buttonReplyId = msg.interactive?.button_reply?.id;
    const listReplyId = msg.interactive?.list_reply?.id;
    const incomingAction = buttonReplyId || listReplyId;
    const incomingText = msg.text?.body || msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title;

    const stepResult = await WhatsAppStateMachineService.handleEvent(user, {
      text: incomingText,
      action: incomingAction
    });

    // Send reply via Meta WhatsApp Cloud API with interactive buttons or list if available
    if (stepResult.buttons && stepResult.buttons.length > 0) {
      if (stepResult.interactiveType === 'list') {
        await WhatsAppClientService.sendInteractiveList(
          phone,
          stepResult.text,
          stepResult.listTitle || 'Menu',
          stepResult.buttons
        );
      } else {
        await WhatsAppClientService.sendInteractiveButtons(
          phone,
          stepResult.text,
          stepResult.buttons
        );
      }
    } else {
      await WhatsAppClientService.sendTextMessage(phone, stepResult.text);
    }
  }

  /**
   * POST /api/sahayak/whatsapp/demo
   * Demo / Testing Mode for SIH evaluators without requiring real Meta credentials
   */
  handleDemo = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    try {
      const body: DemoWhatsAppRequest = req.body;
      const phone = body.phone || 'demo-user';

      const user = await WhatsAppUserService.getOrCreateUser(phone, 'SIH Demo Farmer');

      // Check if action is RESTART / RESET
      if (body.action === 'RESET' || body.action === 'RESTART') {
        WhatsAppUserService.resetSession(user.id);
      }

      if (body.language) {
        await WhatsAppUserService.updateLanguage(user.id, body.language);
        user.language = body.language;
      }

      const input = {
        text: body.message,
        action: body.action,
        payload: body.payload
      };

      const stepResult = await WhatsAppStateMachineService.handleEvent(user, input);
      const session = WhatsAppUserService.getSession(user.id);
      const executionTimeMs = Date.now() - startTime;

      const responsePayload: DemoWhatsAppResponse = {
        success: true,
        state: session.state,
        intent: session.lastIntent || 'HELP',
        detectedLanguage: session.language,
        farmer: {
          phoneNumber: session.phoneNumber || user.phoneNumber,
          isLinked: session.accountStatus === 'CONNECTED',
          farmerName: session.farmerProfile?.name || user.name || 'Farmer',
          location: session.farmerProfile?.location || user.locationName || 'Nashik, Maharashtra',
          land: session.farmerProfile?.land,
          primaryCrop: session.farmerProfile?.crop
        },
        reply: stepResult.text,
        interactiveType: stepResult.interactiveType,
        listTitle: stepResult.listTitle,
        buttons: stepResult.buttons,
        suggestedQuickReplies: stepResult.quickReplies,
        executionTimeMs,
        metadata: {
          isDemoMode: true,
          metaCloudApiConfigured: WhatsAppClientService.isConfigured(),
          accountStatus: session.accountStatus,
          historyDepth: session.navigationHistory?.length || 1
        }
      };

      ApiResponse.success(res, responsePayload, 'Sahayak WhatsApp state machine processed successfully');
    } catch (err: any) {
      logger.error('[WhatsAppController] Demo mode error:', err);
      ApiResponse.error(res, 'Failed to process WhatsApp demo request', err.message);
    }
  };
}
