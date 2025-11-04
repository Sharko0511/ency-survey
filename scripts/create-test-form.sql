-- Simple Test Form Creation Script (Using Existing Questions)
-- Copy and paste this entire script into your Supabase SQL editor

-- Clean up existing test data first (optional - run this if you want to recreate)
DELETE FROM forms WHERE id = 'test-simple';
DELETE FROM sections WHERE section_id IN ('basic_info_test', 'lifestyle_test');

-- NOTE: We're reusing existing questions from your fitness form, so no need to insert new questions
-- We'll just create new sections and form that reference existing questions

-- Insert Sections using existing questions from your fitness form
INSERT INTO sections (section_id, title, description, question_ids, category, tags) VALUES
-- Basic info section (using existing questions from basic_info section)
('basic_info_test', 'Test: Basic Information', 'Simple test section with basic questions', 
 '{"full_name", "email", "age", "gender"}', 'personal', '{"basic", "required"}'),
 
-- Lifestyle section (using existing questions from lifestyle section) 
('lifestyle_test', 'Test: Lifestyle Questions', 'Simple test section with lifestyle questions',
 '{"occupation", "activity_level", "sleep_hours", "stress"}', 'lifestyle', '{"optional"}');

-- Insert Form with section references (using PostgreSQL array syntax)
INSERT INTO forms (id, title, description, section_ids, is_active, settings) VALUES
('test-simple', 'Simple Test Survey', 'A minimal survey for testing API endpoints using existing questions', 
 '{"basic_info_test", "lifestyle_test"}', true, 
 '{"allow_anonymous": true, "require_authentication": false, "submission_limit": null}');

-- Verify the creation
SELECT 'FORM CREATED:' as status, id, title, array_length(section_ids, 1) as sections_count FROM forms WHERE id = 'test-simple';
SELECT 'SECTIONS:' as status, section_id, title, array_length(question_ids, 1) as questions_count FROM sections WHERE section_id IN ('basic_info_test', 'lifestyle_test');
SELECT 'QUESTIONS REFERENCED:' as status, question_id, type, label FROM questions WHERE question_id IN ('full_name', 'email', 'age', 'gender', 'occupation', 'activity_level', 'sleep_hours', 'stress');

-- Test URLs (copy these for testing):
-- Full Form: http://localhost:3000/api/forms/test-simple
-- All Questions: http://localhost:3000/api/forms/test-simple/questions  
-- Basic Info Only: http://localhost:3000/api/forms/test-simple/questions?sections=basic_info_test
-- Lifestyle Only: http://localhost:3000/api/forms/test-simple/questions?sections=lifestyle_test
-- Multiple Sections: http://localhost:3000/api/forms/test-simple/questions?sections=basic_info_test,lifestyle_test
-- Paginated: http://localhost:3000/api/forms/test-simple/questions?page=1&limit=3