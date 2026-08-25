# KrishiBot Backend Module

## Purpose
Multilingual AI farmer assistant backend service.

## Responsibilities
- Processes text and voice user queries.
- Manages farmer context (location, crop, soil conditions).
- Interfaces with local/cloud LLM providers or returns reliable mock advice during offline/development mode.

## Endpoints
- `POST /api/krishibot/chat` - Submits a farmer prompt and receives contextual agricultural advice.

## Layering
- **Controller**: `krishiBot.controller.ts`
- **Service**: `krishiBot.service.ts`
- **Repository**: `krishiBot.repository.ts` (Mock DB / AI Provider Layer)

## Developer Ownership
Assigned Developer: Developer C
