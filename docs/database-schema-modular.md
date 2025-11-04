# Database Schema Design - Modular Form System

## 📊 Overview

A modular, reusable form system with 3 independent tables connected via array references instead of foreign keys. This design maximizes flexibility and reusability.

## 🏗️ Database Structure

### **Forms Table**

Stores form metadata and references to sections via array.

```sql
forms:
├── id (TEXT PRIMARY KEY)                    -- "fitness-form-v1"
├── title (TEXT NOT NULL)                    -- "Bảng Câu Hỏi Khách Hàng - Huấn Luyện Cá Nhân"
├── description (TEXT)                       -- "Thu thập thông tin cá nhân, sức khỏe và mục tiêu tập luyện"
├── section_ids (TEXT[])                     -- ["sec1", "sec2", "sec3", ...]
├── submit_button_text (TEXT DEFAULT 'Submit') -- "Gửi"
├── is_active (BOOLEAN DEFAULT true)
├── settings (JSONB DEFAULT '{}')            -- Additional form configuration
├── created_at (TIMESTAMP WITH TIME ZONE)
└── updated_at (TIMESTAMP WITH TIME ZONE)
```

### **Sections Table**

Independent sections that can be reused across multiple forms.

```sql
sections:
├── section_id (TEXT PRIMARY KEY)            -- "sec1", "basic_info", "health_section"
├── title (TEXT NOT NULL)                    -- "Phần 1: Thông tin cơ bản"
├── description (TEXT)                       -- "Vui lòng cung cấp thông tin cá nhân của bạn"
├── question_ids (TEXT[])                    -- ["full_name", "dob", "email", "phone"]
├── category (TEXT)                          -- "personal", "health", "fitness" (optional grouping)
├── tags (TEXT[])                            -- ["basic", "required", "personal"] (for searching)
├── created_at (TIMESTAMP WITH TIME ZONE)
└── updated_at (TIMESTAMP WITH TIME ZONE)
```

### **Questions Table**

Independent question bank that can be referenced from any section.

```sql
questions:
├── question_id (TEXT PRIMARY KEY)           -- "full_name", "email", "height"
├── type (TEXT NOT NULL)                     -- "text", "email", "number", "select", "radio", "checkbox", "date", "textarea", "tel"
├── label (TEXT NOT NULL)                    -- "Họ và tên", "Email", "Chiều cao (cm)"
├── description (TEXT)                       -- Additional help text
├── options (JSONB)                          -- {"choices": ["Nam", "Nữ"]} for select/radio/checkbox
├── validation (JSONB)                       -- {"min": 50, "max": 250, "required": true}
├── conditional (JSONB)                      -- {"dependsOn": "bf_method", "showWhen": "Công thức số đo"}
├── created_at (TIMESTAMP WITH TIME ZONE)
└── updated_at (TIMESTAMP WITH TIME ZONE)
```

### **Responses Table**

Stores form submissions with answers keyed by question_id.

```sql
responses:
├── id (UUID DEFAULT gen_random_uuid() PRIMARY KEY)
├── form_id (TEXT)                           -- References forms.id (no FK constraint)
├── user_id (UUID)                           -- External user ID from other database
├── answers (JSONB NOT NULL)                 -- {"full_name": "Nguyễn Văn A", "email": "user@example.com"}
├── submitted_at (TIMESTAMP WITH TIME ZONE DEFAULT now())
├── created_at (TIMESTAMP WITH TIME ZONE DEFAULT now())
└── metadata (JSONB)                         -- Additional submission data
```

## 🔄 Relationships

### **Array-Based References (No Foreign Keys)**

```
Forms → section_ids[] → Sections → question_ids[] → Questions
  ↓
Responses (answers keyed by question_id)
```

### **Relationship Flow:**

1. **Form** contains array of section IDs: `["sec1", "sec2", "sec3"]`
2. **Section** contains array of question IDs: `["full_name", "email", "phone"]`
3. **Questions** are independent, referenced by their `question_id`
4. **Responses** store answers using `question_id` as keys

## 🎯 Benefits

### **Maximum Reusability**

- ✅ **Questions** can be used in multiple sections across different forms
- ✅ **Sections** can be reused in multiple forms
- ✅ **Forms** can mix and match existing sections

### **Flexibility**

- ✅ **No FK constraints** - complete freedom to reorganize
- ✅ **Easy reordering** - just update array order
- ✅ **Independent components** - modify one without affecting others

### **Maintainability**

- ✅ **Centralized question definitions** - update once, affects all uses
- ✅ **Modular design** - clear separation of concerns
- ✅ **Searchable components** - tags and categories for easy discovery

## 🚀 Query Patterns

### **Get Complete Form Structure**

```sql
-- 1. Get form
SELECT * FROM forms WHERE id = 'fitness-form-v1';

-- 2. Get sections for this form
SELECT * FROM sections WHERE id = ANY(ARRAY['sec1', 'sec2', 'sec3']);

-- 3. Get questions for each section
SELECT * FROM questions WHERE question_id = ANY(ARRAY['full_name', 'email', 'phone']);
```

### **Build Form Dynamically**

