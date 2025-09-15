-- Safer sample data population focusing on ND levels only

-- 1) Reset data that depends on students
DELETE FROM public.results;
DELETE FROM public.students;
DELETE FROM public.announcements;

-- 2) Insert sample student profiles (ND1/ND2 only to satisfy profiles_level_check)
WITH admin_user AS (
  SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1
)
INSERT INTO public.profiles (id, user_id, role, full_name, matric_number, phone_number, level)
VALUES
  -- ND1
  (gen_random_uuid(), gen_random_uuid(), 'student', 'Adebayo Samuel Oluwaseun', 'ND/CSC/22/001', '08012345678', 'ND1'),
  (gen_random_uuid(), gen_random_uuid(), 'student', 'Fatima Aisha Muhammad',    'ND/BAM/22/002', '08023456789', 'ND1'),
  (gen_random_uuid(), gen_random_uuid(), 'student', 'Chioma Grace Okafor',      'ND/ACC/22/003', '08034567890', 'ND1'),
  -- ND2
  (gen_random_uuid(), gen_random_uuid(), 'student', 'Ibrahim Yakubu Musa',      'ND/CSC/21/001', '08045678901', 'ND2'),
  (gen_random_uuid(), gen_random_uuid(), 'student', 'Blessing Esther Okoro',    'ND/BAM/21/002', '08056789012', 'ND2'),
  (gen_random_uuid(), gen_random_uuid(), 'student', 'Abdullahi Sani Ahmad',     'ND/EEE/21/003', '08067890123', 'ND2');

-- 3) Create students with fee status variety
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
  0.00,
  0.00,
  0
FROM public.profiles p
WHERE p.role = 'student' AND p.level IN ('ND1','ND2');

-- 4) Results for ND1 (2023/2024 first + second)
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
    ('MTH101', 'General Mathematics I',            3, 'A', 15.00),
    ('ENG101', 'Use of English I',                 2, 'B',  8.00),
    ('PHY101', 'General Physics I',                3, 'C',  9.00),
    ('GST101', 'Communication in English',         2, 'B',  8.00)
) AS c(course_code, course_title, credit_unit, grade, point)
WHERE p.level = 'ND1';

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
    ('ENG102', 'Use of English II',      2, 'A',  8.00),
    ('PHY102', 'General Physics II',     3, 'B', 12.00)
) AS c(course_code, course_title, credit_unit, grade, point)
WHERE p.level = 'ND1';

-- 5) Results for ND2 (2022/2023 first)
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
    ('CSC202', 'Database Systems',               3, 'B', 12.00),
    ('CSC203', 'Operating Systems',              3, 'A', 15.00),
    ('MTH201', 'Statistics and Probability',     3, 'B', 12.00)
) AS c(course_code, course_title, credit_unit, grade, point)
WHERE p.level = 'ND2';

-- Carryover examples (fails)
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
WHERE p.matric_number IN ('ND/BAM/22/002', 'ND/EEE/21/003');

-- 6) Compute aggregates
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

-- 7) Announcements (use admin user_id when available, else generate a UUID)
WITH chosen_admin AS (
  SELECT COALESCE((SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1), gen_random_uuid()) AS admin_id
)
INSERT INTO public.announcements (created_by, title, content, target_level)
SELECT admin_id, t.title, t.content, t.target_level
FROM chosen_admin,
     (VALUES
       ('Welcome to 2023/2024', 'Welcome to the new academic session. Pay fees and register on time.', 'all'),
       ('ND1 Orientation',      'All ND1 students must attend orientation next Monday at the auditorium.', 'ND1'),
       ('ND2 SIWES Briefing',   'ND2 students should prepare for industrial training. Forms at Academic Office.', 'ND2'),
       ('Library Hours',        'Library opens 8am-8pm weekdays, 10am-6pm weekends.', 'all'),
       ('Fee Payment Reminder', 'Settle outstanding fees before the deadline to avoid penalties.', 'all')
     ) AS t(title, content, target_level);