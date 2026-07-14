# Architecture Inventory

This document provides a comprehensive map of the current AssetFlow MVP architecture, acting as the Level 3 Module Architecture baseline before Epic 1 commences.

---

## 1. High-Level Architecture Diagram
```text
[ Users (Web / Mobile) ]
           ↓
[ Frontend (Vite / React) ]
           ↓
[ REST API (Express) ]
           ↓
[ Modular Monolith (Services & Repositories) ]
           ↓
[ PostgreSQL Database ]
```

## 2. Active Modules
### Auth Module
- **Module Status**: Stable
- **Module Owner**: Backend
- **Public API Count**: 3 (`/login`, `/refresh`, `/logout`)
- **Database Ownership**:
  - Tables Owned: None (Depends on User Module)
  - Tables Read: `User`, `Role`
  - Tables Written: `User` (Last login tracking)
- **Published Domain Events**: `UserLoggedIn`, `UserLoggedOut`, `SuspiciousLoginDetected`
- **Module Maturity**: ★★★☆☆ (Missing brute force protection)

### User Module
- **Module Status**: Stable
- **Module Owner**: Backend
- **Public API Count**: 5 (CRUD)
- **Database Ownership**:
  - Tables Owned: `User`, `Role`
  - Tables Read: `User`, `Role`, `Department`
  - Tables Written: `User`
- **Published Domain Events**: None
- **Module Maturity**: ★★★★☆

### Department Module
- **Module Status**: Stable
- **Module Owner**: Backend
- **Public API Count**: 5 (CRUD)
- **Database Ownership**:
  - Tables Owned: `Department`
  - Tables Read: `Department`, `Organization`
  - Tables Written: `Department`
- **Published Domain Events**: None
- **Module Maturity**: ★★★★★

### Employee Module
- **Module Status**: Stable
- **Module Owner**: Backend
- **Public API Count**: 5 (CRUD)
- **Database Ownership**:
  - Tables Owned: `Employee`
  - Tables Read: `Employee`, `User`, `Department`
  - Tables Written: `Employee`
- **Published Domain Events**: None
- **Module Maturity**: ★★★★☆

### Asset Module
- **Module Status**: Stable
- **Module Owner**: Backend
- **Public API Count**: 6 (CRUD + Search)
- **Database Ownership**:
  - Tables Owned: `Asset`, `AssetCategory`, `CustomField`
  - Tables Read: `Asset`, `AssetCategory`
  - Tables Written: `Asset`
- **Published Domain Events**: `AssetCreated`, `AssetDecommissioned`
- **Module Maturity**: ★★★★☆

### AssetAllocation Module
- **Module Status**: Stable
- **Module Owner**: Backend
- **Public API Count**: 4
- **Database Ownership**:
  - Tables Owned: `AssetAllocation`
  - Tables Read: `Asset`, `User`, `AssetAllocation`
  - Tables Written: `AssetAllocation`, `Asset` (Status update)
- **Published Domain Events**: `AssetAllocated`
- **Module Maturity**: ★★★☆☆ (Tight coupling with AssetRepository)

### Booking & Maintenance Modules
- **Module Status**: Stable
- **Module Owner**: Backend
- **Public API Count**: 8
- **Database Ownership**:
  - Tables Owned: `Booking`, `MaintenanceRecord`
  - Tables Read: `Asset`, `Booking`, `MaintenanceRecord`
  - Tables Written: `Booking`, `MaintenanceRecord`
- **Published Domain Events**: `MaintenanceCompleted`
- **Module Maturity**: ★★★☆☆

## 3. Planned Future Modules
- **Inventory**: Multi-warehouse stock tracking.
- **Warehouses**: Physical location hierarchies.
- **Suppliers**: Vendor evaluations and records.
- **Procurement**: Purchase Requests and Orders.
- **Notifications**: Centralized Email/Push delivery via Event Bus.
- **QR Platform**: Hardware sticker generation and mobile resolution.
- **OCR**: Document text extraction.
- **AI Platform**: Predictive maintenance and RAG search.
- **Business Intelligence**: Read-optimized analytic dashboards.

## 4. Cross-Cutting Concerns
- **Authentication**: JWT signing and HttpOnly secure cookies.
- **Authorization**: RBAC array-checking middleware.
- **Validation**: Zod schema enforcement across all inbound requests.
- **Logging**: Currently `console.log` (Slated for Winston/Pino in Epic 0).
- **Error Handling**: Centralized `AppError` and global Express catch-all.
- **Configuration**: `.env` parsing (Slated for Zod strict validation).
- **Observability**: Unimplemented (Slated for Correlation IDs in Epic 0).

## 5. External Dependencies
### Current
- **PostgreSQL**: Primary transactional persistence.
- **Prisma**: ORM layer and type generation.
- **JWT**: Cryptographic session signatures.

### Future
- **Redis**: Rate limiting, caching, and background job state.
- **BullMQ**: Asynchronous task processing (OCR, Emails).
- **AWS S3 / Object Storage**: Invoice and PDF persistence.
- **AI Providers (OpenAI/Anthropic)**: Inference layer for Analytics and AI Agents.
