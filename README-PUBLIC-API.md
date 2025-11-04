# Public Survey API - Setup & Testing Guide

## 🚀 Quick Test (No Auth Required!)

### Option 1: Test with Postman

1. Import the collection: `postman/survey-api.postman_collection.json`
2. Use these endpoints (NO headers needed):
   - **Get All Surveys**: `GET https://egllomaxaoixlrowpcqd.supabase.co/functions/v1/public-surveys`
   - **Get Survey + Questions**: `GET https://egllomaxaoixlrowpcqd.supabase.co/functions/v1/public-surveys?survey_id=survey-001`

### Option 2: Test with cURL

```bash
# Get all surveys
curl "https://egllomaxaoixlrowpcqd.supabase.co/functions/v1/public-surveys"

# Get specific survey with questions
curl "https://egllomaxaoixlrowpcqd.supabase.co/functions/v1/public-surveys?survey_id=survey-001"
```

⚠️ **Note**: If you get 401 errors, the RLS policies need to be configured. The edge function uses service role internally to bypass authentication requirements.

## 📋 Available Test Data

- `survey-001` - Customer Satisfaction Survey (5 questions)
- `survey-002` - Product Feedback Survey (4 questions)
- `survey-003` - Employee Engagement Survey (5 questions)

## 🔧 Setup Instructions (If needed)

### 1. Database Setup (RLS Policies)

If you get authentication errors, run this SQL in your Supabase Dashboard:

```sql
-- Run the setup-public-rls.sql script
```

### 2. Edge Functions Available

- **`public-surveys-anon`** ✅ - Uses anonymous key (recommended)
- **`public-surveys`** - Uses service role key (fallback)
- **`get-survey-questions`** - Original (may require auth)

### 3. Testing Endpoints

#### Get All Surveys

```
GET https://egllomaxaoixlrowpcqd.supabase.co/functions/v1/public-surveys-anon
```

Response:

```json
{
  "success": true,
  "surveys": [
    {
      "id": "survey-001",
      "title": "Customer Satisfaction Survey",
      "description": "Help us improve our services",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "message": "Add ?survey_id=<id> to get questions"
}
```

#### Get Survey with Questions

```
GET https://egllomaxaoixlrowpcqd.supabase.co/functions/v1/public-surveys-anon?survey_id=survey-001
```

Response:

```json
{
  "success": true,
  "survey": {
    "id": "survey-001",
    "title": "Customer Satisfaction Survey",
    "description": "Help us improve our services",
    "questions": [
      {
        "id": "q1",
        "title": "How satisfied are you overall?",
        "type": "scale",
        "options": { "min": 1, "max": 5 },
        "required": true,
        "order_index": 1
      }
    ],
    "question_count": 1
  }
}
```

## 🐛 Troubleshooting

### Error: "Missing authorization header"

1. Use `public-surveys-anon` endpoint (not `public-surveys`)
2. Run the RLS setup SQL: `scripts/setup-public-rls.sql`
3. Ensure no auth headers in your request

### Error: "Survey not found"

- Use valid survey IDs: `survey-001`, `survey-002`, or `survey-003`
- Check that sample data was inserted properly

### Error: "Failed to fetch surveys"

- Run the RLS policies setup script
- Check Supabase project is active
- Verify the edge function deployed correctly

## 📁 File Structure

```
d:\Projects\MERCTECH\ency-survey\
├── supabase/functions/
│   ├── public-surveys-anon/     ← 🎯 Main endpoint (anonymous)
│   ├── public-surveys/          ← Fallback (service role)
│   └── get-survey-questions/    ← Original
├── postman/
│   └── survey-api.postman_collection.json  ← Import this!
├── scripts/
│   ├── setup-public-rls.sql     ← Run if auth issues
│   └── test-public-api.sh       ← Automated test script
└── README-PUBLIC-API.md         ← This file
```

## 🚀 Next Steps

1. Test the endpoints in Postman
2. Integrate with your frontend application
3. No authentication required - just call the URLs directly!

---

**Project**: Next.js Survey Backend with Supabase  
**Status**: ✅ Ready for Testing  
**Auth Required**: ❌ None (Public API)
