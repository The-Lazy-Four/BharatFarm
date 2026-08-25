import { describe, it, expect } from 'vitest';
import { detectSpokenLanguage, classifyLocalIntent } from '../src/features/krishibot/voiceKnowledge/intentClassifier.js';

describe('BharatFarm Multilingual Voice Assistant Test Suite', () => {
  it('correctly detects spoken languages across scripts and Hinglish/Banglish phrases', () => {
    expect(detectSpokenLanguage('Open leaf scanner')).toBe('en');
    expect(detectSpokenLanguage('स्कैनर खोलो')).toBe('hi');
    expect(detectSpokenLanguage('লিফ স্ক্যানার খোলো')).toBe('bn');
    expect(detectSpokenLanguage('Scanner open karo')).toBe('hi');
    expect(detectSpokenLanguage('Weather ta dekhao')).toBe('bn');
    expect(detectSpokenLanguage('আমার crop er অবস্থা কেমন?')).toBe('bn');
  });

  it('provides zero-latency local fast intent matching & instant routing for app navigation', () => {
    const enRes = classifyLocalIntent('Open marketplace');
    expect(enRes.matched).toBe(true);
    expect(enRes.isNavigation).toBe(true);
    expect(enRes.navPath).toBe('/marketplace');
    expect(enRes.detectedLanguage).toBe('en');

    const hiRes = classifyLocalIntent('स्कैनर खोलो');
    expect(hiRes.matched).toBe(true);
    expect(hiRes.isNavigation).toBe(true);
    expect(hiRes.navPath).toBe('/scanner');
    expect(hiRes.detectedLanguage).toBe('hi');
    expect(hiRes.responseMessage).toContain('लीफ स्कैनर खुल गया है');

    const bnRes = classifyLocalIntent('আবহাওয়া দেখাও');
    expect(bnRes.matched).toBe(true);
    expect(bnRes.isNavigation).toBe(true);
    expect(bnRes.navPath).toBe('/weather');
    expect(bnRes.detectedLanguage).toBe('bn');
    expect(bnRes.responseMessage).toContain('আবহাওয়া পূর্বাভাস খুলে গেছে');
  });

  it('correctly handles Hinglish and Banglish natural farmer phrasing', () => {
    const hinglishRes = classifyLocalIntent('leaf disease check karni hai');
    expect(hinglishRes.matched).toBe(true);
    expect(hinglishRes.navPath).toBe('/scanner');

    const banglishRes = classifyLocalIntent('bazaar kholo');
    expect(banglishRes.matched).toBe(true);
    expect(banglishRes.navPath).toBe('/marketplace');
  });

  it('gates sensitive financial/payment transactions behind manual farmer confirmation', () => {
    const payRes = classifyLocalIntent('Confirm payment for fertilizer');
    expect(payRes.matched).toBe(true);
    expect(payRes.isSensitive).toBe(true);
    expect(payRes.isNavigation).toBe(false);
  });
});
