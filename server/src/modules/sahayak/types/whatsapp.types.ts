export type WhatsAppMessageType = 'text' | 'image' | 'audio' | 'voice' | 'location' | 'interactive' | 'unknown';

export type SupportedWhatsAppLanguage = 'hi' | 'en' | 'bn';

export type SahayakIntent =
  | 'CLIMATE_RISK'
  | 'SMART_MANDI'
  | 'CROP_DISEASE'
  | 'PRICE_INFORMATION'
  | 'CROP_ADVISORY'
  | 'GOVERNMENT_SCHEME'
  | 'FARM_INFORMATION'
  | 'LINK_ACCOUNT'
  | 'HELP'
  | 'UNKNOWN';

export type SahayakStateMachineState =
  | 'START'
  | 'LANGUAGE_SELECTION'
  | 'ACCOUNT_SELECTION'
  | 'ACCOUNT_LINK_PHONE'
  | 'ACCOUNT_VERIFYING'
  | 'ACCOUNT_CONNECTED'
  | 'ACCOUNT_NOT_CONNECTED'
  | 'MAIN_MENU'
  | 'SERVICE_SELECTION'
  | 'SERVICE_PROCESSING'
  | 'SERVICE_RESULT'
  | 'END_SESSION';

export type SahayakServiceCategory =
  | 'PRICE_RISK'
  | 'CLIMATE_RISK'
  | 'AGGREGATION'
  | 'CROP_INSURANCE'
  | 'SMART_MANDI'
  | 'BASIC_FARMER_NEEDS';

export interface WhatsAppSessionState {
  whatsappUserId: string;
  state: SahayakStateMachineState;
  language: SupportedWhatsAppLanguage;
  accountStatus: 'UNKNOWN' | 'CONNECTED' | 'GUEST' | 'FAILED';
  farmerId?: string | null;
  phoneNumber?: string;
  farmerProfile?: {
    name: string;
    location: string;
    crop?: string;
    land?: string;
    season?: string;
  };
  service?: SahayakServiceCategory;
  serviceStep?: string;
  navigationHistory: SahayakStateMachineState[];
  lastActiveAt: string;
  metadata?: Record<string, any>;
}

export interface WhatsAppUserRecord {
  id: string;
  phoneNumber: string;
  farmerId?: string | null;
  name?: string | null;
  language: string; // 'en' | 'hi' | 'bn'
  locationLat?: number | null;
  locationLng?: number | null;
  locationName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessageRecord {
  id: string;
  whatsappMessageId: string;
  whatsappUserId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  messageType: WhatsAppMessageType;
  content?: string | null;
  mediaId?: string | null;
  intent?: SahayakIntent | null;
  status: 'RECEIVED' | 'PROCESSING' | 'DELIVERED' | 'FAILED';
  createdAt: string;
}

export interface SahayakSessionContext extends WhatsAppSessionState {
  lastIntent?: SahayakIntent;
  pendingAction?: string;
  currentCrop?: string;
  preferredMandi?: string;
}

// Meta Webhook Inbound Payload Types
export interface MetaWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: 'whatsapp';
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: {
          name: string;
        };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        type: string;
        text?: {
          body: string;
        };
        image?: {
          id: string;
          mime_type: string;
          sha256?: string;
          caption?: string;
        };
        audio?: {
          id: string;
          mime_type: string;
          voice?: boolean;
        };
        voice?: {
          id: string;
          mime_type: string;
        };
        location?: {
          latitude: number;
          longitude: number;
          name?: string;
          address?: string;
        };
        interactive?: {
          type: string;
          button_reply?: { id: string; title: string };
          list_reply?: { id: string; title: string; description?: string };
        };
      }>;
      statuses?: Array<{
        id: string;
        status: string;
        timestamp: string;
        recipient_id: string;
      }>;
    };
    field: string;
  }>;
}

export interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

export interface OutgoingWhatsAppMessage {
  to: string;
  type: 'text' | 'image' | 'interactive';
  text?: string;
  imageUrl?: string;
  caption?: string;
  buttons?: Array<{ id: string; title: string }>;
}

export interface DemoWhatsAppRequest {
  phone?: string;
  sessionId?: string;
  action?: string;
  payload?: any;
  message?: string;
  imageBase64?: string;
  audioBase64?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  language?: string;
}

export interface DemoWhatsAppResponse {
  success: boolean;
  state: SahayakStateMachineState;
  intent: SahayakIntent;
  detectedLanguage: SupportedWhatsAppLanguage;
  farmer: {
    phoneNumber: string;
    isLinked: boolean;
    farmerName?: string;
    location?: string;
    land?: string;
    primaryCrop?: string;
  };
  reply: string;
  interactiveType?: 'button' | 'list';
  listTitle?: string;
  buttons?: Array<{ id: string; title: string }>;
  suggestedQuickReplies?: string[];
  executionTimeMs: number;
  metadata?: Record<string, any>;
}
