# BharatFarm Sahayak — WhatsApp Access Layer Documentation

## 1. Architecture Overview

WhatsApp functions as an alternative, zero-install, multi-lingual access channel to BharatFarm's existing agricultural intelligence backend.

```
                    FARMER
                       │
             ┌─────────┴─────────┐
             │                   │
          BharatFarm          WhatsApp
             PWA                  │
             │                    │
             └─────────┬──────────┘
                       ↓
                 Sahayak Core
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Climate Risk    Smart Mandi    Crop Scanner
  (weatherProvider, (SmartMandi    (AiClient Vision
   climateEngine)   MatchingService) Pathologist)
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                 AI / Intent Layer
                       ↓
                Response Generator
                       ↓
                    WhatsApp
```

The WhatsApp layer does **not** contain or duplicate agricultural business logic. It translates incoming messages (text, image, audio, location) into structured intents, routes them to existing services, and formats the output into clean, concise WhatsApp markdown.

---

## 2. Meta WhatsApp Cloud API Setup

### Requirements:
1. **Meta for Developers Account** at [developers.facebook.com](https://developers.facebook.com/).
2. Create a WhatsApp Business App in Meta Developer Portal.
3. Obtain:
   - `WHATSAPP_ACCESS_TOKEN`: System User Permanent Access Token (or temporary 24h test token).
   - `WHATSAPP_PHONE_NUMBER_ID`: From WhatsApp > Getting Started dashboard.
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`: WhatsApp Business Account ID.
   - `WHATSAPP_VERIFY_TOKEN`: A secret string created by you (e.g. `bharatfarm_verify_token_secure`).
   - `WHATSAPP_API_VERSION`: `v19.0` (or current version).

---

## 3. Environment Variables

Add the following to your root `.env` file (see `.env.example`):

```bash
# ── WhatsApp Cloud API (Meta for Developers) ─────
WHATSAPP_ACCESS_TOKEN=your-meta-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_VERIFY_TOKEN=bharatfarm_verify_token_secure
WHATSAPP_API_VERSION=v19.0
```

---

## 4. Webhook Configuration

### Endpoints:
- `GET  /api/sahayak/whatsapp/webhook` — Meta Webhook Verification
- `POST /api/sahayak/whatsapp/webhook` — Inbound WhatsApp Event Notifications

### Verification Handshake (GET):
When registering the webhook in Meta Developer Portal:
1. Set **Callback URL** to: `https://<your-domain>/api/sahayak/whatsapp/webhook` (or via ngrok / Cloudflare tunnel for local development).
2. Set **Verify Token** to the value of `WHATSAPP_VERIFY_TOKEN`.
3. The server validates `hub.verify_token` against config and responds with `hub.challenge`.

### Inbound Events (POST):
- Immediately returns `200 OK ('EVENT_RECEIVED')` to satisfy Meta's 3-second SLA.
- Performs message deduplication based on `whatsapp_message_id`.
- Dispatches message asynchronously to `SahayakCoreService`.

---

## 5. Supported Message Types

1. **Text Messages**:
   - Hindi, Bengali, English supported.
   - Deterministic keyword regex with fast AI intent classification.
2. **Image Messages**:
   - Securely downloads image binary stream from Meta using media ID.
   - Runs `CropScannerService` leaf vision diagnostics.
   - Responds with disease identification, severity, and fungicide/cultural treatments.
3. **Voice / Audio Messages**:
   - `SpeechToTextService` cleanly decouples STT transcription before routing through Sahayak intent pipeline.
4. **Location Messages**:
   - WhatsApp location pins automatically update the farmer's coordinates in `whatsapp_users`.
   - Computes distance to nearest APMC mandi and delivers localized weather forecasts.

---

## 6. Interactive Demo Mode (Without Real Meta Credentials)

For SIH evaluators, judges, and offline development, an internal demo pipeline is provided at:

**Endpoint:** `POST /api/sahayak/whatsapp/demo`

**Example Request:**
```json
{
  "phone": "demo-user",
  "message": "Aaj mere paas wali mandi mein dhan ka kya rate hai?"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "intent": "SMART_MANDI",
    "detectedLanguage": "hi",
    "farmer": {
      "phoneNumber": "demo-user",
      "isLinked": true,
      "farmerName": "Judge / Evaluator",
      "location": "Haldia, West Bengal"
    },
    "reply": "🌾 *स्मार्ट मंडी मूल्य अपडेट*\n\n📍 *नजदीकी मंडी:* Haldia APMC Mandi\n📏 *दूरी:* 6.4 km\n💰 *Paddy का भाव:* ₹2,180/क्विंटल (₹21.8/kg)\n📈 *भाव का रुझान:* तेज 🟢\n\n🤝 *सक्रिय खरीदार मांग (Smart Pool):*\n• मांग: 500 kg\n• प्रस्तावित मूल्य: ₹22/kg\n\n_BharatFarm के साथ सीधे बेचें और 12-18% अधिक लाभ प्राप्त करें।_",
    "suggestedQuickReplies": ["Join Supply Pool", "Check Other Crops"],
    "executionTimeMs": 24,
    "metadata": {
      "isDemoMode": true,
      "metaCloudApiConfigured": false
    }
  },
  "message": "Sahayak WhatsApp pipeline processed successfully"
}
```

---

## 7. Example Webhook Payloads

### Incoming Text Query:
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "1234567890",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "919876543210",
          "phone_number_id": "100200300400"
        },
        "contacts": [{
          "profile": { "name": "Ramesh Mondal" },
          "wa_id": "919831200001"
        }],
        "messages": [{
          "from": "919831200001",
          "id": "wamid.HBgLOTE5ODMxMjAwMDAxFQIAEhggRDU0M0I5Q0My",
          "timestamp": "1726743600",
          "text": { "body": "Kal baarish hogi kya?" },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### Incoming Location Pin:
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "1234567890",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": { "display_phone_number": "919876543210", "phone_number_id": "100200300400" },
        "messages": [{
          "from": "919831200001",
          "id": "wamid.HBgLOTE5ODMxMjAwMDAxFQIAEhggRDU0M0I5Q0My",
          "timestamp": "1726743600",
          "location": {
            "latitude": 22.0667,
            "longitude": 88.0667,
            "name": "Haldia Farm Center"
          },
          "type": "location"
        }]
      },
      "field": "messages"
    }]
  }]
}
```
