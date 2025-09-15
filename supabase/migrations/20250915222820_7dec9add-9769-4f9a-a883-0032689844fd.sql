-- Clean up any incomplete existing data and populate comprehensive sample data

-- First, let's clean up any existing incomplete student records
DELETE FROM public.results;
DELETE FROM public.students;
DELETE FROM public.announcements;

-- Update existing profiles with complete information or delete incomplete ones
DELETE FROM public.profiles WHERE full_name IS NULL OR matric_number IS NULL;

-- Create comprehensive student profiles and records
INSERT INTO public.profiles (id, user_id, role, full_name, matric_number, phone_number, level) VALUES
-- ND1 Students
(gen_random_uuid(), gen_random_uuid(), 'student', 'Adebayo Samuel Oluwaseun', 'ND/CSC/22/001', '08012345678', 'ND1'),
(gen_random_uuid(), gen_random_uuid(), 'student', 'Fatima Aisha Muhammad', 'ND/BAM/22/002', '08023456789', 'ND1'),
(gen_random_uuid(), gen_random_uuid(), 'student', 'Chioma Grace Okafor', 'ND/ACC/22/003', '08034567890', 'ND1'),
-- ND2 Students  
(gen_random_uuid(), gen_random_uuid(), 'student', 'Ibrahim Yakubu Musa', 'ND/CSC/21/001', '08045678901', 'ND2'),
(gen_random_uuid(), gen_random_uuid(), 'student', 'Blessing Esther Okoro', 'ND/BAM/21/002', '08056789012', 'ND2'),
(gen_random_uuid(), gen_random_uuid(), 'student', 'Abdullahi Sani Ahmad', 'ND/EEE/21/003', '08067890123', 'ND2'),
-- HND1 Students
(gen_random_uuid(), gen_random_uuid(), 'student', 'Olumide Peter Adeyemi', 'HND/CSC/22/001', '08078901234', 'HND1'),
(gen_random_uuid(), gen_random_uuid(), 'student', 'Mercy Chiamaka Eze', 'HND/ACC/22/002', '08089012345', 'HND1'),
-- HND2 Students
(gen_random_uuid(), gen_random_uuid(), 'student', 'Usman Aliyu Bello', 'HND/CSC/21/001', '08090123456', 'HND2'),
(gen_random_uuid(), gen_random_uuid(), 'student', 'Joy Temiloluwa Akinola', 'HND/BAM/21/002', '08001234567', 'HND2');

-- Create student records with diverse fee statuses and initial academic data
INSERT INTO public.students (profile_id, matric_number, level, pin, fee_status, cgp, total_gp, carryovers)
SELECT 
  p.id,
  p.matric_number,
  p.level,
  '112233',
  CASE 
    WHEN p.matric_number LIKE '%001' THEN 'paid'
    WHEN p.matric_number LIKE '%002' THEN 'unpaid' 
    WHEN p.matric_number LIKE '%003' THEN 'paid'
    ELSE 'unpaid'
  END,
  0.00, -- Will be calculated after inserting results
  0.00,
  0
FROM public.profiles p WHERE p.role = 'student';

-- Generate realistic academic results for each student
-- ND1 Students - First Semester Results
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester) 
SELECT 
  s.id,
  course_data.course_code,
  course_data.course_title,
  course_data.credit_unit,
  course_data.grade,
  course_data.point,
  s.level,
  '2023/2024',
  'first'
FROM public.students s
CROSS JOIN (
  VALUES 
    ('CSC101', 'Introduction to Computer Science', 3, 'B', 12.00),
    ('MTH101', 'General Mathematics I', 3, 'A', 15.00),
    ('ENG101', 'Use of English I', 2, 'B', 8.00),
    ('PHY101', 'General Physics I', 3, 'C', 9.00),
    ('CHM101', 'General Chemistry I', 3, 'B', 12.00),
    ('BIO101', 'General Biology I', 2, 'A', 8.00),
    ('GST101', 'Communication in English', 2, 'B', 8.00)
) AS course_data(course_code, course_title, credit_unit, grade, point)
WHERE s.level = 'ND1';

-- ND1 Students - Second Semester Results  
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester)
SELECT 
  s.id,
  course_data.course_code,
  course_data.course_title,
  course_data.credit_unit,
  course_data.grade,
  course_data.point,
  s.level,
  '2023/2024',
  'second'
FROM public.students s
CROSS JOIN (
  VALUES 
    ('CSC102', 'Computer Programming I', 3, 'A', 15.00),
    ('MTH102', 'General Mathematics II', 3, 'B', 12.00),
    ('ENG102', 'Use of English II', 2, 'A', 8.00),
    ('PHY102', 'General Physics II', 3, 'B', 12.00),
    ('CHM102', 'General Chemistry II', 3, 'C', 9.00),
    ('GST102', 'Nigerian Peoples and Culture', 2, 'B', 8.00)
) AS course_data(course_code, course_title, credit_unit, grade, point)
WHERE s.level = 'ND1';

-- ND2 Students - Multiple Semesters Results
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester)
SELECT 
  s.id,
  course_data.course_code,
  course_data.course_title,
  course_data.credit_unit,
  course_data.grade,
  course_data.point,
  s.level,
  '2022/2023',
  'first'
