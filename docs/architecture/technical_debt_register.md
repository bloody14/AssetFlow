# Technical Debt Register

This document tracks known technical debt, missing capabilities, and architectural gaps across the AssetFlow platform.

---

### TD-001: Unstructured Console Logging & Lack of Tracing
- **Owner**: Backend
- **Current Status**: Open
- **Severity**: Critical | **Business Impact**: Complete loss of observability in cloud environments.
- **Estimated Effort**: Small
- **Proposed Resolution**: Replace `console.log` with a structured JSON logger (e.g., Winston). Implement middleware to inject `X-Correlation-ID`.
- **Target Epic**: Epic 0 | **Target Phase**: Phase 0.3
- **Risk Score**: Probability: High, Impact: High, Overall Risk: Critical
- **Dependencies**: None.
- **Verification Criteria**: No `console.log` remains; log streams in stdout are 100% JSON format with `correlationId`.
- **AI Impact**: Critical. AI log analysis requires structured data.

### TD-002: Missing Automated Testing Suite
- **Owner**: Backend / QA
- **Current Status**: Open
- **Severity**: Critical | **Business Impact**: High risk of regressions. Prevents reliable CI/CD automation.
- **Estimated Effort**: Large
- **Proposed Resolution**: Establish Jest + Supertest baseline. Enforce an 80% coverage quality gate.
- **Target Epic**: Epic 0 | **Target Phase**: Phase 0.4
- **Risk Score**: Probability: High, Impact: High, Overall Risk: Critical
- **Dependencies**: CI/CD Pipeline Setup.
- **Verification Criteria**: `npm run test` passes with >80% coverage reported in CI.
- **AI Impact**: Low.

### TD-003: Missing Pagination on List Endpoints
- **Owner**: Backend
- **Current Status**: Open
- **Severity**: High | **Business Impact**: Memory exhaustion at scale.
- **Estimated Effort**: Medium
- **Proposed Resolution**: Implement cursor-based pagination utilizing Prisma's native `cursor` and `take`.
- **Target Epic**: Epic 1 | **Target Phase**: Phase 1.3
- **Risk Score**: Probability: High, Impact: Medium, Overall Risk: High
- **Dependencies**: API Contract Standardization.
- **Verification Criteria**: All `GET` list endpoints require/support `take` and `cursor` query parameters.
- **AI Impact**: Low.

### TD-004: Lack of Rate Limiting & Brute Force Protection
- **Owner**: Security / Backend
- **Current Status**: Open
- **Severity**: High | **Business Impact**: Vulnerable to credential stuffing and DoS vectors.
- **Estimated Effort**: Medium
- **Proposed Resolution**: Integrate `express-rate-limit` leveraging Redis as the centralized state store.
- **Target Epic**: Epic 1 | **Target Phase**: Phase 1.1
- **Risk Score**: Probability: Medium, Impact: High, Overall Risk: High
- **Dependencies**: Redis Deployment.
- **Verification Criteria**: 6th failed login attempt from same IP within 15 mins returns 429.
- **AI Impact**: Low.

### TD-005: Hardcoded Dependency Injection
- **Owner**: Architecture
- **Current Status**: Deferred
- **Severity**: Medium | **Business Impact**: Slows down development velocity as modules grow.
- **Estimated Effort**: Large
- **Proposed Resolution**: Defer IoC until module count dictates necessity. Use explicit manual injection.
- **Target Epic**: N/A | **Target Phase**: N/A
- **Risk Score**: Probability: High, Impact: Low, Overall Risk: Medium
- **Dependencies**: None.
- **Verification Criteria**: IoC Container integrated (when implemented).
- **AI Impact**: Low.

