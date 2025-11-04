# Quick API Reference - 3 Question Querying Options

## 🎯 **The 3 Question Querying Options You Requested**

### **Option 1: Get All Questions for Form**

```bash
GET /api/forms/{id}/questions
```

**Example:** `/api/forms/fitness-form-v1/questions`

- Returns ALL questions from ALL sections
- Questions include section context
- Maintains original order from sections

### **Option 2: Get Questions for Specific Sections**

```bash
GET /api/forms/{id}/questions?sections=section1,section2
```

**Example:** `/api/forms/fitness-form-v1/questions?sections=basic_info,body_metrics`

- Returns questions ONLY from specified sections
- Filter by comma-separated section IDs
- Useful for multi-step forms

### **Option 3: Get Paginated Questions**

```bash
GET /api/forms/{id}/questions?page=1&limit=10
```

**Example:** `/api/forms/fitness-form-v1/questions?page=2&limit=20`

- Returns questions with pagination
- Default: page=1, limit=50
- Includes pagination metadata

### **🔀 Combined Options**

```bash
GET /api/forms/{id}/questions?sections=medical_health,lifestyle&page=1&limit=5
```

- Combine section filtering with pagination
- Get specific sections in smaller chunks
- Perfect for progressive loading

---

## 📊 **Response Structure**

All 3 options return the same structure:

```json
{
  "questions": [
    {
      "question_id": "full_name",
      "type": "text",
      "label": "Họ và tên",
      "validation": { "required": true },
      "section_context": {
        "section_id": "basic_info",
        "section_title": "Phần 1: Thông tin cơ bản"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 74,
    "has_next": true
  },
  "metadata": {
    "form_id": "fitness-form-v1",
    "query_type": "all_sections|filtered_sections",
    "sections_included": ["basic_info", "body_metrics"]
  }
}
```

---

## 🚀 **Additional APIs Created**

### **Get Complete Form Structure**

```bash
GET /api/forms/{id}
```

- Returns form with ALL sections and questions nested
- Perfect for rendering complete forms

### **Submit Form Response**

```bash
POST /api/responses
```

- Submit completed form with user_id support
- Accepts answers object with question_id keys

### **Get Form Responses**

```bash
GET /api/responses?form_id={id}&user_id={uuid}&page=1&limit=20
```

- Retrieve submitted responses with filtering
- Supports pagination and user filtering

---

## ✅ **Ready to Use!**

1. **Deploy your database schema:** Run the SQL scripts
2. **Start your Next.js server:** `npm run dev`
3. **Test the APIs:** Use the provided test script
4. **Build your frontend:** Use any of the 3 question querying options

The APIs are designed for maximum flexibility - you can build simple single-page forms, complex multi-step wizards, or progressive loading interfaces! 🎯
