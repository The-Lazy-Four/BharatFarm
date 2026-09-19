export type WhatsAppMessageType = 'text' | 'image' | 'audio' | 'voice' | 'location' | 'interactive' | 'unknown';

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

export interface SahayakSessionContext {
  whatsappUserId: string;
  lastIntent?: SahayakIntent;
  lastActiveAt: string;
  pendingAction?: string;
  currentCrop?: string;
  preferredMandi?: string;
  metadata?: Record<string, any>;
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
  phone: string;
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
  intent: SahayakIntent;
  detectedLanguage: string;
  farmer: {
    phoneNumber: string;
    isLinked: boolean;
    farmerName?: string;
    location?: string;
  };
  reply: string;
  suggestedQuickReplies?: string[];
  executionTimeMs: number;
  metadata?: Record<string, any>;
}