### TD-006: Environment Variable Validation
- **Owner**: DevOps / Backend
- **Current Status**: Open
- **Severity**: Low | **Business Impact**: Misconfigured deployments fail at runtime instead of startup.
- **Estimated Effort**: Small
- **Proposed Resolution**: Startup validation using Zod schemas against `process.env`.
- **Target Epic**: Epic 0 | **Target Phase**: Phase 0.3
- **Risk Score**: Probability: Medium, Impact: Low, Overall Risk: Low
- **Dependencies**: None.
- **Verification Criteria**: Server throws startup exception if required env variables are missing.
- **AI Impact**: Low.

### TD-007: API Versioning Strategy
- **Owner**: Architecture
- **Current Status**: Open
- **Severity**: High | **Business Impact**: Prevents safe rollout of breaking changes.
- **Estimated Effort**: Small
- **Proposed Resolution**: Enforce strict `/api/v1/` routing and document deprecation policies.
- **Target Epic**: Epic 1 | **Target Phase**: Phase 1.3
- **Risk Score**: Probability: Medium, Impact: High, Overall Risk: High
- **Dependencies**: None.
- **Verification Criteria**: All routes are explicitly versioned in Express router definitions.
- **AI Impact**: Medium. Future AI agents must negotiate API versions.

### TD-008: Health Endpoints
- **Owner**: DevOps
- **Current Status**: Open
- **Severity**: Medium | **Business Impact**: Cloud load balancers cannot determine instance health.
- **Estimated Effort**: Small
- **Proposed Resolution**: Implement standard GET `/health`, `/ready`, `/live`.
- **Target Epic**: Epic 0 | **Target Phase**: Phase 0.5
- **Risk Score**: Probability: High, Impact: Medium, Overall Risk: High
- **Dependencies**: None.
- **Verification Criteria**: K8s or AWS ALB can successfully probe endpoints returning 200 OK.
- **AI Impact**: Low.

### TD-009: API Documentation Coverage
- **Owner**: Architecture / Backend
- **Current Status**: Open
- **Severity**: High | **Business Impact**: Prevents mobile and 3rd party integration.
- **Estimated Effort**: Medium
- **Proposed Resolution**: Generate OpenAPI/Swagger spec from Zod schemas and TSOA.
- **Target Epic**: Epic 1 | **Target Phase**: Phase 1.4
- **Risk Score**: Probability: High, Impact: Medium, Overall Risk: High
- **Dependencies**: Zod schema maturity.
- **Verification Criteria**: `/api-docs` endpoint serves complete Swagger UI.
- **AI Impact**: High. AI Agent requires OpenAPI spec to function as a tool.

### TD-010: Audit Event Catalog
- **Owner**: Architecture
- **Current Status**: Open
- **Severity**: Medium | **Business Impact**: Compliance failure; inability to track critical actions.
- **Estimated Effort**: Medium
- **Proposed Resolution**: Define standard schema for audit logs linking User -> Action -> Resource.
- **Target Epic**: Epic 1 | **Target Phase**: Phase 1.2
- **Risk Score**: Probability: Medium, Impact: High, Overall Risk: Medium
- **Dependencies**: Domain Event Registry.
- **Verification Criteria**: Security actions (Login, Delete) are durably written to `AuditLog` table.
- **AI Impact**: High. Foundation for Anomaly Detection.

### TD-011: Performance Benchmarks
- **Owner**: Architecture / QA
- **Current Status**: Open
- **Severity**: Medium | **Business Impact**: Unknown capacity limits risk production outages.
- **Estimated Effort**: Medium
- **Proposed Resolution**: Establish K6/Artillery load testing baselines for critical paths.
- **Target Epic**: Epic 1 | **Target Phase**: Phase 1.5
- **Risk Score**: Probability: Medium, Impact: Medium, Overall Risk: Medium
- **Dependencies**: Testing Infrastructure.
- **Verification Criteria**: CI runs load test and ensures p95 < 200ms.
- **AI Impact**: Low.

