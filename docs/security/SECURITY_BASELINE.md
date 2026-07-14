# AssetFlow Security Baseline

This document serves as the single source of truth for AssetFlow's security architecture, policies, and strategic roadmaps.

## 1. Deployment Proxy Configuration
AssetFlow operates behind reverse proxies and load balancers in production. To ensure rate limiters and logging accurately capture client IPs:
- `app.set('trust proxy', 1)` must be configured in Express.
- The infrastructure must sanitize and strictly pass `X-Forwarded-For` headers.

## 2. Rate Limiting Strategy
The platform utilizes a layered rate limiting approach to mitigate abuse:
| Endpoint Category | Limit (per IP) | Window |
|-------------------|----------------|--------|
| Authentication (`/auth/login`) | 5 Requests | 15 Minutes |
| Refresh Tokens (`/auth/refresh`) | 10 Requests | 15 Minutes |
| Public APIs / Global | 100 Requests | 15 Minutes |
| Administrative APIs | 200 Requests | 15 Minutes |

## 3. Security Header Policy (Helmet)
AssetFlow strictly enforces HTTP security headers via Helmet:
- **CSP (Content Security Policy)**: Default-src 'self'. Prevents XSS by restricting resource loading.
- **HSTS (Strict-Transport-Security)**: Enforced `max-age=31536000; includeSubDomains`. Ensures browsers only connect via HTTPS.
- **Referrer-Policy**: `strict-origin-when-cross-origin`. Protects sensitive URL data during cross-origin navigation.
- **Permissions-Policy**: Disables access to camera, microphone, and geolocation.

## 4. Security Event Logging
Security events must emit highly structured JSON logs for SIEM ingestion. Examples of critical events that must be logged:
- **Rate Limit Exceeded**: `{ event: 'RATE_LIMIT_EXCEEDED', ip: string, path: string }`
- **Invalid JWT**: `{ event: 'INVALID_JWT_ATTEMPT', ip: string, reason: string }`
- **Replay Attack**: `{ event: 'REPLAY_ATTACK_DETECTED', sessionId: string, revokedTokenFamily: string }`
- **Unauthorized Access**: `{ event: 'UNAUTHORIZED_ACCESS_ATTEMPT', userId: string, missingRole: string }`

## 5. Security Metrics & Monitoring
Future observability dashboards (Grafana) will track the following critical security KPIs:
- Failed Logins (Spikes indicate brute-force attempts).
- Blocked Requests (WAF/Helmet rejections).
- Rate Limited IPs (Top offending IPs).
- Unauthorized Requests (401/403 volume tracking).

## 6. Official Session Cookie Standard
When AssetFlow implements cookie-based sessions (e.g., for Refresh Tokens), the following strictly enforced cookie attributes apply:
- **HttpOnly**: `true` (Prevents XSS extraction).
- **Secure**: `true` (Requires HTTPS).
- **SameSite**: `Strict` (Prevents CSRF).
- **Domain**: Strictly tied to the API's top-level domain.
- **Path**: `/api/v1/auth` (Restrict token transmission).
- **MaxAge**: Explicitly aligned with the token's JWT expiration.

## 7. Security Testing Expansion Roadmap
Extensive automated security tests will be continually integrated into `backend/tests/security/`. Future targets include:
- **JWT Tampering**: Modifying payloads/signatures and verifying rejection.
- **Rate Limiting**: Simulating burst traffic to ensure `429 Too Many Requests` responses.
- **Header Validation**: Verifying Helmet's output on production builds.
- **Origin Validation**: Testing CORS preflight and rejection of rogue origins.
- **Replay Attack Simulation**: Re-using a previously revoked refresh token and verifying complete token family revocation.
