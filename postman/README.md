# Postman Collection - Survey Forms API Testing

This directory contains Postman collection and environment files for comprehensive API testing.

## 📁 Files

- **`survey-forms-modular-api.postman_collection.json`** - Complete API collection
- **`survey-forms-environment.postman_environment.json`** - Environment variables
- **`README.md`** - This guide

## 🚀 Quick Setup

### 1. Import Collection & Environment

**In Postman:**

1. Click **Import**
2. Drag & drop both JSON files
3. Select **Survey Forms - Local Development** environment

### 2. Start Your Server

Make sure your Next.js server is running:

```bash
cd ency-survey
npm run dev
```

### 3. Deploy Database (If Not Done)

Run the database scripts first:

```bash
# In Supabase SQL Editor, run:
# 1. modular-schema-setup.sql
# 2. insert-fitness-form-data.sql
# 3. insert-fitness-form-data-part2.sql
```

## 🧪 **Testing the 3 Question Querying Options**

### **Option 1: Get ALL Questions**

📍 **Request:** `Questions API - 3 Querying Options` → `🎯 Option 1: Get ALL Questions`

- **What it does:** Returns all 74 questions from all 10 sections
- **Use case:** Complete form rendering

### **Option 2: Get Specific Sections**

📍 **Requests:**

- `🔍 Option 2: Get Questions - Basic Info Only`
- `🔍 Option 2: Get Questions - Multiple Sections`
- **What it does:** Returns questions only from specified sections
- **Use case:** Multi-step forms, section-by-section loading

### **Option 3: Get Paginated Questions**

📍 **Requests:**

- `📄 Option 3: Get Questions - Page 1 (10 items)`
- `📄 Option 3: Get Questions - Page 2 (5 items)`
- **What it does:** Returns questions with pagination
- **Use case:** Performance optimization, progressive loading

### **Combined: Sections + Pagination**

📍 **Request:** `🔀 Combined: Sections + Pagination`

- **What it does:** Filter by sections AND paginate results
- **Use case:** Complex UIs with both filtering and pagination

## 📋 **Complete Test Sequence**

### **Recommended Testing Order:**

1. **📋 Forms API**

   - `Get Complete Form Structure` - Verify form exists
   - `Get Form - Not Found` - Test error handling

2. **❓ Questions API (The 3 Options)**

   - `🎯 Option 1: Get ALL Questions` - Test complete retrieval
   - `🔍 Option 2: Basic Info Only` - Test single section
   - `🔍 Option 2: Multiple Sections` - Test multi-section filtering
   - `📄 Option 3: Page 1 & Page 2` - Test pagination
   - `🔀 Combined` - Test section + pagination
   - `❌ Error Test` - Test invalid form ID

3. **📝 Responses API**

   - `Submit Form Response (With User ID)` - Test user tracking
   - `Submit Form Response (Anonymous)` - Test anonymous submission
   - `Get All Responses for Form` - Verify submissions
   - `Get Responses for Specific User` - Test user filtering
   - Error tests for validation

4. **🧪 Integration Tests**
   - Run workflow tests to simulate real usage

## ✅ **Expected Results**

### **Option 1 Response:**

```json
{
  "questions": [...], // All 74 questions
  "pagination": {"total": 74, "page": 1},
  "metadata": {"query_type": "all_sections"}
}
```

### **Option 2 Response (Sections):**

```json
{
  "questions": [...], // Only questions from specified sections
  "metadata": {
    "query_type": "filtered_sections",
    "sections_requested": ["basic_info", "body_metrics"]
  }
}
```

### **Option 3 Response (Pagination):**

```json
{
  "questions": [...], // Limited by page size
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 74,
    "has_next": true
  }
}
```

## 🔧 **Troubleshooting**

### **Common Issues:**

**❌ "Form not found"**

- Solution: Run database insert scripts first
- Check: `fitness-form-v1` exists in forms table

**❌ "Connection refused"**

- Solution: Start Next.js server (`npm run dev`)
- Check: Server running on `localhost:3000`

**❌ "Database connection error"**

- Solution: Check Supabase environment variables
- Verify: `.env.local` has correct Supabase credentials

**❌ "No questions returned"**

- Solution: Run `insert-fitness-form-data.sql` scripts
- Verify: Questions table populated with 74 questions

### **Environment Variables Check:**

Make sure these are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📊 **Performance Expectations**

- **Complete form structure:** < 500ms
- **All questions (74 items):** < 300ms
- **Paginated queries:** < 200ms
- **Filtered sections:** < 200ms
- **Response submission:** < 300ms

## 🎯 **Testing Scenarios**

### **Scenario 1: Multi-Step Form**

1. Get sections: `basic_info,body_metrics`
2. Submit partial response
3. Get next sections: `medical_health,lifestyle`
4. Continue workflow

### **Scenario 2: Progressive Loading**

1. Get page 1 (10 questions)
2. User fills form
3. Get page 2 (next 10 questions)
4. Continue until complete

### **Scenario 3: Section-Specific Updates**

1. Get medical questions only
2. Update medical responses
3. Keep other sections unchanged

All test scenarios are included in the **🧪 Integration Tests** folder!

## 🎉 **Ready to Test!**

The collection includes:

- ✅ **21 different API requests**
- ✅ **All 3 question querying options**
- ✅ **Error handling tests**
- ✅ **Integration workflows**
- ✅ **Performance tests**
- ✅ **Automated test scripts**

Start with the **Forms API** folder and work your way through each section! 🚀
