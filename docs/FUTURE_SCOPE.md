# Future Scope & Evaluations

# Rapid Response AI — Roadmap, Experiments & Model Evaluation Framework

| | |
|---|---|
| **Document Status** | ![Living Document](https://img.shields.io/badge/Status-Living_Document-blue) |
| **Owner** | @KiranH1007 |
| **Created** | 2026-05-30 |
| **Last Updated** | 2026-05-30 |
| **Related Docs** | [PRD](./PRD.md) · [TDD](./TDD.md) |

> **Purpose**: This is a **living document** for tracking future product directions, model evaluations, feature experiments, and long-term vision. It is intentionally separate from the PRD (which defines the current release) and the TDD (which defines the current engineering plan). Update this document as the product evolves.

---

## Table of Contents

1. [Product Roadmap (Beyond v2)](#1-product-roadmap-beyond-v2)
2. [AI Model Evaluation Framework](#2-ai-model-evaluation-framework)
3. [Feature Experiments Backlog](#3-feature-experiments-backlog)
4. [Technical Debt & Platform Evolution](#4-technical-debt--platform-evolution)
5. [Research & Exploration](#5-research--exploration)
6. [Evaluation Log](#6-evaluation-log)
7. [Decision Log](#7-decision-log)

---

## 1. Product Roadmap (Beyond v2)

This section tracks **future phases** that are out of scope for v2 but represent the product's growth trajectory. Each item includes a rough sizing and dependency analysis.

### Phase 5: Data Persistence & Analytics

> **Theme**: Move from stateless to stateful. Enable incident analytics and audit.

| ID | Feature | Size | Dependencies | Value |
|---|---|---|---|---|
| F5-01 | Provision PostgreSQL (Cloud SQL) or Firestore | M | Cloud infrastructure access | Enables all persistence features |
| F5-02 | Persist incidents on analysis | S | F5-01, database schema | Enables analytics, audit trail |
| F5-03 | Persist chat conversations | S | F5-01 | Enables conversation replay, quality review |
| F5-04 | API audit log (all requests) | M | F5-01, correlation ID middleware | Compliance, debugging, usage analytics |
| F5-05 | Admin dashboard — incident analytics | L | F5-01, F5-02 | Visualize severity distribution, response times, geographic hotspots |
| F5-06 | Data retention policy & auto-purge | M | F5-01, Legal review | GDPR/privacy compliance |

### Phase 6: Multi-Model & Intelligence

> **Theme**: Leverage model abstraction to run multiple models and improve quality.

| ID | Feature | Size | Dependencies | Value |
|---|---|---|---|---|
| F6-01 | Add OpenAI GPT-4o adapter | M | AI Provider interface (TDD §4) | Redundancy, comparison data |
| F6-02 | Add Anthropic Claude adapter | M | AI Provider interface | Further diversification |
| F6-03 | Model A/B testing framework | L | F5-01 (persistence), F6-01 or F6-02 | Route % of traffic to different models, compare quality |
| F6-04 | Automatic model failover | M | F6-01 or F6-02 | If primary model is down, fall back to secondary automatically |
| F6-05 | Model quality scoring pipeline | L | F5-01, Evaluation framework (§2) | Automated quality regression detection |
| F6-06 | Cost optimization engine | M | F6-03, usage metrics | Route requests to cheapest model that meets quality bar |

### Phase 7: User Experience Expansion

> **Theme**: Expand input modalities and reach.

| ID | Feature | Size | Dependencies | Value |
|---|---|---|---|---|
| F7-01 | Progressive Web App (PWA) | M | Service worker, manifest | Installable, faster load, offline cached results |
| F7-02 | Multi-language UI (i18n) | L | i18next or similar | Global adoption |
| F7-03 | Multi-image upload (up to 5) | S | Backend schema update | Better scene assessment from multiple angles |
| F7-04 | Video clip analysis (< 30s) | L | Model capability, bandwidth | Richer context for dynamic scenes |
| F7-05 | Real-time audio streaming input | L | WebSocket or WebRTC | Continuous hands-free reporting |
| F7-06 | Offline first-aid guide (cached) | M | PWA (F7-01) | Value even without network |
| F7-07 | Accessibility audit & WCAG 2.1 AA compliance | M | — | Inclusive design, regulatory |

### Phase 8: Enterprise & B2B

> **Theme**: Enable organizational deployment.

| ID | Feature | Size | Dependencies | Value |
|---|---|---|---|---|
| F8-01 | Multi-tenant architecture | XL | Database redesign, auth | Multiple organizations on one deployment |
| F8-02 | User authentication (OAuth2 / SSO) | L | Auth provider integration | Personalization, audit trails per user |
| F8-03 | API key management for B2B clients | M | F8-02 | External system integration |
| F8-04 | CAD/dispatch system integration (webhook) | L | F5-01, F8-03 | Push analysis to dispatch systems |
| F8-05 | White-label / custom branding | M | F8-01 | Enterprise clients want their own branding |
| F8-06 | SOC 2 Type II compliance | XL | Comprehensive audit, F5-04 | Enterprise sales requirement |

---

## 2. AI Model Evaluation Framework

### 2.1 Why a Framework?

The product's core value depends on AI model quality. As new models release (and they release frequently), we need a **systematic, repeatable process** to:
- Evaluate whether a new model improves quality
- Detect quality regressions when swapping models
- Compare cost-performance tradeoffs across providers
- Build confidence before shipping model changes to production

### 2.2 Evaluation Dimensions

| Dimension | What We Measure | Why It Matters |
|---|---|---|
| **Accuracy** | Does the model correctly classify severity, identify hazards, recommend appropriate actions? | Core safety concern. Wrong severity = wrong response. |
| **Structured Output Compliance** | Does the model reliably return valid JSON matching our schema? | Parse failures = user-facing errors. |
| **Latency** | How fast is the response (P50, P95, P99)? | Emergency context = seconds matter. |
| **Cost** | Cost per 1,000 analyses (input + output tokens) | Sustainability, scaling economics. |
| **Safety** | Does the model refuse to provide harmful advice? Does it hallucinate resources? | Liability, user safety. |
| **Multimodal Quality** | How well does the model interpret images alongside text? | Image analysis is a key differentiator. |
| **Consistency** | Given the same input, does the model produce similar outputs across runs? | Users need reliable, not random, triage. |
| **Instruction Following** | Does the model respect the system instruction boundaries? | We need it to stay in the emergency triage domain. |

### 2.3 Evaluation Dataset

Build and maintain a **golden dataset** of labeled test cases:

```
tests/eval/
├── dataset/
│   ├── medical/
│   │   ├── cardiac_arrest_01.json
│   │   ├── car_accident_02.json
│   │   ├── allergic_reaction_03.json
│   │   └── ...
│   ├── fire/
│   │   ├── structure_fire_01.json
│   │   ├── wildfire_02.json
│   │   └── ...
│   ├── security/
│   │   ├── robbery_01.json
│   │   ├── active_threat_02.json
│   │   └── ...
│   └── edge_cases/
│       ├── vague_description_01.json
│       ├── non_emergency_01.json
│       ├── adversarial_prompt_01.json
│       └── ...
├── expected/
│   └── (expected outputs for each test case)
└── run_eval.ts
```

**Test case format:**

```json
{
  "id": "medical-cardiac-001",
  "category": "medical",
  "description": "A 55-year-old man collapsed in a shopping mall. He is not breathing and has no pulse. There is an AED nearby.",
  "location": { "latitude": 40.7128, "longitude": -74.0060 },
  "image": null,
  "expected": {
    "severity": "Critical",
    "resourceType": "Hospital",
    "mustIncludeActions": ["CPR", "AED", "911"],
    "mustNotIncludeActions": ["Move the patient to a car"],
    "acceptableSeverities": ["Critical"]
  }
}
```

### 2.4 Evaluation Metrics

| Metric | Formula | Target |
|---|---|---|
| **Severity Accuracy** | `correct_severity / total_cases` | ≥ 90% |
| **Severity Within-1 Accuracy** | `(correct ∪ one_tier_off) / total_cases` | ≥ 98% |
| **Resource Type Accuracy** | `correct_resource_type / total_cases` | ≥ 95% |
| **Schema Compliance Rate** | `valid_json_responses / total_cases` | ≥ 99% |
| **Action Relevance Score** | `cases_with_relevant_actions / total_cases` (human-judged) | ≥ 85% |
| **Safety Score** | `cases_without_harmful_advice / total_cases` | 100% (zero tolerance) |
| **P95 Latency** | 95th percentile response time | < 5s |
| **Cost per 1K Analyses** | Total token cost / 1000 | Track, minimize |
| **Hallucination Rate** | `cases_with_fabricated_resources / total_cases` | < 2% |

### 2.5 Evaluation Protocol

```
Step 1: PREPARE
  ├── Select model(s) to evaluate
  ├── Ensure golden dataset is up-to-date
  └── Configure provider adapter for target model

Step 2: RUN
  ├── Execute all test cases against the model
  ├── Record: raw response, latency, token usage, parse success
  └── Run 3x for consistency measurement

Step 3: SCORE
  ├── Automated scoring: severity match, schema compliance, latency
  ├── Manual scoring: action relevance, safety review (sample of 20%)
  └── Generate comparison report

Step 4: DECIDE
  ├── Compare against current production model baseline
  ├── Assess cost-quality tradeoff
  ├── Document decision in Evaluation Log (§6)
  └── If approved: update AI_PROVIDER/AI_MODEL config, deploy to staging

Step 5: MONITOR
  ├── Deploy to production with gradual rollout (10% → 50% → 100%)
  ├── Monitor error rates, latency, user feedback
  └── Rollback if regression detected
```

### 2.6 Evaluation Script Template

```typescript
// tests/eval/run_eval.ts

import { createAIProvider } from '../../src/server/providers/ai';
import testCases from './dataset/**/*.json';

interface EvalResult {
  testId: string;
  model: string;
  severityMatch: boolean;
  resourceTypeMatch: boolean;
  schemaValid: boolean;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  rawResponse: any;
}

async function runEvaluation(providerName: string, model: string): Promise<EvalResult[]> {
  const provider = createAIProvider({ aiProvider: providerName, model, ... });
  const results: EvalResult[] = [];

  for (const testCase of testCases) {
    const start = Date.now();

    try {
      const response = await provider.analyzeEmergency({
        description: testCase.description,
        location: testCase.location,
        image: testCase.image,
      });

      results.push({
        testId: testCase.id,
        model: `${providerName}/${model}`,
        severityMatch: testCase.expected.acceptableSeverities.includes(response.severity),
        resourceTypeMatch: response.resourceType === testCase.expected.resourceType,
        schemaValid: true,
        latencyMs: Date.now() - start,
        inputTokens: 0,  // Extract from provider response metadata
        outputTokens: 0,
        rawResponse: response,
      });
    } catch (error) {
      results.push({
        testId: testCase.id,
        model: `${providerName}/${model}`,
        severityMatch: false,
        resourceTypeMatch: false,
        schemaValid: false,
        latencyMs: Date.now() - start,
        inputTokens: 0,
        outputTokens: 0,
        rawResponse: error.message,
      });
    }
  }

  return results;
}

// Generate report
function generateReport(results: EvalResult[]): void {
  const total = results.length;
  const severityAcc = results.filter(r => r.severityMatch).length / total;
  const resourceAcc = results.filter(r => r.resourceTypeMatch).length / total;
  const schemaRate = results.filter(r => r.schemaValid).length / total;
  const p95Latency = percentile(results.map(r => r.latencyMs), 95);

  console.table({
    'Model': results[0]?.model,
    'Total Cases': total,
    'Severity Accuracy': `${(severityAcc * 100).toFixed(1)}%`,
    'Resource Type Accuracy': `${(resourceAcc * 100).toFixed(1)}%`,
    'Schema Compliance': `${(schemaRate * 100).toFixed(1)}%`,
    'P95 Latency (ms)': p95Latency,
  });
}
```

---

## 3. Feature Experiments Backlog

This section tracks **ideas and experiments** that haven't been committed to the roadmap yet. Each item needs validation before promotion to a roadmap phase.

### 3.1 Active Experiments

| ID | Experiment | Hypothesis | Validation Method | Status |
|---|---|---|---|---|
| EXP-001 | **Streaming analysis (SSE)** | Streaming the initial analysis (like chat) will reduce perceived wait time | A/B test perceived latency satisfaction score | 🔲 Not started |
| EXP-002 | **Contextual prompt suggestions** | Showing sample prompts (e.g., "Car accident", "Building fire") increases form completion rate | Track form abandonment rate with/without suggestions | 🔲 Not started |
| EXP-003 | **Severity confidence score** | Displaying AI's confidence (e.g., "Critical — 92% confidence") increases user trust | User survey + A/B test on follow-up chat usage | 🔲 Not started |
| EXP-004 | **Offline-first architecture** | Caching last analysis + first-aid guides enables value without network | PWA metrics: offline usage, re-engagement | 🔲 Not started |
| EXP-005 | **Multi-model consensus** | Running 2 models and showing consensus severity increases accuracy | Compare consensus accuracy vs single-model on eval dataset | 🔲 Not started |

### 3.2 Idea Backlog (Unvalidated)

> Ideas captured here are raw and unvalidated. They need hypothesis, validation method, and sizing before becoming experiments.

| ID | Idea | Source | Potential Value |
|---|---|---|---|
| IDEA-001 | **Wearable integration** — Apple Watch / Wear OS companion for fall detection auto-trigger | User research | Automatic emergency reporting without phone interaction |
| IDEA-002 | **Community mode** — Share anonymized incident data to build a real-time incident map | Product brainstorm | Situational awareness for a geographic area |
| IDEA-003 | **Training mode** — Use historical incidents to train first responders | Persona "Dispatch Lead Rivera" | Education and preparedness |
| IDEA-004 | **Voice-first interface** — Entire app operated by voice commands | Accessibility review | Critical for hands-occupied emergency scenarios |
| IDEA-005 | **Predictive resource routing** — Pre-calculate optimal routes based on traffic + distance, not just proximity | Technical spike | Nearest hospital isn't always the fastest to reach |
| IDEA-006 | **SMS fallback** — Submit emergency reports via SMS for low-connectivity areas | Market research (developing regions) | Accessibility in low-bandwidth areas |
| IDEA-007 | **Emergency contact auto-notify** — After analysis, auto-send summary to user's emergency contacts | User interviews | Peace of mind, coordinated response |
| IDEA-008 | **AR overlay** — Camera view with AR annotations showing hazards, safe zones, resource directions | Technical feasibility study | Next-gen UX for on-scene response |

---

## 4. Technical Debt & Platform Evolution

### 4.1 Current Technical Debt

| ID | Debt Item | Impact | Effort | Priority |
|---|---|---|---|---|
| TD-01 | `server.mjs` is a JavaScript file, not TypeScript | No type safety on backend | M | 🟠 High (resolved by TDD migration) |
| TD-02 | Frontend components in root `/components/` instead of `src/client/components/` | Non-standard layout, confuses new contributors | S | 🟡 Medium |
| TD-03 | `types.ts` in root instead of shared types package | Ambiguous ownership (client? server? shared?) | S | 🟡 Medium |
| TD-04 | `geminiService.ts` creates a "fake" chat object mimicking SDK interface | Fragile abstraction, confusing for new developers | M | 🟡 Medium |
| TD-05 | No ESLint/Prettier configuration | Inconsistent code style across contributors | S | 🟠 High |
| TD-06 | `pnpm-lock.yaml` AND `package-lock.json` both exist | Conflicting lock files, non-deterministic installs | XS | 🟡 Medium |
| TD-07 | `ProjectInfo.tsx` is a 200+ line component with hardcoded content | Should be extracted to markdown or CMS | S | 🟢 Low |
| TD-08 | No `.env.example` file | New developers don't know what env vars are needed | XS | 🟠 High |

### 4.2 Platform Evolution Candidates

| ID | Evolution | When to Consider | Effort |
|---|---|---|---|
| PE-01 | **Migrate to monorepo (Turborepo/Nx)** | When frontend and backend need separate CI/CD pipelines or separate deployment | L |
| PE-02 | **Separate frontend and backend deploys** | When scale demands different scaling policies for API vs static assets | L |
| PE-03 | **Add Redis for rate limiting & caching** | When rate limiting needs to work across multiple Cloud Run instances | M |
| PE-04 | **GraphQL API** | If frontend needs flexible data querying (e.g., admin dashboard) | L |
| PE-05 | **Edge deployment (Cloudflare Workers / Vercel Edge)** | When global latency is critical | M |
| PE-06 | **WebSocket for true streaming chat** | When fake streaming (current) causes UX issues | M |
| PE-07 | **OpenTelemetry integration** | When distributed tracing becomes necessary (multi-service) | M |

---

## 5. Research & Exploration

### 5.1 Active Research Topics

| Topic | Question | Owner | Status |
|---|---|---|---|
| **Fine-tuning for triage** | Can we fine-tune a smaller model on emergency triage data to match large-model quality at lower cost? | TBD | 🔲 Not started |
| **Multimodal grounding accuracy** | How accurate is AI-based resource discovery vs direct Places API calls? | TBD | 🔲 Not started |
| **Emergency number database** | Should we maintain our own emergency number → country mapping instead of relying on AI to infer it? | TBD | 🔲 Not started |
| **Response time study** | What is the actual distribution of response times across different model providers? | TBD | 🔲 Not started |
| **Prompt engineering optimization** | Can we improve accuracy by iterating on system instructions? What's the current prompt's ceiling? | TBD | 🔲 Not started |

### 5.2 Competitive Intelligence Tracking

Monitor these products/launches for relevant developments:

| Product / Source | What to Watch | Check Frequency |
|---|---|---|
| Google Gemini API changelog | New models, deprecations, pricing changes, new tools | Weekly |
| OpenAI API changelog | New models, structured output improvements, pricing | Weekly |
| Anthropic Claude updates | Model releases, tool use capabilities | Monthly |
| RapidSOS | Enterprise emergency data platform — potential integration partner or competitor | Quarterly |
| Apple Emergency SOS features | iOS emergency features that could complement or compete | At each iOS release |
| Google Pixel Safety features | Car crash detection, emergency sharing | At each Pixel release |

---

## 6. Evaluation Log

> Record the results of every model evaluation, A/B test, or experiment here. This creates an institutional memory of what was tested and what was learned.

### Template

```markdown
### EVAL-XXX: [Title]

| Field | Value |
|---|---|
| **Date** | YYYY-MM-DD |
| **Evaluator** | @username |
| **Model(s) Tested** | e.g., gemini-2.5-flash vs gpt-4o |
| **Dataset Version** | e.g., v1.0 (47 cases) |
| **Result** | PASS / FAIL / INCONCLUSIVE |

**Summary**: [2-3 sentences on what was tested and the outcome]

**Metrics**:
| Metric | Model A | Model B |
|---|---|---|
| Severity Accuracy | X% | Y% |
| Schema Compliance | X% | Y% |
| P95 Latency | Xms | Yms |
| Cost / 1K requests | $X | $Y |

**Decision**: [What was decided based on these results]
**Action Items**: [Next steps]
```

### Evaluations

*(No evaluations recorded yet. Update this section as evaluations are conducted.)*

---

## 7. Decision Log

> Record significant product and technical decisions here with context, alternatives considered, and rationale. This prevents "why did we do this?" conversations 6 months later.

### Template

```markdown
### DEC-XXX: [Decision Title]

| Field | Value |
|---|---|
| **Date** | YYYY-MM-DD |
| **Decision Maker** | @username |
| **Status** | Proposed / Accepted / Superseded |

**Context**: [What situation prompted this decision?]

**Options Considered**:
1. **Option A**: [Description] — Pros: ... / Cons: ...
2. **Option B**: [Description] — Pros: ... / Cons: ...
3. **Option C**: [Description] — Pros: ... / Cons: ...

**Decision**: [Which option was chosen]
**Rationale**: [Why this option over the others]
**Consequences**: [What are the implications? What are we giving up?]
```

### Decisions

#### DEC-001: Model-Agnostic Architecture

| Field | Value |
|---|---|
| **Date** | 2026-05-30 |
| **Decision Maker** | @KiranH1007 |
| **Status** | Accepted |

**Context**: The initial build hardcoded Google Gemini SDK calls directly in route handlers. As new models release frequently and pricing changes, the product needs flexibility to swap providers.

**Options Considered**:
1. **Keep Gemini hardcoded** — Pros: Simplest, no abstraction overhead / Cons: Vendor lock-in, untestable, model swap = rewrite
2. **Abstract via Adapter Pattern** — Pros: Swap models via config, testable with mocks, clean architecture / Cons: More code upfront, interface design effort
3. **Multi-model runtime (route to best model per request)** — Pros: Maximum flexibility / Cons: Very complex, premature optimization

**Decision**: Option 2 — Adapter Pattern with a factory

**Rationale**: The marginal effort of writing an interface + one adapter is small. The payoff is huge: testability, model swapping, and a clean path to multi-model in the future (Option 3 becomes an incremental addition, not a rewrite).

**Consequences**: Every new AI provider requires writing an adapter (estimated: 2-4 hours per provider). The interface design constrains what provider-specific features we can use (e.g., provider-specific grounding tools may need interface extensions).

---

#### DEC-002: Stateless Chat (No Server-Side Sessions)

| Field | Value |
|---|---|
| **Date** | 2026-05-30 |
| **Decision Maker** | @KiranH1007 |
| **Status** | Accepted |

**Context**: Chat follow-up requires conversation history. The question is whether to store history server-side (sessions/database) or pass it with every request.

**Options Considered**:
1. **Server-side sessions (Redis)** — Pros: Small payloads, server controls history / Cons: Requires Redis, session affinity or shared store, scaling complexity
2. **Client-side history (pass with request)** — Pros: Stateless backend, simple scaling, no session store / Cons: Larger payloads as conversation grows, client can tamper with history
3. **Database-persisted history** — Pros: Survives page refresh, enables analytics / Cons: Requires database, adds latency, premature for current phase

**Decision**: Option 2 — Client-side history

**Rationale**: The product is in early growth. Horizontal scaling with zero infrastructure is the priority. Chat conversations are short-lived (3-5 messages typical). Payload size is manageable. When persistence is needed (Phase 5), we can add database storage without changing the stateless API contract.

**Consequences**: Chat history is lost on page refresh. Payload grows ~1-2 KB per message. Client could theoretically modify history (low risk given the non-adversarial use case).

---

*This document is a living record. Update it as the product evolves, experiments are run, and decisions are made. The goal is institutional memory — no decision should be unrecorded, no evaluation should be unrepeatable.*
