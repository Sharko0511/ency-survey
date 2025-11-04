-- Part 2: Continue inserting remaining questions
-- Section 6: Training History Questions
INSERT INTO questions (question_id, type, label, description, options, validation, conditional) VALUES
('training_time', 'radio', 'Bạn tập gym (liên tục) được bao lâu rồi?', NULL, '{"choices": ["Mới bắt đầu (< 6 tháng)", "6 tháng - 2 năm", "Trên 2 năm"]}', '{"required": true}', NULL),
('training_split', 'checkbox', 'Lịch tập hiện tại/gần nhất của bạn', NULL, '{"choices": ["Push Pull Legs", "Upper Lower", "Full Body", "Bro Split (Mỗi ngày 1 nhóm cơ)", "Crossfit", "Cardio", "Tập ngẫu nhiên không theo lịch"]}', NULL, NULL),
('training_freq', 'radio', 'Tần suất tập luyện hiện tại', NULL, '{"choices": ["Không tập", "1-2 buổi/tuần", "3-4 buổi/tuần", "5-6 buổi/tuần", "Hàng ngày"]}', '{"required": true}', NULL),
('session_length', 'radio', 'Độ dài mỗi buổi tập', NULL, '{"choices": ["<45 phút", "45-60 phút", "60-90 phút", ">90 phút"]}', NULL, NULL),
('cardio_week', 'number', 'Ngoài tập tạ, bạn có thể dành bao nhiêu phút/tuần cho cardio?', NULL, NULL, NULL, NULL),
('sports', 'text', 'Bạn có chơi môn thể thao nào khác không? Trình độ như thế nào?', NULL, NULL, NULL, NULL),
('coach_before', 'textarea', 'Bạn đã từng có Huấn luyện viên cá nhân chưa? Trải nghiệm đó như thế nào?', NULL, NULL, NULL, NULL),
('stopped_reason', 'text', 'Trong quá khứ, điều gì khiến bạn ngưng tập luyện?', NULL, NULL, NULL, NULL),
('track_workout', 'radio', 'Bạn có kinh nghiệm theo dõi lịch tập (track workout) không?', NULL, '{"choices": ["Có, và đang theo dõi", "Có, nhưng hiện tại không", "Chưa từng"]}', '{"required": true}', NULL),
('personal_records_intro', 'text', 'Thành tích cá nhân (1RM - Mức tạ tối đa 1 lần)', 'Nếu bạn tự tin và đã từng thử, hãy nhập thẳng kết quả 1RM của bạn. Nếu không, hãy nhập mức tạ và số lần lặp lại tối đa (reps max, không quá 10) bạn làm được với form chuẩn, hệ thống sẽ ước tính 1RM cho bạn.', NULL, NULL, NULL),
('squat_1rm_direct', 'number', 'Squat - 1RM (kg)', 'Nhập trực tiếp nếu bạn biết 1RM của mình', NULL, NULL, NULL),
('squat_weight_estimate', 'number', 'Squat - Hoặc ước tính từ: Mức tạ (kg)', 'Mức tạ bạn có thể squat với số reps max', NULL, NULL, NULL),
('squat_reps_estimate', 'number', 'Squat - Số Reps max', 'Số lần lặp lại tối đa (không quá 10)', NULL, '{"min": 1, "max": 10}', NULL),
('bench_1rm_direct', 'number', 'Bench Press - 1RM (kg)', 'Nhập trực tiếp nếu bạn biết 1RM của mình', NULL, NULL, NULL),
('bench_weight_estimate', 'number', 'Bench Press - Hoặc ước tính từ: Mức tạ (kg)', 'Mức tạ bạn có thể bench với số reps max', NULL, NULL, NULL),
('bench_reps_estimate', 'number', 'Bench Press - Số Reps max', 'Số lần lặp lại tối đa (không quá 10)', NULL, '{"min": 1, "max": 10}', NULL),
('deadlift_1rm_direct', 'number', 'Deadlift - 1RM (kg)', 'Nhập trực tiếp nếu bạn biết 1RM của mình', NULL, NULL, NULL),
('deadlift_weight_estimate', 'number', 'Deadlift - Hoặc ước tính từ: Mức tạ (kg)', 'Mức tạ bạn có thể deadlift với số reps max', NULL, NULL, NULL),
('deadlift_reps_estimate', 'number', 'Deadlift - Số Reps max', 'Số lần lặp lại tối đa (không quá 10)', NULL, '{"min": 1, "max": 10}', NULL);

