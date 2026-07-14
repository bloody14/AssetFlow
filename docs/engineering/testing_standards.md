# Testing Standards & Strategy

This document establishes the official testing standards, classifications, and methodologies for the AssetFlow platform. These standards enforce high software quality, consistency, and security across the engineering lifecycle.

## 1. Test Classifications

All tests within the AssetFlow platform fall into one of the following official classifications:

- **Unit Tests (`tests/unit/`)**: Isolated tests targeting individual functions, services, middlewares, or validation schemas. External dependencies (like the database) MUST be fully mocked.
- **Integration Tests (`tests/integration/`)**: Tests that verify the interaction between components (e.g., Controllers and Database via Supertest). An ephemeral test database is utilized.
- **Contract Tests (`tests/contracts/` - Future)**: Consumer-driven contract testing to ensure frontend-backend compatibility (e.g., using Pact).
- **Security Tests (`tests/security/` - Future)**: Automated security checks targeting authentication bypassing, authorization flaws, and rate-limit verifications.
- **Performance Tests (`tests/performance/` - Future)**: Load and stress testing utilizing `k6` or `Artillery` to validate SLA targets (e.g., login <200ms).
- **End-to-End Tests (`tests/e2e/` - Future)**: Automated browser testing (e.g., Playwright) validating critical user journeys across the full stack.

## 2. Standard Test Naming Convention

Tests must follow a strict, descriptive naming format using the `describe`/`it` structure. The `it` description should clearly state the expected behavior.

**Convention:** `it('should [expected outcome] when [condition/context]')`

**Example:**
```typescript
describe('AuthService.login', () => {
  it('should throw AppError with 401 when the email does not exist', async () => { ... });
  it('should return TokenPair when credentials are valid', async () => { ... });
});
```

## 3. Snapshot Testing Policy
Snapshot testing is permitted ONLY for:
1. Static configuration files.
2. Complex UI rendering components (Frontend).

**Restrictions:**
- Snapshots must never be used for JSON API responses containing dynamic data (timestamps, UUIDs).
- If a snapshot fails, it must be reviewed manually before being updated (`vitest -u`). Automated CI updates are forbidden.

## 4. Coverage Matrix (Progressive Targets)
The minimum viable coverage for the CI pipeline is progressively increased per phase. 
*Current Global Target: 60% (Epic 1 Phase 1.1)*

| Module | Target | Status |
|--------|--------|--------|
| Auth | 80% | In Progress |
| User / Employee | 80% | Pending |
| Asset | 80% | Pending |
| Reporting | 80% | Pending |
| Shared/Utils | 90% | Met |

## 5. Mutation Testing (Future Support)
In Epic 2+, AssetFlow will adopt **Stryker Mutator** to evaluate the actual effectiveness of our test suites. Stryker will introduce artificial faults (mutations) into the codebase to ensure our tests catch them (killing mutants).

## 6. OpenAPI Documentation Standards
Alongside the implementation of new endpoints, OpenAPI specifications MUST be written in `docs/api/openapi.yaml`. Every endpoint specification MUST include:

1. **Summary**: A short, action-oriented title.
2. **Description**: Detailed explanation of the endpoint's purpose.
3. **Authentication**: Explicit mention of required tokens (e.g., Bearer auth).
4. **Authorization**: Roles/Permissions required to access the endpoint.
5. **Request Schema**: Strict definitions of required and optional payload fields.
6. **Response Schema**: The exact shape of successful `2xx` responses.
7. **Error Responses**: Expected standard errors (`400`, `401`, `403`, `404`, `429`).
8. **Examples**: Real-world payload examples for clarity.
