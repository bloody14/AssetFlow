# Code Metrics Report

This report establishes the quantitative engineering baseline for the AssetFlow platform prior to Epic 1. It serves as the benchmark for measuring growth, technical debt reduction, and architectural maturity.

---

## 1. Trend Metrics (Current Baseline)
- **Modules**: 10
- **Controllers**: 10
- **Repositories**: 10
- **Endpoints**: ~45
- **Tables**: 8
- **Published Domain Events**: 0 (Implementation pending)

## 2. Security Metrics
- **Public Endpoints**: 1 (`/auth/login`)
- **Protected Endpoints**: 44
- **JWT Protected**: 100% of protected routes
- **RBAC Protected**: ~40% of protected routes
- **Rate Limited**: 0% (Target: 100% in Epic 1)
- **Validated Endpoints**: 100% (Zod schemas active)

## 3. Database Metrics (PostgreSQL)
- **Tables**: 8
- **Indexes**: 8 (Primary keys only, no composite indexes yet)
- **Foreign Keys**: 7
- **Views**: 0
- **Materialized Views**: 0

## 4. Documentation Metrics
- **Architecture Documents**: 5 (Phase 0.1 Deliverables)
- **ADR Count**: 0 (Pending Phase 0.2)
- **API Documentation**: 0% (No OpenAPI/Swagger definition yet)
- **Coverage**: 100% of Epic 0 planning artifacts

## 5. AI Readiness Metrics
- **Published Domain Events**: 0 implementation (35 planned in Registry)
- **AI Ready Modules**: 0 (Currently coupled, no async event emission)
- **Structured Logs**: 0% (Currently unstructured `console.log`)
- **AI Compatible APIs**: 0% (No OpenAPI spec for LLM consumption)

## 6. Performance Metrics (Estimates prior to Load Testing)
- **Average Response Time**: ~50ms (Local development)
- **P95 Latency**: Unknown (Pending K6 load tests)
- **P99 Latency**: Unknown
- **Memory Footprint**: ~150MB Idle Node.js Process
- **Database Query Count**: Average 1-3 queries per request

## 7. Build Metrics
- **Build Duration (tsc)**: ~3.5 seconds
- **Lint Duration**: ~2.0 seconds
- **Typecheck Duration**: ~3.0 seconds
- **Test Duration**: N/A (No tests exist)
- **Docker Build Duration**: N/A (Dockerfile not yet optimized)

## 8. Code Quality Metrics
- **Technical Debt Count**: 17 registered items
- **Cyclomatic Complexity**: Medium (Manual DI adds boilerplate, but logic is flat)
- **Duplicate Code**: Low (Shared middleware handling errors and auth)
- **Average Function Length**: ~15 lines
- **Average Class Size**: ~50 lines (Controllers and Services)
- **Unused Dependencies**: 0 (Pruned)
- **Unused Files**: 0

## 9. Architecture Metrics
- **Module Coupling**: High (Direct Repository injections across module boundaries)
- **Shared Components**: 4 (JWT, Cookie, AppError, HttpStatus)
- **Circular Dependencies**: 0 (Enforced by ESLint)
- **Repository Count**: 10
- **Event Count**: 0

## 10. Business Metrics (MVP Seeding Baseline)
- **Organizations**: 1
- **Departments**: 3
- **Employees**: 5
- **Assets**: 10
- **Inventory Items**: 0 (Module pending)
- **Warehouses**: 0 (Module pending)
- **Purchase Orders**: 0 (Module pending)
- **Notifications**: 0
- **AI Requests**: 0