FROM public.students s
CROSS JOIN (
  VALUES 
    ('CSC201', 'Data Structures and Algorithms', 4, 'A', 20.00),
    ('CSC202', 'Database Systems', 3, 'B', 12.00),
    ('CSC203', 'Operating Systems', 3, 'A', 15.00),
    ('MTH201', 'Statistics and Probability', 3, 'B', 12.00),
    ('CSC204', 'Web Development', 3, 'A', 15.00),
    ('ENG201', 'Technical Writing', 2, 'B', 8.00)
) AS course_data(course_code, course_title, credit_unit, grade, point)
WHERE s.level = 'ND2';

-- HND1 Students Results
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester)
SELECT 
  s.id,
  course_data.course_code,
  course_data.course_title,
  course_data.credit_unit,
  course_data.grade,
  course_data.point,
  s.level,
  '2023/2024',
  'first'
FROM public.students s
CROSS JOIN (
  VALUES 
    ('CSC301', 'Advanced Programming', 4, 'A', 20.00),
    ('CSC302', 'Software Engineering', 3, 'B', 12.00),
    ('CSC303', 'Network Administration', 3, 'A', 15.00),
    ('CSC304', 'Mobile App Development', 3, 'B', 12.00),
    ('MTH301', 'Discrete Mathematics', 3, 'C', 9.00),
    ('ENT301', 'Entrepreneurship', 2, 'A', 8.00)
) AS course_data(course_code, course_title, credit_unit, grade, point)
WHERE s.level = 'HND1';

-- HND2 Students Results
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester)
SELECT 
  s.id,
  course_data.course_code,
  course_data.course_title,
  credit_unit,
  grade,
  point,
  s.level,
  '2022/2023',
  'second'
FROM public.students s
CROSS JOIN (
  VALUES 
    ('CSC401', 'Project Management', 4, 'A', 20.00),
    ('CSC402', 'Artificial Intelligence', 3, 'B', 12.00),
    ('CSC403', 'Cybersecurity', 3, 'A', 15.00),
    ('CSC404', 'Final Year Project', 6, 'A', 30.00),
    ('CSC405', 'Industry Attachment', 4, 'B', 16.00)
) AS course_data(course_code, course_title, credit_unit, grade, point)
WHERE s.level = 'HND2';

-- Add some carryover courses (failed courses) for realistic data
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester)
SELECT 
  s.id,
  'MTH101',
  'General Mathematics I',
  3,
  'F',
  0.00,
  s.level,
  '2023/2024',
  'first'
FROM public.students s
WHERE s.matric_number IN ('ND/BAM/22/002', 'ND/EEE/21/003')
LIMIT 2;

-- Update CGP, total_gp, and carryovers for each student based on their results
UPDATE public.students 
SET 
  total_gp = (
    SELECT COALESCE(SUM(r.point), 0)
    FROM public.results r 
    WHERE r.student_id = students.id
  ),
  cgp = (
    SELECT CASE 
      WHEN SUM(r.credit_unit) > 0 THEN ROUND(SUM(r.point) / SUM(r.credit_unit), 2)
      ELSE 0.00
    END
    FROM public.results r 
    WHERE r.student_id = students.id
  ),
  carryovers = (
    SELECT COUNT(*)::integer
    FROM public.results r 
    WHERE r.student_id = students.id AND r.grade = 'F'
  );

-- Create sample announcements
INSERT INTO public.announcements (created_by, title, content, target_level) VALUES
-- General announcements
((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), 
 'Welcome to New Academic Session 2023/2024', 
 'We welcome all students to the new academic session. Please ensure your fees are paid and registration is completed on time.', 
 'all'),

((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
 'Library Operating Hours Update',
 'The library will now be open from 8:00 AM to 8:00 PM on weekdays and 10:00 AM to 6:00 PM on weekends.',
 'all'),

-- Level-specific announcements
((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
 'ND1 Orientation Program',
 'All new ND1 students are required to attend the orientation program scheduled for next Monday at the main auditorium.',
 'ND1'),

((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
 'ND2 Industrial Training Information',
 'ND2 students should start preparing for their industrial training. Application forms are available at the academic office.',
 'ND2'),

((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
 'HND1 Course Registration Deadline',
 'HND1 students have until Friday to complete their course registration for the current semester.',
 'HND1'),

((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
 'HND2 Final Year Project Guidelines',
 'HND2 students should collect their project guidelines from their department heads before the end of this week.',
 'HND2'),

((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
 'Fee Payment Reminder',
 'All students with outstanding fees are advised to settle their bills before the deadline to avoid penalties.',
 'all'),

((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
 'Career Fair 2024',
 'The annual career fair will be held next month. All students are encouraged to participate and bring their CVs.',
 'all');

-- Ensure we have an admin user (create one if none exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    INSERT INTO public.profiles (id, user_id, role, full_name, matric_number, phone_number, level) VALUES
    (gen_random_uuid(), gen_random_uuid(), 'admin', 'System Administrator', 'ADMIN001', '08000000000', NULL);
  END IF;
END $$;