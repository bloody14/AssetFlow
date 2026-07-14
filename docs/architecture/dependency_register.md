# Dependency Register

This document provides an exhaustive governance audit of the primary backend dependencies utilized by AssetFlow, evaluating their strategic viability for an enterprise production environment.

---

## 1. Core Framework Dependencies

### DEP-001: Express (v5.x)
- **Package Necessity**: Core foundational HTTP web framework.
- **Current Usage**: Global (App initialization, all controllers).
- **Runtime Category**: Runtime
- **Security Monitoring**: Dependabot, npm audit, GitHub Advisories
- **Upgrade Strategy**: Manual Major
- **Version Policy**: Compatible (`^`)
- **Breaking Change Risk**: Very High (Replacing Express requires rewriting the Presentation layer)
- **Performance Impact**: Latency (Minimal), Memory (Low)
- **License Compatibility**: Approved (MIT)
- **Next Review Date**: Beginning of Epic 3

### DEP-002: Prisma (v7.8) & @prisma/client
- **Package Necessity**: Core Object-Relational Mapper (ORM). Enforces type safety between DB and TS.
- **Current Usage**: Global (All repository modules).
- **Runtime Category**: Runtime & Infrastructure
- **Security Monitoring**: Dependabot, GitHub Advisories
- **Upgrade Strategy**: Manual Major
- **Version Policy**: Pinned (Strictly tied to schema migrations)
- **Breaking Change Risk**: Very High
- **Performance Impact**: CPU (High during generation), Startup (Medium connection pool overhead)
- **License Compatibility**: Approved (Apache 2.0)
- **Next Review Date**: Beginning of Epic 3

### DEP-003: Zod (v4.x)
- **Package Necessity**: Schema declaration and runtime validation.
- **Current Usage**: Global (All module DTOs).
- **Runtime Category**: Runtime
- **Security Monitoring**: Dependabot, npm audit
- **Upgrade Strategy**: Automatic Minor
- **Version Policy**: Compatible (`^`)
- **Breaking Change Risk**: High
- **Performance Impact**: CPU (Medium during large payload validation)
- **License Compatibility**: Approved (MIT)
- **Next Review Date**: Beginning of Epic 3

## 2. Security & Authentication Dependencies

### DEP-004: jsonwebtoken (v9.x)
- **Package Necessity**: Generates stateless authentication signatures.
- **Current Usage**: Auth Module, Auth Middleware.
- **Runtime Category**: Runtime
- **Security Monitoring**: Dependabot, npm audit, GitHub Advisories
- **Upgrade Strategy**: LTS Preferred
- **Version Policy**: Compatible (`^`)
- **Breaking Change Risk**: Low
- **Performance Impact**: CPU (Medium during signing/verification)
- **License Compatibility**: Approved (MIT)
- **Next Review Date**: Beginning of Epic 1

### DEP-005: bcrypt (v6.x)
- **Package Necessity**: Cryptographic hashing of user passwords.
- **Current Usage**: Auth Service.
- **Runtime Category**: Runtime
- **Security Monitoring**: Dependabot, npm audit
- **Upgrade Strategy**: LTS Preferred
- **Version Policy**: Compatible (`^`)
- **Breaking Change Risk**: Low
- **Performance Impact**: CPU (High during login)
- **License Compatibility**: Approved (MIT)
- **Next Review Date**: Beginning of Epic 1

### DEP-006: helmet (v8.x)
- **Package Necessity**: Automates injection of HTTP security headers.
- **Current Usage**: Global Middleware.
- **Runtime Category**: Runtime
- **Security Monitoring**: Dependabot
- **Upgrade Strategy**: Automatic Minor
- **Version Policy**: Compatible (`^`)
- **Breaking Change Risk**: Low
- **Performance Impact**: Latency (Negligible)
- **License Compatibility**: Approved (MIT)
- **Next Review Date**: Beginning of Epic 1

### DEP-007: express-rate-limit (v8.x)
- **Package Necessity**: Defends against brute force and DoS attacks.
- **Current Usage**: Auth Route, Global Middleware.
- **Runtime Category**: Runtime
- **Security Monitoring**: Dependabot, npm audit
- **Upgrade Strategy**: Automatic Minor
- **Version Policy**: Compatible (`^`)
- **Breaking Change Risk**: Medium
- **Performance Impact**: Latency (Medium due to state lookup)
- **License Compatibility**: Approved (MIT)
- **Next Review Date**: Beginning of Epic 1

## 3. Observability Dependencies

### DEP-008: winston (v3.x)
- **Package Necessity**: Structured JSON logging and transport management.
- **Current Usage**: Global (Logging Middleware).
- **Runtime Category**: Runtime
- **Security Monitoring**: Dependabot
- **Upgrade Strategy**: Automatic Minor
- **Version Policy**: Compatible (`^`)
- **Breaking Change Risk**: Medium
- **Performance Impact**: Memory (Medium during heavy throughput)
- **License Compatibility**: Approved (MIT)
- **Next Review Date**: Beginning of Epic 0

## 4. Planned Future Dependencies (Architectural Planning Only)

### Testing
- **DEP-009: Vitest** (Runtime: Testing | Impact: High dev velocity | Risk: Low | Upgrade: Automatic Minor)
- **DEP-010: Playwright** (Runtime: Testing | Impact: E2E coverage | Risk: Medium | Upgrade: Manual Major)

### Documentation
- **DEP-011: OpenAPI / Swagger Tooling** (Runtime: Development | Impact: API spec gen | Risk: Medium | Upgrade: Automatic Minor)

### Monitoring
- **DEP-012: OpenTelemetry** (Runtime: Infrastructure | Impact: Tracing | Risk: High | Upgrade: LTS Preferred)
- **DEP-013: Prometheus Client** (Runtime: Infrastructure | Impact: Metrics | Risk: Low | Upgrade: Automatic Minor)

### Storage
- **DEP-014: AWS SDK v3** (Runtime: Runtime | Impact: S3 persistence | Risk: High | Upgrade: LTS Preferred)
- **DEP-015: MinIO Client** (Runtime: Runtime | Impact: Local object storage | Risk: Low | Upgrade: Automatic Minor)

### Email & Communication
- **DEP-016: Nodemailer** (Runtime: Runtime | Impact: SMTP transmission | Risk: Medium | Upgrade: LTS Preferred)
- **DEP-017: Email Provider Abstraction** (Runtime: Runtime | Impact: Provider decoupling | Risk: Medium)

### QR Platform
- **DEP-018: QR Generation Library** (Runtime: Runtime | Impact: Label creation | Risk: Low | Upgrade: Automatic Minor)
- **DEP-019: QR Scanning Library** (Runtime: Frontend | Impact: Mobile parsing | Risk: Medium | Upgrade: Manual Major)
