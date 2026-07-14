# Domain Event Registry

This document catalogs the future Domain Events to be emitted by the AssetFlow platform. These events represent critical business moments and are the foundation for future AI, Notification, Analytics, and Automation architectures.

---

### DE-001: AssetCreated
- **Event Name**: `AssetCreated`
- **Ownership**: Asset Module (EAM)
- **Triggering Conditions**: Emitted immediately after a new asset record is successfully inserted into the database.
- **Payload Structure**:
  ```json
  {
    "eventId": "uuid",
    "timestamp": "ISO8601",
    "assetId": "uuid",
    "categoryId": "uuid",
    "purchaseCost": "decimal",
    "status": "string"
  }
  ```
- **Future AI Compatibility**: High. Triggers predictive lifecycle and depreciation models.
- **Notification Compatibility**: Medium. May alert Finance for capitalization.
- **Audit Compatibility**: High. Forms the genesis record of the asset lifecycle.

### DE-002: AssetAllocated
- **Event Name**: `AssetAllocated`
- **Ownership**: Asset Allocation Module
- **Triggering Conditions**: Emitted when an asset is successfully assigned to an employee or department.
- **Payload Structure**:
  ```json
  {
    "eventId": "uuid",
    "timestamp": "ISO8601",
    "allocationId": "uuid",
    "assetId": "uuid",
    "assigneeId": "uuid",
    "allocatorId": "uuid"
  }
  ```
- **Future AI Compatibility**: Medium. Feeds into utilization and employee productivity analytics.
- **Notification Compatibility**: High. Triggers email/push to the assignee confirming receipt.
- **Audit Compatibility**: High. Proof of custody transfer.

### DE-003: InventoryUpdated
- **Event Name**: `InventoryUpdated`
- **Ownership**: Inventory Module
- **Triggering Conditions**: Emitted on any stock adjustment (manual, transfer, or goods receipt).
- **Payload Structure**:
  ```json
  {
    "eventId": "uuid",
    "timestamp": "ISO8601",
    "warehouseId": "uuid",
    "itemId": "uuid",
    "quantityDelta": "integer",
    "newQuantity": "integer",
    "reason": "string"
  }
  ```
- **Future AI Compatibility**: Critical. Feeds directly into demand forecasting and stock optimization AI models.
- **Notification Compatibility**: Low (unless triggering thresholds).
- **Audit Compatibility**: High. Tracks inventory shrinkage or unauthorized adjustments.

### DE-004: InventoryBelowThreshold
- **Event Name**: `InventoryBelowThreshold`
- **Ownership**: Inventory Intelligence Module
- **Triggering Conditions**: Emitted when `InventoryUpdated` results in `newQuantity` dropping below the item's configured `reorderPoint`.
- **Payload Structure**:
  ```json
  {
    "eventId": "uuid",
    "timestamp": "ISO8601",
    "itemId": "uuid",
    "warehouseId": "uuid",
    "currentQuantity": "integer",
    "reorderPoint": "integer"
  }
  ```
- **Future AI Compatibility**: High. Prompts AI agents to automatically generate Purchase Requests.
- **Notification Compatibility**: Critical. Alerts Warehouse/Procurement Managers immediately.
- **Audit Compatibility**: Low (Operational event, not a security event).

### DE-005: PurchaseOrderApproved
- **Event Name**: `PurchaseOrderApproved`
- **Ownership**: Procurement Module
- **Triggering Conditions**: Emitted when an authorized manager approves a pending PO.
- **Payload Structure**:
  ```json
  {
    "eventId": "uuid",
    "timestamp": "ISO8601",
    "poId": "uuid",
    "approverId": "uuid",
    "totalAmount": "decimal",
    "supplierId": "uuid"
  }
  ```
- **Future AI Compatibility**: High. Tracks supplier spending velocity and budget forecasting.
- **Notification Compatibility**: High. Alerts the original requester and the supplier (via ERP integration).
- **Audit Compatibility**: Critical. Financial compliance and segregation of duties tracking.

### DE-006: MaintenanceCompleted
- **Event Name**: `MaintenanceCompleted`
- **Ownership**: Maintenance Module
- **Triggering Conditions**: Emitted when a field technician closes a maintenance ticket.
- **Payload Structure**:
  ```json
  {
    "eventId": "uuid",
    "timestamp": "ISO8601",
    "maintenanceId": "uuid",
    "assetId": "uuid",
    "technicianId": "uuid",
    "cost": "decimal",
    "resolutionCode": "string"
  }
  ```
- **Future AI Compatibility**: Critical. Directly trains the Predictive Maintenance ML models.
- **Notification Compatibility**: Medium. Alerts the primary user that their asset is repaired.
- **Audit Compatibility**: Medium. Tracks repair costs against capitalization.

### DE-007: NotificationRequested
- **Event Name**: `NotificationRequested`
- **Ownership**: Shared/Cross-cutting
- **Triggering Conditions**: Emitted by any module requiring an outbound communication to be processed asynchronously.
- **Payload Structure**:
  ```json
  {
    "eventId": "uuid",
    "timestamp": "ISO8601",
    "channel": "EMAIL | PUSH | IN_APP",
    "recipientId": "uuid",
    "templateId": "string",
    "templateData": "json"
  }
  ```
- **Future AI Compatibility**: Low.
- **Notification Compatibility**: Critical. This is the integration boundary for the entire Notification Platform.
- **Audit Compatibility**: Medium. Logs communication delivery attempts.