-- Section 7: Training Goals Questions
INSERT INTO questions (question_id, type, label, description, options, validation, conditional) VALUES
('goals', 'checkbox', 'Mục tiêu', NULL, '{"choices": ["Giảm mỡ / Giảm cân", "Tăng cơ", "Cải thiện vóc dáng", "Tăng sức bền/tim mạch", "Tăng sự linh hoạt", "Cải thiện sức khỏe tổng thể", "Khác"]}', '{"required": true}', NULL),
('goal_number', 'text', 'Bạn có mục tiêu cụ thể nào về con số không? (ví dụ: Giảm 5kg, squat 100kg...)', NULL, NULL, '{"required": true}', NULL),
('goal_time', 'text', 'Bạn muốn đạt được kết quả trong bao lâu?', NULL, NULL, '{"required": true}', NULL),
('success_def', 'textarea', 'Thành công trong việc tập luyện đối với bạn có nghĩa là gì?', NULL, NULL, '{"required": true}', NULL);

-- Section 8: Preferences Schedule Questions
INSERT INTO questions (question_id, type, label, description, options, validation, conditional) VALUES
('training_place', 'radio', 'Địa điểm', NULL, '{"choices": ["Gym", "Ở nhà", "Ngoài trời"]}', '{"required": true}', NULL),
('training_type', 'checkbox', 'Loại hình', NULL, '{"choices": ["Nâng tạ", "Cardio", "HIIT", "Yoga/Pilates"]}', NULL, NULL),
('exercise_dislike', 'text', 'Có bài tập nào bạn không thích hoặc không thể thực hiện không?', NULL, NULL, NULL, NULL),
('equipment', 'text', 'Thiết bị có sẵn', NULL, NULL, NULL, NULL),
('training_time_day', 'checkbox', 'Thời gian bạn có thể tập luyện trong ngày? (chọn tất cả những gì phù hợp)', NULL, '{"choices": ["Sáng (5-9h)", "Trưa (11-13h)", "Chiều (15-18h)", "Tối (18-21h)", "Linh động"]}', '{"required": true}', NULL),
('days', 'checkbox', 'Những ngày bạn có thể tập trong tuần? (chọn tất cả những ngày phù hợp)', NULL, '{"choices": ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]}', '{"required": true}', NULL);

-- Section 9: Motivation Coaching Questions
INSERT INTO questions (question_id, type, label, description, options, validation, conditional) VALUES
('motivation', 'textarea', 'Điều gì giúp bạn duy trì động lực tập luyện?', NULL, NULL, NULL, NULL),
('coach_style', 'checkbox', 'Bạn mong muốn Huấn luyện viên hỗ trợ như thế nào?', NULL, '{"choices": ["Kỷ luật, nhắc nhở thường xuyên", " Khích lệ, động viên nhẹ nhàng", "Cung cấp kiến thức, giải thích chi tiết", "Theo dõi số liệu, phân tích tiến trình"]}', '{"required": true}', NULL),
('contact', 'select', 'Bạn muốn trao đổi với Huấn luyện viên qua kênh nào là chính?', NULL, '{"choices": ["Zalo / Messenger", "Gặp trực tiếp", "Email", "Cuộc gọi"]}', '{"required": true}', NULL);

-- Section 10: Commitment Questions
INSERT INTO questions (question_id, type, label, description, options, validation, conditional) VALUES
('signature', 'text', 'Tên đầy đủ', 'Nhập họ tên đầy đủ để xác nhận', NULL, '{"required": true}', NULL),
('date', 'date', 'Ngày', NULL, NULL, '{"required": true}', NULL);

-- Final verification query
SELECT 
    'Summary' as category,
    'Forms' as item,
    COUNT(*) as count
FROM forms 
WHERE id = 'fitness-form-v1'
UNION ALL
SELECT 
    'Summary' as category,
    'Sections' as item,
    COUNT(*) as count
FROM sections 
UNION ALL
SELECT 
    'Summary' as category,
    'Questions' as item,
    COUNT(*) as count
FROM questions
ORDER BY category, item;