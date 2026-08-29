# Shayak / KrishiBot Production Backend Architecture

## 1. Executive Summary
Shayak (KrishiBot) serves as BharatFarm's central multi-domain AI agronomist. Rather than operating as an isolated chatbot, Shayak dynamically inspects user intent, retrieves verified real-time platform telemetry across 6 core modules, and formats actionable, multilingual recommendations for Indian farmers.

---

## 2. Intent Routing & Factual Domain Aggregation
Shayak implements a zero-bloat deterministic intent detection algorithm before querying AI. Only domain contexts matching query keywords are retrieved:

| Intent Category | Triggers / Keywords | Source-of-Truth Data Retrieved | Context Action |
| :--- | :--- | :--- | :--- |
| **Weather & Spray** | `rain`, `weather`, `baarish`, `मौसम`, `आবহাওয়া`, `spray` | Live Open-Meteo API Telemetry (Temp, Humidity, Rain Probability) | `🌦️ View Weather Telemetry` (`/weather`) |
| **Leaf Scanner Diagnostic** | `scan`, `disease`, `leaf`, `pathogen`, `blight`, `fungus` | Latest Supabase `scan_results` (Crop, Disease Name, Confidence, Severity) | `🔬 View Scan Report` (`/scanner`) |
| **Crop Roadmap Progress** | `roadmap`, `stage`, `task`, `sowing`, `harvest`, `schedule` | Latest active Supabase `roadmaps` (Current Stage, Day Offset, Activities) | `📅 View Crop Roadmap` (`/roadmap`) |
| **Government Schemes** | `scheme`, `subsidy`, `yojana`, `pm-kisan`, `loan`, `योजना` | Supabase `schemes` catalog (Title, Eligibility, Category) | `📜 Check Scheme Eligibility` (`/schemes`) |
| **Marketplace Catalog** | `buy`, `price`, `fertilizer`, `seed`, `khad`, `खाद`, `সার` | Supabase `marketplace_products` (Title, Price, Unit) | `🛒 Browse Marketplace Catalog` (`/marketplace`) |
| **Group Buying Pools** | `group`, `pool`, `bulk`, `discount`, `sasta` | Supabase `group_buying_pools` (Item, Original vs Discounted Rate, Qty) | `🤝 View Group Buying Pools` (`/group-buying`) |

---

## 3. AI Gateway & Optimization Pipeline
- **Central Gateway**: All LLM queries flow through `AiClient.chat` configured with OpenRouter (`google/gemini-2.5-flash`).
- **AiCache**: MD5 fingerprinting on `(query + language + domainContext)` prevents redundant API cost and guarantees instant response for repeated farmer queries (TTL: 1 hour).
- **Data Saver / Offline**: Page load and history fetching perform zero AI calls. AI execution only occurs on deliberate user query dispatch.
- **Bounded Memory**: Multi-turn history is capped at the last 6 messages (`slice(-6)`) to preserve token budgets.

---

## 4. Multi-Turn Security & RLS
- **Session Isolation**: Sessions (`krishibot_sessions`) and messages (`krishibot_messages`) enforce strict ownership checking.
- **Authorization Verification**: Requests targeting session IDs verify `session.user_id === req.user.id`. Accessing or deleting unauthorized sessions throws `UNAUTHORIZED_SESSION_ACCESS` (403/401).

---

## 5. Verification & Testing
The test suite `server/tests/krishibot.test.ts` validates:
1. Persistent session creation & multi-turn history.
2. Cross-user isolation and unauthorized deletion blocking.
3. Domain intent routing (Weather, Scanner, Roadmap, Schemes, Marketplace, Group Buying).
4. Multilingual response synthesis (English, Hindi, Bengali).
