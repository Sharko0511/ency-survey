# API Documentation - Survey Forms System

This document describes the RESTful API endpoints for the modular survey forms system.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses Supabase Row Level Security (RLS) policies. No authentication is required for public form access.

---

## **Forms API**

### **Get Complete Form Structure**

Retrieves a complete form with all sections and questions in the correct order.

**Endpoint:** `GET /api/forms/{id}`

**Parameters:**

- `id` (path): Form ID (e.g., "fitness-form-v1")

**Response:**

```json
{
  "id": "fitness-form-v1",
  "title": "Bảng Câu Hỏi Khách Hàng - Huấn Luyện Cá Nhân",
  "description": "Thu thập thông tin cá nhân, sức khỏe và mục tiêu tập luyện",
  "section_ids": ["basic_info", "body_metrics", "medical_health"],
  "is_active": true,
  "settings": {
    "submitButtonText": "Gửi",
    "successMessage": "Cảm ơn bạn! Huấn luyện viên sẽ liên hệ trong thời gian sớm nhất."
  },
  "sections": [
    {
      "section_id": "basic_info",
      "title": "Phần 1: Thông tin cơ bản",
      "description": "Vui lòng cung cấp thông tin cá nhân của bạn",
      "question_ids": ["full_name", "dob", "age"],
      "questions": [
        {
          "question_id": "full_name",
          "type": "text",
          "label": "Họ và tên",
          "validation": { "required": true }
        }
      ]
    }
  ],
  "total_questions": 74,
  "total_sections": 10
}
```

---

## **Questions API with 3 Querying Options**

### **Option 1: Get All Questions for Form**

Retrieves all questions for a form, organized by sections.

**Endpoint:** `GET /api/forms/{id}/questions`

**Example:** `GET /api/forms/fitness-form-v1/questions`

### **Option 2: Get Questions for Specific Sections**

Retrieves questions only from specified sections.

**Endpoint:** `GET /api/forms/{id}/questions?sections=section1,section2`

**Parameters:**

- `sections` (query): Comma-separated list of section IDs

**Example:** `GET /api/forms/fitness-form-v1/questions?sections=basic_info,body_metrics`

### **Option 3: Get Paginated Questions**

Retrieves questions with pagination support.

**Endpoint:** `GET /api/forms/{id}/questions?page=1&limit=10`

**Parameters:**

- `page` (query): Page number (default: 1)
- `limit` (query): Questions per page (default: 50)

**Example:** `GET /api/forms/fitness-form-v1/questions?page=2&limit=20`

### **Combined Options**

You can combine section filtering with pagination:

**Example:** `GET /api/forms/fitness-form-v1/questions?sections=medical_health,lifestyle&page=1&limit=5`

### **Response Format (All Options):**

```json
{
  "questions": [
    {
      "question_id": "full_name",
      "type": "text",
      "label": "Họ và tên",
      "description": null,
      "options": null,
      "validation": { "required": true },
      "conditional": null,
      "section_context": {
        "section_id": "basic_info",
        "section_title": "Phần 1: Thông tin cơ bản",
        "category": "personal"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 74,
    "total_pages": 4,
    "has_next": true,
    "has_prev": false
  },
  "metadata": {
    "form_id": "fitness-form-v1",
    "sections_included": ["basic_info", "body_metrics"],
    "sections_requested": ["basic_info", "body_metrics"],
    "total_questions": 74,
    "query_type": "filtered_sections"
  }
}
```

---

## **Responses API**

### **Submit Form Response**

Submits a completed form response with user ID support.

**Endpoint:** `POST /api/responses`

**Request Body:**

```json
{
  "form_id": "fitness-form-v1",
  "user_id": "123e4567-e89b-12d3-a456-426614174000", // Optional - UUID format
  "answers": {
    "full_name": "Nguyễn Văn A",
    "age": 25,
    "email": "nguyen@example.com",
    "height": 175,
    "weight": 70
  },
  "metadata": {
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "completion_time_seconds": 300
  }
}
```

**Response:**

```json
{
  "success": true,
  "response_id": "123e4567-e89b-12d3-a456-426614174000",
  "submitted_at": "2023-11-04T10:30:00.000Z",
  "message": "Response submitted successfully"
}
```

### **Get Form Responses**

Retrieves submitted form responses with filtering and pagination.

**Endpoint:** `GET /api/responses`

**Query Parameters:**

- `form_id` (optional): Filter by specific form
- `user_id` (optional): Filter by specific user
- `page` (optional): Page number (default: 1)
- `limit` (optional): Responses per page (default: 20)

**Examples:**

- `GET /api/responses?form_id=fitness-form-v1`
- `GET /api/responses?user_id=123e4567-e89b-12d3-a456-426614174000`
- `GET /api/responses?form_id=fitness-form-v1&page=2&limit=10`

**Response:**

```json
{
  "responses": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "form_id": "fitness-form-v1",
      "user_id": "456e7890-e89b-12d3-a456-426614174000",
      "answers": {
        "full_name": "Nguyễn Văn A",
        "age": 25
      },
      "submitted_at": "2023-11-04T10:30:00.000Z",
      "metadata": {}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "filters": {
    "form_id": "fitness-form-v1",
    "user_id": null
  }
}
```

---

## **Error Responses**

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "details": "Additional technical details (optional)"
}
```

**HTTP Status Codes:**

- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (validation errors)
- `404`: Not Found (form/resource not found)
- `500`: Internal Server Error

---

## **CORS Support**

All endpoints include CORS headers for cross-origin requests:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

---

## **Usage Examples**

### **1. Display a Complete Form**

```javascript
// Get complete form structure for rendering
const response = await fetch("/api/forms/fitness-form-v1");
const formData = await response.json();

// formData.sections contains all sections with questions in order
formData.sections.forEach((section) => {
  console.log(`Section: ${section.title}`);
  section.questions.forEach((question) => {
    console.log(`  - ${question.label} (${question.type})`);
  });
});
```

### **2. Load Questions Progressively**

```javascript
// Load first page of questions
const page1 = await fetch(
  "/api/forms/fitness-form-v1/questions?page=1&limit=10"
);
const questionsData = await page1.json();

// Load questions from specific sections only
const healthQuestions = await fetch(
  "/api/forms/fitness-form-v1/questions?sections=medical_health,lifestyle"
);
const healthData = await healthQuestions.json();
```

### **3. Submit Form Response**

```javascript
// Submit complete form
const response = await fetch("/api/responses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    form_id: "fitness-form-v1",
    user_id: "user-uuid", // Optional
    answers: {
      full_name: "Nguyễn Văn A",
      age: 25,
      email: "nguyen@example.com",
    },
  }),
});

const result = await response.json();
if (result.success) {
  console.log("Response submitted:", result.response_id);
}
```

This API provides complete flexibility for building survey forms with the 3 question querying options as specified! 🎯
