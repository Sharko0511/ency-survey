# Survey Backend API - Public Access Guide ✅

## 🚀 Quick Test (No Auth Required!)

### ✅ Working Solution: Next.js API Routes

The API is now running as a Next.js backend server with **truly public endpoints** - no authentication required!

### How to Start

```bash
cd d:\Projects\MERCTECH\ency-survey
npm run dev
# Server runs on http://localhost:3000
```

### ⚠️ IMPORTANT: Update Database Schema First!

**Before testing, run the complete setup script in Supabase Dashboard:**

1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste: `scripts/complete-simple-ids-setup.sql`
3. Run the script to update schema from UUID to TEXT and insert simple IDs
4. ⚠️ **This will clear existing data and recreate with simple IDs**

### Option 1: Test with Postman

1. Import the collection: `postman/survey-api.postman_collection.json`
2. Make sure the server is running (`npm run dev`)
3. Use these endpoints (NO headers needed):
   - **Get All Surveys**: `GET http://localhost:3000/api/surveys`
   - **Get Survey + Questions**: `GET http://localhost:3000/api/surveys?survey_id=s1`
   - **Submit Response**: `POST http://localhost:3000/api/responses`

### Option 2: Test with cURL

```bash
# Get all surveys
curl "http://localhost:3000/api/surveys"

# Get specific survey with questions (now using simple IDs!)
curl "http://localhost:3000/api/surveys?survey_id=s1"

# Submit a response (simple IDs!)
curl -X POST "http://localhost:3000/api/responses" \
  -H "Content-Type: application/json" \
  -d '{
    "survey_id": "s1",
    "answers": {
      "q1": 4,
      "q2": "Enterprise Client",
      "q3": ["Customer Support", "Online Platform"],
      "q4": true,
      "q5": "Great service overall!"
    },
    "respondent_info": {
      "ip_address": "192.168.1.1"
    }
  }'
```

## 📋 Available Test Data

### Simple IDs Available (After running the SQL script):

**Surveys:**

- `s1` - Customer Satisfaction Survey (5 questions: q1-q5)
- `s2` - Product Feedback Survey (4 questions: q6-q9)
- `s3` - Employee Engagement Survey (5 questions: q10-q14)

**Questions:**

- `q1-q5` - Customer satisfaction questions
- `q6-q9` - Product feedback questions
- `q10-q14` - Employee engagement questions

### Sample API Responses:

#### Get All Surveys Response:

```json
{
  "success": true,
  "surveys": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "title": "Customer Satisfaction Survey 2025",
      "description": "Help us improve our services by sharing your feedback",
      "created_at": "2025-11-04T04:04:38.807555+00:00",
      "settings": {
        "theme": "modern",
        "show_progress": true,
        "allow_anonymous": true
      }
    }
  ],
  "total": 2,
  "message": "Add ?survey_id=<id> to get questions",
  "available_surveys": [
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222222"
  ]
}
```

#### Get Survey with Questions Response (All Questions):

```json
{
  "success": true,
  "survey": {
    "id": "11111111-1111-1111-1111-111111111111",
    "title": "Customer Satisfaction Survey 2025",
    "questions": [
      {
        "id": "0cbbd89e-9e1d-4205-82cc-3c4e7e02296e",
        "type": "rating",
        "title": "How satisfied are you with our overall service?",
        "options": {
          "min": 1,
          "max": 5,
          "labels": {
            "1": "Very Dissatisfied",
            "5": "Very Satisfied"
          }
        },
        "required": true,
        "order_index": 1
      }
    ],
    "question_count": 7
  }
}
```

#### Get Survey with Paginated Questions Response:

```json
{
  "success": true,
  "survey": {
    "id": "11111111-1111-1111-1111-111111111111",
    "title": "Customer Satisfaction Survey 2025",
    "questions": [
      {
        "id": "0cbbd89e-9e1d-4205-82cc-3c4e7e02296e",
        "type": "rating",
        "title": "How satisfied are you with our overall service?",
        "required": true,
        "order_index": 1
      }
    ],
    "question_count": 3
  },
  "pagination": {
    "current_page": 1,
    "per_page": 3,
    "total_questions": 7,
    "total_pages": 3,
    "has_next_page": true,
    "has_prev_page": false,
    "next_page": 2,
    "prev_page": null
  }
}
```

## 🎯 API Endpoints

| Method | Endpoint                                      | Description                         | Auth Required |
| ------ | --------------------------------------------- | ----------------------------------- | ------------- |
| GET    | `/api/surveys`                                | Get all active surveys              | ❌ None       |
| GET    | `/api/surveys?survey_id=<id>`                 | Get survey with ALL questions       | ❌ None       |
| GET    | `/api/surveys?survey_id=<id>&page=1&limit=10` | Get survey with paginated questions | ❌ None       |
| POST   | `/api/responses`                              | Submit survey response              | ❌ None       |
| POST   | `/api/surveys`                                | Create new survey                   | ❌ None       |

### 📄 Pagination Parameters

- **`page`**: Page number (starts from 1, default: 1)
- **`limit`**: Questions per page (1-100, default: 10)

### 📄 Pagination Examples

```bash
# Get first 5 questions
curl "http://localhost:3000/api/surveys?survey_id=11111111-1111-1111-1111-111111111111&page=1&limit=5"

# Get next 5 questions
curl "http://localhost:3000/api/surveys?survey_id=11111111-1111-1111-1111-111111111111&page=2&limit=5"

# Get 20 questions per page
curl "http://localhost:3000/api/surveys?survey_id=11111111-1111-1111-1111-111111111111&page=1&limit=20"
```

## 🔧 Technical Details

### Why This Works:

- **Next.js API Routes**: Run on the server, can use service role keys safely
- **Public Access**: No authentication checks in the route handlers
- **CORS Enabled**: All endpoints include proper CORS headers
- **Service Role**: Uses `SUPABASE_SERVICE_ROLE_KEY` internally to bypass RLS

### Environment Variables Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://egllomaxaoixlrowpcqd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Deployment:

- **Local Development**: `npm run dev` (http://localhost:3000)
- **Production**: Deploy to Vercel, Netlify, or any Node.js hosting
- **API Base URL**: Update Postman collection with your deployed URL

## 🐛 Troubleshooting

### Server Not Starting?

```bash
npm install
npm run dev
```

### Environment Variables Missing?

Check your `.env.local` file has the required Supabase credentials.

### CORS Issues?

The API includes proper CORS headers. If testing from a browser, make sure you're not blocking cross-origin requests.

## 📁 Project Structure

```
d:\Projects\MERCTECH\ency-survey\
├── app/api/
│   ├── surveys/route.ts      ← 🎯 Main survey API
│   └── responses/route.ts    ← 🎯 Response submission API
├── postman/
│   └── survey-api.postman_collection.json  ← Import this!
└── README-PUBLIC-API.md      ← This file
```

## 🚀 Production Deployment

1. **Deploy to Vercel**: `vercel --prod`
2. **Update Postman**: Change `api_base_url` to your production URL
3. **Test**: Your API will work exactly the same, just with a different base URL

---

**Status**: ✅ **WORKING** - No Authentication Required!  
**Server**: Next.js API Routes  
**Database**: Supabase PostgreSQL  
**Auth**: Public Access (Service Role Key internally)

🎉 **Ready for frontend integration!**
