# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities.
2. Email: **[security@rapidresponseai.dev]** (or create a private security advisory on GitHub)
3. Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) feature on this repository.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Action | SLA |
|---|---|
| Acknowledgment of report | 48 hours |
| Initial assessment | 5 business days |
| Critical vulnerability fix | 24 hours |
| High vulnerability fix | 7 days |
| Medium/Low vulnerability fix | 30 days |

### Scope

The following are in scope:
- API endpoints (`/api/analyze`, `/api/chat`, `/api/health`)
- Frontend application
- Docker container configuration
- Dependency vulnerabilities
- Data exposure risks (API keys, PII)

### Out of Scope

- Social engineering attacks
- Denial of service (DoS) attacks
- Issues in third-party services (Google Gemini, Google Maps)

## Security Best Practices for Contributors

1. **Never commit secrets** — Use `.env` files (included in `.gitignore`)
2. **Use `.env.example`** — Template without real values
3. **API keys** — Managed via cloud provider's secret management in production
4. **Dependencies** — Dependabot is enabled; patch critical vulnerabilities within 24 hours
5. **Input validation** — All user input must be validated server-side before processing
6. **Error responses** — Never leak stack traces, file paths, or internal details
