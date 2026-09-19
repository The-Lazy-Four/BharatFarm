import { describe, it, expect } from 'vitest';
import { CallAssistantService } from '../src/modules/sahayak/services/callAssistant.service.js';
import { CallSessionService } from '../src/modules/sahayak/services/callSession.service.js';
import { VoiceIntentService } from '../src/modules/sahayak/services/voiceIntent.service.js';
import { CallController } from '../src/modules/sahayak/controllers/call.controller.js';

describe('BharatFarm Sahayak AI Voice Call & IVR Assistant', () => {
  const sessionId = `test_call_${Date.now()}`;
  const callerPhone = '+91 98312 99999';

  // Section 27 Test Requirements:
  // 1. Hindi language selection
  // 2. English language selection
  // 3. Bengali language selection
  // 4. Main menu DTMF routing
  // 5. Option 1 -> Before You Sow
  // 6. Option 2 -> Climate Risk
  // 7. Option 3 -> Aggregation
  // 8. Option 4 -> Crop Insurance
  // 9. Option 5 -> Smart Mandi
  // 10. Option 6 -> Basic Farmer Needs
  // 11. Natural language Climate query
  // 12. Natural language Mandi query
  // 13. Natural language Crop Insurance query
  // 14. Natural language Before You Sow query
  // 15. Natural language Aggregation query
  // 16. Natural language Basic Farmer query
  // 17. Main menu command
  // 18. Back command
  // 19. Repeat command
  // 20. Session persistence
  // 21. Farmer profile reuse
  // 22. Unknown intent
  // 23. Service failure resilience
  // 24. Demo call flow

  describe('1-3. Language Selection via DTMF', () => {
    it('1. Hindi language selection (Key 1)', async () => {
      const sess = CallSessionService.getOrCreateSession(`hi_test_${Date.now()}`, callerPhone);
      const res = await CallAssistantService.processCallEvent({
        sessionId: sess.sessionId,
        digits: '1'
      });
      expect(res.language).toBe('hi');
      expect(res.currentStep).toBe('MAIN_MENU');
      expect(res.displayPrompt).toContain('BharatFarm Sahayak');
      expect(res.optionsMenu).toBeDefined();
      expect(res.optionsMenu?.length).toBe(6);
    });

    it('2. English language selection (Key 2)', async () => {
      const sess = CallSessionService.getOrCreateSession(`en_test_${Date.now()}`, callerPhone);
      const res = await CallAssistantService.processCallEvent({
        sessionId: sess.sessionId,
        digits: '2'
      });
      expect(res.language).toBe('en');
      expect(res.currentStep).toBe('MAIN_MENU');
      expect(res.displayPrompt).toContain('Press 1 for Before You Sow');
    });

    it('3. Bengali language selection (Key 3)', async () => {
      const sess = CallSessionService.getOrCreateSession(`bn_test_${Date.now()}`, callerPhone);
      const res = await CallAssistantService.processCallEvent({
        sessionId: sess.sessionId,
        digits: '3'
      });
      expect(res.language).toBe('bn');
      expect(res.currentStep).toBe('MAIN_MENU');
      expect(res.displayPrompt).toContain('ভারতফার্ম সহায়ক');
    });
  });

  describe('4-10. Main Menu DTMF Routing to Existing BharatFarm Services', () => {
    it('4 & 5. Option 1 -> Before You Sow', async () => {
      const testId = `sow_test_${Date.now()}`;
      // Select Hindi first
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '1' });
      // Press 1 for Before You Sow
      const res = await CallAssistantService.processCallEvent({ sessionId: testId, digits: '1' });
      expect(res.activeModule).toBe('BEFORE_YOU_SOW');
      expect(res.spokenText.length).toBeGreaterThan(15);
    });

    it('6. Option 2 -> Climate Risk (calls weather & climate engine)', async () => {
      const testId = `climate_test_${Date.now()}`;
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '2' }); // English
      const res = await CallAssistantService.processCallEvent({ sessionId: testId, digits: '2' }); // Climate
      expect(res.activeModule).toBe('CLIMATE_RISK');
      expect(res.spokenText).toMatch(/weather|rain|forecast|condition/i);
    });

    it('7. Option 3 -> Aggregation (collective selling/buying)', async () => {
      const testId = `agg_test_${Date.now()}`;
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '2' });
      const res = await CallAssistantService.processCallEvent({ sessionId: testId, digits: '3' });
      expect(res.activeModule).toBe('AGGREGATION');
      expect(res.spokenText).toMatch(/collective|group|pool|quantity/i);
    });

    it('8. Option 4 -> Crop Insurance (Claim store & satellite NDVI)', async () => {
      const testId = `ins_test_${Date.now()}`;
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '2' });
      const res = await CallAssistantService.processCallEvent({ sessionId: testId, digits: '4' });
      expect(res.activeModule).toBe('CROP_INSURANCE');
      expect(res.spokenText).toMatch(/insurance|claim|satellite|PMFBY/i);
    });

    it('9. Option 5 -> Smart Mandi (SmartMandiMatchingService prices)', async () => {
      const testId = `mandi_test_${Date.now()}`;
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '2' });
      const res = await CallAssistantService.processCallEvent({ sessionId: testId, digits: '5' });
      expect(res.activeModule).toBe('SMART_MANDI');
      expect(res.spokenText).toMatch(/mandi|price|quintal|market/i);
    });

    it('10. Option 6 -> Basic Farmer Needs (Leaf Scanner, Schemes, Roadmap)', async () => {
      const testId = `basic_test_${Date.now()}`;
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '2' });
      const res = await CallAssistantService.processCallEvent({ sessionId: testId, digits: '6' });
      expect(res.activeModule).toBe('BASIC_FARMER_NEEDS');
      expect(res.spokenText).toMatch(/Basic Farmer Needs|Leaf Scanner|tools/i);
    });
  });

  describe('11-16. Natural Language Speech Routing', () => {
    it('11. Natural language Climate query ("Kal baarish hogi kya?")', async () => {
      const testId = `speech_clim_${Date.now()}`;
      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        speechText: 'Kal baarish hogi kya?'
      });
      expect(res.activeModule).toBe('CLIMATE_RISK');
      expect(res.language).toBe('hi');
      expect(res.spokenText).toMatch(/baarish|mausam|rain|spray/i);
    });

    it('12. Natural language Mandi query ("Kal dhan bechna hai, sabse achhi mandi kaunsi hai?")', async () => {
      const testId = `speech_mandi_${Date.now()}`;
      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        speechText: 'Kal dhan bechna hai, sabse achhi mandi kaunsi hai?'
      });
      expect(res.activeModule).toBe('SMART_MANDI');
      expect(res.spokenText).toMatch(/mandi|bhav|dhan|paddy/i);
    });

    it('13. Natural language Crop Insurance query ("Fasal ka daawa verify karna hai")', async () => {
      const testId = `speech_ins_${Date.now()}`;
      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        speechText: 'Fasal ka daawa verify karna hai'
      });
      expect(res.activeModule).toBe('CROP_INSURANCE');
      expect(res.spokenText).toMatch(/bima|claim|satellite/i);
    });

    it('14. Natural language Before You Sow query ("Is baar kaunsa crop lagana sahi rahega?")', async () => {
      const testId = `speech_sow_${Date.now()}`;
      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        speechText: 'Is baar kaunsa crop lagana sahi rahega?'
      });
      expect(res.activeModule).toBe('BEFORE_YOU_SOW');
      expect(res.spokenText).toMatch(/Before You Sow|crop|sowing|fasal/i);
    });

    it('15. Natural language Aggregation query ("Mujhe group mein fasal bechni hai")', async () => {
      const testId = `speech_agg_${Date.now()}`;
      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        speechText: 'Mujhe group mein fasal bechni hai'
      });
      expect(res.activeModule).toBe('AGGREGATION');
      expect(res.spokenText).toMatch(/group|collective|aggregation|pool/i);
    });

    it('16. Natural language Basic Farmer query ("Leaf scanner kahan hai?")', async () => {
      const testId = `speech_basic_${Date.now()}`;
      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        speechText: 'Leaf scanner kahan hai aur kaise use karein?'
      });
      expect(res.activeModule).toBe('BASIC_FARMER_NEEDS');
      expect(res.spokenText).toMatch(/leaf|scanner|photo/i);
    });
  });

  describe('17-21. Telephony Commands & Session Continuity', () => {
    it('17. "main menu" command returns to main IVR menu in active language', async () => {
      const testId = `cmd_menu_${Date.now()}`;
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '1' }); // Set Hindi
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '2' }); // Enter Climate
      
      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        speechText: 'main menu'
      });
      expect(res.currentStep).toBe('MAIN_MENU');
      expect(res.language).toBe('hi');
      expect(res.displayPrompt).toContain('Before You Sow ke liye 1 dabayein');
    });

    it('18. "back" command steps back', async () => {
      const testId = `cmd_back_${Date.now()}`;
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '2' }); // Set English
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '5' }); // Mandi

      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        speechText: 'back'
      });
      expect(res.currentStep).toBe('MAIN_MENU');
    });

    it('19. "repeat" command replays previous prompt', async () => {
      const testId = `cmd_rep_${Date.now()}`;
      const first = await CallAssistantService.processCallEvent({ sessionId: testId, digits: '2' });
      const repeat = await CallAssistantService.processCallEvent({ sessionId: testId, speechText: 'repeat' });
      expect(repeat.displayPrompt).toBe(first.displayPrompt);
    });

    it('20. Session persistence & crop context memory', async () => {
      const testId = `sess_mem_${Date.now()}`;
      await CallAssistantService.processCallEvent({ sessionId: testId, digits: '1' }); // Hindi
      await CallAssistantService.processCallEvent({ sessionId: testId, speechText: 'My crop is paddy' });

      const sess = CallSessionService.getSession(testId);
      expect(sess?.crop?.toLowerCase()).toContain('paddy');
      expect(sess?.language).toBe('hi');
    });

    it('21. Farmer profile reuse (Pre-fills existing profile)', () => {
      const sess = CallSessionService.getOrCreateSession(`profile_${Date.now()}`, '+91 98765 43210');
      expect(sess.farmerName).toBe('Ramesh Patel');
      expect(sess.crop).toBe('paddy');
      expect(sess.district).toBe('Purba Medinipur');
    });
  });

  describe('22-24. Edge Cases, Unknown Intent & Full Call Flow', () => {
    it('22. Unknown intent responds politely without crashing', async () => {
      const testId = `unk_${Date.now()}`;
      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        speechText: 'xyz abc random non-agricultural sentence'
      });
      expect(res.spokenText.length).toBeGreaterThan(10);
      expect(res.isCallEnded).toBeFalsy();
    });

    it('23. Service failure resilience (no internal trace exposed)', async () => {
      const testId = `fail_${Date.now()}`;
      const res = await CallAssistantService.processCallEvent({
        sessionId: testId,
        digits: '999' // Non-existent key
      });
      expect(res.spokenText).not.toContain('TypeError');
      expect(res.spokenText).not.toContain('Stack trace');
    });

    it('24. Full demo call flow simulation (Dial -> Lang -> Main Menu -> Smart Mandi -> Disconnect)', async () => {
      const testId = `flow_demo_${Date.now()}`;
      
      // Step 1: Inbound Call
      const init = await CallAssistantService.processCallEvent({ sessionId: testId, callerPhone });
      expect(init.currentStep).toBe('WELCOME_LANGUAGE');

      // Step 2: Key 1 (Hindi)
      const lang = await CallAssistantService.processCallEvent({ sessionId: testId, digits: '1' });
      expect(lang.currentStep).toBe('MAIN_MENU');
      expect(lang.language).toBe('hi');

      // Step 3: Key 5 (Smart Mandi)
      const mandi = await CallAssistantService.processCallEvent({ sessionId: testId, digits: '5' });
      expect(mandi.activeModule).toBe('SMART_MANDI');
      expect(mandi.spokenText).toMatch(/mandi/i);

      // Step 4: Spoken "Exit"
      const exit = await CallAssistantService.processCallEvent({ sessionId: testId, speechText: 'exit' });
      expect(exit.isCallEnded).toBe(true);
    });
  });
});
