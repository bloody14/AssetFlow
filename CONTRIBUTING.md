# Contributing to AssetFlow

This document outlines the strict coding standards, naming conventions, and pull request guidelines for the AssetFlow enterprise ERP system. All contributors must adhere to these rules to maintain a clean, scalable, and secure codebase.

## 1. Naming Conventions

### 1.1 Folder Naming
*   Folders must be named in `kebab-case`.
*   Feature modules should be singular (e.g., `asset`, `booking`, `maintenance`).

### 1.2 File Naming
*   Files should follow the pattern: `[feature].[type].ts`.
*   Examples: `asset.controller.ts`, `auth.service.ts`, `booking.repository.ts`.
*   Interfaces/Types: `[feature].types.ts`.
*   Constants: `[feature].constants.ts`.

### 1.3 Function & Variable Naming
*   Use `camelCase` for variables, functions, and methods.
*   Functions must use verb-noun phrasing describing their action (e.g., `getAssetById`, `createBooking`, `validatePayload`).
*   Booleans should be prefixed with `is`, `has`, `can`, or `should` (e.g., `isActive`, `hasPermission`).

### 1.4 Class & Interface Naming
*   Classes and Interfaces must be `PascalCase` (e.g., `AssetService`, `BookingRepository`, `IUserPayload`).
*   Enums must be `PascalCase`, with members in `UPPER_SNAKE_CASE` (e.g., `AssetStatus.UNDER_MAINTENANCE`).

## 2. Import Order

Maintain a clean and consistent import structure at the top of every file. Separate groups with a blank line:
1.  Node.js built-in modules (`fs`, `path`).
2.  External third-party packages (`express`, `zod`, `bcrypt`).
3.  Internal path aliases/absolute imports (if configured, e.g., `@/core/...`).
4.  Relative parent directory imports (`../`).
5.  Relative sibling directory imports (`./`).

## 3. Comment Style

*   **JSDoc/TSDoc:** Use block comments `/** ... */` for documenting classes, interfaces, and public methods. Include `@param` and `@returns` tags.
*   **Inline Comments:** Use `//` for brief explanations of complex or non-obvious logic. Do not over-comment obvious code.
*   **TODOs:** Format as `// TODO: [Name] - [Description]`.

## 4. Coding Principles

*   **DRY (Don't Repeat Yourself):** Extract duplicated logic into shared utility functions, base classes, or middleware.
*   **SOLID Principles:** Ensure Single Responsibility (controllers only route, services only do business logic, repositories only touch DB).
*   **KISS (Keep It Simple, Stupid):** Avoid over-engineering. Prefer readable code over clever one-liners.

## 5. Git Standards

### 5.1 Branch Naming
Branches must follow the format: `[type]/[issue-number]-[short-description]`
*   `feature/` - For new additions (e.g., `feature/12-asset-allocation`).
*   `fix/` - For bug fixes (e.g., `fix/34-auth-token-expiry`).
*   `refactor/` - For code restructuring without behavior changes.
*   `chore/` - For tooling, dependency updates, etc.

### 5.2 Commit Message Format
Follow Conventional Commits:
*   `feat: add asset checkout functionality`
*   `fix: resolve race condition in booking overlap check`
*   `docs: update API documentation for maintenance endpoints`
*   `refactor: extract pagination logic to BaseService`
*   `test: add integration tests for auth flow`

## 6. Pull Request Checklist

Before submitting a PR, ensure you can check off the following:
- [ ] Code follows the established architecture (Route -> Controller -> Service -> Repository).
- [ ] No direct database access occurs in the controller.
- [ ] No manual JSON response building (using `sendSuccess` / `sendError`).
- [ ] All inputs are validated via Zod schemas.
- [ ] `asyncHandler` is used; no repetitive try/catch blocks.
- [ ] Unit and Integration tests have been added/updated.
- [ ] The automatic Code Review Report identifies zero architecture or security violations.
- [ ] Code has been checked for reusability (no duplicated logic).
