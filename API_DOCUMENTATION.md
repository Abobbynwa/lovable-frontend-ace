# API Documentation - School Management System

Base URL: `https://<your-project-id>.supabase.co/functions/v1`

All authenticated endpoints require an `Authorization` header with a valid JWT token:
```
Authorization: Bearer <your-jwt-token>
```

## Authentication

### 1. Register Student

Creates a new student account with email verification.

**Endpoint:** `POST /register-student`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "rollNumber": "2024001",
  "classId": "uuid-of-class", // optional
  "guardianId": "uuid-of-guardian", // optional
  "redirectUrl": "https://your-app.com/verify" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student registered successfully. Please check email for verification link.",
  "userId": "uuid"
}
```

**Status Codes:**
- 200: Success
- 400: Validation error or registration failed

---

### 2. Register Parent

Creates a new parent/guardian account with student linking.

**Endpoint:** `POST /register-parent`

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!",
  "name": "Jane Doe",
  "phone": "+1234567890", // optional
  "studentIds": ["student-uuid-1", "student-uuid-2"], // optional
  "redirectUrl": "https://your-app.com/verify" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parent registered successfully. Please check email for verification link.",
  "userId": "uuid",
  "guardianId": "uuid"
}
```

**Status Codes:**
- 200: Success
- 400: Validation error or registration failed

---

### 3. Verify Email

Validates email verification token and activates account.

**Endpoint:** `POST /verify-email`

**Request Body:**
```json
{
  "token": "verification-token-string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid or expired token

---

## Attendance Management

### 4. Mark Attendance

Records or updates attendance for multiple students.

**Endpoint:** `POST /mark-attendance`

**Authentication:** Required (Teacher or Admin)

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "records": [
    {
      "studentId": "uuid",
      "status": "present"
    },
    {
      "studentId": "uuid",
      "status": "absent"
    }
  ],
  "date": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked for 2 students",
  "data": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "date": "2024-01-15",
      "status": "present",
      "teacher_id": "uuid",
      "recorded_by": "uuid"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 401: Unauthorized

**Notes:**
- Uses upsert logic: updates existing records for same student+date
- Only teachers and admins can mark attendance
- Records who marked the attendance

---

## Results Management

### 5. Record Result

Records or updates a student's result for a subject.

**Endpoint:** `POST /record-result`

**Authentication:** Required (Teacher or Admin)

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "studentId": "uuid",
  "subject": "Mathematics",
  "score": 85
}
```

**Response:**
```json
{
  "success": true,
  "message": "Result recorded successfully",
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "subject": "Mathematics",
    "score": 85,
    "grade": "A",
    "teacher_id": "uuid",
    "recorded_by": "uuid",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Grading Scale:**
- 90-100: A+
- 80-89: A
- 70-79: B
- 60-69: C
- 50-59: D
- 0-49: F

**Status Codes:**
- 200: Success
- 400: Validation error (score must be 0-100)
- 401: Unauthorized

**Notes:**
- Grade is calculated server-side
- Uses upsert logic: updates existing result for same student+subject

---

## Class Management

### 6. Create Class

Creates a new class with optional teacher assignment.

**Endpoint:** `POST /create-class`

**Authentication:** Required (Admin only)

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Grade 10-A",
  "teacherId": "uuid" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "id": "uuid",
    "name": "Grade 10-A",
    "teacher_id": "uuid",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (not admin)

---

## Bulk Operations

### 7. Bulk Import Students

Imports multiple students from CSV/JSON data.

**Endpoint:** `POST /bulk-import-students`

**Authentication:** Required (Admin only)

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "students": [
    {
      "email": "student1@example.com",
      "password": "Pass123!",
      "name": "Student One",
      "rollNumber": "2024001",
      "classId": "uuid" // optional
    },
    {
      "email": "student2@example.com",
      "password": "Pass123!",
      "name": "Student Two",
      "rollNumber": "2024002",
      "classId": "uuid" // optional
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Imported 2 students. 0 failed.",
  "results": [
    {
      "email": "student1@example.com",
      "userId": "uuid",
      "success": true
    },
    {
      "email": "student2@example.com",
      "userId": "uuid",
      "success": true
    }
  ],
  "errors": []
}
```

**Status Codes:**
- 200: Success (even with partial failures)
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (not admin)

**Notes:**
- Verification emails sent asynchronously (non-blocking)
- Returns both successful imports and errors
- Continues processing even if some students fail

---

## Notifications

### 8. Send Notification

Sends in-app and/or email notifications to users.

**Endpoint:** `POST /send-notification`

**Authentication:** Required (Teacher or Admin)

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "title": "Important Announcement",
  "message": "School will be closed tomorrow due to weather conditions.",
  "type": "warning", // optional: 'info', 'warning', 'success', 'error'
  "sendEmail": true // optional: default false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to 3 users",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Important Announcement",
      "message": "School will be closed tomorrow...",
      "type": "warning",
      "read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 401: Unauthorized

**Notes:**
- In-app notifications always created
- Email notifications sent if `sendEmail: true`
- Email failures don't block the response

---

## Error Responses

All endpoints follow a consistent error format:

```json
{
  "error": "Detailed error message"
}
```

**Common Error Status Codes:**
- 400: Bad Request - Validation error or invalid input
- 401: Unauthorized - Missing or invalid authentication token
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource doesn't exist
- 500: Internal Server Error - Unexpected server error

---

## Rate Limiting

**Recommendations:**
- Authentication endpoints: 5 requests per minute per IP
- Email sending: 10 requests per hour per user
- Bulk operations: 1 request per minute per user
- General API: 100 requests per minute per user

*Note: Rate limiting is not currently implemented but should be added for production.*

---

## Webhook Events

The system supports webhooks for:
- User registration
- Email verification
- Attendance marked
- Results recorded
- Notifications sent

Configure webhooks in the Lovable Cloud dashboard.

---

## Testing

### Postman Collection

Import the Postman collection from `/docs/postman_collection.json` for easy testing.

### Example: Using cURL

**Register a student:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/register-student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test Student",
    "rollNumber": "TEST001"
  }'
```

**Mark attendance (authenticated):**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/mark-attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "records": [
      {"studentId": "uuid", "status": "present"}
    ],
    "date": "2024-01-15"
  }'
```

---

## SDK Integration

### JavaScript/TypeScript

```typescript
import { supabase } from '@/integrations/supabase/client';

// Get authentication token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Call edge function
const { data, error } = await supabase.functions.invoke('mark-attendance', {
  body: {
    records: [
      { studentId: 'uuid', status: 'present' }
    ],
    date: '2024-01-15'
  },
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

## Support

For API issues or questions:
- GitHub Issues: [your-repo]/issues
- Email: api-support@yourschool.com
- Documentation: https://your-docs-site.com
