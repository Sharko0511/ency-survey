-- Step 1: Create Modular Form System Schema
-- This script creates all tables for the modular form system with array-based relationships

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS questions CASCADE; 
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS forms CASCADE;

-- 1. FORMS TABLE
-- Stores form metadata and references to sections via array
CREATE TABLE forms (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    section_ids TEXT[], -- Array of section IDs: ["sec1", "sec2", "sec3"]
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}', -- Additional form configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. SECTIONS TABLE  
-- Independent sections that can be reused across multiple forms
CREATE TABLE sections (
    section_id TEXT PRIMARY KEY, -- "sec1", "basic_info", "health_section"  
    title TEXT NOT NULL,
    description TEXT,
    question_ids TEXT[], -- Array of question IDs: ["full_name", "dob", "email"]
    category TEXT, -- "personal", "health", "fitness" (optional grouping)
    tags TEXT[], -- ["basic", "required", "personal"] (for searching)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. QUESTIONS TABLE
-- Independent question bank that can be referenced from any section
CREATE TABLE questions (
    question_id TEXT PRIMARY KEY, -- "full_name", "email", "height" 
    type TEXT NOT NULL, -- "text", "email", "number", "select", "radio", "checkbox", "date", "textarea", "tel"
    label TEXT NOT NULL,
    description TEXT, -- Additional help text
    options JSONB, -- {"choices": ["Nam", "Nữ"]} for select/radio/checkbox
    validation JSONB, -- {"min": 50, "max": 250, "required": true}
    conditional JSONB, -- {"dependsOn": "bf_method", "showWhen": "Công thức số đo"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. RESPONSES TABLE
-- Stores form submissions with answers keyed by question_id
CREATE TABLE responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id TEXT, -- References forms.id (no FK constraint for flexibility)
    user_id UUID, -- External user ID from other database
    answers JSONB NOT NULL, -- {"full_name": "Nguyễn Văn A", "email": "user@example.com"}
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB DEFAULT '{}' -- Additional submission data
);

-- CREATE INDEXES for performance
-- Forms indexes
CREATE INDEX idx_forms_active ON forms(is_active);
CREATE INDEX idx_forms_created_at ON forms(created_at);

-- Sections indexes  
CREATE INDEX idx_sections_category ON sections(category);
CREATE INDEX idx_sections_tags ON sections USING GIN(tags);
CREATE INDEX idx_sections_created_at ON sections(created_at);

-- Questions indexes
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_created_at ON questions(created_at);

-- Responses indexes
CREATE INDEX idx_responses_form_id ON responses(form_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_responses_submitted_at ON responses(submitted_at);
CREATE INDEX idx_responses_answers ON responses USING GIN(answers);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY; 
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES for public access
-- Forms policies
CREATE POLICY "Public forms are viewable by everyone" ON forms
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can create forms" ON forms  
    FOR INSERT WITH CHECK (true);

-- Sections policies
CREATE POLICY "Public sections are viewable by everyone" ON sections
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create sections" ON sections
    FOR INSERT WITH CHECK (true);

-- Questions policies  
CREATE POLICY "Public questions are viewable by everyone" ON questions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create questions" ON questions
    FOR INSERT WITH CHECK (true);

-- Responses policies
CREATE POLICY "Anyone can submit form responses" ON responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view form responses" ON responses
    FOR SELECT USING (true);

-- VERIFICATION QUERIES
-- Check table creation and structure
SELECT 'Forms' as table_name, count(*) as count FROM forms
UNION ALL
SELECT 'Sections' as table_name, count(*) as count FROM sections  
UNION ALL
SELECT 'Questions' as table_name, count(*) as count FROM questions
UNION ALL
SELECT 'Responses' as table_name, count(*) as count FROM responses;

-- Verify indexes
SELECT 
    schemaname,
    tablename, 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('forms', 'sections', 'questions', 'responses')
ORDER BY tablename, indexname;

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('forms', 'sections', 'questions', 'responses')
ORDER BY tablename, policyname;