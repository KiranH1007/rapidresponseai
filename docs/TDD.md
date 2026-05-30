# Technical Design Document (TDD)

# Rapid Response AI — Engineering Specification

| | |
|---|---|
| **Document Status** | ![Draft](https://img.shields.io/badge/Status-Draft-yellow) |
| **Author** | @KiranH1007 |
| **Reviewers** | TBD |
| **PRD Reference** | [PRD.md](./PRD.md) |
| **Created** | 2026-05-30 |
| **Last Updated** | 2026-05-30 |

---

## Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-05-30 | @KiranH1007 | Initial draft |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Current Architecture (As-Is)](#2-current-architecture-as-is)
3. [Target Architecture (To-Be)](#3-target-architecture-to-be)
4. [AI Model Abstraction Layer](#4-ai-model-abstraction-layer)
5. [Data Models & Type System](#5-data-models--type-system)
6. [API Specification](#6-api-specification)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Backend Architecture](#8-backend-architecture)
9. [Infrastructure & Deployment](#9-infrastructure--deployment)
10. [Observability & Monitoring](#10-observability--monitoring)
11. [Security Implementation](#11-security-implementation)
12. [Testing Strategy](#12-testing-strategy)
13. [Migration Plan](#13-migration-plan)
14. [Appendix](#14-appendix)

---

## 1. Overview

### 1.1 Purpose

This document describes the **technical architecture, implementation details, and engineering decisions** for Rapid Response AI. It is the engineering counterpart to the [Product Requirements Document (PRD)](./PRD.md) and should be read alongside it.

**Audience**: Engineers, technical leads, DevOps, and security reviewers.

### 1.2 Scope

This TDD covers:
- Current state architecture and its limitations
- Target state architecture with clean separation of concerns
- AI model abstraction layer for vendor-agnostic inference
- API contracts with request/response schemas
- Frontend component architecture
- Backend service architecture
- Infrastructure, deployment, and CI/CD
- Observability, security, and testing strategies
- Migration plan from current to target state

### 1.3 Design Principles

| Principle | What It Means in Practice |
|---|---|
| **Model-agnostic** | The AI inference layer is behind an interface. Swapping from Provider A to Provider B requires changing one adapter, not the entire system. |
| **Stateless backend** | No server-side session state. All context (chat history, location) travels with the request. Enables horizontal scaling. |
| **Fail gracefully** | Every external dependency (AI model, maps provider) has a fallback path. The user always sees a meaningful response. |
| **Defense in depth** | Input validation at the edge, schema enforcement at the service layer, sanitized output at the response layer. |
| **Observable by default** | Every request gets a correlation ID. Every external call is instrumented. Structured logs, not `console.log`. |

---

## 2. Current Architecture (As-Is)

### 2.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                             │
│                                                                     │
│  index.html ──► main.tsx ──► App.tsx                                │
│                                │                                    │
│                    ┌───────────┴───────────┐                        │
│                    ▼                       ▼                        │
│            EmergencyForm.tsx        AnalysisDisplay.tsx              │
│            (text/image/GPS)         (severity/actions/resources)     │
│                    │                       │                        │
│                    ▼                       ▼                        │
│                 geminiService.ts     FollowUpChat.tsx                │
│                 (API client)        (conversational Q&A)             │
│                    │                                                │
│                    │ fetch('/api/analyze')                           │
│                    │ fetch('/api/chat')                              │
└────────────────────┼────────────────────────────────────────────────┘
                     │
         ┌───────────┴──── Vite proxy (dev) / same-origin (prod)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      server.mjs (Express)                           │
│                                                                     │
│    ┌─────────────────────┐    ┌──────────────────────┐              │
│    │ POST /api/analyze   │    │ POST /api/chat       │              │
│    │                     │    │                      │              │
│    │ 1. Validate inputs  │    │ 1. Receive message   │              │
│    │ 2. Call AI model    │    │ 2. Rebuild chat      │              │
│    │ 3. Parse JSON       │    │ 3. Send to AI model  │              │
│    │ 4. Call Maps API    │    │ 4. Return text       │              │
│    │ 5. Return result    │    │                      │              │
│    └─────────┬───────────┘    └───────────┬──────────┘              │
│              │                            │                         │
│              ▼                            ▼                         │
│    ┌──────────────────────────────────────────────────┐             │
│    │         @google/genai SDK                        │             │
│    │   • Structured JSON generation                   │             │
│    │   • Google Maps grounding tool                   │             │
│    │   • Chat session management                      │             │
│    └──────────────────────────────────────────────────┘             │
│                                                                     │
│    API Key: process.env.GEMINI_API_KEY                              │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Current File Structure

```
rapidresponseai/
├── App.tsx                          # Root React component, state management
├── types.ts                         # Shared TypeScript interfaces
├── index.html                       # HTML entry point
├── components/
│   ├── Header.tsx                   # App header with branding
│   ├── EmergencyForm.tsx            # 3-step input (text, image, location)
│   ├── AnalysisDisplay.tsx          # Results view (severity, actions, resources)
│   ├── FollowUpChat.tsx             # Chat UI for follow-up questions
│   ├── ProjectInfo.tsx              # "How to Use" informational page
│   ├── PromptsModal.tsx             # Shows AI system instruction/prompt
│   └── icons/                       # SVG icon components
├── services/
│   └── geminiService.ts             # Frontend API client for /api/* endpoints
├── server.mjs                       # ← EXPRESS BACKEND (monolith, active)
├── src/
│   ├── main.tsx                     # React DOM mount
│   ├── index.css                    # Tailwind base styles
│   ├── vite-env.d.ts                # Vite type declarations
│   └── backend/                     # ← CLEAN ARCHITECTURE SCAFFOLD (inactive)
│       ├── app.ts                   # Express app factory (helmet, cors)
│       ├── server.ts                # Server entry point
│       └── routes/
│           └── api.routes.ts        # Route stubs returning 501
├── vite.config.ts                   # Vite build + dev proxy config
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── Dockerfile                       # Multi-stage Docker build
└── package.json                     # Dependencies and scripts
```

### 2.3 Key Limitations of Current Architecture

| # | Limitation | Impact | Severity |
|---|---|---|---|
| L1 | **Monolithic backend** (`server.mjs`) — all logic in one file | Untestable, unmaintainable as features grow | 🟠 High |
| L2 | **Tight coupling to one AI provider** — `@google/genai` SDK called directly in route handlers | Cannot swap models without rewriting route logic | 🟠 High |
| L3 | **No input validation** — only checks existence of `description` and `location` | Vulnerable to malformed payloads, injection | 🔴 Critical |
| L4 | **No error handler** — per-route try/catch with raw `console.error` | Stack traces may leak; inconsistent error formats | 🟠 High |
| L5 | **No logging** — uses `console.log` / `console.error` | No structured data for debugging, auditing, or alerting | 🟠 High |
| L6 | **No tests** — zero unit, integration, or component tests | No confidence in refactoring; regressions are invisible | 🔴 Critical |
| L7 | **No health check** — no endpoint for Cloud Run liveness/readiness probes | Platform cannot determine service health | 🟡 Medium |
| L8 | **Chat history travels with every request** — `aiHistory` is passed from client to server on every chat message | Payload grows linearly with conversation length; no server-side context | 🟡 Medium |
| L9 | **Duplicate backend code** — active `server.mjs` AND scaffold `src/backend/` exist side-by-side | Confusion about which is authoritative | 🟡 Medium |
| L10 | **API key in `.env` committed to repo** | Credential exposure | 🔴 Critical |

---

## 3. Target Architecture (To-Be)

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER (Client)                              │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  App.tsx      │  │  Components  │  │  Services    │  │  Types     │  │
│  │  (Shell)      │  │  (UI Layer)  │  │  (API Client)│  │  (Shared)  │  │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘  └────────────┘  │
│         │                                    │                          │
│         └────────────────────────────────────┘                          │
│                          │ HTTP                                         │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND (Clean Architecture)                 │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        MIDDLEWARE PIPELINE                       │   │
│  │  correlationId → rateLimiter → helmet → cors → bodyParser       │   │
│  │  → inputValidator → requestLogger                               │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                              │                                          │
│  ┌──────────────────────────┴───────────────────────────────────────┐   │
│  │                          ROUTE LAYER                             │   │
│  │   GET  /api/health     → healthController.check()               │   │
│  │   POST /api/analyze    → analyzeController.analyze()            │   │
│  │   POST /api/chat       → chatController.send()                  │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                              │                                          │
│  ┌──────────────────────────┴───────────────────────────────────────┐   │
│  │                        SERVICE LAYER                             │   │
│  │                                                                  │   │
│  │   ┌─────────────────┐   ┌──────────────────┐                    │   │
│  │   │  AnalysisService│   │  ChatService     │                    │   │
│  │   │  .analyze()     │   │  .sendMessage()  │                    │   │
│  │   └────────┬────────┘   └────────┬─────────┘                    │   │
│  │            │                     │                               │   │
│  │            ▼                     ▼                               │   │
│  │   ┌──────────────────────────────────────────────────────────┐   │   │
│  │   │              AI PROVIDER INTERFACE (Port)                │   │   │
│  │   │                                                          │   │   │
│  │   │   interface AIProvider {                                  │   │   │
│  │   │     analyzeEmergency(input): AnalysisResult              │   │   │
│  │   │     chat(message, history, context): ChatResponse        │   │   │
│  │   │   }                                                      │   │   │
│  │   │                                                          │   │   │
│  │   │   ┌──────────────────┐   ┌──────────────────┐           │   │   │
│  │   │   │ GeminiAdapter    │   │ OpenAIAdapter     │           │   │   │
│  │   │   │ (implements      │   │ (implements       │           │   │   │
│  │   │   │  AIProvider)     │   │  AIProvider)      │           │   │   │
│  │   │   │                  │   │                   │           │   │   │
│  │   │   │ @google/genai    │   │ openai SDK        │           │   │   │
│  │   │   └──────────────────┘   └──────────────────┘           │   │   │
│  │   └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │   ┌──────────────────────────────────────────────────────────┐   │   │
│  │   │            GEOSPATIAL PROVIDER INTERFACE (Port)          │   │   │
│  │   │                                                          │   │   │
│  │   │   interface GeoProvider {                                 │   │   │
│  │   │     findNearbyResources(type, lat, lng): Resource[]      │   │   │
│  │   │   }                                                      │   │   │
│  │   │                                                          │   │   │
│  │   │   ┌──────────────────┐   ┌──────────────────┐           │   │   │
│  │   │   │ GoogleMapsAdapter│   │ MapboxAdapter     │           │   │   │
│  │   │   │ (via AI grounding│   │ (direct API)      │           │   │   │
│  │   │   │  or Places API)  │   │                   │           │   │   │
│  │   │   └──────────────────┘   └──────────────────┘           │   │   │
│  │   └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      GLOBAL ERROR HANDLER                        │   │
│  │   Catches all unhandled errors → sanitizes → logs → responds    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Config: process.env.* via dotenv / cloud secret manager                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Target File Structure

```
rapidresponseai/
├── src/
│   ├── client/                          # FRONTEND
│   │   ├── App.tsx                      # Root component
│   │   ├── main.tsx                     # React DOM mount
│   │   ├── index.css                    # Global styles
│   │   ├── types/
│   │   │   └── index.ts                 # Client-side type definitions
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── EmergencyForm.tsx
│   │   │   ├── AnalysisDisplay.tsx
│   │   │   ├── FollowUpChat.tsx
│   │   │   ├── ProjectInfo.tsx
│   │   │   ├── PromptsModal.tsx
│   │   │   └── icons/
│   │   └── services/
│   │       └── apiClient.ts             # HTTP client for /api/* endpoints
│   │
│   └── server/                          # BACKEND
│       ├── index.ts                     # Server entry point
│       ├── app.ts                       # Express app factory
│       ├── config/
│       │   └── index.ts                 # Environment configuration
│       ├── middleware/
│       │   ├── correlationId.ts         # Assigns unique request ID
│       │   ├── requestLogger.ts         # Pino structured logging
│       │   ├── rateLimiter.ts           # express-rate-limit
│       │   ├── inputValidator.ts        # Zod schema validation
│       │   └── errorHandler.ts          # Global error handler
│       ├── routes/
│       │   ├── index.ts                 # Route aggregator
│       │   ├── health.routes.ts         # GET /api/health
│       │   ├── analyze.routes.ts        # POST /api/analyze
│       │   └── chat.routes.ts           # POST /api/chat
│       ├── controllers/
│       │   ├── health.controller.ts
│       │   ├── analyze.controller.ts
│       │   └── chat.controller.ts
│       ├── services/
│       │   ├── analysis.service.ts      # Orchestrates analysis pipeline
│       │   └── chat.service.ts          # Orchestrates chat pipeline
│       └── providers/
│           ├── ai/
│           │   ├── ai.provider.ts       # AIProvider interface (port)
│           │   ├── gemini.adapter.ts     # Gemini implementation
│           │   ├── openai.adapter.ts     # OpenAI implementation (future)
│           │   └── index.ts             # Factory: resolves provider from config
│           └── geo/
│               ├── geo.provider.ts      # GeoProvider interface (port)
│               ├── google-maps.adapter.ts
│               └── index.ts             # Factory: resolves provider from config
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── analysis.service.test.ts
│   │   │   └── chat.service.test.ts
│   │   └── providers/
│   │       ├── gemini.adapter.test.ts
│   │       └── google-maps.adapter.test.ts
│   ├── integration/
│   │   ├── analyze.routes.test.ts
│   │   ├── chat.routes.test.ts
│   │   └── health.routes.test.ts
│   └── component/                       # React component tests
│       ├── EmergencyForm.test.tsx
│       ├── AnalysisDisplay.test.tsx
│       └── FollowUpChat.test.tsx
│
├── docs/
│   ├── PRD.md                           # Product Requirements Document
│   ├── TDD.md                           # This document
│   ├── FUTURE_SCOPE.md                  # Future scope & evaluations
│   └── adr/                             # Architecture Decision Records
│       └── 001-ai-model-abstraction.md
│
├── .env.example                         # Template for environment variables
├── Dockerfile
├── docker-compose.yml                   # Local development
├── package.json
├── tsconfig.json
├── tsconfig.server.json                 # Separate TS config for backend
├── vite.config.ts
└── vitest.config.ts                     # Test runner configuration
```

### 3.3 Layer Responsibilities

| Layer | Responsibility | Allowed Dependencies |
|---|---|---|
| **Routes** | HTTP verb + path mapping. Zero business logic. | Controllers |
| **Controllers** | Request deserialization, response serialization, HTTP status codes. | Services |
| **Services** | Business logic, orchestration, error classification. | Providers (via interfaces) |
| **Providers** | External system communication (AI models, maps APIs). | External SDKs |
| **Middleware** | Cross-cutting concerns (auth, logging, validation, rate-limiting). | Config |
| **Config** | Environment variable loading, validation, and type-safe export. | None |

**Dependency rule**: Dependencies point **inward**. Routes → Controllers → Services → Providers. Never the reverse.

---

## 4. AI Model Abstraction Layer

### 4.1 Why Model Abstraction Matters

The current codebase calls `@google/genai` directly inside route handlers. This means:
- Switching to a different AI model requires rewriting route logic
- Testing requires mocking the SDK at the transport level
- Model-specific quirks (response format, error types) leak into business logic

The target architecture introduces the **Adapter Pattern** (aka Ports & Adapters / Hexagonal Architecture).

### 4.2 Interface Definition (Port)

```typescript
// src/server/providers/ai/ai.provider.ts

export interface EmergencyInput {
  description: string;
  location: { latitude: number; longitude: number };
  image?: {
    data: string;       // base64-encoded
    mimeType: string;   // e.g., "image/jpeg"
  };
}

export interface TriageResult {
  severity: 'Critical' | 'Severe' | 'Moderate' | 'Minor';
  summary: string;
  actionList: string[];
  resourceType: 'Hospital' | 'Fire_Rescue' | 'Police' | 'Ambulance';
}

export interface ChatInput {
  message: string;
  history: ChatHistoryEntry[];
  context: {
    location: { latitude: number; longitude: number };
  };
}

export interface ChatHistoryEntry {
  role: 'user' | 'model';
  text: string;
}

export interface ChatResponse {
  text: string;
  updatedHistory: ChatHistoryEntry[];
}

/**
 * Port: AI Provider Interface
 *
 * Any AI model (Gemini, OpenAI, Claude, Mistral, local LLM)
 * must implement this interface to be used by the application.
 */
export interface AIProvider {
  readonly name: string;

  /**
   * Analyze an emergency scene and return structured triage data.
   * The implementation must enforce structured output (JSON schema).
   */
  analyzeEmergency(input: EmergencyInput): Promise<TriageResult>;

  /**
   * Send a conversational message with history context.
   * Returns natural language text (not JSON).
   */
  chat(input: ChatInput): Promise<ChatResponse>;
}
```

### 4.3 Adapter Implementation (Example: Gemini)

```typescript
// src/server/providers/ai/gemini.adapter.ts

import { GoogleGenAI, Type } from '@google/genai';
import type { AIProvider, EmergencyInput, TriageResult, ChatInput, ChatResponse } from './ai.provider';

export class GeminiAdapter implements AIProvider {
  readonly name = 'gemini';
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash') {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async analyzeEmergency(input: EmergencyInput): Promise<TriageResult> {
    const systemInstruction = `You are a highly efficient Emergency Triage Analyst...`;

    const parts = [
      { text: `Analyze: ${input.description}. Location: ${input.location.latitude}, ${input.location.longitude}.` }
    ];

    if (input.image) {
      parts.push({ inlineData: { data: input.image.data, mimeType: input.image.mimeType } } as any);
    }

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: { /* ... Gemini-specific schema ... */ },
        systemInstruction,
      },
    });

    return JSON.parse(response.text.trim());
  }

  async chat(input: ChatInput): Promise<ChatResponse> {
    // ... Gemini-specific chat implementation ...
  }
}
```

### 4.4 Provider Factory

```typescript
// src/server/providers/ai/index.ts

import { AIProvider } from './ai.provider';
import { GeminiAdapter } from './gemini.adapter';
// import { OpenAIAdapter } from './openai.adapter';  // Future

export function createAIProvider(config: AppConfig): AIProvider {
  switch (config.aiProvider) {
    case 'gemini':
      return new GeminiAdapter(config.geminiApiKey, config.geminiModel);
    // case 'openai':
    //   return new OpenAIAdapter(config.openaiApiKey, config.openaiModel);
    default:
      throw new Error(`Unknown AI provider: ${config.aiProvider}`);
  }
}
```

### 4.5 Adding a New AI Provider

To add support for a new model (e.g., OpenAI GPT-4o, Anthropic Claude, Mistral):

1. Create `src/server/providers/ai/<provider-name>.adapter.ts`
2. Implement the `AIProvider` interface
3. Add a case to the factory in `src/server/providers/ai/index.ts`
4. Add config variables to `.env.example`
5. Write unit tests for the new adapter
6. Set `AI_PROVIDER=<provider-name>` in environment config

**Zero changes required** in routes, controllers, services, or frontend.

---

## 5. Data Models & Type System

### 5.1 Shared Types

These types are used across both client and server. They should live in a shared location or be duplicated with tests ensuring parity.

```typescript
// --- Core Domain Types ---

export type SeverityLevel = 'Critical' | 'Severe' | 'Moderate' | 'Minor';

export type ResourceType = 'Hospital' | 'Fire_Rescue' | 'Police' | 'Ambulance';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface NearbyResource {
  title: string;
  uri: string;   // Google Maps deep link
}

export interface AnalysisResult {
  severity: SeverityLevel;
  summary: string;
  actionList: string[];
  resourceType: ResourceType;
  nearbyResources: NearbyResource[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
```

### 5.2 Request/Response DTOs

```typescript
// --- API Request DTOs ---

export interface AnalyzeRequest {
  description: string;                    // Required, 10–5000 chars
  location: Location;                     // Required
  image?: {
    inlineData: {
      data: string;                       // base64-encoded
      mimeType: string;                   // Allowed: image/jpeg, image/png, image/webp
    };
  };
}

export interface ChatRequest {
  message: string;                        // Required, 1–2000 chars
  aiHistory: AiHistoryEntry[];            // Required, conversation context
  location: Location;                     // Required
}

// --- API Response DTOs ---

export interface AnalyzeResponse {
  analysis: AnalysisResult;
  initialHistory: ChatMessage[];
  aiHistory: AiHistoryEntry[];
}

export interface ChatResponse {
  text: string;
  aiHistory: AiHistoryEntry[];
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  checks: {
    aiProvider: 'ok' | 'error';
  };
}

export interface ErrorResponse {
  error: {
    code: string;                         // e.g., 'VALIDATION_ERROR', 'AI_PROVIDER_ERROR'
    message: string;                      // Human-readable, sanitized
    correlationId: string;                // For support/debugging
  };
}
```

### 5.3 Validation Schemas (Zod)

```typescript
// src/server/middleware/inputValidator.ts

import { z } from 'zod';

export const analyzeRequestSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters')
                          .max(5000, 'Description must not exceed 5000 characters'),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  image: z.object({
    inlineData: z.object({
      data: z.string(),
      mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    }),
  }).optional(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  aiHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
  })),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});
```

### 5.4 Database Schema (Phase 5 — Future)

> Not required for v2 launch. Included here for forward planning.

```sql
-- Incidents table
CREATE TABLE incidents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    severity        VARCHAR(10) NOT NULL CHECK (severity IN ('Critical','Severe','Moderate','Minor')),
    summary         TEXT NOT NULL,
    resource_type   VARCHAR(20) NOT NULL,
    location_lat    DECIMAL(10, 7) NOT NULL,
    location_lng    DECIMAL(10, 7) NOT NULL,
    input_text      TEXT NOT NULL,
    has_image       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Action items per incident
CREATE TABLE incident_actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id     UUID REFERENCES incidents(id) ON DELETE CASCADE,
    step_order      SMALLINT NOT NULL,
    action_text     TEXT NOT NULL
);

-- Nearby resources found
CREATE TABLE incident_resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id     UUID REFERENCES incidents(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    uri             TEXT NOT NULL
);

-- Chat messages per incident
CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id     UUID REFERENCES incidents(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('user', 'model')),
    message_text    TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- API audit log
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id  UUID NOT NULL,
    endpoint        VARCHAR(50) NOT NULL,
    method          VARCHAR(10) NOT NULL,
    status_code     SMALLINT NOT NULL,
    latency_ms      INTEGER NOT NULL,
    ip_hash         VARCHAR(64),           -- SHA-256 of IP, not raw IP
    error_code      VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_audit_log_correlation ON audit_log(correlation_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
```

---

## 6. API Specification

### 6.1 Base URL

| Environment | Base URL |
|---|---|
| Local Development | `http://localhost:3000/api` |
| Production | `https://<service-url>/api` |

### 6.2 Common Headers

**Request Headers:**
| Header | Required | Description |
|---|---|---|
| `Content-Type` | Yes | `application/json` |

**Response Headers:**
| Header | Always Present | Description |
|---|---|---|
| `X-Correlation-Id` | Yes | Unique request identifier for tracing |
| `X-RateLimit-Remaining` | Yes | Remaining requests in current window |
| `X-RateLimit-Reset` | Yes | Unix timestamp when the rate limit resets |
| `Content-Type` | Yes | `application/json` |

### 6.3 Endpoints

#### `GET /api/health`

Returns system health status. Used by cloud platform for liveness/readiness probes.

**Response (200):**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "uptime": 84321,
  "timestamp": "2026-05-30T10:00:00Z",
  "checks": {
    "aiProvider": "ok"
  }
}
```

**Response (503 — degraded):**
```json
{
  "status": "degraded",
  "version": "2.0.0",
  "uptime": 84321,
  "timestamp": "2026-05-30T10:00:00Z",
  "checks": {
    "aiProvider": "error"
  }
}
```

---

#### `POST /api/analyze`

Analyze an emergency scene. Accepts multimodal input (text + optional image + location).

**Request:**
```json
{
  "description": "Car accident on highway, one person injured and not moving. Car is smoking.",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "image": {
    "inlineData": {
      "data": "<base64-encoded-image-data>",
      "mimeType": "image/jpeg"
    }
  }
}
```

**Response (200):**
```json
{
  "analysis": {
    "severity": "Critical",
    "summary": "Single-vehicle accident with one unresponsive occupant. Vehicle producing smoke indicates potential fire hazard.",
    "actionList": [
      "Ensure your own safety. Do not approach if fire or explosion risk is present.",
      "Call 911 immediately. Report: one person unresponsive, vehicle smoking.",
      "If safe, check for responsiveness. Tap shoulder and shout.",
      "Do not move the person unless there is immediate danger (fire, explosion).",
      "Direct traffic away from the scene if possible."
    ],
    "resourceType": "Hospital",
    "nearbyResources": [
      {
        "title": "UCSF Medical Center",
        "uri": "https://maps.google.com/?cid=..."
      }
    ]
  },
  "initialHistory": [
    { "role": "user", "text": "Submitted an emergency report." },
    { "role": "model", "text": "Analysis complete. You can now ask follow-up questions." }
  ],
  "aiHistory": [
    { "role": "user", "parts": [{ "text": "Analyzed accident scene." }] },
    { "role": "model", "parts": [{ "text": "Initial analysis complete. Location: 37.7749, -122.4194." }] }
  ]
}
```

**Error Responses:**

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/invalid `description`, `location`, or `image.mimeType` |
| 413 | `PAYLOAD_TOO_LARGE` | Request body exceeds 50 MB |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests from this IP |
| 500 | `AI_PROVIDER_ERROR` | AI model call failed |
| 500 | `RESOURCE_DISCOVERY_PARTIAL` | Analysis succeeded but resource discovery failed (resources will be empty array) |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

#### `POST /api/chat`

Send a follow-up message in the context of a previous analysis.

**Request:**
```json
{
  "message": "Should I move the injured person?",
  "aiHistory": [ /* ... history array from previous response ... */ ],
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

**Response (200):**
```json
{
  "text": "Generally, you should NOT move an injured person unless there is immediate danger...",
  "aiHistory": [ /* ... updated history array ... */ ]
}
```

---

### 6.4 Error Response Format (All Endpoints)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description must be at least 10 characters.",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

Error codes follow a consistent taxonomy:

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request payload failed schema validation |
| `PAYLOAD_TOO_LARGE` | 413 | Request body exceeds size limit |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `AI_PROVIDER_ERROR` | 500 | AI model inference failed |
| `GEO_PROVIDER_ERROR` | 500 | Geospatial resource discovery failed |
| `INTERNAL_ERROR` | 500 | Unclassified server error |

---

## 7. Frontend Architecture

### 7.1 Component Tree

```
App.tsx
├── Header.tsx
├── [Navigation Tabs: Emergency AI | How to Use]
│
├── View: APP
│   ├── State: EMPTY
│   │   └── EmergencyForm.tsx
│   │       ├── TextArea (with MicrophoneIcon for voice input)
│   │       ├── ImageUpload (with CameraIcon)
│   │       └── LocationButton (with MapPinIcon)
│   │
│   ├── State: LOADING
│   │   └── Spinner + "AI Analyzing Scene..."
│   │
│   ├── State: ERROR
│   │   └── Error message + "Try Again" button
│   │
│   └── State: RESULTS
│       └── AnalysisDisplay.tsx
│           ├── Severity Badge (color-coded)
│           ├── Summary (with Copy button)
│           ├── Action List (ordered)
│           ├── Nearby Resources (with navigation links)
│           ├── FollowUpChat.tsx
│           │   ├── Message list (auto-scroll)
│           │   └── Input + Send button
│           └── "Report Another Incident" button
│
└── View: INFO
    └── ProjectInfo.tsx
```

### 7.2 State Management

The application uses **React `useState` hooks** at the `App.tsx` level. This is appropriate for the current complexity.

| State Variable | Type | Purpose |
|---|---|---|
| `view` | `View` enum | Controls APP vs INFO tab |
| `isLoading` | `boolean` | Shows spinner during analysis |
| `isChatLoading` | `boolean` | Disables chat input during response |
| `analysis` | `AnalysisResult \| null` | Analysis result data |
| `error` | `string \| null` | Error message |
| `chatSession` | `Chat \| null` | Chat session object (from geminiService) |
| `chatHistory` | `ChatMessage[]` | Chat messages for display |

**State Machine**:
```
EMPTY ──(submit)──► LOADING ──(success)──► RESULTS
                        │                     │
                        └──(error)──► ERROR    └──(reset)──► EMPTY
                                       │
                                       └──(retry)──► EMPTY
```

### 7.3 API Client (`services/apiClient.ts`)

The frontend API client abstracts server communication. Currently it creates a "fake" chat object that mimics the Gemini SDK's interface so `App.tsx` doesn't need to change.

**Target refactoring**: Replace the fake chat object with a simpler API client that exposes:

```typescript
export const apiClient = {
  analyze: async (input: AnalyzeRequest): Promise<AnalyzeResponse> => { ... },
  chat: async (input: ChatRequest): Promise<ChatResponse> => { ... },
};
```

This removes the SDK-mimicking complexity and makes the client a thin HTTP wrapper.

---

## 8. Backend Architecture

### 8.1 Middleware Pipeline

Requests flow through middleware in this order:

```
Request
  │
  ▼
┌──────────────────┐
│ correlationId    │  Assigns X-Correlation-Id header (UUID v4)
└────────┬─────────┘
         ▼
┌──────────────────┐
│ requestLogger    │  Logs: method, path, correlationId, start time
└────────┬─────────┘
         ▼
┌──────────────────┐
│ helmet           │  Sets security headers (CSP, X-Frame-Options, etc.)
└────────┬─────────┘
         ▼
┌──────────────────┐
│ cors             │  Restricts origins (not wildcard)
└────────┬─────────┘
         ▼
┌──────────────────┐
│ rateLimiter      │  30 req/min/IP (configurable)
└────────┬─────────┘
         ▼
┌──────────────────┐
│ bodyParser       │  JSON parsing with 50 MB limit
└────────┬─────────┘
         ▼
┌──────────────────┐
│ inputValidator   │  Zod schema validation (per-route)
└────────┬─────────┘
         ▼
     Route Handler
         │
         ▼
┌──────────────────┐
│ responseLogger   │  Logs: status code, latency, correlationId
└────────┬─────────┘
         ▼
┌──────────────────┐
│ errorHandler     │  Global: catches unhandled errors, sanitizes, logs
└────────┬─────────┘
         ▼
Response
```

### 8.2 Configuration

```typescript
// src/server/config/index.ts

export interface AppConfig {
  // Server
  port: number;
  nodeEnv: 'development' | 'production' | 'test';

  // AI Provider
  aiProvider: 'gemini' | 'openai';            // Which provider to use
  geminiApiKey: string;
  geminiModel: string;                        // e.g., 'gemini-2.5-flash'
  // openaiApiKey: string;                    // Future
  // openaiModel: string;                     // Future

  // Rate Limiting
  rateLimitWindowMs: number;                  // Default: 60000 (1 min)
  rateLimitMax: number;                       // Default: 30

  // CORS
  corsOrigins: string[];                      // Allowed origins

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
```

### 8.3 Error Classification

```typescript
// src/server/middleware/errorHandler.ts

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational: boolean = true,
  ) {
    super(message);
  }
}

// Usage in services:
throw new AppError(400, 'VALIDATION_ERROR', 'Description must be at least 10 characters');
throw new AppError(500, 'AI_PROVIDER_ERROR', 'AI model failed to generate a response');

// Global handler:
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const correlationId = req.headers['x-correlation-id'];

  if (err instanceof AppError && err.isOperational) {
    logger.warn({ correlationId, code: err.code, message: err.message });
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, correlationId }
    });
  }

  // Unexpected errors — log full stack, return sanitized message
  logger.error({ correlationId, err });
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', correlationId }
  });
}
```

---

## 9. Infrastructure & Deployment

### 9.1 Container Architecture

```dockerfile
# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build           # Builds both client (Vite) and server (tsc)

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/dist ./dist
EXPOSE 3001
USER node                     # Non-root user
CMD ["node", "dist/server/index.js"]
```

**Key changes from current Dockerfile:**
- No `VITE_API_KEY` build argument (API key stays server-side only)
- Single `CMD` serves both static frontend and API
- Runs as non-root `node` user
- Uses `corepack` instead of global `npm install -g pnpm`

### 9.2 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - AI_PROVIDER=gemini
      - AI_MODEL=gemini-2.5-flash
      - PORT=3001
      - CORS_ORIGINS=http://localhost:5173
      - LOG_LEVEL=debug
    volumes:
      - .:/app
      - /app/node_modules
```

### 9.3 Environment Variables

```bash
# .env.example

# ═══════════════════════════════════════════
# Server Configuration
# ═══════════════════════════════════════════
NODE_ENV=development
PORT=3000

# ═══════════════════════════════════════════
# AI Provider Configuration
# ═══════════════════════════════════════════
# Which AI provider to use: 'gemini' | 'openai'
AI_PROVIDER=gemini

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key-here
AI_MODEL=gemini-2.5-flash

# OpenAI (future)
# OPENAI_API_KEY=your-openai-api-key-here
# AI_MODEL=gpt-4o

# ═══════════════════════════════════════════
# Security
# ═══════════════════════════════════════════
CORS_ORIGINS=http://localhost:5173,http://localhost:3001
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30

# ═══════════════════════════════════════════
# Observability
# ═══════════════════════════════════════════
LOG_LEVEL=debug
```

### 9.4 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml (Target)

name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Unit tests
        run: pnpm test:unit -- --coverage

      - name: Integration tests
        run: pnpm test:integration

      - name: Build
        run: pnpm build

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info

  docker:
    needs: quality
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t rapid-response-ai:${{ github.sha }} .

      # Deploy step would go here (Cloud Run, etc.)
```

### 9.5 Package.json Scripts (Target)

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"tsx watch src/server/index.ts\"",
    "build": "tsc -p tsconfig.server.json && vite build",
    "start": "node dist/server/index.js",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:unit": "vitest run --dir tests/unit",
    "test:integration": "vitest run --dir tests/integration",
    "test:component": "vitest run --dir tests/component",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 10. Observability & Monitoring

### 10.1 Structured Logging (Pino)

```typescript
// Example log output (JSON):

// Request start
{"level":"info","time":1717063200,"correlationId":"abc-123","msg":"request_start","method":"POST","path":"/api/analyze","ip_hash":"sha256:a1b2c3..."}

// AI provider call
{"level":"info","time":1717063201,"correlationId":"abc-123","msg":"ai_provider_call","provider":"gemini","model":"gemini-2.5-flash","latencyMs":2340}

// Geo provider call
{"level":"info","time":1717063202,"correlationId":"abc-123","msg":"geo_provider_call","provider":"google-maps","resourceType":"Hospital","resultsCount":3,"latencyMs":890}

// Request complete
{"level":"info","time":1717063203,"correlationId":"abc-123","msg":"request_complete","statusCode":200,"totalLatencyMs":3450}

// Error
{"level":"error","time":1717063204,"correlationId":"def-456","msg":"ai_provider_error","provider":"gemini","error":"RESOURCE_EXHAUSTED","stack":"..."}
```

### 10.2 Health Check

```typescript
// GET /api/health

{
  "status": "healthy",         // healthy | degraded | unhealthy
  "version": "2.0.0",
  "uptime": 84321,             // seconds since server start
  "timestamp": "2026-05-30T10:00:00Z",
  "checks": {
    "aiProvider": "ok"         // ok | error
  }
}
```

**Cloud Run integration:**
- **Liveness probe**: `GET /api/health` → expects 200
- **Readiness probe**: `GET /api/health` → checks `status !== 'unhealthy'`
- **Startup probe**: Same as readiness, with longer timeout

### 10.3 Metrics to Track

| Metric | Type | Labels |
|---|---|---|
| `http_requests_total` | Counter | method, path, status_code |
| `http_request_duration_ms` | Histogram | method, path |
| `ai_provider_calls_total` | Counter | provider, model, success |
| `ai_provider_latency_ms` | Histogram | provider, model |
| `geo_provider_calls_total` | Counter | provider, success |
| `geo_provider_latency_ms` | Histogram | provider |
| `analysis_severity_total` | Counter | severity |
| `active_connections` | Gauge | — |

---

## 11. Security Implementation

### 11.1 Security Checklist

| # | Measure | Implementation | Status |
|---|---|---|---|
| S1 | API keys server-side only | `process.env` via dotenv / Secret Manager | ✅ Current |
| S2 | Remove `.env` from Git history | `git filter-branch` or BFG Repo-Cleaner | 🔲 Pending |
| S3 | Input validation | Zod schemas on all endpoints | 🔲 Planned |
| S4 | Security headers | Helmet middleware | ✅ In scaffold |
| S5 | CORS restriction | Whitelist specific origins | 🔲 Planned |
| S6 | Rate limiting | `express-rate-limit` | 🔲 Planned |
| S7 | Error sanitization | Global error handler, no stack traces | 🔲 Planned |
| S8 | Dependency scanning | Dependabot (weekly npm, monthly GH Actions) | ✅ Current |
| S9 | Non-root Docker user | `USER node` in Dockerfile | 🔲 Planned |
| S10 | Payload size limits | Express body-parser `limit: '50mb'` | ✅ Current |
| S11 | IP hashing in logs | SHA-256(IP) — never raw IPs in logs | 🔲 Planned |

### 11.2 Threat Model (STRIDE Subset)

| Threat | Attack Vector | Mitigation |
|---|---|---|
| **Spoofing** | Forged requests to API | Rate limiting, CORS, future: API key per client |
| **Tampering** | Modified request payloads | Zod validation, HTTPS enforcement |
| **Information Disclosure** | Stack traces in error responses | Global error handler, sanitized responses |
| **Denial of Service** | Flood of expensive AI calls | Rate limiting (30 req/min/IP), payload size limits |
| **Prompt Injection** | Adversarial text in description | System instruction constrains output domain; input length limits |

---

## 12. Testing Strategy

### 12.1 Testing Pyramid

```
                    ┌───────────┐
                    │  E2E      │   Manual / Playwright (future)
                    │  Tests    │   Test full user journey
                    ├───────────┤
                    │           │
                ┌───┤Integration├───┐   Supertest + real Express app
                │   │  Tests    │   │   Test routes with mocked providers
                │   ├───────────┤   │
                │   │           │   │
            ┌───┤   │   Unit    │   ├───┐   Vitest
            │   │   │   Tests   │   │   │   Test services, adapters, utils
            │   │   └───────────┘   │   │   in isolation with mocks
            └───┘                   └───┘
```

### 12.2 Test Configuration

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
```

### 12.3 Unit Test Examples

```typescript
// tests/unit/services/analysis.service.test.ts

describe('AnalysisService', () => {
  let service: AnalysisService;
  let mockAIProvider: MockAIProvider;
  let mockGeoProvider: MockGeoProvider;

  beforeEach(() => {
    mockAIProvider = new MockAIProvider();
    mockGeoProvider = new MockGeoProvider();
    service = new AnalysisService(mockAIProvider, mockGeoProvider);
  });

  it('should return analysis with severity and actions', async () => {
    mockAIProvider.setResponse({ severity: 'Critical', summary: '...', actionList: ['...'], resourceType: 'Hospital' });
    mockGeoProvider.setResponse([{ title: 'Hospital A', uri: 'https://maps...' }]);

    const result = await service.analyze({
      description: 'Car accident with injuries',
      location: { latitude: 37.77, longitude: -122.41 },
    });

    expect(result.analysis.severity).toBe('Critical');
    expect(result.analysis.nearbyResources).toHaveLength(1);
  });

  it('should return empty resources when geo provider fails', async () => {
    mockAIProvider.setResponse({ severity: 'Moderate', summary: '...', actionList: ['...'], resourceType: 'Hospital' });
    mockGeoProvider.setError(new Error('Maps API unavailable'));

    const result = await service.analyze({ description: '...', location: { latitude: 0, longitude: 0 } });

    expect(result.analysis.nearbyResources).toEqual([]);
    // Analysis should still succeed
    expect(result.analysis.severity).toBe('Moderate');
  });

  it('should throw AppError when AI provider fails', async () => {
    mockAIProvider.setError(new Error('Model overloaded'));

    await expect(service.analyze({ description: '...', location: { latitude: 0, longitude: 0 } }))
      .rejects.toThrow(AppError);
  });
});
```

### 12.4 Integration Test Examples

```typescript
// tests/integration/analyze.routes.test.ts

import request from 'supertest';
import { createApp } from '../../src/server/app';

describe('POST /api/analyze', () => {
  const app = createApp({ aiProvider: new MockAIProvider(), geoProvider: new MockGeoProvider() });

  it('should return 400 when description is missing', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ location: { latitude: 37.77, longitude: -122.41 } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when description is too short', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ description: 'short', location: { latitude: 37.77, longitude: -122.41 } });

    expect(res.status).toBe(400);
  });

  it('should return 200 with valid analysis', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        description: 'Car accident on highway, person injured',
        location: { latitude: 37.77, longitude: -122.41 },
      });

    expect(res.status).toBe(200);
    expect(res.body.analysis.severity).toBeDefined();
    expect(res.body.analysis.actionList).toBeInstanceOf(Array);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('should return correlation ID in response headers', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        description: 'Fire in building, smoke visible',
        location: { latitude: 40.71, longitude: -74.00 },
      });

    expect(res.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
});
```

### 12.5 Component Test Examples

```typescript
// tests/component/EmergencyForm.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { EmergencyForm } from '../../src/client/components/EmergencyForm';

describe('EmergencyForm', () => {
  it('should disable submit when description is empty', () => {
    render(<EmergencyForm onSubmit={vi.fn()} />);
    const button = screen.getByText('Analyze Situation');
    expect(button).toBeDisabled();
  });

  it('should disable submit when location is not acquired', () => {
    render(<EmergencyForm onSubmit={vi.fn()} />);
    const textarea = screen.getByPlaceholderText(/car accident/i);
    fireEvent.change(textarea, { target: { value: 'Test description' } });
    const button = screen.getByText('Analyze Situation');
    expect(button).toBeDisabled();  // Still disabled — no location
  });

  it('should hide voice button when Speech API is unavailable', () => {
    // Mock SpeechRecognition as undefined
    render(<EmergencyForm onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText('Start listening')).not.toBeInTheDocument();
  });
});
```

---

## 13. Migration Plan

### 13.1 Migration Strategy: Strangler Fig Pattern

We migrate from `server.mjs` to `src/server/` incrementally, route by route, not all at once.

```
Phase 1: Scaffold + Health Check
  server.mjs (active) ──────────── /api/analyze, /api/chat
  src/server/ (new) ─────────────── /api/health (new)

Phase 2: Move /api/analyze
  server.mjs ────────────────────── /api/chat (only)
  src/server/ ───────────────────── /api/health, /api/analyze (migrated)

Phase 3: Move /api/chat
  server.mjs ────────────────────── (deleted)
  src/server/ ───────────────────── /api/health, /api/analyze, /api/chat

Phase 4: Cleanup
  Remove server.mjs
  Update Dockerfile CMD
  Update package.json scripts
```

### 13.2 Step-by-Step Migration

| Step | Action | Validation | Rollback |
|---|---|---|---|
| 1 | Create `src/server/` structure with middleware pipeline | Server starts, `/api/health` returns 200 | Delete new files |
| 2 | Implement `AIProvider` interface + `GeminiAdapter` | Unit tests pass with mocked Gemini SDK | Revert adapter |
| 3 | Implement `GeoProvider` interface + `GoogleMapsAdapter` | Unit tests pass | Revert adapter |
| 4 | Implement `AnalysisService` using providers | Unit tests with mocked providers pass | Revert service |
| 5 | Wire `/api/analyze` route through controller → service → providers | Integration tests pass; manual test matches `server.mjs` behavior | Revert route |
| 6 | Implement `ChatService` + wire `/api/chat` | Integration tests pass | Revert |
| 7 | Run both servers in parallel, compare outputs | Same responses for identical inputs | Keep `server.mjs` |
| 8 | Remove `server.mjs`, update Dockerfile and scripts | Full CI passes, Docker build succeeds | Restore `server.mjs` |
| 9 | Deploy to staging | Manual E2E testing | Roll back deploy |
| 10 | Deploy to production | Monitor error rates, latency | Roll back deploy |

### 13.3 Breaking Changes

| Change | Impact | Migration |
|---|---|---|
| Backend entrypoint changes from `server.mjs` to `dist/server/index.js` | Dockerfile CMD must update | Update in same PR |
| `dev` script changes from `node server.mjs` to `tsx watch src/server/index.ts` | Local dev workflow change | Document in README |
| New env vars (`AI_PROVIDER`, `AI_MODEL`, `CORS_ORIGINS`) | Existing `.env` files need updates | Provide `.env.example` migration guide |

---

## 14. Appendix

### A. Decision Log (ADRs)

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | Use Adapter Pattern for AI model abstraction | Enables model swapping without service layer changes. Testable with mocks. |
| ADR-002 | Use Zod for input validation (over Joi) | Zod has first-class TypeScript support, infers types from schemas, smaller bundle. |
| ADR-003 | Use Pino for structured logging (over Winston) | Pino is faster, outputs JSON natively, integrates well with Cloud Run. |
| ADR-004 | Use Vitest as test runner (over Jest) | Native Vite integration, faster, ESM-first, compatible with existing toolchain. |
| ADR-005 | Strangler Fig migration (over Big Bang rewrite) | Lower risk, incremental validation, easy rollback at each step. |
| ADR-006 | Stateless chat (history in request payload) | Simplifies scaling. No server-side session store needed. Tradeoff: larger payloads. |
| ADR-007 | Non-root Docker user | Defense in depth. Limits blast radius of container escape. |

### B. Dependency Inventory

| Package | Purpose | Layer | License |
|---|---|---|---|
| `react`, `react-dom` | UI framework | Frontend | MIT |
| `@vitejs/plugin-react` | Vite React plugin | Frontend (dev) | MIT |
| `tailwindcss` | CSS framework | Frontend | MIT |
| `express` | HTTP server framework | Backend | MIT |
| `cors` | CORS middleware | Backend | MIT |
| `helmet` | Security headers | Backend | MIT |
| `dotenv` | Environment variable loading | Backend | BSD-2 |
| `zod` | Input validation | Backend | MIT |
| `pino` | Structured logging | Backend | MIT |
| `express-rate-limit` | Rate limiting | Backend | MIT |
| `@google/genai` | Gemini AI SDK | Backend (adapter) | Apache-2.0 |
| `vitest` | Test runner | Testing | MIT |
| `supertest` | HTTP integration testing | Testing | MIT |
| `@testing-library/react` | Component testing | Testing | MIT |
| `typescript` | Type system | Both | Apache-2.0 |

### C. References

| Document | Location |
|---|---|
| Product Requirements Document (PRD) | [docs/PRD.md](./PRD.md) |
| Future Scope & Evaluations | [docs/FUTURE_SCOPE.md](./FUTURE_SCOPE.md) |
| Contributing Guide | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Google Gemini API Docs | https://ai.google.dev/docs |
| Express.js Security Best Practices | https://expressjs.com/en/advanced/best-practice-security.html |
| Hexagonal Architecture | https://alistair.cockburn.us/hexagonal-architecture/ |

---

*This document is the engineering companion to the [PRD](./PRD.md). It describes **how** to build what the PRD defines. For future scope and model evaluation criteria, see [FUTURE_SCOPE.md](./FUTURE_SCOPE.md).*
