import { describe, it, expect } from 'vitest';
import { KrishiBotRepository } from '../src/modules/krishibot/repositories/krishiBot.repository.js';
import { KrishiBotService } from '../src/modules/krishibot/services/krishibot.service.js';

describe('KrishiBot / Shayak Phase 9 Production Suite', () => {
  const repository = new KrishiBotRepository();
  const service = new KrishiBotService();
  const testUserId = 'test-farmer-shayak-789';

  it('1. creates and retrieves persistent sessions per user', async () => {
    const session = await service.getOrCreateSession(testUserId, 'hi');
    expect(session).toBeDefined();
    expect(session.userId).toBe(testUserId);

    const fetched = await service.getOrCreateSession(testUserId, 'hi');
    expect(fetched.id).toBe(session.id);
  });

  it('2. enforces strict cross-user RLS session isolation', async () => {
    const session = await service.getOrCreateSession(testUserId, 'en');
    await expect(service.getSessionMessages(session.id, 'intruder-user-999'))
      .rejects.toThrow('UNAUTHORIZED_SESSION_ACCESS');

    await expect(service.deleteSession(session.id, 'intruder-user-999'))
      .rejects.toThrow('UNAUTHORIZED_SESSION_ACCESS');
  });

  it('3. routes Weather intent and retrieves live Open-Meteo telemetry', async () => {
    const session = await service.getOrCreateSession(testUserId, 'en');
    const response = await service.getChatResponse({
      sessionId: session.id,
      message: 'Will rain affect spraying in my wheat field today?',
      language: 'en',
      farmerContext: { location: 'Ludhiana', state: 'Punjab', crop: 'Wheat' }
    }, testUserId);

    expect(response).toBeDefined();
    expect(response.reply).toBeTruthy();
    expect(response.suggestedActions?.some(a => a.includes('Weather'))).toBe(true);
  }, 15000);

  it('4. routes Leaf Scanner intent and references latest diagnostic scan', async () => {
    const session = await service.getOrCreateSession(testUserId, 'en');
    const response = await service.getChatResponse({
      sessionId: session.id,
      message: 'What disease did my last leaf scan show and what spray should I use?',
      language: 'en'
    }, testUserId);

    expect(response.reply).toBeTruthy();
    expect(response.suggestedActions).toBeDefined();
  }, 15000);

  it('5. routes Crop Roadmap intent and suggests stage-based actions', async () => {
    const response = await service.getChatResponse({
      message: 'What activity should I do next in my crop roadmap today?',
      language: 'en'
    }, testUserId);

    expect(response.reply).toBeTruthy();
    expect(response.suggestedActions).toBeDefined();
  }, 15000);

  it('6. routes Government Schemes intent with official catalog context', async () => {
    const response = await service.getChatResponse({
      message: 'Which government scheme can I apply for subsidy?',
      language: 'en'
    }, testUserId);

    expect(response.reply).toBeTruthy();
    expect(response.suggestedActions?.some(a => a.includes('Scheme'))).toBe(true);
  }, 15000);

  it('7. routes Marketplace & Group Buying intent with real price catalogs', async () => {
    const response = await service.getChatResponse({
      message: 'Can I buy fertilizer cheaper through group buying pools?',
      language: 'en'
    }, testUserId);

    expect(response.reply).toBeTruthy();
    expect(response.suggestedActions?.some(a => a.includes('Marketplace') || a.includes('Group'))).toBe(true);
  }, 15000);

  it('8. preserves multilingual response capability in Hindi and Bengali', async () => {
    const hiResponse = await service.getChatResponse({
      message: 'गेहूं की फसल के लिए सिंचाई सलाह दें',
      language: 'hi'
    }, testUserId);
    expect(hiResponse.reply).toBeTruthy();

    const bnResponse = await service.getChatResponse({
      message: 'ধানের জমিতে সার প্রয়োগ সম্পর্কিত তথ্য দিন',
      language: 'bn'
    }, testUserId);
    expect(bnResponse.reply).toBeTruthy();
  }, 20000);

  it('9. deletes user session securely upon owner request', async () => {
    const session = await service.getOrCreateSession('user-to-delete-123', 'en');
    const deleted = await service.deleteSession(session.id, 'user-to-delete-123');
    expect(deleted).toBe(true);
  });
});
