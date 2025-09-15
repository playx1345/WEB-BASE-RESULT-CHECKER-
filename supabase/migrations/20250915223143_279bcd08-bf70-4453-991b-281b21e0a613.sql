-- Clean and populate sample data using existing user_ids

-- 1) Clear existing dependent data
DELETE FROM public.results;
DELETE FROM public.students;
DELETE FROM public.announcements;

-- 2) Clean and update existing profiles with proper sample data
-- First, let's get existing user_ids and update profiles
UPDATE public.profiles 
SET 
  full_name = CASE 
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'Adebayo Samuel Oluwaseun'
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Fatima Aisha Muhammad'
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Ibrahim Yakubu Musa'
    ELSE full_name
  END,
  matric_number = CASE 
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'ND/CSC/22/001'
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'ND/BAM/22/002'
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'ND/CSC/21/001'
    ELSE matric_number
  END,
  phone_number = CASE 
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 0) THEN '08012345678'
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 1) THEN '08023456789'
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 2) THEN '08045678901'
    ELSE phone_number
  END,
  level = CASE 
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'ND1'
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'ND1'
    WHEN id = (SELECT id FROM public.profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'ND2'
    ELSE level
  END
WHERE role = 'student';

-- 3) Create student records for existing profiles
INSERT INTO public.students (profile_id, matric_number, level, pin, fee_status, cgp, total_gp, carryovers)
SELECT 
  p.id,
  p.matric_number,
  p.level,
  '112233',
  CASE 
    WHEN p.matric_number LIKE '%001' THEN 'paid'
    WHEN p.matric_number LIKE '%002' THEN 'unpaid' 
    ELSE 'paid'
  END,
  0.00,
  0.00,
  0
FROM public.profiles p
WHERE p.role = 'student' AND p.matric_number IS NOT NULL AND p.level IN ('ND1','ND2');

-- 4) Generate academic results for ND1 students
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester)
SELECT 
  s.id,
  c.course_code,
  c.course_title,
  c.credit_unit,
  c.grade,
  c.point,
  s.level,
  '2023/2024',
  'first'
FROM public.students s
JOIN public.profiles p ON p.id = s.profile_id
CROSS JOIN (
  VALUES 
    ('CSC101', 'Introduction to Computer Science', 3, 'B', 12.00),
    ('MTH101', 'General Mathematics I', 3, 'A', 15.00),
    ('ENG101', 'Use of English I', 2, 'B', 8.00),
    ('PHY101', 'General Physics I', 3, 'C', 9.00),
    ('GST101', 'Communication in English', 2, 'B', 8.00)
) AS c(course_code, course_title, credit_unit, grade, point)
WHERE p.level = 'ND1';

-- Second semester for ND1
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester)
SELECT 
  s.id,
  c.course_code,
  c.course_title,
  c.credit_unit,
  c.grade,
  c.point,
  s.level,
  '2023/2024',
  'second'
FROM public.students s
JOIN public.profiles p ON p.id = s.profile_id
CROSS JOIN (
  VALUES 
    ('CSC102', 'Computer Programming I', 3, 'A', 15.00),
    ('MTH102', 'General Mathematics II', 3, 'B', 12.00),
    ('ENG102', 'Use of English II', 2, 'A', 8.00),
    ('PHY102', 'General Physics II', 3, 'B', 12.00)
) AS c(course_code, course_title, credit_unit, grade, point)
WHERE p.level = 'ND1';

-- 5) Results for ND2 students
INSERT INTO public.results (student_id, course_code, course_title, credit_unit, grade, point, level, session, semester)
SELECT 
  s.id,
  c.course_code,
  c.course_title,
  c.credit_unit,
  c.grade,
  c.point,
  s.level,
  '2022/2023',
  'first'
FROM public.students s
JOIN public.profiles p ON p.id = s.profile_id
CROSS JOIN (
  VALUES 
    ('CSC201', 'Data Structures and Algorithms', 4, 'A', 20.00),
    ('CSC202', 'Database Systems', 3, 'B', 12.00),
    ('CSC203', 'Operating Systems', 3, 'A', 15.00),
    ('MTH201', 'Statistics and Probability', 3, 'B', 12.00)
) AS c(course_code, course_title, credit_unit, grade, point)
WHERE p.level = 'ND2';

-- Add a carryover for one student
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
JOIN public.profiles p ON p.id = s.profile_id
WHERE p.matric_number = 'ND/BAM/22/002'
LIMIT 1;

-- 6) Update student statistics
UPDATE public.students st
SET 
  total_gp = (
    SELECT COALESCE(SUM(r.point), 0)
    FROM public.results r 
    WHERE r.student_id = st.id
  ),
  cgp = (
    SELECT CASE 
      WHEN SUM(r.credit_unit) > 0 THEN ROUND(SUM(r.point) / SUM(r.credit_unit), 2)
      ELSE 0.00
    END
    FROM public.results r 
    WHERE r.student_id = st.id
  ),
  carryovers = (
    SELECT COUNT(*)::integer
    FROM public.results r 
    WHERE r.student_id = st.id AND r.grade = 'F'
  );

-- 7) Create announcements using admin user_id if available
INSERT INTO public.announcements (created_by, title, content, target_level)
SELECT 
  COALESCE(
    (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1), 
    (SELECT user_id FROM public.profiles WHERE role = 'student' LIMIT 1)
  ) as admin_id,
  t.title, 
  t.content, 
  t.target_level
FROM (
  VALUES
    ('Welcome to New Academic Session 2023/2024', 'Welcome to the new academic session. Please ensure your fees are paid and registration is completed on time.', 'all'),
    ('ND1 Orientation Program', 'All new ND1 students are required to attend the orientation program scheduled for next Monday at the main auditorium.', 'ND1'),
    ('ND2 Industrial Training Information', 'ND2 students should start preparing for their industrial training. Application forms are available at the academic office.', 'ND2'),
    ('Library Operating Hours Update', 'The library will now be open from 8:00 AM to 8:00 PM on weekdays and 10:00 AM to 6:00 PM on weekends.', 'all'),
    ('Fee Payment Reminder', 'All students with outstanding fees are advised to settle their bills before the deadline to avoid penalties.', 'all')
) AS t(title, content, target_level);