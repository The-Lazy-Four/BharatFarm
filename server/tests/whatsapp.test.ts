import { describe, it, expect, vi } from 'vitest';
import { IntentRouterService } from '../src/modules/sahayak/services/intentRouter.service.js';
import { ResponseFormatterService } from '../src/modules/sahayak/services/responseFormatter.service.js';
import { SahayakCoreService } from '../src/modules/sahayak/services/sahayakCore.service.js';
import { WhatsAppUserService } from '../src/modules/sahayak/services/whatsappUser.service.js';
import { WhatsAppController } from '../src/modules/sahayak/controllers/whatsapp.controller.js';
import { config } from '../src/config/env.js';

describe('Sahayak WhatsApp Access Layer', () => {
  describe('1. Webhook Verification', () => {
    it('should verify webhook with correct challenge token', () => {
      const controller = new WhatsAppController();
      let sentStatus = 0;
      let sentBody = '';

      const req: any = {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': config.whatsapp.verifyToken || 'bharatfarm_verify_token_secure',
          'hub.challenge': '1155993300'
        }
      };

      const res: any = {
        status(code: number) {
          sentStatus = code;
          return this;
        },
        send(body: any) {
          sentBody = body;
          return this;
        },
        json(payload: any) {
          sentBody = JSON.stringify(payload);
          return this;
        }
      };

      controller.verifyWebhook(req, res);
      expect(sentStatus).toBe(200);
      expect(sentBody).toBe('1155993300');
    });

    it('should reject invalid verification token', () => {
      const controller = new WhatsAppController();
      let sentStatus = 0;

      const req: any = {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong_token',
          'hub.challenge': '1155993300'
        }
      };

      const res: any = {
        status(code: number) {
          sentStatus = code;
          return this;
        },
        json() {
          return this;
        }
      };

      controller.verifyWebhook(req, res);
      expect(sentStatus).toBe(403);
    });
  });

  describe('2. Intent Detection & Language Recognition', () => {
    it('should route "Kal baarish hogi kya?" to CLIMATE_RISK in Hindi', async () => {
      const result = await IntentRouterService.classify('Kal baarish hogi kya?');
      expect(result.intent).toBe('CLIMATE_RISK');
      expect(result.detectedLanguage).toBe('hi');
    });

    it('should route "Aaj mere paas wali mandi mein dhan ka kya rate hai?" to SMART_MANDI with Paddy', async () => {
      const result = await IntentRouterService.classify('Aaj mere paas wali mandi mein dhan ka kya rate hai?');
      expect(result.intent).toBe('SMART_MANDI');
      expect(result.extractedEntity?.crop).toBe('Paddy');
    });

    it('should route "meri fasal mein daag hai" to CROP_DISEASE', async () => {
      const result = await IntentRouterService.classify('meri fasal mein daag hai');
      expect(result.intent).toBe('CROP_DISEASE');
    });

    it('should route "PM Kisan ke liye apply kaise karu" to GOVERNMENT_SCHEME', async () => {
      const result = await IntentRouterService.classify('PM Kisan ke liye apply kaise karu');
      expect(result.intent).toBe('GOVERNMENT_SCHEME');
    });

    it('should recognize Bengali query "আগামীকাল কি বৃষ্টি হবে?"', async () => {
      const result = await IntentRouterService.classify('আগামীকাল কি বৃষ্টি হবে?');
      expect(result.intent).toBe('CLIMATE_RISK');
      expect(result.detectedLanguage).toBe('bn');
    });
  });

  describe('3. Core Sahayak Pipeline Execution', () => {
    it('should execute Climate Risk routing and format WhatsApp report', async () => {
      const user = await WhatsAppUserService.getOrCreateUser('919831200001', 'Souvik Dey');
      const output = await SahayakCoreService.handleIncomingMessage(user, {
        text: 'Kal baarish hogi kya?'
      });

      expect(output.intent).toBe('CLIMATE_RISK');
      expect(output.replyText).toContain('मौसम एवं फसल जोखिम अपडेट');
      expect(output.replyText).toContain('बारिश की संभावना');
    });

    it('should execute Smart Mandi routing and format prices', async () => {
      const user = await WhatsAppUserService.getOrCreateUser('919831200002', 'Ramesh Patel');
      await WhatsAppUserService.updateLanguage(user.id, 'hi');
      user.language = 'hi';

      const output = await SahayakCoreService.handleIncomingMessage(user, {
        text: 'Aaj dhan ka mandi rate kya hai?'
      });

      expect(output.intent).toBe('SMART_MANDI');
      expect(output.replyText).toContain('मंडी');
      expect(output.replyText).toContain('Paddy');
      expect(output.replyText).toContain('₹');
    });

    it('should handle GPS Location pin sharing', async () => {
      const user = await WhatsAppUserService.getOrCreateUser('919831200001', 'Souvik Dey');
      const output = await SahayakCoreService.handleIncomingMessage(user, {
        location: { latitude: 22.0667, longitude: 88.0667, name: 'Haldia Port' }
      });

      expect(output.intent).toBe('FARM_INFORMATION');
      expect(output.replyText).toContain('Location Updated');
      expect(output.replyText).toContain('Haldia APMC');
    });
  });

  describe('4. Interactive Demo Endpoint Mode', () => {
    it('should process simulated WhatsApp message via POST /demo', async () => {
      const controller = new WhatsAppController();
      let responseStatus = 200;
      let responseBody: any = null;

      const req: any = {
        body: {
          phone: 'demo-judge-sih',
          message: "What is today's mandi price for potato?"
        }
      };

      const res: any = {
        status(code: number) {
          responseStatus = code;
          return this;
        },
        json(data: any) {
          responseBody = data;
          return this;
        }
      };

      await controller.handleDemo(req, res);

      expect(responseStatus).toBe(200);
      expect(responseBody.success).toBe(true);
      expect(responseBody.data.intent).toBe('SMART_MANDI');
      expect(responseBody.data.reply).toContain('Smart Mandi');
      expect(responseBody.data.metadata.isDemoMode).toBe(true);
    });
  });
});
