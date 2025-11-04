# Database Population Scripts

This directory contains scripts to populate the Supabase database with the Vietnamese fitness form data.

## Prerequisites

1. **Database Schema**: Make sure you've run the `modular-schema-setup.sql` first to create the tables
2. **Environment Variables**: Set up your Supabase credentials

## Scripts Available

### Option 1: SQL Scripts (Recommended)

Run these scripts directly in your Supabase SQL Editor:

1. **First run**: `modular-schema-setup.sql` (creates tables)
2. **Then run**: `insert-fitness-form-data.sql` (inserts main data)
3. **Finally run**: `insert-fitness-form-data-part2.sql` (inserts remaining questions)

### Option 2: Node.js Script

For programmatic insertion with better error handling:

```bash
# Install dependencies first
npm install @supabase/supabase-js

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the script
node scripts/populate-database.js
```

## Data Structure Overview

After running these scripts, you'll have:

- **1 Form**: Vietnamese fitness questionnaire
- **10 Sections**: From basic info to commitment
- **74 Questions**: All questions with proper validation and conditional logic

## Verification Queries

Run these in Supabase to verify the data:

```sql
-- Check form
SELECT * FROM forms WHERE id = 'fitness-form-v1';

-- Check sections count
SELECT count(*) as section_count FROM sections;

-- Check questions count
SELECT count(*) as question_count FROM questions;

-- Check questions by category
SELECT category, count(*) as count
FROM questions
GROUP BY category
ORDER BY category;
```

## Next Steps

After populating the database:

1. Test the API endpoints (Step 2 in implementation plan)
2. Build the frontend form components (Step 3)
3. Add response submission logic (Step 4)

## Troubleshooting

- **Foreign key errors**: Make sure you ran `modular-schema-setup.sql` first
- **Permission errors**: Use the service role key for the Node.js script
- **Timeout errors**: Run the SQL scripts in smaller batches if needed
