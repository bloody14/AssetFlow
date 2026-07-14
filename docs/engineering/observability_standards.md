# Observability Standards

This document establishes the official standards for logging, telemetry, and health monitoring within the AssetFlow platform.

## 1. Official Logging Contract
All structured logs emitted by AssetFlow applications must include the following attributes to ensure comprehensive trace indexing and debugging:

- **Timestamp**: ISO 8601 UTC format.
- **Level**: The severity level (see Section 5).
- **Correlation ID**: A UUID generated per request boundary (`X-Correlation-ID`).
- **Module**: The business domain (e.g., `Auth`, `Inventory`).
- **Operation**: The specific action (e.g., `CreateAsset`, `Login`).
- **HTTP Method**: Standard REST verb (`GET`, `POST`, etc.).
- **Request Path**: The URI path (`/api/v1/assets`).
- **Duration**: Milliseconds taken to complete the operation (logged at response `finish`).
- **Environment**: Target deployment (`development`, `staging`, `production`).
- **User ID**: Authenticated user ID (if available within the context).
- **Organization ID**: Target tenant identifier (future multi-tenant capability).
- **Application Version**: Semver version or git hash.

## 2. Sensitive Logging Policy
**CRITICAL**: Under no circumstances should the following data be written to logs. All logger transports and serializers must strictly redact or mask these fields:

- Passwords (hashed or plaintext)
- JWT Tokens (Access or Refresh)
- API Keys / Secret Keys
- OTPs / 2FA Codes
- Secure Cookies
- Financial Data (e.g., full credit card numbers)
- Highly sensitive PII (Social Security Numbers, full unmasked email addresses if legally classified as sensitive in the region)

## 3. Health Endpoint Specification
The application exposes standard Kubernetes-compatible lifecycle probes.

- **`GET /live`** (Liveness Probe): Returns `200 OK` if the Node.js process is responsive and event loop is healthy. If this fails, the container should be killed and restarted.
- **`GET /ready`** (Readiness Probe): Returns `200 OK` only if the application is fully ready to accept traffic. This checks if the connection to the database (and future Redis) is established. If this fails, the load balancer stops routing traffic to the instance.
- **`GET /health`** (Deep Health): Detailed operational view. Evaluates and returns the status of all dependencies:
  - **Current**: PostgreSQL connection status.
  - **Future Check Targets**: Redis cache connectivity, Object Storage (S3/MinIO) reachability, Email Provider API status, AI Services (OpenAI API) availability.

## 4. Version Endpoint Specification
- **`GET /version`**: Exposes the build metadata to assist deployment tracing.
  - `application`: Name of the service (AssetFlow API).
  - `version`: Semver representation (`v1.0.0`).
  - `gitCommit`: The short SHA of the deployment commit.
  - `buildDate`: The ISO 8601 timestamp of the CI pipeline build.
  - `environment`: The current execution context (e.g., `production`).

## 5. Logging Level Definitions
- **ERROR**: Actionable failures. The system or request failed to complete (e.g., Database connection lost, unhandled exceptions). Triggers alerts.
- **WARN**: Sub-optimal states or recovered errors that require attention but did not cause a complete failure (e.g., High memory usage, Rate limit near threshold).
- **INFO**: Standard operational events. Business milestones and request completions (e.g., `User logged in`, `Asset created`, `HTTP 200 OK`).
- **DEBUG**: Diagnostic information useful for developers tracing logic paths during active investigation (e.g., Query execution times, external API payloads). Never enabled in production by default.
- **TRACE**: Extremely granular, high-volume event tracking (e.g., inner-loop states). Used strictly for localized edge-case debugging.
