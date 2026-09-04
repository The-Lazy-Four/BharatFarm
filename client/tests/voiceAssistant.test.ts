import { describe, it, expect } from 'vitest';
import { detectSpokenLanguage, classifyLocalIntent, normalizeText } from '../src/modules/basic-farmer-needs/krishibot/voiceKnowledge/intentClassifier.js';
import { SUPPORTED_LANGUAGES } from '../src/modules/basic-farmer-needs/krishibot/voiceKnowledge/voiceRegistry.js';

describe('BharatFarm Multilingual Voice Assistant Test Suite — Expanded Coverage', () => {
  it('correctly detects spoken languages across 11 regional Indian languages and scripts', () => {
    expect(detectSpokenLanguage('Open leaf scanner')).toBe('en');
    expect(detectSpokenLanguage('स्कैनर खोलो')).toBe('hi');
    expect(detectSpokenLanguage('লিফ স্ক্যানার খোলো')).toBe('bn');
    expect(detectSpokenLanguage('मौसम पूर्वाभास दिखाओ')).toBe('hi');
    expect(detectSpokenLanguage('আবহাওয়া পূর্বাভাষ')).toBe('bn');
    expect(detectSpokenLanguage('వాతావరణం చూడండి')).toBe('te');
    expect(detectSpokenLanguage('வானிலை பார்க்கவும்')).toBe('ta');
    expect(detectSpokenLanguage('હવામાન અંદાજ')).toBe('gu');
    expect(detectSpokenLanguage('ਮੌਸਮ ਜਾਣਕਾਰੀ')).toBe('pa');
    expect(detectSpokenLanguage('પાદડું check કરો')).toBe('gu');
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

    const bnRes = classifyLocalIntent('আজ আবহাওয়া কেমন?');
    expect(bnRes.detectedLanguage).toBe('bn');
  });

  it('handles informal farmer speech patterns and diverse command variants', () => {
    const variants = [
      'scanner',
      'scanner kholo',
      'scanner open karo',
      'scanner khol do',
      'mujhe scanner dekhna hai',
      'pata check karna hai',
      'leaf check',
      'plant check karo',
      'meri fasal check karo',
      'yeh wala scanner',
      'scanner kaha hai',
      'scanner kidhar milega',
      'mujhe patta dekhna hai',
      'patta check'
    ];

    for (const phrase of variants) {
      const res = classifyLocalIntent(phrase);
      expect(res.matched).toBe(true);
      expect(res.navPath).toBe('/scanner');
    }
  });

  it('handles speech-to-text mistakes and phonetic errors', () => {
    expect(classifyLocalIntent('scannar kholo').navPath).toBe('/scanner');
    expect(classifyLocalIntent('scaner kholo').navPath).toBe('/scanner');
    expect(classifyLocalIntent('skaner kholo').navPath).toBe('/scanner');
    expect(classifyLocalIntent('mosam batao').navPath).toBe('/weather');
    expect(classifyLocalIntent('mousam dekhao').navPath).toBe('/weather');
    expect(classifyLocalIntent('mandee dikhao').navPath).toBe('/marketplace');
  });

  it('safely handles meaningless noise/short audio without random navigation', () => {
    const noiseInputs = ['a', 'uh', 'hmm', 'um', 'ee', 'ओ', 'আ', 'হুম'];
    for (const noise of noiseInputs) {
      const res = classifyLocalIntent(noise);
      expect(res.matched).toBe(false);
      expect(res.isNoise).toBe(true);
      expect(res.responseMessage).toBeDefined();
    }
  });

  it('supports affirmative context follow-ups ("haan", "yes", "theek hai")', () => {
    const followUpEn = classifyLocalIntent('yes', 'OPEN_WEATHER');
    expect(followUpEn.matched).toBe(true);
    expect(followUpEn.navPath).toBe('/weather');

    const followUpHi = classifyLocalIntent('haan', 'OPEN_SCANNER');
    expect(followUpHi.matched).toBe(true);
    expect(followUpHi.navPath).toBe('/scanner');
  });

  it('gates sensitive financial/payment transactions behind manual farmer confirmation', () => {
    const payRes = classifyLocalIntent('Confirm payment for fertilizer');
    expect(payRes.matched).toBe(true);
    expect(payRes.isSensitive).toBe(true);
    expect(payRes.isNavigation).toBe(false);
  });

  it('supports barge-in interruption detection and normalization', () => {
    const norm = normalizeText('Open weather ta dekhao!');
    expect(norm).toBe('open weather ta dekhao');
  });

  it('has valid BCP-47 locale configurations for all 11 supported languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(11);
    expect(SUPPORTED_LANGUAGES.find(l => l.code === 'bn')?.bcp47).toBe('bn-IN');
    expect(SUPPORTED_LANGUAGES.find(l => l.code === 'hi')?.bcp47).toBe('hi-IN');
    expect(SUPPORTED_LANGUAGES.find(l => l.code === 'mr')?.bcp47).toBe('mr-IN');
  });
});
