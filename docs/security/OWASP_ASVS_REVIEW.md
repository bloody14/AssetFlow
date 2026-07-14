# OWASP Application Security Verification Standard (ASVS) 4.0 Review

**Target Level**: ASVS Level 1 (Basic Assessment) / Partial Level 2
**Phase**: Epic 1 - Phase 1.2

This checklist verifies the AssetFlow backend API against key ASVS control families.

## V2: Authentication Verification Requirements
- [x] **2.1.1**: Verify that user set passwords are at least 12 characters in length (Enforced via `Zod` Auth schemas).
- [x] **2.2.1**: Verify that the application protects against automated attacks like credential stuffing (Enforced via `express-rate-limit` on `/api/v1/auth/login`).
- [x] **2.7.1**: Verify that passwords are hashed using a secure algorithm (Using `bcrypt` with 12 rounds; `argon2` scheduled in ADR-001).

## V3: Session Management Verification Requirements
- [x] **3.1.1**: Verify the application never reveals session tokens in URL parameters.
- [x] **3.2.1**: Verify that session tokens are generated using a secure CSPRNG (Refresh tokens use `crypto.randomBytes(40)`).
- [x] **3.3.1**: Verify logout invalidates the session on the server (Enforced via `DomainRevokedBy.USER` token revocation logic).

## V4: Access Control Verification Requirements
- [x] **4.1.1**: Verify that the application enforces the principle of least privilege (Enforced via granular RBAC constants and `hasPermission` helpers).
- [x] **4.3.1**: Verify that administrative interfaces use appropriate role-based separation.

## V5: Validation, Sanitization and Encoding Verification Requirements
- [x] **5.1.1**: Verify that the application has defenses against HTTP Parameter Pollution (Strict query parsing via `Zod`).
- [x] **5.1.4**: Verify that all input is validated against a strict allowlist of data types (Implemented via `z.object().strict()` on request bodies).

## V14: Configuration Verification Requirements
- [x] **14.2.1**: Verify that the application sets appropriate security headers (`Helmet` integrated).
- [x] **14.3.2**: Verify that the application has strict CORS policies (`cors` package restricted to `CLIENT_URL`).
- [x] **14.4.1**: Verify that the web application does not output stack traces in production (Enforced via `errorHandler.ts`).
