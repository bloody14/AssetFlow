# Performance and Pagination Standards

This document establishes future-state guidelines and policies for application performance, database management, and list handling.

## 1. Official Pagination Policy
All list-based endpoints must adhere to these limitations:
- **Default Page Size**: 20 records.
- **Maximum Page Size**: 100 records.

## 2. Future Cursor Pagination Strategy
While `skip/take` offset pagination is acceptable for early phases, endpoints returning very large datasets (e.g., historical logs, full asset inventories) will migrate to Cursor Pagination using an indexed, sequential column (e.g., `id` or `createdAt`).

## 3. Pagination Metadata
Future iterations of `sendPaginatedSuccess` will support relational navigation arrays containing:
- `first` (URI)
- `previous` (URI)
- `next` (URI)
- `last` (URI)

## 4. Standard Sorting & Filtering Strategies
API implementations will adopt a standard mechanism for sorting and filtering:
- **Sorting**: Query variables `sortBy` (target column name) and `sortOrder` (must strictly be `asc` or `desc`).
- **Filtering**: Structured query parameters reflecting logical comparisons (e.g., `category[eq]=LAPTOP`, `purchaseDate[gte]=2024-01-01`).

## 5. Database Performance Policy
To maintain high throughput and minimize technical debt, the following strict rules apply:
- **Index Strategy**: Every `WHERE` clause column used frequently must have a corresponding Prisma `@@index`.
- **Query Review**: Every complex database operation MUST be peer-reviewed for optimization.
- **N+1 Prevention**: Prisma `include` operations must be aggressively monitored. If nested loops execute hidden queries, raw queries or grouped finds must be substituted.
- **Explain Plan Review**: Any query operating on >500k rows must have its `EXPLAIN ANALYZE` metrics documented in an ADR.

## 6. Database Metrics & Monitoring
Future observability integrations will track:
- Prisma Connection Pool Usage / Saturation
- Slow Queries (>100ms)
- Query Duration Percentiles (p95, p99)
- Connection Wait Time (Threads blocked waiting for pool access)

## 7. Performance Baselines
Target response time SLAs for the API:
- `GET /api/v1/auth/*`: < 50ms
- `GET List Endpoints`: < 150ms
- `POST/PUT Transactions`: < 250ms

## 8. Configuration Improvements
*Note on Database Pools*: The currently implemented Prisma Connection Pool configuration uses hardcoded connection strings and pool sizing. In Epic 2, these values (`max_connections`, `idle_timeout`) will be strictly migrated to environment variables (`DATABASE_MAX_CONNECTIONS`) for dynamic cloud scaling.
