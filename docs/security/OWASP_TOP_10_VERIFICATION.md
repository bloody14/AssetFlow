# OWASP Top 10 Verification (Epic 1 - Phase 1.2)

This document verifies the AssetFlow application's adherence to the OWASP Top 10 (2021) security framework.

## A01:2021-Broken Access Control
**Status: Pass**
- All protected endpoints utilize the centralized RBAC middleware (`requireRole`).
- API requests are strictly authenticated via JWTs validated on each request.
- Default-deny architecture is enforced; all routes (except explicit public ones like `/login` and `/health`) demand authentication.

## A02:2021-Cryptographic Failures
**Status: Pass**
- TLS 1.2+ is mandated at the load balancer level (planned for deployment).
- Sensitive environment variables are managed outside the repository via `.env`.
- Refresh tokens are cryptographically generated (40 bytes random) and stored as SHA-256 hashes in the database.
- *Note*: Argon2 migration for password hashing is formally tracked and scheduled for Epic 3 via ADR-001; currently using `bcrypt` (12 rounds) which is considered secure for pre-production.

## A03:2021-Injection
**Status: Pass**
- AssetFlow uses Prisma ORM exclusively for all database interactions. Raw SQL is strictly prohibited unless explicitly parameterized via `Prisma.sql`.
- Input is heavily validated and sanitized using `Zod` schemas before reaching any controller logic.

## A04:2021-Insecure Design
**Status: Pass**
- Phase 0 established secure defaults, including strict logging protocols and standardized error responses that do not leak stack traces.
- `express-rate-limit` mitigates automated attack flows.

## A05:2021-Security Misconfiguration
**Status: Pass**
- Express `X-Powered-By` header is removed via `Helmet`.
- Global error handler ensures stack traces are never exposed in the `production` environment.
- Strict CORS configuration restricts cross-origin access to the exact `CLIENT_URL`.

## A06:2021-Vulnerable and Outdated Components
**Status: Pass**
- `npm audit --audit-level=high` is integrated directly into the CI pipeline (`ci.yml`).
- Dependabot is configured for weekly package ecosystem updates.

## A07:2021-Identification and Authentication Failures
**Status: Pass**
- Login endpoint is heavily rate-limited (5 requests per 15 minutes) to prevent credential stuffing.
- JWT Access tokens are short-lived (15 minutes).
- Refresh tokens utilize a Token Family versioning system with strict Replay Attack detection and revocation.

## A08:2021-Software and Data Integrity Failures
**Status: Pass**
- CI Pipeline utilizes `npm ci` ensuring deterministic builds based on `package-lock.json`.
- Strict type checking (`tsc --noEmit`) and schema validation guarantee payload structures.

## A09:2021-Security Logging and Monitoring Failures
**Status: Pass**
- AssetFlow uses Winston for structured, JSON-formatted logging.
- `AsyncLocalStorage` correlation IDs track requests entirely through the stack.
- A strict Sensitive Logging Policy is actively enforced.

## A10:2021-Server-Side Request Forgery (SSRF)
**Status: N/A**
- AssetFlow currently does not fetch resources from user-provided URIs. Future external integrations will require strict whitelisting.
