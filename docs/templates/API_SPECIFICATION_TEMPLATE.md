# API Specification: [Endpoint Path]

## Overview
**Method**: `[GET | POST | PUT | DELETE]`
**Path**: `/api/v1/resource`
**Description**: [What does this endpoint do?]

## Authentication & Authorization
- **Requires Auth**: [Yes/No]
- **Required Roles**: [e.g., Admin, User]

## Request Details
### Parameters
- **Path Parameters**: [e.g., `id: string (UUID)`]
- **Query Parameters**: [e.g., `cursor: string (optional)`]

### Request Body
```json
{
  "field": "string"
}
```

## Response Details
### Success Response (200 OK / 201 Created)
```json
{
  "success": true,
  "data": {}
}
```

### Error Responses
- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Insufficient role
- **404 Not Found**: Resource doesn't exist

## Additional Context
[Rate limiting rules, caching behavior, etc.]
