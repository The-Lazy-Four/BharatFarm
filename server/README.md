# BharatFarm Backend Architecture

## Overview
Modular Node.js Express + TypeScript backend designed with clean Domain-Driven and Feature-Based separation.

## Infrastructure
- Config (`/src/config`)
- Middleware (`/src/middleware`)
- Utils (`/src/utils`)
- Global Routes (`/src/routes`)

## Feature Modules
Each feature module inside `/src/modules/<feature>` contains:
- `controllers/`
- `services/`
- `repositories/`
- `routes/`
- `schemas/`
- `types/`
- `mock/`
- `constants/`
- `index.ts`
- `README.md`
