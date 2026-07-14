# Domain Event Registry

This document catalogs all Domain Events to be emitted by the AssetFlow platform. Domain Events are mandatory architectural artifacts that define integration points for Notification, Analytics, Automation, and AI modules.

---

## 1. Authentication Events
- **UserLoggedIn**: Fired on successful login.
  - **Metadata**: Version: 1.0, Priority: Low, Source: Auth, Consumers: Audit, Retry: None, Idempotent: Yes, Retention: 1 yr, Security: High, AI: Low
- **UserLoggedOut**: Fired on explicit logout.
  - **Metadata**: Version: 1.0, Priority: Low, Source: Auth, Consumers: Audit, Retry: None, Idempotent: Yes, Retention: 1 yr, Security: Low, AI: Low
- **PasswordResetRequested**: Fired when reset workflow begins.
  - **Metadata**: Version: 1.0, Priority: High, Source: Auth, Consumers: Notifications, Retry: 3x, Idempotent: Yes, Retention: 1 yr, Security: Critical, AI: Low
- **PasswordChanged**: Fired on successful password change.
  - **Metadata**: Version: 1.0, Priority: High, Source: Auth, Consumers: Notifications/Audit, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Critical, AI: Low
- **AccountLocked**: Fired after 5 failed login attempts.
  - **Metadata**: Version: 1.0, Priority: Critical, Source: Auth, Consumers: Audit/Notifications, Retry: 5x, Idempotent: Yes, Retention: 7 yrs, Security: Critical, AI: High (Anomaly Detection)
- **RefreshTokenRotated**: Fired when session refreshes.
  - **Metadata**: Version: 1.0, Priority: Low, Source: Auth, Consumers: Audit, Retry: None, Idempotent: Yes, Retention: 30 days, Security: High, AI: Low

## 2. Security Events
- **PermissionDenied**: RBAC check fails.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Middleware, Consumers: Audit, Retry: None, Idempotent: Yes, Retention: 1 yr, Security: High, AI: High
- **UnauthorizedAccess**: Missing/invalid token.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Middleware, Consumers: Audit, Retry: None, Idempotent: Yes, Retention: 1 yr, Security: High, AI: High
- **RateLimitExceeded**: Client exceeds request quota.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: API Gateway, Consumers: Audit, Retry: None, Idempotent: Yes, Retention: 30 days, Security: Medium, AI: High
- **SuspiciousLoginDetected**: New IP or anomalous location.
  - **Metadata**: Version: 1.0, Priority: High, Source: Auth, Consumers: Security/Notifications, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Critical, AI: Critical
- **SessionExpired**: Token expiration.
  - **Metadata**: Version: 1.0, Priority: Low, Source: Auth, Consumers: None, Retry: None, Idempotent: Yes, Retention: 30 days, Security: Low, AI: Low

## 3. Enterprise Asset Management (EAM) Events
- **AssetCreated**: New asset registered.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Asset, Consumers: Audit/Analytics, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Low, AI: Medium
- **AssetAllocated**: Asset assigned to employee.
  - **Metadata**: Version: 1.0, Priority: High, Source: AssetAllocation, Consumers: Audit/Notifications, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Medium, AI: Medium
- **AssetDecommissioned**: Asset reaches end-of-life.
  - **Metadata**: Version: 1.0, Priority: High, Source: Asset, Consumers: Audit/Finance, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Medium, AI: High

## 4. Inventory Events
- **InventoryUpdated**: Stock count changes.
  - **Metadata**: Version: 1.0, Priority: High, Source: Inventory, Consumers: Analytics/AI, Retry: 3x, Idempotent: No (requires sequence ID), Retention: 7 yrs, Security: Medium, AI: Critical
- **InventoryBelowThreshold**: Stock drops below reorder point.
  - **Metadata**: Version: 1.0, Priority: Critical, Source: Inventory, Consumers: Notifications/Procurement, Retry: 5x, Idempotent: Yes, Retention: 7 yrs, Security: Medium, AI: Critical
- **GoodsReceived**: Scan of incoming shipment.
  - **Metadata**: Version: 1.0, Priority: High, Source: Receiving, Consumers: Inventory/Procurement, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Medium, AI: Medium
- **StockTransferred**: Movement between warehouses.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Inventory, Consumers: Audit, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Medium, AI: High
- **StockAdjusted**: Manual discrepancy correction.
  - **Metadata**: Version: 1.0, Priority: High, Source: Inventory, Consumers: Audit/Finance, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: High, AI: High
- **ItemReturned**: Return to stock.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Inventory, Consumers: Audit, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Low, AI: Medium

## 5. Supply Chain Events
- **PurchaseOrderApproved**: PO financially cleared.
  - **Metadata**: Version: 1.0, Priority: Critical, Source: Procurement, Consumers: Notifications/ERP, Retry: Infinite (DLQ), Idempotent: Yes, Retention: 10 yrs, Security: High, AI: High
- **SupplierCreated**: New vendor onboarded.
  - **Metadata**: Version: 1.0, Priority: Low, Source: Procurement, Consumers: Audit, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Medium, AI: Low
