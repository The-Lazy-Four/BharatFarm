# Government Schemes Production Backend & AI Assistance Architecture

## 1. Overview
The Government Schemes module provides verified Indian central and state support program discovery for farmers. It combines high-speed deterministic database filtering with optional AI eligibility explanations via BharatFarm's central AI Gateway.

---

## 2. Filtering & Search Architecture
Deterministic queries execute with **ZERO AI calls** to optimize data saver bandwidth, latency, and database workload:
- `GET /api/schemes?state=Punjab&category=subsidy&search=kisan`
- Filters schemes by state (matching target state or `Central`), category, and natural language keyword matching in title, department, or description.

---

## 3. Eligibility Verification & Loan Assessment
1. **Deterministic Eligibility Evaluation**: Checks user landholding size against scheme `minLandSize` / `maxLandSize` bounds and target crop categories.
2. **Loan Credit Assessment (`POST /api/schemes/loan-assessment`)**: Evaluates credit readiness scores (650–850 range) based on registered acreage and reported annual income, returning max estimated loan eligibility along with mandatory financial disclaimers.
3. **AI Eligibility Reasoning**: When requested explicitly through Shayak or the eligibility wizard, structured explanations highlight why a scheme matches, missing prerequisites, required documents, and next steps without guaranteeing official bank/governmental approval.

---

## 4. Cross-Module Connections
- **KrishiBot (Shayak)**: Querying Shayak about schemes retrieves the relevant scheme record for context-aware guidance.
- **Crop Roadmap**: Roadmap crop and district context automatically refine scheme search priorities.

---

## 5. Verification & Testing
The test suite `server/tests/schemes.test.ts` validates:
1. Full scheme listing & seed idempotency.
2. Category, state, and natural search filters.
3. Individual scheme detail retrieval.
4. Deterministic eligibility matching.
5. Credit readiness assessment & loan limit calculation.
