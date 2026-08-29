# BharatFarm — Government Schemes Module Architecture & Documentation

## Overview
The Government Schemes module in BharatFarm connects Indian farmers directly with central and state agricultural welfare programs, subsidies, crop insurance schemes, equipment grants, and credit assessments.

---

## Key Features

1. **Deterministic Idempotent Seeding (`schemes.seed.ts`)**:
   - Populates `public.schemes` with 27 real-world Indian agricultural schemes (PM-KISAN, PMFBY, KCC, Soil Health Card, PM-KUSUM, State-specific schemes for West Bengal, Telangana, Andhra Pradesh, Odisha, Maharashtra, Gujarat, Haryana, Punjab, UP, Bihar, Chhattisgarh).
   - Prevents duplicate insertion on repeated application restarts via unique primary keys and conditional row count checks.

2. **Dual Mode Architecture (Supabase DB + Offline Mock Fallback)**:
   - Queries `public.schemes` directly when Supabase connection is active.
   - Falls back gracefully to `MOCK_SCHEMES` when `useMockData` is enabled or when Supabase connection is offline.

3. **Intelligent Eligibility Matching**:
   - Dynamic OpenRouter AI matching using Gemini model.
   - Rule-based fallback matching by state, landholding area (acres), and crop category.
   - Special direct allocation rules for landless agricultural laborers and sharecroppers (e.g. West Bengal *Bhumihin Krishak Bandhu*).

4. **Agri Credit Readiness Assessment**:
   - Calculates institutional loan eligibility score and max credit estimate based on farm land acreage and reported annual income.

---

## API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/schemes` | Fetch schemes list (supports optional `category`, `state`, `search` filters) |
| `GET` | `/api/schemes/:id` | Fetch specific scheme details by ID |
| `POST` | `/api/schemes/check-eligibility` | Run dynamic AI or rule-based eligibility check based on farmer input |
| `POST` | `/api/schemes/loan-assessment` | Generate institutional credit readiness score & loan estimate |

---

## Supabase Security & RLS Policy
- `public.schemes` has RLS enabled with full public `SELECT` access for active schemes (`active = true`).
- Insert/Update access restricted to system service role.
