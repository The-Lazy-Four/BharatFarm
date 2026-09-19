import {
  CallSessionState,
  SupportedCallLanguage,
  CallModuleOption,
  CallStep
} from '../types/call.types.js';
import { WhatsAppUserService } from './whatsappUser.service.js';

export class CallSessionService {
  private static sessions = new Map<string, CallSessionState>();

  private static knownProfiles: Record<string, { name: string; crop: string; district: string; state: string }> = {
    '919876543210': { name: 'Ramesh Patel', crop: 'paddy', district: 'Purba Medinipur', state: 'West Bengal' },
    '919831200001': { name: 'Souvik Dey', crop: 'paddy', district: 'Purba Medinipur', state: 'West Bengal' }
  };

  /**
   * Initialize or retrieve an active telephony call session
   */
  static getOrCreateSession(
    sessionId: string,
    callerPhone: string = '+91 98312 00001'
  ): CallSessionState {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      session.lastActiveAt = new Date().toISOString();
      return session;
    }

    // Try finding existing farmer profile to reuse context (crop, district, state)
    const cleanPhone = callerPhone.replace(/[^0-9]/g, '');
    const known = this.knownProfiles[cleanPhone];

    let farmerName = known?.name || 'Farmer';
    let defaultCrop: string | undefined = known?.crop || 'paddy';
    let defaultDistrict: string | undefined = known?.district || 'Purba Medinipur';
    let defaultState: string | undefined = known?.state || 'West Bengal';

    const newSession: CallSessionState = {
      sessionId,
      callerPhone,
      farmerName,
      language: 'hi', // default until farmer chooses DTMF or speech
      currentStep: 'WELCOME_LANGUAGE',
      crop: defaultCrop,
      district: defaultDistrict,
      state: defaultState,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      history: []
    };

    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  static getSession(sessionId: string): CallSessionState | undefined {
    return this.sessions.get(sessionId);
  }

  static updateSession(sessionId: string, updates: Partial<CallSessionState>): CallSessionState {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Call session ${sessionId} not found`);
    }
    Object.assign(session, updates, { lastActiveAt: new Date().toISOString() });
    this.sessions.set(sessionId, session);
    return session;
  }

  static addHistory(sessionId: string, speaker: 'ai' | 'farmer', text: string, dtmf?: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.history.push({
        speaker,
        text,
        dtmf,
        timestamp: new Date().toISOString()
      });
      session.lastActiveAt = new Date().toISOString();
    }
  }

  static endSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
