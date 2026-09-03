# SIH Innovation Platform Module

This directory contains the independent **Smart India Hackathon (SIH) 2026 Innovation Platform** modules for BharatFarm.

## Module Structure

- `shared/`: SIH Launcher Dashboard (`SihDashboardPage.tsx`) and Standalone SIH Navigation Shell (`SihLayout.tsx`).
- `climate-risk/`: Climate-Risk-Aware Procurement Engine workspace.
- `aggregation/`: Small-Farm Aggregation & Group Buying Bargaining Matrix workspace.
- `crop-risk-insurance/`: Satellite Damage Audit & AI Leaf Scanner Diagnostic workspace.
- `smart-mandi/`: Smart Mandi ML Net-Return Profit Router workspace.
- `sahayak/`: 24/7 WhatsApp AI Companion & Human Sahayak Assistance workspace.

## Application Architecture & Routing

All SIH workspaces operate independently from the legacy `AppLayout` and `MasterDashboardPage`. They are mapped to `/sih` and `/sih/*` canonical routes.
