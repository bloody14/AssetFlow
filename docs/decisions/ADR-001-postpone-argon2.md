# Architecture Decision Record (ADR) Template

## Title
ADR-001: Postpone Argon2 Migration for Password Hashing

## Status
Accepted

## Context
During the Epic 1 (Production Hardening) planning phase, replacing `bcrypt` with `argon2` for password hashing was proposed. Argon2 offers superior resistance to GPU cracking and is the current industry standard recommended by OWASP. However, the platform has not yet entered production, and existing users are registered with `bcrypt` hashes.

## Decision
We will postpone the migration from `bcrypt` to `argon2` until Epic 3 or later. We will continue using `bcrypt` throughout Epic 1 and Epic 2.

## Consequences
- **Easier Epic 1 execution**: Avoids the complexity of implementing a transparent hash upgrade strategy (where old hashes are dynamically upgraded upon the next successful login) during the current foundational hardening phase.
- **Reduced Testing Overhead**: We do not need to build and maintain tests for hash migration during Phase 1.
- **Acceptable Security Risk**: `bcrypt` (with sufficient work factor/salt rounds) remains secure against CPU attacks and is adequate for the platform's current pre-production status.

## Alternatives Considered
- **Immediate Migration**: Rejected due to unnecessary complexity and testing overhead introduced before the core testing infrastructure and CI/CD pipelines are fully stabilized.
