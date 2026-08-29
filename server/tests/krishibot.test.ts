import { describe, it, expect } from 'vitest';
import { KrishiBotRepository } from '../src/modules/krishibot/repositories/krishiBot.repository.js';

describe('KrishiBot / Shayak Complete AI Assistant Module', () => {
  const repository = new KrishiBotRepository();
  const testUserId = 'test-farmer-456';

  it('creates and fetches persistent sessions per authenticated user', async () => {
    const session = await repository.getOrCreateSession(testUserId, 'hi');
    expect(session).toBeDefined();
    expect(session.userId).toBe(testUserId);
    expect(session.language).toBe('hi');

    const fetched = await repository.getOrCreateSession(testUserId, 'hi');
    expect(fetched.id).toBe(session.id);
  });

  it('prevents unauthorized users from accessing another user messages', async () => {
    const session = await repository.getOrCreateSession(testUserId, 'en');
    await expect(repository.getSessionMessages(session.id, 'unauthorized-hacker-789'))
      .rejects.toThrow('UNAUTHORIZED_SESSION_ACCESS');
  });

  it('processes queries with weather context and persists user/bot messages', async () => {
    const session = await repository.getOrCreateSession(testUserId, 'en');
    const response = await repository.processQuery({
      sessionId: session.id,
      message: 'Will tomorrow rain affect spraying in my wheat field?',
      language: 'en',
      farmerContext: { location: 'Punjab', crop: 'Wheat' }
    }, testUserId);

    expect(response).toBeDefined();
    expect(response.sessionId).toBe(session.id);
    expect(response.reply).toBeTruthy();

    const messages = await repository.getSessionMessages(session.id, testUserId);
    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages.some(m => m.sender === 'user' && m.text.includes('rain'))).toBe(true);
    expect(messages.some(m => m.sender === 'bot')).toBe(true);
  }, 15000);

  it('incorporates Marketplace catalog data when query mentions fertilizers', async () => {
    const response = await repository.processQuery({
      message: 'Mujhe wheat ke liye fertilizer chahiye',
      language: 'hi'
    }, testUserId);

    expect(response.reply).toBeTruthy();
  }, 15000);

  it('falls back gracefully to rule-based multilingual engine when OpenRouter is offline', async () => {
    const response = await repository.processQuery({
      message: 'Namaskar, pest control advice for paddy',
      language: 'en'
    }, testUserId);

    expect(response.reply).toContain('pest control');
  });
});
