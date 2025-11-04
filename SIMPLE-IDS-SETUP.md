# Quick Setup: Simple IDs

## 🎯 Goal

Replace complex UUIDs with simple IDs like `s1`, `q1`, etc.

## 🚀 Steps

### 1. Update Database Schema & Data (Required!)

⚠️ **IMPORTANT**: The database schema needs to be updated first!

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy the entire content of `scripts/complete-simple-ids-setup.sql`
4. Paste and **Run** the script
5. ✅ Done! Your database schema is updated and has simple IDs

**What this script does:**

- Changes ID columns from UUID to TEXT type
- Clears existing data
- Inserts new data with simple IDs (s1, s2, s3, q1-q14)

### 2. Test the API

```bash
# Start server
npm run dev

# Test with simple IDs
curl "http://localhost:3000/api/surveys?survey_id=s1"
curl "http://localhost:3000/api/surveys?survey_id=s1&page=1&limit=3"
```

### 3. Use in Postman

- Import: `postman/survey-api.postman_collection.json`
- All examples now use simple IDs: `s1`, `q1`, `q2`, etc.

## 📋 New ID Structure

| Old ID Format                          | New ID | Type     |
| -------------------------------------- | ------ | -------- |
| `11111111-1111-1111-1111-111111111111` | `s1`   | Survey   |
| `22222222-2222-2222-2222-222222222222` | `s2`   | Survey   |
| `33333333-3333-3333-3333-333333333333` | `s3`   | Survey   |
| `0cbbd89e-9e1d-4205-82cc-3c4e7e02296e` | `q1`   | Question |
| `8e597869-959c-4774-b6bc-98a8f8c022e9` | `q2`   | Question |

## ✅ Benefits

- ✅ **Easier to remember**: `s1` vs `11111111-1111-1111-1111-111111111111`
- ✅ **Simpler URLs**: `/api/surveys?survey_id=s1`
- ✅ **Cleaner responses**: `{"q1": 4, "q2": "Yes"}`
- ✅ **Better testing**: Quick to type in Postman

---

**Status**: Ready to use after running the SQL script! 🎉