```sql
-- Get form with all components in one query
SELECT
    f.*,
    s.* as section_data,
    q.* as question_data
FROM forms f
CROSS JOIN LATERAL unnest(f.section_ids) AS section_id
JOIN sections s ON s.id = section_id
CROSS JOIN LATERAL unnest(s.question_ids) AS question_id
JOIN questions q ON q.question_id = question_id
WHERE f.id = 'fitness-form-v1'
ORDER BY array_position(f.section_ids, s.id), array_position(s.question_ids, q.question_id);
```

### **Question Querying Options**

#### **Option 1: Get All Questions with Form ID**

Get all questions for a specific form across all sections.

```sql
-- Get all questions for a form
WITH form_questions AS (
  SELECT unnest(s.question_ids) as question_id
  FROM forms f
  CROSS JOIN LATERAL unnest(f.section_ids) AS section_id
  JOIN sections s ON s.section_id = section_id
  WHERE f.id = 'fitness-form-v1'
)
SELECT q.* FROM questions q
JOIN form_questions fq ON q.question_id = fq.question_id
ORDER BY q.question_id;
```

#### **Option 2: Get Questions with Form ID and Section ID Array**

Get questions for specific sections within a form.

```sql
-- Get questions for specific sections in a form
WITH filtered_sections AS (
  SELECT unnest(question_ids) as question_id
  FROM sections
  WHERE section_id = ANY(ARRAY['basic_info', 'body_metrics'])
  AND section_id = ANY((SELECT unnest(section_ids) FROM forms WHERE id = 'fitness-form-v1'))
)
SELECT q.* FROM questions q
JOIN filtered_sections fs ON q.question_id = fs.question_id
ORDER BY q.question_id;
```

#### **Option 3: Get Questions with Form ID + Pagination**

Get questions for a form with limit and offset for pagination.

```sql
-- Get paginated questions for a form (page 1, 10 questions per page)
WITH form_questions AS (
  SELECT
    unnest(s.question_ids) as question_id,
    ROW_NUMBER() OVER (ORDER BY
      array_position((SELECT section_ids FROM forms WHERE id = 'fitness-form-v1'), s.section_id),
      array_position(s.question_ids, unnest(s.question_ids))
    ) as row_num
  FROM forms f
  CROSS JOIN LATERAL unnest(f.section_ids) AS section_id
  JOIN sections s ON s.section_id = section_id
  WHERE f.id = 'fitness-form-v1'
)
SELECT q.* FROM questions q
JOIN form_questions fq ON q.question_id = fq.question_id
WHERE fq.row_num > 0 AND fq.row_num <= 10  -- LIMIT 10 OFFSET 0
ORDER BY fq.row_num;
```

### **Section-Based Pagination**

```sql
-- Get sections 1-3 with their questions
SELECT * FROM sections
WHERE section_id = ANY((SELECT section_ids[1:3] FROM forms WHERE id = 'fitness-form-v1'));
```

## 📝 Example Data

### **Vietnamese Fitness Form Example**

```sql
-- Form
INSERT INTO forms (id, title, description, section_ids) VALUES (
  'fitness-form-v1',
  'Bảng Câu Hỏi Khách Hàng - Huấn Luyện Cá Nhân',
  'Thu thập thông tin cá nhân, sức khỏe và mục tiêu tập luyện',
  ARRAY['basic_info', 'body_metrics', 'medical_health', 'lifestyle']
);

-- Section
INSERT INTO sections (id, title, description, question_ids) VALUES (
  'basic_info',
  'Phần 1: Thông tin cơ bản',
  'Vui lòng cung cấp thông tin cá nhân của bạn',
  ARRAY['full_name', 'dob', 'age', 'gender', 'email', 'phone']
);

-- Questions
INSERT INTO questions (id, question_id, type, label, validation) VALUES
('q1', 'full_name', 'text', 'Họ và tên', '{"required": true}'),
('q2', 'email', 'email', 'Email', '{"required": true}'),
('q3', 'height', 'number', 'Chiều cao (cm)', '{"min": 50, "max": 250, "required": true}');
```

## 🔧 API Endpoints

### **Form Management**

- `GET /api/forms` - List all forms
- `GET /api/forms/{id}` - Get complete form structure
- `GET /api/forms/{id}?sections_only=true` - Get form with sections (no questions)
- `POST /api/forms` - Create new form

### **Question Management (3 Options)**

- `GET /api/forms/{id}/questions` - **Option 1:** Get all questions for a form
- `GET /api/forms/{id}/questions?sections=basic_info,body_metrics` - **Option 2:** Get questions for specific sections
- `GET /api/forms/{id}/questions?page=1&limit=10` - **Option 3:** Get paginated questions for a form

### **Component Management**

- `GET /api/sections` - Browse section library
- `GET /api/sections?category=health` - Filter sections
- `GET /api/questions` - Browse question bank
- `GET /api/questions?category=personal_info` - Filter questions

### **Response Handling**

- `POST /api/responses` - Submit form response
- `GET /api/responses?form_id={id}` - Get form responses

## 🎨 Use Cases

### **Reusable Components**

```sql
-- "Contact Info" section used in multiple forms
section_ids: ["contact_info"]
-- Used in: registration_form, profile_form, survey_form

-- "Email" question used across many sections
question_id: "email"
-- Used in: contact_info, notification_settings, account_setup
```

### **Easy Form Building**

1. **Select existing sections** from library
2. **Customize section order** by arranging array
3. **Add/remove questions** by updating section's question_ids
4. **Create new components** as needed and reuse later

This modular design provides maximum flexibility while maintaining clean, efficient data structures! 🚀
