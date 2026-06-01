# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Health check endpoint (`GET /api/health`) — FR-600
- Helmet security headers on backend — PRD Section 15.2
- CORS restricted to known origins (no more wildcard) — PRD Section 15.2
- Manual lat/lng coordinate entry as geolocation fallback — FR-105
- Actual drag-and-drop image upload support — FR-106
- Client-side image type validation (JPEG, PNG, WebP only) — FR-101
- Client-side image size validation (50 MB max) — Edge case
- Safe JSON parsing with malformed AI response handling — FR-208
- `.env.example` template for developer onboarding
- `SECURITY.md` vulnerability disclosure process
- `CHANGELOG.md` (this file)

### Changed
- Error responses no longer leak raw error objects — FR-605
- Image upload `accept` attribute restricted to `image/jpeg,image/png,image/webp`

### Security
- Installed and configured `helmet` for security headers
- CORS no longer allows wildcard origins
- API error responses sanitized (no stack traces or internal details)

## [1.0.0] — 2026-05-30

### Added
- Initial release
- Multimodal emergency triage (text + image + GPS)
- AI-powered structured analysis (severity, summary, actions, resource type)
- 4-tier severity classification (Critical / Severe / Moderate / Minor)
- Geospatial resource discovery via Google Maps grounding
- Country-specific emergency number via chat
- Speech-to-text input (Web Speech API)
- Conversational follow-up chat with streaming responses
- Copy summary to clipboard
- Color-coded severity badges
- Docker containerization for cloud deployment
- CI pipeline (GitHub Actions)
