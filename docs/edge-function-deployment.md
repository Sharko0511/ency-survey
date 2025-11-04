# Deploy Edge Function Guide

## 1. Deploy the Edge Function

```bash
# Deploy the get-survey-questions function
npx supabase functions deploy get-survey-questions

# Or deploy all functions
npx supabase functions deploy
```

## 2. Test the Edge Function

### Your Edge Function URL:

```
https://egllomaxaoixlrowpcqd.supabase.co/functions/v1/get-survey-questions
```

### Postman Test URLs:

#### Get All Surveys:

```
GET https://egllomaxaoixlrowpcqd.supabase.co/functions/v1/get-survey-questions
```

#### Get Specific Survey with Questions:

```
GET https://egllomaxaoixlrowpcqd.supabase.co/functions/v1/get-survey-questions?survey_id=11111111-1111-1111-1111-111111111111
```

## 3. No Authentication Required! 🎉

- **No API keys needed**
- **No Authorization headers**
- **No login required**
- **Completely public access**

## 4. Expected Response Format

### Get All Surveys:

```json
{
  "success": true,
  "surveys": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "title": "Customer Satisfaction Survey 2025",
      "description": "Help us improve our services...",
      "created_at": "2025-11-04T..."
    }
  ],
  "total_surveys": 1,
  "message": "Use ?survey_id=<id> to get questions for a specific survey"
}
```

### Get Survey with Questions:

```json
{
  "success": true,
  "survey": {
    "id": "11111111-1111-1111-1111-111111111111",
    "title": "Customer Satisfaction Survey 2025",
    "description": "Help us improve our services...",
    "settings": {...},
    "questions": [
      {
        "id": "question_uuid_1",
        "title": "How satisfied are you with our service?",
        "type": "rating",
        "options": {"min": 1, "max": 5, "labels": {...}},
        "required": true,
        "order_index": 1
      }
    ]
  },
  "question_count": 7
}
```

## 5. Error Responses

### Survey Not Found:

```json
{
  "error": "Survey not found or not active",
  "survey_id": "invalid-id"
}
```

### Server Error:

```json
{
  "error": "Internal server error",
  "message": "Please try again later"
}
```

## 6. Import to Postman

1. Open Postman
2. Click **Import**
3. Select the file: `postman/survey-api.postman_collection.json`
4. Update the `edge_function_url` variable if needed
5. Test the endpoints!

## 7. CORS Headers

The function includes CORS headers for web browser access:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: content-type`
