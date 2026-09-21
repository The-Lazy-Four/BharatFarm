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

  describe('5. WhatsApp State Machine Workflows (TEST A - G)', () => {
    const controller = new WhatsAppController();

    const callDemo = async (body: any) => {
      let status = 200;
      let data: any = null;
      const req: any = { body };
      const res: any = {
        status(code: number) { status = code; return this; },
        json(payload: any) { data = payload; return this; }
      };
      await controller.handleDemo(req, res);
      return { status, data: data?.data };
    };

    it('TEST A: Full Onboarding Flow (HI -> Hindi -> Yes -> Phone -> Connected -> Main Menu -> Price Risk -> Back -> End)', async () => {
      const phone = 'test-flow-a-user';

      // 1. Farmer sends HI
      let res = await callDemo({ phone, message: 'HI' });
      expect(res.data.state).toBe('LANGUAGE_SELECTION');
      expect(res.data.reply).toContain('Welcome to BharatFarm Sahayak');

      // 2. Farmer selects Hindi
      res = await callDemo({ phone, action: 'LANG_HI' });
      expect(res.data.state).toBe('ACCOUNT_SELECTION');
      expect(res.data.reply).toContain('क्या आपका BharatFarm अकाउंट है?');

      // 3. Farmer selects Yes
      res = await callDemo({ phone, action: 'ACCOUNT_YES' });
      expect(res.data.state).toBe('ACCOUNT_LINK_PHONE');
      expect(res.data.reply).toContain('registered mobile number भेजें');

      // 4. Farmer sends phone number 9876543210 (Demo Farmer - Nashik)
      res = await callDemo({ phone, message: '9876543210' });
      expect(res.data.state).toBe('MAIN_MENU');
      expect(res.data.farmer.isLinked).toBe(true);
      expect(res.data.farmer.farmerName).toContain('Demo Farmer');
      expect(res.data.reply).toContain('सफलतापूर्वक कनेक्ट हो गया है');

      // 5. Farmer selects Price Risk / Before You Sow
      res = await callDemo({ phone, action: 'SRV_PRICE_RISK' });
      expect(res.data.state).toBe('SERVICE_RESULT');
      expect(res.data.reply).toContain('Price Risk Analysis');
      expect(res.data.reply).toContain('Tomato');

      // 6. Farmer clicks Back
      res = await callDemo({ phone, action: 'NAV_BACK' });
      expect(res.data.state).toBe('MAIN_MENU');
      expect(res.data.reply).toContain('BharatFarm Sahayak');

      // 7. Farmer clicks End Session
      res = await callDemo({ phone, action: 'NAV_END_SESSION' });
      expect(res.data.state).toBe('END_SESSION');
      expect(res.data.reply).toContain('धन्यवाद');
    });

    it('TEST B: Guest Flow (HI -> English -> No -> Continue -> Climate Risk -> Back -> End)', async () => {
      const phone = 'test-flow-b-user';

      // 1. Farmer sends HI
      let res = await callDemo({ phone, message: 'HI' });
      expect(res.data.state).toBe('LANGUAGE_SELECTION');

      // 2. Select English
      res = await callDemo({ phone, action: 'LANG_EN' });
      expect(res.data.state).toBe('ACCOUNT_SELECTION');
      expect(res.data.reply).toContain('Do you have a BharatFarm account?');

      // 3. Select No
      res = await callDemo({ phone, action: 'ACCOUNT_NO' });
      expect(res.data.state).toBe('ACCOUNT_NOT_CONNECTED');
      expect(res.data.reply).toContain('continue using selected Sahayak services without a BharatFarm account');

      // 4. Continue as Guest
      res = await callDemo({ phone, action: 'GUEST_CONTINUE' });
      expect(res.data.state).toBe('MAIN_MENU');
      expect(res.data.farmer.isLinked).toBe(false);

      // 5. Select Climate Risk
      res = await callDemo({ phone, action: 'SRV_CLIMATE_RISK' });
      expect(res.data.state).toBe('SERVICE_RESULT');
      expect(res.data.reply).toContain('Climate Risk');

      // 6. End Session
      res = await callDemo({ phone, action: 'NAV_END_SESSION' });
      expect(res.data.state).toBe('END_SESSION');
    });

    it('TEST C: Bengali Flow (HI -> Bengali -> Yes -> Phone -> Smart Mandi -> Result)', async () => {
      const phone = 'test-flow-c-user';

      await callDemo({ phone, message: 'HI' });
      await callDemo({ phone, action: 'LANG_BN' });
      await callDemo({ phone, action: 'ACCOUNT_YES' });

      // Link Bengali farmer 9831200001
      let res = await callDemo({ phone, message: '9831200001' });
      expect(res.data.farmer.farmerName).toContain('Souvik');
      expect(res.data.state).toBe('MAIN_MENU');

      // Select Smart Mandi
      res = await callDemo({ phone, action: 'SRV_SMART_MANDI' });
      expect(res.data.state).toBe('SERVICE_RESULT');
      expect(res.data.reply).toContain('Smart Mandi');
    });

    it('TEST D: Invalid Phone Handling (Error message -> Try valid phone -> Connects)', async () => {
      const phone = 'test-flow-d-user';

      await callDemo({ phone, message: 'HI' });
      await callDemo({ phone, action: 'LANG_HI' });
      await callDemo({ phone, action: 'ACCOUNT_YES' });

      // Invalid format
      let res = await callDemo({ phone, message: '1234' });
      expect(res.data.reply).toContain('अमान्य फोन नंबर');

      // Unknown number
      res = await callDemo({ phone, message: '9999999999' });
      expect(res.data.reply).toContain('कोई BharatFarm अकाउंट नहीं मिला');

      // Enter valid number
      res = await callDemo({ phone, message: '9876543210' });
      expect(res.data.state).toBe('MAIN_MENU');
      expect(res.data.farmer.isLinked).toBe(true);
    });

    it('TEST E: Basic Farmer Needs & Sub-services (Leaf Scanner)', async () => {
      const phone = 'test-flow-e-user';

      await callDemo({ phone, message: 'HI' });
      await callDemo({ phone, action: 'LANG_HI' });
      await callDemo({ phone, action: 'ACCOUNT_NO' });
      await callDemo({ phone, action: 'GUEST_CONTINUE' });

      // Select Basic Farmer Needs
      let res = await callDemo({ phone, action: 'SRV_BASIC_NEEDS' });
      expect(res.data.reply).toContain('Basic Farmer Needs');

      // Select Leaf Scanner
      res = await callDemo({ phone, action: 'BN_LEAF_SCANNER' });
      expect(res.data.reply).toContain('Leaf Scanner');
    });

    it('TEST F: Free-text Fallback Intent Routing from Main Menu ("kal baarish hogi kya?")', async () => {
      const phone = 'test-flow-f-user';

      await callDemo({ phone, message: 'HI' });
      await callDemo({ phone, action: 'LANG_HI' });
      await callDemo({ phone, action: 'ACCOUNT_NO' });
      await callDemo({ phone, action: 'GUEST_CONTINUE' });

      // Type free-text query from Main Menu
      const res = await callDemo({ phone, message: 'kal baarish hogi kya?' });
      expect(res.data.state).toBe('SERVICE_RESULT');
      expect(res.data.reply).toContain('मौसम एवं फसल जोखिम अपडेट');
    });

    it('TEST G: Session Ending and Clean Restart on New HI', async () => {
      const phone = 'test-flow-g-user';

      await callDemo({ phone, message: 'HI' });
      await callDemo({ phone, action: 'LANG_HI' });
      let res = await callDemo({ phone, action: 'NAV_END_SESSION' });
      expect(res.data.state).toBe('END_SESSION');

      // Send HI again -> clean new session starting from language selection
      res = await callDemo({ phone, message: 'HI' });
      expect(res.data.state).toBe('LANGUAGE_SELECTION');
      expect(res.data.reply).toContain('Welcome to BharatFarm Sahayak');
    });
  });
});
