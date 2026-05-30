# Product Requirements Document (PRD)

# Rapid Response AI

| | |
|---|---|
| **Document Status** | ![Draft](https://img.shields.io/badge/Status-Draft-yellow) |
| **Product Owner** | Kiran Hiremath |
| **Engineering Lead** | TBD |
| **Design Lead** | TBD |
| **Stakeholders** | Engineering, Product, Design, Security, Legal |
| **Created** | 2026-05-30 |
| **Last Updated** | 2026-05-30 |
| **Target Launch** | Q3 2026 |
| **Review Cadence** | Bi-weekly stakeholder sync |

---

## Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-05-30 | @KiranH1007 | Initial draft |

---

## Table of Contents

1. [TL;DR](#1-tldr)
2. [Background & Context](#2-background--context)
3. [Problem Statement](#3-problem-statement)
4. [Goals & Non-Goals](#4-goals--non-goals)
5. [User Personas](#5-user-personas)
6. [User Journeys](#6-user-journeys)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [UX & Design](#9-ux--design)
10. [Edge Cases & Failure Modes](#10-edge-cases--failure-modes)
11. [Success Metrics & KPIs](#11-success-metrics--kpis)
12. [Competitive Landscape](#12-competitive-landscape)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Dependencies & Constraints](#14-dependencies--constraints)
15. [Privacy, Security & Compliance](#15-privacy-security--compliance)
16. [Launch Plan & Milestones](#16-launch-plan--milestones)
17. [Open Questions](#17-open-questions)
18. [Appendix](#18-appendix)

---

## 1. TL;DR

Rapid Response AI is a multimodal emergency triage platform that transforms unstructured emergency information (text descriptions, scene photos, GPS coordinates, voice input) into **structured, actionable intelligence** — severity classification, prioritized response steps, and real-time discovery of nearby emergency resources.

The product targets the critical 5–10 minute window between an incident occurring and professional responders arriving. It serves bystanders, first responders, and dispatchers with AI-powered scene assessment that is model-agnostic, cloud-native, and designed for global deployment.

---

## 2. Background & Context

### 2.1 Market Context

Emergency response is a time-critical domain where information quality directly correlates with outcomes. Studies show that **effective bystander intervention within the first 4 minutes of a cardiac event increases survival rates by 2–3x**. Yet most bystanders lack training, feel overwhelmed, and don't know what actions to take or who to call.

Existing solutions fall into two categories:
- **General emergency apps** (e.g., calling 911) — provide no guidance, no structure, no intelligence
- **Specialized medical apps** (e.g., AED finders, first-aid guides) — narrow scope, no multimodal analysis, no real-time resource discovery

There is a **gap** for a platform that combines multimodal AI analysis with real-time geospatial intelligence across all emergency types.

### 2.2 Product Evolution

Rapid Response AI originated as a hackathon project focused on traffic accidents and hospital discovery. It has since expanded to cover four emergency domains:

| Domain | Examples |
|---|---|
| **Medical** | Accidents, injuries, cardiac events, allergic reactions |
| **Fire** | Structure fires, wildfires, smoke inhalation |
| **Security** | Criminal activity, active threats, suspicious behavior |
| **Multi-service** | Complex incidents requiring coordinated response |

### 2.3 Current State

The product has a **working prototype** deployed on a cloud serverless platform with the following capabilities:
- Text + image + location multimodal input
- AI-powered structured triage (severity, actions, resource type)
- Geospatial resource discovery (hospitals, fire stations, police, ambulance)
- Conversational follow-up for context-aware Q&A
- Speech-to-text for hands-free input

The product is **not yet enterprise-ready**. See [Section 4: Goals](#4-goals--non-goals) for the upgrade path.

---

## 3. Problem Statement

### Primary Problem

> In the critical minutes following an emergency, bystanders and early responders lack a tool that can **rapidly assess the situation**, **guide their immediate actions**, and **connect them to the right resources** — adapted to their location and the specific type of incident.

### Secondary Problems

| Problem | Impact |
|---|---|
| **Bystanders don't know the correct emergency number** | Emergency numbers vary by country (911, 108, 999, 112, 000). Tourists, travelers, and immigrants often don't know the local number. |
| **No structured triage before responders arrive** | First responders arrive without scene assessment. Bystanders relay unstructured, often panicked information. |
| **Resource discovery is manual** | Finding the nearest hospital, fire station, or police station requires separate Google Maps searches under stress. |
| **Incidents are not categorized by severity** | Dispatchers lack pre-arrival severity classification, leading to suboptimal resource allocation. |

---

## 4. Goals & Non-Goals

### 4.1 Goals

| ID | Goal | Why It Matters |
|---|---|---|
| **G1** | Deliver structured emergency triage from multimodal inputs in under 5 seconds | Speed saves lives. Sub-5s response enables real-time decision-making. |
| **G2** | Accurately classify incident severity into 4 tiers (Critical / Severe / Moderate / Minor) | Enables dispatchers and responders to prioritize resources proportionally. |
| **G3** | Automatically surface the correct emergency number and nearest relevant resources based on GPS | Eliminates friction for travelers, tourists, and anyone in an unfamiliar area. |
| **G4** | Provide ordered, actionable response steps tailored to the specific incident | Empowers untrained bystanders to take effective action. |
| **G5** | Enable conversational follow-up for ongoing situational guidance | Emergencies are dynamic — users need to ask "what do I do next?" |
| **G6** | Achieve enterprise-grade production readiness (security, observability, testing, CI/CD) | Required for real-world deployment, regulatory compliance, and stakeholder trust. |
| **G7** | Maintain AI model agnosticism — the product must function with any capable multimodal AI provider | Prevents vendor lock-in. Enables cost optimization and model upgrades without product regression. |

### 4.2 Non-Goals (Explicit Exclusions)

| ID | Non-Goal | Rationale |
|---|---|---|
| **NG1** | Replace 911/emergency dispatch systems | We augment human dispatchers, not replace them. |
| **NG2** | Provide medical diagnosis | We provide first-response triage, not clinical diagnosis. Legal and ethical liability. |
| **NG3** | Native mobile apps (iOS/Android) | Web-first approach. PWA may be considered in a future phase. |
| **NG4** | User accounts, authentication, or login | The product must be zero-friction. No signup required. |
| **NG5** | Offline functionality | Requires network for AI inference and resource discovery. |
| **NG6** | Real-time video stream analysis | Out of scope for v2. Image analysis is sufficient for MVP+. |
| **NG7** | Integration with third-party CAD/dispatch systems | Enterprise B2B integration is a future product line. |
| **NG8** | Multi-language UI localization | English-only for v2. Internationalization is a future phase. |

---

## 5. User Personas

### 5.1 "Aanya" — The Panicked Bystander (Primary)

| Attribute | Detail |
|---|---|
| **Demographics** | 28-year-old marketing professional, moderate tech literacy |
| **Scenario** | Witnesses a motorcycle accident on her commute |
| **Emotional State** | Panicked, adrenaline-high, shaky hands |
| **Needs** | Someone to tell her exactly what to do, in order, right now |
| **Pain Points** | Doesn't know first aid, can't remember the emergency number (recently moved countries), doesn't know which hospital is closest |
| **Key Feature** | Voice input (hands shaking too much to type), prioritized action list, one-tap map navigation |
| **Success Criteria** | Aanya provides a voice description + photo → gets structured steps + nearest hospital link in < 5 seconds |

### 5.2 "Marcus" — The Off-Duty First Responder (Secondary)

| Attribute | Detail |
|---|---|
| **Demographics** | 35-year-old off-duty EMT, high tech literacy |
| **Scenario** | Encounters a building fire while off-duty in an unfamiliar city |
| **Emotional State** | Calm but urgently needs intel |
| **Needs** | Rapid scene assessment before engaging, nearest fire station location |
| **Pain Points** | Off-duty, no radio, no dispatch support, unfamiliar area |
| **Key Feature** | Severity classification, resource type routing (fire → fire stations), follow-up chat for tactical questions |
| **Success Criteria** | Marcus gets a structured severity assessment and nearest fire station with navigation in one interaction |

### 5.3 "Dispatch Lead Rivera" — The Emergency Coordinator (Tertiary)

| Attribute | Detail |
|---|---|
| **Demographics** | 42-year-old 911 dispatch supervisor |
| **Scenario** | Evaluating tools that could improve pre-arrival intelligence |
| **Emotional State** | Analytical, needs data not opinions |
| **Needs** | Structured, copy-pasteable incident data that can be relayed to field units |
| **Pain Points** | Callers provide unstructured, panicked descriptions. Dispatchers waste time extracting key facts. |
| **Key Feature** | Structured JSON/text output, severity badge, copy-to-clipboard summary |
| **Success Criteria** | AI-generated triage summary is structured enough to be directly relayed to responding units |

---

## 6. User Journeys

### 6.1 Primary Journey: Emergency Triage (Bystander)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐    │
│  │ TRIGGER  │───▶│  INPUT   │───▶│ ANALYSIS │───▶│   RESULTS    │    │
│  │          │    │          │    │          │    │              │    │
│  │ Incident │    │ Describe │    │ AI proc- │    │ • Severity   │    │
│  │ occurs   │    │ + Photo  │    │ essing   │    │ • Actions    │    │
│  │          │    │ + GPS    │    │ (< 5s)   │    │ • Resources  │    │
│  └─────────┘    └──────────┘    └──────────┘    └──────┬───────┘    │
│                                                         │            │
│                                                         ▼            │
│                                                  ┌──────────────┐    │
│                                                  │  FOLLOW-UP   │    │
│                                                  │              │    │
│                                                  │ "What do I   │    │
│                                                  │  do next?"   │    │
│                                                  └──────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Step-by-step:**

1. **Trigger**: User witnesses or is involved in an emergency
2. **Open App**: User navigates to Rapid Response AI (bookmarked or searched)
3. **Describe Incident**: User types or **dictates** (voice-to-text) a description of the situation
4. **Attach Photo** (optional): User takes a photo of the scene for visual context
5. **Share Location**: User grants GPS permission for geospatial intelligence
6. **Submit**: User taps "Analyze Situation"
7. **Processing**: AI analyzes all inputs (text + image + location) — target < 5 seconds
8. **Results Displayed**:
   - Severity badge (color-coded: 🔴 Critical, 🟠 Severe, 🟡 Moderate, 🟢 Minor)
   - Prioritized action list (3–5 ordered steps)
   - Nearby resources with one-tap Google Maps navigation
   - Country-specific emergency number
9. **Follow-Up**: User can ask contextual questions via chat ("Should I move the victim?", "How do I stop the bleeding?")
10. **Share**: User can copy the summary to share via SMS/WhatsApp to others on scene

### 6.2 Secondary Journey: Repeat Use / Resource Discovery

User has used the app before. They skip the description and primarily use it for **nearest resource discovery** — "Find me the nearest hospital" — leveraging the chat interface and geolocation.

---

## 7. Functional Requirements

Requirements are prioritized using the Google-standard **P0 / P1 / P2** system:

| Priority | Meaning | SLA |
|---|---|---|
| **P0** | Launch blocker. Product cannot ship without this. | Must be complete before launch. |
| **P1** | Important. Significant user value, but launch is possible without it. | Should ship within 1 sprint of launch. |
| **P2** | Nice-to-have. Enhances experience but low urgency. | Planned for future sprints. |

### 7.1 Input & Data Capture

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-100 | The system SHALL accept a free-text description of the emergency (min 10 characters, max 5,000 characters) | P0 | ✅ Shipped |
| FR-101 | The system SHALL accept an optional image upload (JPEG, PNG, WebP; max 10 MB displayed / 50 MB accepted) | P0 | ✅ Shipped |
| FR-102 | The system SHALL request and capture the user's GPS coordinates via the browser Geolocation API | P0 | ✅ Shipped |
| FR-103 | The system SHALL provide speech-to-text input using the Web Speech API for hands-free description entry | P0 | ✅ Shipped |
| FR-104 | The system SHALL validate that both description and location are provided before submission | P0 | ✅ Shipped |
| FR-105 | The system SHALL display a clear error state if geolocation permission is denied, with manual coordinate entry as fallback | P1 | 🔲 Planned |
| FR-106 | The system SHALL support drag-and-drop image upload in addition to file picker | P2 | 🔲 Planned |

### 7.2 AI-Powered Triage & Analysis

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-200 | The system SHALL send the user's text, image, and location to a multimodal AI model for structured analysis | P0 | ✅ Shipped |
| FR-201 | The AI model integration SHALL be abstracted behind a service interface, allowing the underlying model to be swapped without changes to the rest of the system | P0 | 🔲 Planned |
| FR-202 | The system SHALL return a structured response containing: severity level, summary, prioritized action list, and recommended resource type | P0 | ✅ Shipped |
| FR-203 | Severity SHALL be classified into exactly 4 tiers: `Critical`, `Severe`, `Moderate`, `Minor` | P0 | ✅ Shipped |
| FR-204 | The action list SHALL contain 3–5 prioritized steps ordered by urgency | P0 | ✅ Shipped |
| FR-205 | The resource type SHALL be one of: `Hospital`, `Fire_Rescue`, `Police`, `Ambulance` | P0 | ✅ Shipped |
| FR-206 | The system SHALL enforce structured output (JSON schema) from the AI model to ensure deterministic parsing | P0 | ✅ Shipped |
| FR-207 | The system SHALL complete the full analysis pipeline (input → AI → resource discovery → response) in < 5 seconds (P95) | P0 | ⚠️ Not measured |
| FR-208 | If the AI model fails or times out, the system SHALL return a graceful error with a retry option — never a blank screen or stack trace | P0 | ⚠️ Partial |
| FR-209 | The system SHALL log all AI model calls with request/response metadata for debugging and audit purposes | P1 | 🔲 Planned |

### 7.3 Geospatial Resource Discovery

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-300 | The system SHALL discover nearby emergency resources relevant to the incident type (e.g., fire → fire stations) using a geospatial data provider | P0 | ✅ Shipped |
| FR-301 | Each discovered resource SHALL include: facility name and a navigation link (deep link to maps application) | P0 | ✅ Shipped |
| FR-302 | The system SHALL provide the correct country-specific emergency phone number based on the user's GPS coordinates | P0 | ✅ Shipped |
| FR-303 | If geospatial resource discovery fails, the analysis SHALL still return successfully with an empty resources array and a user-facing notice | P1 | ✅ Shipped |
| FR-304 | The system SHALL support resource discovery fallback to a secondary provider if the primary provider is unavailable | P2 | 🔲 Planned |

### 7.4 Conversational Follow-Up

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-400 | After initial analysis, the system SHALL provide a chat interface for contextual follow-up questions | P0 | ✅ Shipped |
| FR-401 | The chat SHALL maintain conversation context from the initial analysis (incident details, location, severity) | P0 | ✅ Shipped |
| FR-402 | Chat responses SHALL be conversational natural language (not structured JSON) | P0 | ✅ Shipped |
| FR-403 | The chat SHALL support streaming responses for real-time feedback | P1 | ✅ Shipped |
| FR-404 | The chat SHALL be location-aware and provide country-specific emergency guidance | P0 | ✅ Shipped |
| FR-405 | Chat errors SHALL display a user-friendly message and allow retry without losing conversation history | P1 | ✅ Shipped |

### 7.5 Results Display & Sharing

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-500 | Severity SHALL be displayed as a color-coded badge: 🔴 Critical, 🟠 Severe, 🟡 Moderate, 🟢 Minor | P0 | ✅ Shipped |
| FR-501 | Action items SHALL be displayed as a numbered, ordered list | P0 | ✅ Shipped |
| FR-502 | Nearby resources SHALL be displayed as a list with clickable navigation links | P0 | ✅ Shipped |
| FR-503 | The user SHALL be able to copy the full analysis summary to clipboard with one click | P0 | ✅ Shipped |
| FR-504 | The user SHALL be able to reset and submit a new analysis | P0 | ✅ Shipped |
| FR-505 | The system SHALL display a loading state with descriptive text during AI processing | P0 | ✅ Shipped |
| FR-506 | The system SHALL support sharing analysis via native Web Share API (mobile) | P2 | 🔲 Planned |

### 7.6 Enterprise & Platform (New for v2)

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-600 | The system SHALL expose a health check endpoint that returns system status, version, and dependency health | P0 | 🔲 Planned |
| FR-601 | All API endpoints SHALL validate incoming request payloads against a defined schema and reject malformed requests with a 400 status and descriptive error | P0 | 🔲 Planned |
| FR-602 | The system SHALL implement rate limiting to prevent abuse (configurable, default: 30 requests/minute/IP) | P1 | 🔲 Planned |
| FR-603 | The system SHALL generate structured (JSON) logs for all requests including: timestamp, correlation ID, endpoint, status code, latency, and error details | P0 | 🔲 Planned |
| FR-604 | Every request SHALL be assigned a unique correlation ID that is propagated through all downstream calls and returned in the response headers | P1 | 🔲 Planned |
| FR-605 | The system SHALL implement a global error handler that catches unhandled exceptions, logs them, and returns sanitized error responses (no stack traces, no internal details) | P0 | 🔲 Planned |
| FR-606 | The system SHALL pass a CI pipeline including: lint → type-check → unit tests → integration tests → build | P0 | 🔲 Planned |
| FR-607 | The system SHALL maintain ≥ 80% code coverage across unit and integration tests | P1 | 🔲 Planned |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric | Target | Measurement Method |
|---|---|---|
| End-to-end analysis latency | P50 < 3s, P95 < 5s, P99 < 8s | Server-side instrumentation |
| Chat follow-up latency | P50 < 1.5s, P95 < 3s | Server-side instrumentation |
| Time to Interactive (frontend) | < 2s on 4G connection | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Image upload processing | < 500ms client-side base64 encoding | Browser performance API |

### 8.2 Scalability

| Dimension | Target |
|---|---|
| Concurrent users | 1,000+ (via cloud auto-scaling) |
| Horizontal scaling | Stateless architecture enables unlimited horizontal scaling |
| Image payload size | Up to 50 MB per request |
| Chat history depth | Up to 50 messages per session |

### 8.3 Reliability & Availability

| Metric | Target |
|---|---|
| Uptime SLA | 99.9% (43.8 min downtime/month max) |
| AI model failover | Graceful degradation with retry + user notification |
| Geospatial provider failover | Analysis completes successfully even if resource discovery fails |
| Zero data loss | No user-submitted data is silently dropped |

### 8.4 Browser Compatibility

| Browser | Minimum Version |
|---|---|
| Chrome / Edge | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Mobile Chrome (Android) | 90+ |
| Mobile Safari (iOS) | 15+ |

### 8.5 Accessibility

| Requirement | Standard |
|---|---|
| Keyboard navigation | All interactive elements reachable via Tab |
| Screen reader support | ARIA labels on all interactive elements |
| Color contrast | WCAG 2.1 AA minimum (4.5:1 for text) |
| Voice input | Web Speech API for text entry |
| Responsive design | Fully functional on 320px–2560px viewports |

---

## 9. UX & Design

### 9.1 Design Principles

| Principle | What It Means |
|---|---|
| **Speed over polish** | In an emergency, every second counts. Prioritize fast interaction over beautiful animations. |
| **Clarity over density** | Users are stressed. Use large text, clear hierarchy, and unambiguous labels. |
| **Action-oriented** | Every screen should answer: "What should I do RIGHT NOW?" |
| **One-hand operable** | Users may be holding a phone in one hand and helping someone with the other. |
| **Progressive disclosure** | Show the most critical info first (severity + first action). Details on scroll/tap. |

### 9.2 Information Hierarchy (Results Screen)

```
1. ████ SEVERITY BADGE ████          ← Largest, color-coded, unmissable
2. Summary (2-3 sentences)           ← What happened, in plain language
3. ⚡ PRIORITY ACTIONS               ← Numbered, ordered, actionable
   1. [Most urgent action]
   2. [Second action]
   3. [Third action]
4. 📍 Nearby Resources               ← Clickable map links
   • Hospital A → [Navigate]
   • Hospital B → [Navigate]
5. 💬 Follow-Up Chat                 ← "Ask me anything about this situation"
6. [Copy Summary] [New Analysis]     ← Secondary actions
```

### 9.3 States & Transitions

| State | Description |
|---|---|
| **Empty** | Form with 3-step input guide (Describe → Photo → Location) |
| **Loading** | Spinner + "AI Analyzing Scene..." + descriptive subtext |
| **Results** | Severity badge + actions + resources + chat |
| **Error** | Error message + "Try Again" button |
| **Chat Active** | Appended below results, streaming response indicator |

---

## 10. Edge Cases & Failure Modes

| Scenario | Expected Behavior |
|---|---|
| User submits empty description | Frontend validation prevents submission. Error: "Please describe the emergency." |
| User denies geolocation permission | Display error with instructions. Offer manual lat/lng entry fallback. |
| AI model returns malformed JSON | Backend catches parse error. Returns 500 with "Analysis failed, please try again." Log the raw response for debugging. |
| AI model is down / unreachable | Timeout after 15s. Return error with retry button. If repeat failure, display static emergency number lookup as fallback. |
| Geospatial resource discovery fails | Analysis still returns with empty `nearbyResources` array. UI shows "Resource discovery unavailable" notice. |
| User uploads non-image file | Frontend validates file type. Rejects with "Please upload a JPEG, PNG, or WebP image." |
| User uploads extremely large image (>50 MB) | Backend rejects with 413 Payload Too Large. Frontend shows size error. |
| User sends chat message while previous is still loading | Button disabled during loading. Prevents duplicate requests. |
| Rate limit exceeded | Return 429 Too Many Requests with "Retry-After" header. UI shows "Too many requests, please wait." |
| User submits potentially harmful/adversarial prompt | AI system instruction constrains output to emergency triage only. Input sanitization prevents injection. |
| Multiple simultaneous users in same location | Stateless architecture handles independently. No cross-contamination. |
| User is in a country without structured emergency numbers | AI provides best-effort guidance. Chat can clarify. |
| Browser does not support Web Speech API | Voice input button is hidden. Text input remains available. |

---

## 11. Success Metrics & KPIs

### 11.1 North Star Metric

> **Structured triage completion rate**: % of users who submit an emergency report and receive a complete, structured analysis (severity + actions + resources).

**Target**: ≥ 95%

### 11.2 Key Performance Indicators

| Category | KPI | Target | How Measured |
|---|---|---|---|
| **Reliability** | Analysis success rate | ≥ 98% | `(successful_analyses / total_attempts) × 100` |
| **Performance** | P95 end-to-end latency | < 5 seconds | Server-side instrumentation |
| **Quality** | Severity classification accuracy | ≥ 90% on labeled test set | Quarterly evaluation against expert-labeled dataset |
| **Engagement** | Follow-up chat usage rate | ≥ 30% of completed analyses | `(sessions_with_chat / total_analyses) × 100` |
| **Utility** | Resource navigation click-through | ≥ 50% of analyses with resources | Frontend click tracking |
| **Reliability** | Uptime | ≥ 99.9% | Cloud monitoring |
| **Security** | Critical vulnerability count | 0 | Dependabot + manual audit |
| **Engineering** | CI pipeline pass rate | ≥ 95% | GitHub Actions metrics |
| **Engineering** | Code coverage | ≥ 80% | Test runner coverage reports |
| **User Satisfaction** | Copy/share action rate | ≥ 20% of completed analyses | Frontend click tracking |

### 11.3 Counter-Metrics (Guardrails)

Metrics we monitor to ensure we're not optimizing primary KPIs at the expense of quality:

| Counter-Metric | Threshold | What It Guards Against |
|---|---|---|
| False "Critical" severity rate | < 5% | Over-classifying to appear useful |
| AI hallucination rate (wrong resources / numbers) | < 2% | Providing dangerous misinformation |
| Error rate (5xx responses) | < 2% | Shipping fast but breaking things |

---

## 12. Competitive Landscape

| Product | Multimodal | Severity Triage | Resource Discovery | Conversational | Model-Agnostic |
|---|---|---|---|---|---|
| **Rapid Response AI** | ✅ Text + Image + Voice + GPS | ✅ 4-tier | ✅ Auto via maps | ✅ Chat | ✅ (Goal) |
| **911/Emergency Call** | ❌ Voice only | ❌ Human judgment | ❌ Manual | ❌ | N/A |
| **First Aid Apps** (Red Cross) | ❌ Text guides | ❌ | ❌ | ❌ | N/A |
| **Google Maps** | ❌ | ❌ | ✅ Search-based | ❌ | N/A |
| **Pulse Point** | ❌ | ❌ | ✅ AED only | ❌ | N/A |
| **General AI Chatbots** (ChatGPT, etc.) | ✅ | ❌ No structured output | ❌ | ✅ | ❌ Vendor-locked |

**Our differentiator**: The only product combining multimodal input → structured AI triage → geospatial resource discovery → conversational follow-up in a single, purpose-built emergency workflow.

---

## 13. Risks & Mitigations

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **AI provides incorrect severity or dangerous advice** | Medium | 🔴 Critical | System instruction constrains to triage-only. Disclaimers in UI. Actions framed as guidance, not commands. Regular accuracy audits. |
| R2 | **AI model provider has outage or deprecates model** | Medium | 🟠 High | FR-201: Model-agnostic service interface. Ability to swap models without product changes. |
| R3 | **Exposed API credentials in source code** | Occurred | 🔴 Critical | Immediate key rotation. Remove `.env` from Git history. Enforce secret management via cloud provider. |
| R4 | **User relies solely on app instead of calling emergency services** | Medium | 🔴 Critical | Prominent disclaimer: "This tool supplements, not replaces, emergency services." Always surface the correct emergency number prominently. |
| R5 | **Adversarial prompt injection** | Low | 🟠 High | Input sanitization. System instruction constrains output domain. Output validation before display. |
| R6 | **High latency degrades user experience in emergencies** | Medium | 🟠 High | Performance budgets (P95 < 5s). Streaming responses for chat. Loading states with descriptive text. |
| R7 | **Legal liability for AI-generated emergency advice** | Medium | 🟠 High | Terms of service + disclaimer. Advice framed as informational, not directive. Legal review before public launch. |
| R8 | **Geolocation not available (browser denied, indoor, etc.)** | Medium | 🟡 Medium | Manual coordinate entry fallback. Analysis works without resources (graceful degradation). |
| R9 | **Vendor lock-in to specific cloud provider** | Low | 🟡 Medium | Containerized (Docker). Standard Node.js. No proprietary cloud APIs in application code. |

---

## 14. Dependencies & Constraints

### 14.1 External Dependencies

| Dependency | Type | Risk Level | Fallback |
|---|---|---|---|
| **Multimodal AI model provider** | AI inference | 🟠 High | Model-agnostic interface (FR-201) enables provider swap |
| **Maps / geospatial data provider** | Resource discovery | 🟡 Medium | Analysis completes without resources; manual search fallback |
| **Browser Geolocation API** | User location | 🟡 Medium | Manual coordinate entry |
| **Web Speech API** | Voice input | 🟢 Low | Text input always available |
| **Cloud serverless platform** | Hosting | 🟡 Medium | Docker container runs on any cloud / on-prem |

### 14.2 Constraints

| Constraint | Impact |
|---|---|
| **No user authentication** | Cannot personalize, cannot persist across sessions, cannot build user history |
| **Stateless architecture** | No incident history, no analytics on past events, no audit trail (until database is added) |
| **Browser-only** | Dependent on browser APIs (Geolocation, Speech). No native capabilities. |
| **English-only** | Limits global adoption. AI model may still respond in other languages if prompted. |
| **No HIPAA/healthcare compliance** | Cannot be marketed to healthcare providers or insurers without compliance work |

---

## 15. Privacy, Security & Compliance

### 15.1 Data Handling

| Data Type | Collected? | Stored? | Retention |
|---|---|---|---|
| Text description | ✅ Processed | ❌ Not persisted (currently) | Session only |
| Uploaded images | ✅ Processed (base64) | ❌ Not persisted | Session only |
| GPS coordinates | ✅ Processed | ❌ Not persisted | Session only |
| Voice audio | ❌ Processed client-side only (Web Speech API) | ❌ | N/A |
| Chat messages | ✅ Processed | ❌ In-memory session only | Session only |
| IP addresses | ✅ For rate limiting | ❌ Not logged (currently) | N/A |

### 15.2 Security Requirements

| Requirement | Priority |
|---|---|
| API keys SHALL never be included in client-side bundles | P0 |
| API keys SHALL be managed via the cloud provider's secret management service | P0 |
| All API endpoints SHALL validate and sanitize input payloads | P0 |
| All client-server communication SHALL use HTTPS | P0 |
| CORS SHALL be restricted to known origins (not wildcard) | P0 |
| Error responses SHALL NOT leak internal implementation details, stack traces, or file paths | P0 |
| Rate limiting SHALL be enforced to prevent abuse and cost overrun | P1 |
| Security response headers SHALL be set (via Helmet or equivalent) | P1 |
| Dependency vulnerabilities SHALL be monitored and patched within SLA (Critical: 24h, High: 7d) | P1 |

### 15.3 Compliance Considerations

| Framework | Applicability | Status |
|---|---|---|
| **GDPR** | If serving EU users — GPS data is PII | ⚠️ Needs review if EU deployment planned |
| **HIPAA** | Not applicable unless marketed to healthcare | ❌ Out of scope |
| **SOC 2** | If B2B/enterprise sales are planned | ❌ Out of scope for v2 |
| **AI Act (EU)** | Emergency triage may be classified as high-risk AI | ⚠️ Needs legal review |

---

## 16. Launch Plan & Milestones

### 16.1 Phased Rollout

| Phase | Name | Duration | Exit Criteria |
|---|---|---|---|
| **Phase 0** | 🔴 Security Hotfix | 1 week | Exposed keys rotated, `.env` removed from history, secrets in cloud manager |
| **Phase 1** | Foundation Hardening | 3 weeks | Input validation, global error handler, structured logging, model abstraction layer |
| **Phase 2** | Test & Observe | 3 weeks | ≥ 80% code coverage, health checks, CI pipeline with lint + test + build |
| **Phase 3** | Repo Polish | 2 weeks | SECURITY.md, CHANGELOG.md, API docs, ADRs, `.env.example` |
| **Phase 4** | Production Launch | 1 week | Load testing, security audit, monitoring dashboards, launch checklist complete |
| **Phase 5** | Data Layer (Future) | TBD | Database provisioned, incident persistence, audit logging, analytics dashboard |

### 16.2 Launch Checklist

- [ ] All P0 functional requirements shipped and verified
- [ ] All P0 security requirements met
- [ ] CI pipeline green: lint → type-check → unit test → integration test → build
- [ ] ≥ 80% code coverage
- [ ] Health check endpoint operational and integrated with cloud monitoring
- [ ] Structured logging operational and visible in cloud logging console
- [ ] Rate limiting configured and tested
- [ ] No critical or high Dependabot alerts open
- [ ] Load test completed (100 concurrent users sustained for 10 minutes)
- [ ] Legal disclaimer reviewed and displayed in product
- [ ] SECURITY.md published with vulnerability disclosure process
- [ ] API documentation published (OpenAPI / Swagger)
- [ ] Runbook created for on-call incident response

---

## 17. Open Questions

> These questions require stakeholder input before the relevant features can be finalized.

| ID | Question | Owner | Impact | Status |
|---|---|---|---|---|
| OQ-1 | **Should we persist incident data?** If yes, what is the data retention policy? What are the privacy implications of storing GPS + images + descriptions? | Product + Legal | Affects Phase 5 scope, database design, privacy policy | 🔲 Open |
| OQ-2 | **What is the disclaimer / liability language?** The product provides AI-generated emergency guidance. Legal needs to review the liability framework. | Legal | Launch blocker | 🔲 Open |
| OQ-3 | **Should the product display ads or be monetized?** This affects UX design and user trust in an emergency context. | Product + Business | UX, revenue model | 🔲 Open |
| OQ-4 | **What is the target geography for launch?** This impacts compliance (GDPR, AI Act), emergency number coverage, and language support. | Product | Compliance, localization | 🔲 Open |
| OQ-5 | **Should we support multi-image upload?** Some incidents benefit from multiple angles. What is the UX tradeoff? | Design + Product | FR-101, UX complexity | 🔲 Open |
| OQ-6 | **What is the SLA for AI model provider failover?** If the primary model is down, how quickly must we switch to a backup? Is a backup model required for launch? | Engineering | Architecture, cost | 🔲 Open |
| OQ-7 | **Should the product work as a PWA for offline access to cached results?** | Product + Engineering | NG5 reconsideration | 🔲 Open |
| OQ-8 | **Do we need an admin panel for v2?** For monitoring, analytics, model performance review. | Product | Phase 5 scope | 🔲 Open |

---

## 18. Appendix

### A. Glossary

| Term | Definition |
|---|---|
| **Triage** | The process of determining the priority of patients' treatments based on the severity of their condition |
| **Multimodal** | AI that can process multiple input types (text, image, audio, location) simultaneously |
| **Structured Output** | AI response constrained to a predefined schema (e.g., JSON) for deterministic parsing |
| **Grounding** | Connecting AI responses to real-world data sources (e.g., maps, databases) |
| **Resource Discovery** | Automated identification of nearby emergency facilities based on incident type and location |
| **Severity Tier** | One of four classification levels: Critical, Severe, Moderate, Minor |
| **Correlation ID** | A unique identifier assigned to each request that is propagated through all downstream calls for tracing |
| **Model-Agnostic** | Architecture designed so the underlying AI model can be replaced without changes to the product layer |

### B. Related Documents

| Document | Purpose | Location |
|---|---|---|
| Technical Design Document (TDD) | Engineering implementation details, architecture, data model, API specs | `docs/TDD.md` (to be created) |
| README.md | Developer onboarding, setup, and run instructions | Root |
| CONTRIBUTING.md | Branch, commit, and PR standards | Root |
| SECURITY.md | Vulnerability disclosure process | Root (to be created) |
| Architecture Decision Records | Key technical decisions and rationale | `docs/adr/` (to be created) |
| API Specification | OpenAPI/Swagger endpoint documentation | `docs/api/` (to be created) |

### C. Revision Notes

This PRD is a **living document**. It should be updated as:
- Open questions are resolved
- Requirements change based on user feedback
- New phases are planned
- Competitive landscape evolves

All changes must be reflected in the [Document History](#document-history) table at the top.

---

*This document follows the standard enterprise PRD format used at top-tier technology companies. It is intentionally product-centric and implementation-agnostic. Technical implementation details belong in the [Technical Design Document](./TDD.md).*