### TD-012: Backup & Restore Strategy
- **Owner**: DevOps
- **Current Status**: Open
- **Severity**: Critical | **Business Impact**: Risk of complete data loss.
- **Estimated Effort**: Medium
- **Proposed Resolution**: Automated daily snapshots (RDS/Aurora) and point-in-time recovery.
- **Target Epic**: Epic 0 | **Target Phase**: Phase 0.5
- **Risk Score**: Probability: Low, Impact: Critical, Overall Risk: Critical
- **Dependencies**: Cloud Infrastructure Provisioning.
- **Verification Criteria**: Successfully restored staging DB from a production snapshot.
- **AI Impact**: Low.

### TD-013: Disaster Recovery Planning
- **Owner**: DevOps
- **Current Status**: Open
- **Severity**: High | **Business Impact**: Extended downtime during major regional outages.
- **Estimated Effort**: Large
- **Proposed Resolution**: Document RTO/RPO targets and multi-AZ deployment architecture.
- **Target Epic**: Epic 8 | **Target Phase**: Phase 8.1
- **Risk Score**: Probability: Low, Impact: Critical, Overall Risk: High
- **Dependencies**: Cloud Infrastructure.
- **Verification Criteria**: Approved DR playbook exists and is tested annually.
- **AI Impact**: Low.

### TD-014: Dependency Vulnerability Monitoring
- **Owner**: Security
- **Current Status**: Open
- **Severity**: High | **Business Impact**: Risk of supply chain attacks (e.g., Log4j equivalent).
- **Estimated Effort**: Small
- **Proposed Resolution**: Enforce `npm audit --audit-level=high` in CI pipeline and adopt Snyk.
- **Target Epic**: Epic 0 | **Target Phase**: Phase 0.5
- **Risk Score**: Probability: Medium, Impact: Critical, Overall Risk: High
- **Dependencies**: CI/CD Foundation.
- **Verification Criteria**: Pipeline blocks merge if high vulnerabilities exist.
- **AI Impact**: Low.

### TD-015: Secrets Rotation Strategy
- **Owner**: Security
- **Current Status**: Open
- **Severity**: Medium | **Business Impact**: Stale credentials increase blast radius of breaches.
- **Estimated Effort**: Medium
- **Proposed Resolution**: Transition to AWS Secrets Manager with auto-rotation policies for DB passwords.
- **Target Epic**: Epic 1 | **Target Phase**: Phase 1.4
- **Risk Score**: Probability: Low, Impact: High, Overall Risk: Medium
- **Dependencies**: Cloud Infrastructure.
- **Verification Criteria**: DB credentials rotate successfully without application downtime.
- **AI Impact**: Low.

### TD-016: Feature Flag Infrastructure
- **Owner**: Architecture
- **Current Status**: Open
- **Severity**: Medium | **Business Impact**: Prevents trunk-based development and canary rollouts.
- **Estimated Effort**: Medium
- **Proposed Resolution**: Integrate Unleash or LaunchDarkly (or simple DB table) for feature toggles.
- **Target Epic**: Epic 1 | **Target Phase**: Phase 1.5
- **Risk Score**: Probability: Medium, Impact: Medium, Overall Risk: Medium
- **Dependencies**: Database / Redis.
- **Verification Criteria**: Experimental endpoints can be enabled/disabled at runtime without deployments.
- **AI Impact**: High. AI features often require phased rollouts and A/B testing.

### TD-017: Caching Strategy
- **Owner**: Architecture
- **Current Status**: Open
- **Severity**: Medium | **Business Impact**: DB contention on high-read dashboard endpoints.
- **Estimated Effort**: Large
- **Proposed Resolution**: Redis layer for aggressive caching of standard reporting/KPI data.
- **Target Epic**: Epic 6 | **Target Phase**: Phase 6.1
- **Risk Score**: Probability: High, Impact: Medium, Overall Risk: Medium
- **Dependencies**: Redis Deployment.
- **Verification Criteria**: `GET /reporting/summary` latency drops < 50ms via Redis cache hit.
- **AI Impact**: High. AI/Analytics queries are highly cacheable and computationally expensive.
