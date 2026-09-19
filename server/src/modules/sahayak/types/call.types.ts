export type SupportedCallLanguage = 'hi' | 'en' | 'bn';

export type CallModuleOption =
  | 'BEFORE_YOU_SOW'       // Option 1
  | 'CLIMATE_RISK'         // Option 2
  | 'AGGREGATION'          // Option 3
  | 'CROP_INSURANCE'       // Option 4
  | 'SMART_MANDI'          // Option 5
  | 'BASIC_FARMER_NEEDS';  // Option 6

export type CallStep =
  | 'WELCOME_LANGUAGE'     // Initial greeting asking for language (1, 2, 3)
  | 'MAIN_MENU'            // Service selection (1 - 6)
  | 'BEFORE_YOU_SOW_FLOW'  // Crop, land size, district questions & recommendation
  | 'CLIMATE_RISK_FLOW'    // Weather, rain, flood inquiry
  | 'AGGREGATION_FLOW'     // Collective selling/buying pool inquiry
  | 'CROP_INSURANCE_FLOW'  // Claim check & satellite verification guidance
  | 'SMART_MANDI_FLOW'     // Local prices, nearest mandi & buyer demand
  | 'BASIC_NEEDS_FLOW'     // Scanner, marketplace, roadmap, schemes guidance
  | 'FOLLOW_UP_CONVERSATION';

export interface CallSessionState {
  sessionId: string;
  callerPhone: string;
  farmerId?: string | null;
  farmerName?: string;
  language: SupportedCallLanguage;
  currentStep: CallStep;
  activeModule?: CallModuleOption;
  
  // Accumulated farmer profile context during call
  crop?: string;
  landSizeAcres?: number;
  district?: string;
  state?: string;
  claimId?: string;
  quantityKg?: number;
  
  // Call metadata
  startedAt: string;
  lastActiveAt: string;
  history: Array<{
    speaker: 'ai' | 'farmer';
    text: string;
    dtmf?: string;
    timestamp: string;
  }>;
}

export interface CallEventRequest {
  sessionId: string;
  callerPhone?: string;
  digits?: string;       // DTMF key pressed ('1', '2', '3', '#', '*')
  speechText?: string;   // Speech recognition transcript
  language?: SupportedCallLanguage;
}

export interface CallEventResponse {
  sessionId: string;
  spokenText: string;    // SSML or plain text to be spoken via TTS
  displayPrompt: string; // Formatted readable text for visual telephony screen
  optionsMenu?: Array<{ key: string; label: string }>;
  currentStep: CallStep;
  activeModule?: CallModuleOption;
  language: SupportedCallLanguage;
  isCallEnded?: boolean;
}

export interface TelephonyProvider {
  name: string;
  initiateCall(toNumber: string, webhookUrl: string): Promise<{ callId: string; status: string }>;
  terminateCall(callId: string): Promise<boolean>;
  playTts(callId: string, text: string, language: SupportedCallLanguage): Promise<void>;
  collectDtmf(callId: string, maxDigits: number, timeoutSec: number): Promise<string>;
}
