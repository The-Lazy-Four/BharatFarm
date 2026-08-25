# BharatFarm Migration Report

Status: **✅ All 6 phases complete (Scanner, Marketplace, Weather, Schemes, KrishiBot, Group Buying)**

This migration is being executed feature-by-feature, in the order requested
(Scanner → Marketplace → Weather → Schemes → KrishiBot → Group Buying),
compiling/linting/testing after each feature rather than doing one blind
mass merge. This report will be extended as each subsequent phase lands.

---

## Cross-cutting fix (before Phase 2): mobile navigation shell

**Classified B — required architectural dependency**, needed before any
feature can be meaningfully "reached and demonstrated" on the mobile
companion app per the acceptance criteria.

- `MobileNavigation` existed as a component but `AppLayout.tsx` never
  rendered it — mobile users only ever saw the fixed 260px desktop
  `Sidebar`. Added `<MobileNavigation />` to `AppLayout` and added a
  responsive breakpoint (768px, matching the Stitch UI's `md:` breakpoint)
  in `client/src/styles/index.css` so `Sidebar` shows on desktop and
  `MobileNavigation` shows on mobile, not both.
- `MobileNavigation` was also missing a label/tab for Schemes and had a
  broken/incomplete icon set; rewired to cover all 5 primary nav
  destinations (KrishiBot, Scanner, Marketplace, Weather, Schemes —
  Group Buying stays reachable from the desktop Sidebar and will get a
  Stitch-referenced entry point when that phase lands).

This is a shell-level change, not a web UI redesign — `Header`/`Sidebar`
visual design were left untouched.

---

## Phase 2: Marketplace — ✅ Migrated

### Old files analyzed
- `js/marketplace.js` (518 lines) — role picker, category chips,
  search/filter, product grid rendering, sell-form submission, WhatsApp/Call
  contact links.
- `js/marketplaceData.js` (121 lines) — 42 static demo listings (source for
  curated mock data only, per "do not treat old demo data as production
  truth").
- `js/cart.js` (236 lines) — reviewed; the old cart/checkout drawer has **no
  equivalent scaffolding in the new architecture** (no cart/orders module
  exists in `client/src/features` or `server/src/modules`), and the new
  `ProductListing`/`SellerInfo` types model a direct-contact (WhatsApp/Call)
  flow, not a checkout flow. Per "preserve NEW architecture, don't add new
  modules," cart/checkout was **not** ported — flagging this as a product
  decision for you to confirm rather than silently adding a new module.
- `mobile/src/screens/marketplace/MarketplaceScreen.js` — confirmed same
  browse/contact flow, no additional logic beyond the web version.

### New files created/modified

**Backend** (`server/src/modules/marketplace/`)
- `types/marketplace.types.ts` — extended `ProductListing`/`CreateListingDto`
  with `sellerPhone`, `sellerWhatsapp`, `verified` (adapted from the old
  `contact`/`whatsapp`/`verified` fields) so the direct-contact model from
  the old app is representable.
- `mock/marketplace.mock.ts` — replaced the 2-item placeholder with a
  curated 12-item set adapted from the old 42-item demo data, spread across
  all 4 categories, explicitly kept under `mock/` and only served in
  `USE_MOCK_DATA=true` mode.
- `repositories/marketplace.repository.ts` — `create()` now derives
  `sellerWhatsapp` from the submitted phone number (digit-stripping, same
  as old `whatsapp: '91' + phone.replace(/\D/g,'')` logic) and accepts a
  real seller name instead of a hardcoded `'Current User'`.
- `services/marketplace.service.ts`, `controllers/marketplace.controller.ts`
  — threaded the seller name through from the (mock) authenticated user.
- `schemas/marketplace.schema.ts` — was checking only `title`/`price`
  truthiness; now validates category enum, positive price, non-negative
  quantity, unit and location presence.
- The rest of the CRUD stack (`findAll`/`findById`/`update`/`delete`,
  routes) was already implemented in the new repo and needed no changes.

**Frontend** (`client/src/features/marketplace/`)
- `types/marketplace.types.ts` — mirrored the backend's contact-field
  additions; added `CreateListingInput`.
- `mock/marketplace.mock.ts` — mirrored backend's curated 12-item mock.
- `utils/marketplace.utils.ts` — added `buildWhatsAppLink`/`buildTelLink`,
  adapted from old `wa.me/${p.whatsapp}` and `tel:${p.contact}` link
  construction.
- `services/marketplaceApi.ts` — added `getListingById`.
- `hooks/useMarketplace.ts` — was fetch-only; added `createListing` (posts
  and prepends to local state), `refetch`, and error state with an offline
  mock fallback. Added a new `useProductListing(id)` hook for the detail
  page.
- `components/ProductCard.tsx` — was a static card with a dead "Contact
  Seller" button; now shows verified badge, seller name, a working "View
  Details" link, and functional WhatsApp/Call buttons.
- `components/SellerInfo.tsx` — was name+rating only; now renders
  verified badge and the same WhatsApp/Call actions, reused on the detail
  page.
- `components/ProductDetails.tsx` — was a 2-line placeholder; now a full
  detail view (price, quantity, location, listed date, seller contact).
- `components/ListingForm.tsx` — was a non-functional form stub (`onSubmit({})`
  ignored all fields); now a real controlled form with category select,
  price/unit/quantity/location/phone fields and inline validation, adapted
  from old `handleSellSubmit` (minus the AI crop-image auto-lookup, which
  is out of scope — see Known Issues).
- `pages/MarketplacePage.tsx` — added a "+ Sell Produce" entry point and an
  empty-state / offline-error message.
- `pages/CreateListingPage.tsx` — was rendering `ListingForm` into a
  `console.log` no-op; now calls the real `createListing` hook and
  redirects to the new listing's detail page on success.
- `pages/ProductPage.tsx` — was a hardcoded placeholder; now reads `:id`
  from the route, fetches the listing, and renders `ProductDetails` (with
  a not-found state).
- `client/src/app/router.tsx` — added the missing `/marketplace/new` and
  `/marketplace/:id` routes (pages existed but were unreachable).

### Functionality preserved
- Category filter + free-text search across title/seller/location.
- Direct WhatsApp / phone contact with a seller (no cart/checkout, matching
  the new architecture's existing type design).
- Publishing a new listing with seller contact info.
- Verified-seller badge.

### UI Integration
- `marketplace_skeleton` Stitch screen was used as the reference for the
  card layout (category chips + product grid + contact actions) and the
  detail/contact pattern, expressed in the existing dark plain-CSS theme
  (see Phase 1's styling note, which applies here too).

### Verification performed
- `npm run build` (server, client) — ✅ pass.
- `npm run lint` (server, client) — ✅ 0 errors.
- `npm run test` (server, client) — ✅ pass.
- Manual smoke test: `GET /api/marketplace/listings`, `GET .../:id` (found
  and 404 cases), `POST .../listings` with an invalid body (validation
  error) and a valid body (derives `sellerWhatsapp`, correct seller name
  from the mock-authenticated user) — all verified against a running
  server instance.

### Not migrated from Marketplace (flagged, not silently dropped)
- **Cart / checkout / OTP-verified orders** (`js/cart.js`,
  `backend/routes/otp.js`, the Stitch `orders_otp_skeleton` screen) — no
  scaffolding for this exists in the new architecture's marketplace module
  (no cart/orders types, repository, or routes). I did not add a new
  module for it. If a cart/checkout flow is actually in scope for the
  approved Marketplace feature, let me know and I'll treat it as its own
  phase with proper module scaffolding rather than bolting it onto the
  existing listing CRUD.
- AI-assisted crop image/category auto-fill on the sell form (old
  `fetchAICropMetadata`) — this was a "nice-to-have" convenience on top of
  the core sell flow, not core functionality, and pulling it in would mean
  a new AI-backed endpoint beyond what's already approved for Scanner/
  KrishiBot. Left out; sellers enter category/details directly instead.
- State/District cascading dropdowns (`INDIAN_STATES` data + `populateDistricts`)
  — replaced with a single free-text "Location" field to match the new
  `ProductListing.location: string` contract. Flagging in case structured
  state/district data is wanted later (would be a type change).

---

## Known Issues / Carried Forward

- **Styling system mismatch** (see Phase 1) — still applies; Marketplace
  UI was built in the existing dark plain-CSS theme, not Stitch's Tailwind
  light theme.
- **Cart/checkout scope question** — see above, needs a decision before
  Phase 6 (Group Buying, which is checkout-adjacent) to avoid rework.

---

## Remaining Phases (not yet started)

6. Group Buying — group formation/progress/join flow.

---

## Phase 6: Group Buying — ✅ Migrated (built fresh, no old-app equivalent)

### Analysis
Verified there is **no Group Buying feature anywhere in the OLD BharatFarm
repository** — no matching files, routes, static data, or UI in the web,
mobile, or backend code. This is the one approved feature that exists only
as scaffolding in the NEW repository plus a Stitch UI reference
(`group_buying_skeleton`), so unlike the other five phases there was no
legacy logic to extract/adapt — I built it out directly from the existing
type contracts and the Stitch screen's actual content (category badge,
participants/target progress bar, time-remaining, standard vs. bulk price,
"Join Group" CTA — no "create a new pool" flow shown, so that wasn't
added either).

### New files created/modified

**Backend** (`server/src/modules/groupbuying/`)
- `repositories/groupBuying.repository.ts` — was functional for the happy
  path but had no business rules: `joinPool()` would happily add units to
  a pool that had already hit its target, was marked `COMPLETED`, or was
  past its `deadline`. Added: auto-expiry (`withRefreshedStatus` flips
  `OPEN` → `EXPIRED` once `deadline` passes, computed on every read so it
  doesn't depend on a background job), a guard that rejects joins on any
  non-`OPEN` pool with a clear message, and quantity validation.
- `mock/groupBuying.mock.ts` — expanded from 1 to 4 pools spanning all
  three categories (fertilizer/seeds/machinery) with varied statuses
  (`OPEN` and `THRESHOLD_REACHED`) so the status-dependent UI actually has
  something to demonstrate.
- `services/groupBuying.service.ts`, `controllers/groupBuying.controller.ts`
  — threaded the repository's new `{pool, error}` result through, so a
  blocked join returns a proper `409 POOL_NOT_OPEN` instead of silently
  succeeding or a generic 404.
- `schemas/groupBuying.schema.ts` — was a no-op (`() => ({error: null})`);
  now validates `quantity` is a positive number, wired into the route via
  the existing `validateRequest` middleware (previously not applied to
  this route at all).

**Frontend** (`client/src/features/groupbuying/`)
- `services/groupBuyingApi.ts` — added `getPoolById`; `joinPool` now
  surfaces the server's error message instead of silently returning
  nothing on failure (the shared `ApiClient` resolves with `{success:
  false}` rather than throwing, so the previous naive implementation
  would have treated a blocked/failed join as if it succeeded).
- `hooks/useGroupBuying.ts` — added error state; added a new
  `useGroupBuyDetails(id)` hook for the detail page.
- `components/JoinGroupButton.tsx` — was a button that always called
  `onJoin()` with no quantity (the page hardcoded `joinPool(pool.id, 5)`
  for every pool regardless of what the farmer actually wants); now a
  real quantity input plus a button that's disabled and relabeled
  ("Target Reached" / "Order Completed" / "Pool Closed") once a pool is
  no longer `OPEN`.
- `components/GroupBuyCard.tsx` — added the category badge and a
  "time remaining" countdown (both present in the Stitch reference but
  missing from the placeholder), plus a link to the new detail page.
- `components/GroupDetails.tsx` — was a single hardcoded line of text
  (`"Group buying rules & wholesale supplier info."`); now a full detail
  view (savings, progress, participant count, location, time remaining,
  an explanation of how pooled orders work, and the same status-aware
  join control).
- `pages/GroupDetailsPage.tsx` — was a static placeholder Card with no
  routing, no data fetching; now reads `:id` from the route and renders
  the real pool via `useGroupBuyDetails`, with a not-found state.
- `pages/GroupBuyingPage.tsx` — added search-by-name and category-chip
  filtering (matching the same pattern used in Marketplace/Weather) and
  an error banner; fixed the hardcoded quantity-5 join to use the real
  quantity from `JoinGroupButton`.
- `client/src/app/router.tsx` — added the missing `/groupbuying/:id` route
  (the page existed but was unreachable).

### Functionality delivered
- Browse pools with search + category filter (fertilizer/seeds/machinery).
- Real quantity-based joining, blocked once a pool is no longer open, with
  the pool's status auto-updating (`OPEN` → `THRESHOLD_REACHED` when the
  join pushes total quantity past target; `OPEN` → `EXPIRED` once the
  deadline passes).
- Full pool detail page with the same status-aware join control.

### UI Integration
- Stitch's `group_buying_skeleton` screen was the direct reference for
  card content (category, participants/target, time remaining, standard
  vs. bulk price, join CTA) since no old-app UI existed to adapt from.

### Verification performed
- `npm run build` (server, client) — ✅ pass.
- `npm run lint` (server, client) — ✅ 0 errors.
- `npm run test` (server, client) — ✅ pass.
- Manual smoke test against a running server in mock mode: listed all 4
  pools with correct statuses; fetched a pool by id; a missing id
  correctly 404s; joining an `OPEN` pool with a valid quantity correctly
  increments `currentQuantity`/`participantCount`; joining with `quantity:
  0` correctly 400s via the new schema validation; joining the
  already-`THRESHOLD_REACHED` pool correctly 409s with a clear message;
  and joining an `OPEN` pool with a quantity that pushes it past its
  target correctly flips its status to `THRESHOLD_REACHED` in the
  response.

### Not built for Group Buying (by design)
- Pool creation ("start a new group buy") — not shown anywhere in the
  Stitch reference screen, and there's no old-app precedent to justify
  adding it as an "approved" behavior. If this is actually wanted, it's a
  small addition to the existing repository/controller (a `createPool`
  method mirroring Marketplace's `createListing` pattern) — flagging
  rather than guessing at a feature not evidenced anywhere in your inputs.
- Payment/order fulfillment once a pool completes — out of scope per the
  same reasoning as the Marketplace cart/checkout flag in Phase 2; no
  scaffolding exists for it and it isn't shown in the Stitch reference.

---

## Phase 5: KrishiBot — ✅ Migrated

### Old files analyzed
- `js/chatbot.js` (773 lines) — chat UI logic, message history handling,
  and the **Voice Assistant**: browser SpeechRecognition (speech-to-text
  input, auto-send on result) and SpeechSynthesis (text-to-speech replies,
  with language-specific voice selection for en/hi/bn).
- `server.js` (`POST /api/chat`, lines ~841–890) — two supported request
  shapes (a generic OpenRouter-proxy shape, and the KrishiBot
  `{text, language, history}` shape), a system prompt requesting short
  answers "read aloud on mobile", and `getFallbackAIResponse()`: a
  **rule-based, trilingual (en/hi/bn) response generator** keyed on
  greeting/rice/pest/fertilizer/weather keywords, used whenever no AI key
  is configured or the AI call fails.
- `mobile/src/screens/chatbot/KrishiBotScreen.js` — confirmed same
  chat + voice flow, no additional logic.
- `api/chat.js`/`api/voice-assistant/chat.js` — thin serverless-function
  wrappers around the same `/api/chat` logic; no new logic beyond what's
  already covered by `server.js`.

### New files created/modified

**Backend** (`server/src/modules/krishibot/`)
- `repositories/krishiBot.repository.ts` — was a mock echo (`"[Mock
  KrishiBot Assistant] Received query: ..."` for every message, no AI
  call, no fallback logic); replaced with the real flow: calls the shared
  `aiClient.ts` (from Phase 1) with a system prompt matching the old app's
  "short answers for mobile read-aloud" instruction plus any
  `farmerContext` (location/crop) passed from the client, and falls back
  to a **1:1 ported version of the old app's trilingual rule-based
  responder** (`getRuleBasedReply`) when no AI key is configured or the
  call fails — same keyword triggers, same en/hi/bn copy.
- No changes needed to `service`/`controller`/`routes`/`schema` — these
  were already correctly wired to accept `message`/`language`/
  `farmerContext` and validate a non-empty message.

**Frontend** (`client/src/features/krishibot/`)
- `services/krishiBotApi.ts` — was untyped (`Promise<any>`) and didn't
  send `language` or `farmerContext`; now properly typed and passes both
  through.
- `hooks/useKrishiBot.ts` — was missing error handling entirely (a failed
  request would silently render `res.data?.reply` as `undefined`); now
  takes the active `language`, surfaces a proper error message on
  failure, and — mirroring the old app's `autoSpeakActive` behavior —
  automatically speaks the bot's reply aloud once the farmer has used
  voice input in that session.
- `components/VoiceButton.tsx` — was a fake button that only ever inserted
  the literal string `"Mock voice input: Soil moisture test query"`; now
  a real Web Speech API (`SpeechRecognition`) implementation, ported from
  `chatbotToggleVoice()`, with the same behavior of auto-sending the
  transcript once recognized and a language-aware recognition locale
  (en-IN/hi-IN/bn-IN).
- `utils/krishiBot.utils.ts` — added `speakText()`/`stopSpeaking()`
  (ported from `speakResponse()` — SpeechSynthesis with per-language voice
  selection) and `speechRecognitionLocale()`.
- `components/MessageBubble.tsx` — added a small 🔊 replay button on bot
  messages so any response can be read aloud on demand, not just
  voice-triggered ones.
- `pages/KrishiBotPage.tsx` — added a language selector (English/हिंदी/
  বাংলা) wired to the existing app-wide `LanguageContext` (previously
  unused by this page — every request was implicitly English) and an
  error banner.

### Functionality preserved
- Text chat with AI-generated replies, short enough for voice playback.
- Trilingual (en/hi/bn) rule-based fallback when no AI key is configured
  or the AI call fails — the old app's "Smart Fallback AI Engine".
- Voice input (speech-to-text, auto-send) and voice output (text-to-speech
  replies), both language-aware.
- Suggested quick-action chips.

### UI Integration
- Stitch's chatbot screen was used as the reference for the chat bubble
  layout and the language-selector placement in the header, expressed in
  the existing dark plain-CSS theme (see Phase 1's note).

### Verification performed
- `npm run build` (server, client) — ✅ pass.
- `npm run lint` (server, client) — ✅ 0 errors (a handful of new
  `no-explicit-any` warnings in `VoiceButton.tsx` are unavoidable — the
  Web Speech API has no official TypeScript types — and match the
  existing tolerance for this warning elsewhere in the codebase).
- `npm run test` (server, client) — ✅ pass.
- Manual smoke test against a running server in mock mode (no AI key
  configured, so this exercises the rule-based fallback path): "Hello
  there" → correct English greeting; "tell me about rice" with
  `language: "hi"` → correct Hindi rice-farming reply; "pest problem" with
  `language: "bn"` → correct Bengali pest-control reply; an empty message
  correctly 400s with "Message text is required".

### Not migrated from KrishiBot (by design)
- The generic OpenRouter-proxy request shape (`{messages: [...]}` with no
  `text` field) from the old `/api/chat` — this was a raw passthrough
  used internally by other old-app features (e.g. Scanner, Schemes) that
  now each have their own dedicated, properly-typed backend logic via the
  shared `aiClient.ts`; keeping a generic untyped proxy endpoint alongside
  that would reintroduce the old app's "multiple responsibilities in one
  route" pattern this migration is meant to move away from.

---

## Phase 4: Government Schemes & Loan Eligibility — ✅ Migrated

### Old files analyzed
- `js/schemes.js` (330 lines) — 3-step wizard (land size → state → crop),
  AI-driven scheme matching via `POST /api/schemes`, and a local-JSON
  fallback filter (`filterLocalSchemes`) when the AI call failed.
- `js/schemesData.json` (116 lines) — 8 curated Central/West Bengal
  schemes with structured `eligibility.{minLandSize,maxLandSize,states,crops}`
  — this is the old app's own offline fallback dataset, reused here as the
  new project's mock/offline dataset for the same purpose.
- `server.js` (`POST /api/schemes`, lines ~891–950) — the AI prompt
  included a **hardcoded override**: if state is West Bengal and land size
  is 0 (landless/sharecropper), return *only* two specific schemes and
  nothing else, regardless of what the AI would otherwise suggest. Ported
  this exactly rather than leaving it to the AI to reproduce reliably.
- Confirmed "Loan Eligibility" in the old app is the same scheme-matching
  wizard, not a separate credit-scoring feature — the new repo's
  `CreditAssessmentResult`/credit-score concept is scaffolding that was
  already present (with an existing non-CIBIL disclaimer), not something
  from the old app; I fleshed it out rather than inventing it.

### New files created/modified

**Backend** (`server/src/modules/schemes/`)
- `types/schemes.types.ts` — added `SchemeEligibility` (structured
  land/state/crop rules, adapted from the old JSON schema) and
  `applySteps` to `Scheme`; extended `EligibilityCheckRequest` with
  optional `annualIncome` to make the loan estimate slightly more grounded.
- `mock/schemes.mock.ts` — replaced the 2-item placeholder with the full
  8-scheme curated set from the old `schemesData.json`, each carrying real
  eligibility rules and apply steps.
- `repositories/schemes.repository.ts` — `checkEligibility()` was a no-op
  that returned every scheme unfiltered; now: (1) applies the West Bengal
  landless-farmer override first, exactly as the old app hardcoded it,
  (2) calls the AI provider with an adapted version of the old prompt when
  configured, (3) falls back to a ported version of `filterLocalSchemes`
  (land/state/crop matching against the static dataset) if the AI call
  fails or isn't configured. `calculateCreditAssessment()` now factors in
  `annualIncome` when provided, still clearly labeled as an internal
  estimate via the existing disclaimer.
- `services/schemes.service.ts`, `controllers/schemes.controller.ts` —
  threaded `state`/`cropCategory`/`annualIncome` through instead of the
  previous behavior of ignoring the request body entirely
  (`checkEligibility` returned all schemes) or silently defaulting
  `landSizeAcres` to `3` when missing.
- `schemas/schemes.schema.ts` — was a no-op; now validates `landSizeAcres`
  (required, non-negative) and `annualIncome` (optional, non-negative).

**Frontend** (`client/src/features/schemes/`)
- `types/schemes.types.ts`, `mock/schemes.mock.ts` — mirrored the backend's
  richer shape.
- `constants/schemes.constants.ts` — added an `INDIAN_STATES` list
  (adapted from old `js/marketplace.js`'s `INDIAN_STATES`, names only — no
  districts needed for this wizard).
- `services/schemesApi.ts` — added `checkEligibility()`.
- `hooks/useSchemes.ts` — was hardcoded to always assess a fixed 3.5-acre
  profile on mount, regardless of the user; now exposes `checkEligibility(input)`
  driven by real form input, plus a separate `useSchemeDetails(id)` hook
  for the detail page.
- `components/EligibilityForm.tsx` — was a single land-size field with no
  handler (`onSubmit={e => e.preventDefault()}` and stopped); now a real
  3-field form (land size, state select, optional crop + income) with the
  same validation the old wizard had (land size required ≥ 0, state
  required).
- `components/SchemeCard.tsx` — added eligibility tags (land range,
  crops, category) and a "View Details" link, adapted from the old app's
  `renderMatchedSchemes` tag rendering.
- `components/SchemeDetails.tsx` — was a single static line of text; now a
  full detail view (criteria, required documents, numbered apply steps,
  official portal link).
- `pages/SchemesPage.tsx` — was auto-fetching a fixed assessment on load
  with no user input; now shows the eligibility form first, an initial
  "browse all schemes" list, and after submission shows the matched
  schemes + loan assessment with a "Check Again" reset.
- `pages/SchemeDetailsPage.tsx` — was a hardcoded placeholder; now reads
  `:id` from the route and renders the real scheme.
- `client/src/app/router.tsx` — added the missing `/schemes/:id` route.

### Functionality preserved
- Land size / state / crop eligibility wizard.
- AI-driven scheme matching when configured, with the same static
  fallback filter logic as the old app when it isn't.
- The West Bengal landless-farmer hardcoded override.
- Loan/credit eligibility estimate (existing new-repo concept, now wired
  to real user input instead of a fixed constant).

### UI Integration
- Stitch's schemes screen was used as the reference for the eligibility
  tag chips and the step-by-step "How to Apply" layout on the detail view,
  expressed in the existing dark plain-CSS theme (see Phase 1's note).

### Verification performed
- `npm run build` (server, client) — ✅ pass.
- `npm run lint` (server, client) — ✅ 0 errors.
- `npm run test` (server, client) — ✅ pass.
- Manual smoke test against a running server in mock mode:
  `GET /api/schemes` returns all 8 curated schemes;
  `POST /api/schemes/check-eligibility` with `{state: "West Bengal",
  landSizeAcres: 0}` returns **exactly** `bhumihin-krishak-bandhu` and
  `krishak-bandhu` (override confirmed); the same endpoint with
  `{state: "West Bengal", landSizeAcres: 3, cropCategory: "Rice"}` returns
  7 correctly-filtered schemes (excludes only the landless-specific one);
  an invalid request (missing `landSizeAcres`) correctly 400s; and
  `POST /api/schemes/loan-assessment` returns a score/tier that responds
  to both land size and income.

### Not migrated from Schemes (by design)
- Multi-step wizard UI chrome (progress dots, `currentWizardStep` state
  machine) — flattened into a single form since the new architecture has
  no wizard/stepper scaffolding to preserve; all the same fields and
  validation are present.
- Payment/subscription-adjacent code found near the schemes route in the
  old `server.js` (`POST /api/submit-payment`, a UPI-screenshot payment
  verifier) — this belongs to the old app's "simulated subscription /
  fake premium unlocking" system, explicitly called out as removed/
  obsolete in your instructions. Not migrated.

---

## Phase 3: Weather — ✅ Migrated

### Old files analyzed
- `js/weather.js` (925 lines) — Open-Meteo forecast fetch, weather-code
  interpretation (`mapWeatherCode`), rule-based do's/don'ts advisory
  (`updateFarmingTips`), and an AI-generated 2-sentence advisory
  (`getAIWeatherAdvice`) with a rule-based fallback when the AI call fails.
- `server.js` (`GET /api/weather`, `GET /api/weather/geocode`, lines
  ~1230–1305) — proxied Open-Meteo's forecast and geocoding APIs (both are
  free, no API key required), with hardcoded offline fallback data if the
  live call failed.
- `mobile/src/screens/weather/WeatherScreen.js` — confirmed same
  fetch → interpret → advise flow, no additional logic.

### New files created/modified

**Backend** (`server/src/modules/weather/`)
- `types/weather.types.ts` — was a single-day snapshot type; added
  `DailyForecast`/`GeocodeResult` and extended `WeatherForecast` with a
  7-day `daily[]` array, `doList`/`dontList` (the two rule-based advisory
  lists), keeping the existing `source: LIVE|CACHED|OFFLINE|MOCK` contract
  as-is since it already matched the migration's LIVE/CACHED/MOCK/OFFLINE
  distinction requirement.
- `repositories/weather.repository.ts` — was mock-only; now calls the real
  Open-Meteo forecast + geocoding APIs (no key needed, unlike Scanner/
  KrishiBot) when `USE_MOCK_DATA=false`, with the old app's weather-code →
  label/icon mapping ported, the rule-based do's/don'ts engine ported
  1:1 from `updateFarmingTips()`, and the AI-generated advisory sentence
  reusing the shared `aiClient.ts` from Phase 1 (with the same rule-based
  fallback text the old app used when no AI key is configured). Geocoding
  failures fall back to the old app's hardcoded common-city lookup table
  rather than erroring out, matching old behavior.
- `services/weather.service.ts`, `controllers/weather.controller.ts`,
  `routes/weather.routes.ts` — added a `geocode` action/route
  (`GET /api/weather/geocode?city=`) alongside the existing
  `GET /api/weather?location=|lat=&lon=`, mirroring the old two-endpoint
  design.
- `schemas/weather.schema.ts` — was a no-op; now validates `lat`/`lon` are
  numeric when provided.
- `constants/weather.constants.ts` — added default lat/lon (Ludhiana,
  Punjab) alongside the existing default location label.

**Frontend** (`client/src/features/weather/`)
- `types/weather.types.ts`, `mock/weather.mock.ts` — mirrored the backend's
  richer shape (daily forecast + do/don't lists).
- `services/weatherApi.ts` — added `geocode()`; `getWeather()` now accepts
  `location` or `lat`/`lon`.
- `hooks/useWeather.ts` — was fetch-once-on-mount only; added
  `searchLocation(city)`, `useMyLocation()` (browser Geolocation API,
  adapted from old `autoDetectLocation`), and offline-mock error state.
- `components/ForecastList.tsx` — was **entirely hardcoded** (`['Mon',
  'Tue', 'Wed', 'Thu', 'Fri']` with fake `30 + i` temperatures); now
  renders the real 7-day forecast from the API, including a rain-amount
  badge on wet days.
- `components/FarmingRecommendation.tsx` — was advisory-text-only; added
  the Do / Don't two-column list (adapted from the old app's
  `whatToDoList`/`whatNotToDoList` DOM sections).
- `pages/WeatherPage.tsx` — added a city search box and a "Use My Location"
  button (previously the page had no location input at all — it only ever
  showed the hook's default).

### Functionality preserved
- Live 7-day forecast with real Open-Meteo data, current conditions,
  humidity/wind/rain-probability.
- Weather-code → human condition/icon mapping.
- Rule-based Do/Don't farming advisory (works with zero configuration,
  since it's pure logic over the forecast numbers).
- AI-generated hyperlocal advisory sentence when `AI_PROVIDER_API_KEY` is
  configured, with the same graceful rule-based fallback text otherwise.
- City search (geocoding) and "use my current location" (browser GPS).
- Graceful offline fallback matching old behavior for both the forecast
  and geocoding endpoints.

### UI Integration
- Stitch's weather screen was used as the reference for the current-
  conditions hero card, the horizontal scrollable 7-day strip, and the
  advisory card layout, expressed in the existing dark plain-CSS theme
  (see Phase 1's styling note).

### Verification performed
- `npm run build` (server, client) — ✅ pass.
- `npm run lint` (server, client) — ✅ 0 errors.
- `npm run test` (server, client) — ✅ pass.
- Manual smoke test against a running server in mock mode: `GET
  /api/weather` returns the full mock shape (7-day daily array, do/don't
  lists); `GET /api/weather/geocode` correctly 400s with no `city` param.
- Manual smoke test of the **live** code path: this sandbox's network
  egress allowlist does not include `api.open-meteo.com` /
  `geocoding-api.open-meteo.com`, so the live HTTP calls themselves
  returned 403 here — but that confirmed the code takes the live-call
  branch correctly, and that the geocoding fallback (ported from the old
  app's hardcoded city table) engages exactly as intended when the call
  fails, resolving both a known city ("Kolkata" → correct coordinates) and
  an unknown one (default coordinates). **The real Open-Meteo calls will
  work normally in your actual deployment environment**, which won't have
  this sandbox's domain restriction — flagging this so you know why I
  couldn't show you a live-data response directly.

### Not migrated from Weather (by design)
- Client-side response caching (`WEATHER_CACHE_KEY`, 10-minute TTL,
  localStorage) and request de-duplication/debouncing from the old
  `js/weather.js` — the new architecture's `OfflineContext`/service layer
  is the intended place for this kind of cross-feature caching, and adding
  ad-hoc localStorage caching inside one feature would cut across that.
  Flagging as a candidate for a future cross-cutting caching pass rather
  than a per-feature fix.
- Reverse geocoding (lat/lon → place name) — the old app used this to
  label "Use My Location" results with a place name; the new version shows
  coordinates-derived weather without a resolved place label. Low priority,
  can be added if wanted.

---

## Phase 1: Leaf Scanner — ✅ Migrated

### Old files analyzed
- `js/scanner.js` (329 lines) — camera capture, file upload, drag/drop, and
  the `analyzeLeaf()` flow that called the old backend.
- `server.js` (`POST /api/analyze-leaf`, lines ~1032–1094) — sent the leaf
  photo to a Gemini-compatible vision model via OpenRouter
  (`callOpenAI`, using `OPENROUTER_API_KEY` / `OPENROUTER_MODEL`), with a
  local fallback response generator when no key is configured.
- `css/scanner.css` — visual reference only (not copied; new project has no
  Tailwind/CSS pipeline matching this file, see "Known Issues").
- `mobile/src/screens/scanner/LeafScannerScreen.js` — confirmed same
  capture → analyze → result flow on the old React Native side; no new
  logic beyond what `js/scanner.js` already covered.

### New files created/modified

**Backend** (`server/src/modules/scanner/`)
- `repositories/scanner.repository.ts` — replaced the mock-only stub with
  real logic: when `AI_PROVIDER_API_KEY` is set and `USE_MOCK_DATA=false`,
  it calls the AI provider with the same vision prompt/JSON contract as the
  old `/api/analyze-leaf` route (adapted to the new `ScanAnalysisResult`
  type: old `treatments` → `recommendations`, old `fertilizers` →
  `preventativeMeasures`). On any provider error it logs and falls back to
  the existing mock result — mirroring the old app's fallback-first
  reliability behavior. When mock mode is on (default in this repo), it
  behaves exactly as before.
- `schemas/scanner.schema.ts` — was a no-op (`{ error: null }` always);
  now validates that an image is present and, if a data URL is given, that
  its MIME type is supported.
- `server/src/utils/aiClient.ts` **(new, shared utility)** — small
  OpenRouter chat/vision client extracted so both Scanner and (later)
  KrishiBot can reuse one implementation instead of duplicating the old
  `callOpenAI` per-feature. Registered in `server/src/utils/index.ts`.

**Frontend** (`client/src/features/scanner/`)
- `components/ScannerCamera.tsx` — was a placeholder that faked a capture
  on click. Replaced with a real implementation: file picker with
  validation (type/size), and a live camera flow using
  `navigator.mediaDevices.getUserMedia` + canvas frame capture, adapted
  from `openCamera`/`capturePhoto`/`closeCamera` in the old `js/scanner.js`
  (DOM calls → React refs/state).
- `utils/image.utils.ts` — added `validateImageFile` and
  `captureFrameFromVideo` (adapted from the old canvas-capture logic).
- `components/ImagePreview.tsx` — now renders the actual captured/uploaded
  image instead of a placeholder icon.
- `components/ScanResult.tsx` — expanded to show severity, crop, a
  Treatment Plan section and a Prevention section (mirrors the old
  UI's disease-status + fertilizer/treatment sections and the Stitch
  "Diagnosis Complete" card structure).
- `pages/ScannerPage.tsx` — wired the existing `error` state from
  `useScanner()` into the UI (previously computed but not displayed).

### Functionality preserved
- Upload-from-gallery and live-camera capture.
- AI-based disease/health analysis with graceful fallback when no AI key
  is configured (matches old "Smart Fallback AI Engine" behavior).
- Treatment and prevention recommendations, confidence, and severity.

### UI Integration
- `leaf_scanner` / `leaf_scanner_skeleton` Stitch screens were used as the
  reference for the card layout (capture card + diagnosis card), the
  severity/confidence presentation, and the two-section
  Treatment/Prevention recommendation pattern. The Stitch screens use a
  Tailwind + light "surface" theme that this repo's `client` does not
  currently have (see Known Issues); the layout and interaction structure
  were carried over, expressed in the project's existing plain-CSS
  variable theme (`client/src/styles/index.css`) rather than introducing a
  new styling system for one feature.

### Verification performed
- `npm run build` (shared, server, client) — ✅ all pass.
- `npm run lint` (server, client) — ✅ 0 errors (pre-existing `any`-type
  warnings unrelated to this change remain, unmodified).
- `npm run test` (server, client) — ✅ pass.
- Manual smoke test: server boots in mock mode, `POST /api/scanner/analyze`
  returns the mock result, and the validation schema correctly rejects a
  request with no image.

### Not migrated from Scanner (by design)
- Gamification hooks (`window.bfGamification.trackScan()`, `logActivity`,
  `updateUserStatistic('totalScans')`) — these belonged to the removed
  gamification/leaderboard system and were intentionally dropped.

---

## Known Issues / Carried Forward

- **Styling system mismatch**: the Stitch mobile UI reference is built with
  Tailwind CSS and a distinct light "surface" color system
  (see `stitch_bharatfarm_farmer_companion_ui/bharatfarm/DESIGN.md`). The
  `client` app in this repo has no Tailwind pipeline and uses a dark,
  CSS-variable-based theme (`client/src/styles/index.css`). I did not
  introduce Tailwind or override the global theme, since that would be a
  cross-cutting change affecting the Header/Sidebar/MobileNavigation shell
  shared with the future web UI — out of scope for this migration.
  Documenting here for the UI team's awareness; happy to revisit if you'd
  like the Stitch visual theme adopted project-wide as a deliberate
  decision rather than a side effect of one feature's migration.

---

## All Phases Complete

All 6 approved features (Scanner, Marketplace, Weather, Schemes,
KrishiBot, Group Buying) have been migrated, verified (build/lint/test +
live smoke test), and documented above in phase order.

## Not Modified (per instructions)
- Web UI (desktop) — untouched, left for the UI team.
- No new research features (demand prediction, satellite/drone/wearable
  systems, etc.) were added.
- Removed/obsolete old features (Leaderboard, Quiz/Gamification, Wiki,
  simulated subscription/premium) were not recreated.