- **SupplierEvaluated**: Periodic vendor scoring.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Intelligence, Consumers: Analytics, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Low, AI: Critical
- **SupplierBlacklisted**: Vendor restricted due to compliance.
  - **Metadata**: Version: 1.0, Priority: Critical, Source: Procurement, Consumers: Auth/Notifications, Retry: 5x, Idempotent: Yes, Retention: 10 yrs, Security: Critical, AI: High

## 6. Maintenance Events
- **MaintenanceCompleted**: Tech finishes repair.
  - **Metadata**: Version: 1.0, Priority: High, Source: Maintenance, Consumers: Analytics/Notifications, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Low, AI: Critical (Predictive Maintenance)

## 7. Notifications
- **NotificationDelivered**: Delivery confirmed (Webhook).
  - **Metadata**: Version: 1.0, Priority: Low, Source: Notifications, Consumers: Audit, Retry: None, Idempotent: Yes, Retention: 90 days, Security: Low, AI: Low
- **NotificationFailed**: Delivery failed (Bounced/Rejected).
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Notifications, Consumers: System, Retry: None, Idempotent: Yes, Retention: 90 days, Security: Low, AI: Medium
- **NotificationRetried**: Internal broker retry.
  - **Metadata**: Version: 1.0, Priority: Low, Source: Notifications, Consumers: System, Retry: None, Idempotent: Yes, Retention: 7 days, Security: Low, AI: Low

## 8. Documents
- **InvoiceUploaded**: S3 upload completes.
  - **Metadata**: Version: 1.0, Priority: High, Source: Documents, Consumers: AI (OCR), Retry: 3x, Idempotent: Yes, Retention: 10 yrs, Security: High, AI: Critical
- **WarrantyUploaded**: PDF warranty added.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Documents, Consumers: AI (OCR), Retry: 3x, Idempotent: Yes, Retention: 10 yrs, Security: Medium, AI: Critical
- **OCRCompleted**: Text extraction finished.
  - **Metadata**: Version: 1.0, Priority: High, Source: AI, Consumers: Indexer, Retry: 5x, Idempotent: Yes, Retention: 1 yr, Security: Medium, AI: Critical
- **DocumentIndexed**: Vector embedding complete.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Analytics, Consumers: Search, Retry: 5x, Idempotent: Yes, Retention: 1 yr, Security: Medium, AI: Critical

## 9. QR Platform
- **QRCodeGenerated**: New QR payload created.
  - **Metadata**: Version: 1.0, Priority: Low, Source: QR, Consumers: Audit, Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Low, AI: Low
- **QRCodeScanned**: Mobile app scan event.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Mobile API, Consumers: Analytics, Retry: 3x, Idempotent: Yes, Retention: 1 yr, Security: Medium, AI: High

## 10. Workflow
- **ApprovalRequested**: Manager review needed.
  - **Metadata**: Version: 1.0, Priority: High, Source: Workflow, Consumers: Notifications, Retry: 5x, Idempotent: Yes, Retention: 7 yrs, Security: Medium, AI: Medium
- **ApprovalGranted**: Request accepted.
  - **Metadata**: Version: 1.0, Priority: Critical, Source: Workflow, Consumers: Source Module, Retry: Infinite (DLQ), Idempotent: Yes, Retention: 7 yrs, Security: High, AI: Medium
- **ApprovalRejected**: Request denied.
  - **Metadata**: Version: 1.0, Priority: High, Source: Workflow, Consumers: Source Module, Retry: Infinite (DLQ), Idempotent: Yes, Retention: 7 yrs, Security: High, AI: Medium

## 11. Analytics & AI
- **DashboardViewed**: Telemetry event.
  - **Metadata**: Version: 1.0, Priority: Low, Source: Frontend, Consumers: Analytics, Retry: None, Idempotent: Yes, Retention: 30 days, Security: Low, AI: High
- **ReportGenerated**: Async report finishes.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: Intelligence, Consumers: Notifications, Retry: 3x, Idempotent: Yes, Retention: 1 yr, Security: Medium, AI: High
- **PredictionGenerated**: AI outputs forecast.
  - **Metadata**: Version: 1.0, Priority: Medium, Source: AI, Consumers: Analytics, Retry: 3x, Idempotent: Yes, Retention: 3 yrs, Security: Medium, AI: Critical
- **RecommendationAccepted**: Human approves AI idea.
  - **Metadata**: Version: 1.0, Priority: High, Source: Frontend, Consumers: AI (RLHF), Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Medium, AI: Critical
- **RecommendationRejected**: Human denies AI idea.
  - **Metadata**: Version: 1.0, Priority: High, Source: Frontend, Consumers: AI (RLHF), Retry: 3x, Idempotent: Yes, Retention: 7 yrs, Security: Medium, AI: Critical
- **AIConversationStarted**: Chatbot session begins.
  - **Metadata**: Version: 1.0, Priority: Low, Source: Frontend, Consumers: AI, Retry: None, Idempotent: Yes, Retention: 1 yr, Security: High, AI: Critical
- **AIConversationEnded**: Chatbot session terminates.
  - **Metadata**: Version: 1.0, Priority: Low, Source: Frontend, Consumers: AI, Retry: None, Idempotent: Yes, Retention: 1 yr, Security: High, AI: Critical
